'use client';

import { ExternalLink, MessageCircle, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useMemo, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/ui/can';
import { Spinner } from '@/components/ui/spinner';
import { paths } from '@/config/paths';
import { CAPABILITY } from '@/lib/capabilities';
import { cn } from '@/utils/cn';

import { postChat } from '../../api/chat';
import { streamChat } from '../../api/chat-stream';
import type { ChatMessage as ChatMessageType, ChatResponse } from '../../types';
import {
  entreesDuPerimetre,
  restrictionsNonTransmises,
  resumePerimetre,
} from '../../utils/perimetre';

import { ChatInput } from './chat-input';
import { ChatMessageList } from './chat-message-list';
import { ChatProgress, type EtapeProgression } from './chat-progress';

type DataChatBubbleProps = {
  /** Filtres appliqués de l'écran — le périmètre de la discussion. */
  filters: Record<string, unknown>;
  /** Noms des sites, pour nommer le périmètre plutôt que ses identifiants. */
  siteNames?: Map<number, string>;
};

const ERREUR_GENERIQUE =
  "L'assistant n'a pas pu répondre. Réessayez dans un instant.";
const ERREUR_QUOTA =
  "Trop de questions d'affilée. Patientez une minute avant de relancer.";

const nouvelId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/**
 * Discuter des données SANS quitter l'écran qui les affiche.
 *
 * POURQUOI — une question sur un tableau de bord filtré obligeait à ouvrir la
 * page assistant, donc à perdre les filtres de vue, puis à les redécrire à la
 * main (« sur Thiès, entre janvier et juin, chez les femmes… »). La plupart du
 * temps on ne le faisait pas, et la réponse portait sur toute la cohorte.
 *
 * La bulle envoie le périmètre de l'écran avec la question ; le serveur
 * l'applique à chaque outil. Ce qu'il ne peut pas appliquer est dit, pas tu :
 * une bulle qui a l'air filtrée sans l'être serait pire que pas de bulle.
 *
 * Le fil reste persisté côté serveur : « Ouvrir dans l'assistant » y ramène
 * avec l'historique complet.
 */
export function DataChatBubble({ filters, siteNames }: DataChatBubbleProps) {
  return (
    <Can
      permission="ai-reports:generate"
      capability={CAPABILITY.AI_CHAT_ACCESS}
    >
      <BulleDeDiscussion filters={filters} siteNames={siteNames} />
    </Can>
  );
}

function BulleDeDiscussion({ filters, siteNames }: DataChatBubbleProps) {
  const [ouverte, setOuverte] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [enVol, setEnVol] = useState(false);
  const [etapes, setEtapes] = useState<EtapeProgression[]>([]);
  const abandon = useRef<AbortController | null>(null);

  const entrees = useMemo(
    () => entreesDuPerimetre(filters, siteNames),
    [filters, siteNames],
  );
  const manquants = useMemo(
    () => restrictionsNonTransmises(filters),
    [filters],
  );

  const envoyer = useCallback(
    async (question: string, pieces: File[]) => {
      if (enVol) return;
      setMessages((precedents) => [
        ...precedents,
        {
          id: nouvelId(),
          role: 'user',
          content: question,
          timestamp: Date.now(),
        },
      ]);
      setEtapes([]);
      setEnVol(true);
      const controleur = new AbortController();
      abandon.current = controleur;

      const afficherErreur = (erreur: unknown) => {
        const status =
          erreur instanceof Error && 'status' in erreur
            ? (erreur as { status?: number }).status
            : undefined;
        const message =
          status === 429
            ? ERREUR_QUOTA
            : status === 400 && erreur instanceof Error && erreur.message
              ? erreur.message
              : erreur instanceof Error &&
                  (erreur as Error & { business?: boolean }).business === true
                ? erreur.message
                : ERREUR_GENERIQUE;
        setMessages((precedents) => [
          ...precedents,
          {
            id: nouvelId(),
            role: 'assistant',
            content: message,
            timestamp: Date.now(),
            isError: true,
          },
        ]);
      };

      const recevoir = (reponse: ChatResponse) => {
        setConversationId(reponse.conversation_id);
        setMessages((precedents) => [
          ...precedents,
          {
            id: String(reponse.message_id),
            role: 'assistant',
            content: reponse.answer_markdown,
            sources_display: reponse.sources_display,
            tools_used: reponse.tools_used,
            artifacts: reponse.artifacts,
            timestamp: Date.now(),
          },
        ]);
      };

      try {
        const reponse = await streamChat({
          question,
          filters,
          signal: controleur.signal,
          ...(pieces.length > 0 ? { attachments: pieces } : {}),
          ...(conversationId !== null
            ? { conversation_id: conversationId }
            : {}),
          onEvent: (e) => {
            if (e.type === 'start') setConversationId(e.conversation_id);
            else if (e.type === 'step')
              setEtapes((p) => [
                ...p.map((etape) => ({ ...etape, terminee: true })),
                { index: e.index, outils: [], terminee: false },
              ]);
            else if (e.type === 'tools')
              setEtapes((p) =>
                p.map((etape) =>
                  etape.index === e.index
                    ? { ...etape, outils: e.tools }
                    : etape,
                ),
              );
          },
        });
        recevoir(reponse);
      } catch (err) {
        if (controleur.signal.aborted) return;
        const metier =
          err instanceof Error &&
          (err as Error & { business?: boolean }).business === true;
        if (!metier) {
          // Streaming coupé par un proxy : l'endpoint synchrone rend la même
          // réponse. Sans ce repli, la bulle serait muette là où la page
          // assistant, elle, répond.
          try {
            recevoir(
              await postChat({
                question,
                filters,
                signal: controleur.signal,
                ...(pieces.length > 0 ? { attachments: pieces } : {}),
                ...(conversationId !== null
                  ? { conversation_id: conversationId }
                  : {}),
              }),
            );
            return;
          } catch (reprise) {
            if (controleur.signal.aborted) return;
            afficherErreur(reprise);
            return;
          }
        }
        afficherErreur(err);
      } finally {
        setEnVol(false);
      }
    },
    [conversationId, enVol, filters],
  );

  if (!ouverte) {
    return (
      <Button
        type="button"
        onClick={() => setOuverte(true)}
        aria-label="Discuter de ces données avec l'assistant"
        className={cn(
          'fixed bottom-6 right-6 z-40 h-12 gap-2 rounded-full pl-4 pr-5 shadow-lg',
          'transition-transform hover:scale-105',
        )}
      >
        <MessageCircle className="size-5" aria-hidden />
        <span className="hidden sm:inline">Discuter des données</span>
      </Button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="Discuter des données affichées"
      className={cn(
        'fixed inset-x-3 bottom-3 z-50 flex flex-col overflow-hidden rounded-xl border border-border',
        'bg-background shadow-2xl duration-200 animate-in slide-in-from-bottom-4',
        'h-[min(34rem,calc(100dvh-1.5rem))]',
        'sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[26rem]',
      )}
    >
      <header className="flex items-start gap-2 border-b border-border px-3 py-2.5">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-tight">
            Discuter des données
          </p>
          <p
            className="truncate text-xs text-muted-foreground"
            title={resumePerimetre(entrees)}
          >
            {resumePerimetre(entrees)}
          </p>
        </div>
        {conversationId !== null && (
          <Button asChild variant="ghost" size="sm" className="h-7 px-2">
            <Link
              href={paths.aiReports.conversation.getHref(conversationId)}
              title="Ouvrir le fil complet dans l'assistant"
            >
              <ExternalLink className="size-3.5" aria-hidden />
              <span className="sr-only">Ouvrir dans l&apos;assistant</span>
            </Link>
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={() => setOuverte(false)}
          aria-label="Fermer la discussion"
        >
          <X className="size-4" aria-hidden />
        </Button>
      </header>

      {entrees.length > 0 && (
        <div className="flex flex-wrap gap-1 border-b border-border px-3 py-2">
          {entrees.map((entree) => (
            <Badge
              key={`${entree.label}-${entree.valeur}`}
              variant="secondary"
              className="text-[10px] font-normal"
            >
              {entree.label} : {entree.valeur}
            </Badge>
          ))}
        </div>
      )}

      {manquants.length > 0 && (
        // Le taire donnerait une réponse à l'air filtré, calculée sur un autre
        // périmètre que celui affiché — l'erreur la plus coûteuse possible ici.
        <p className="border-b border-border bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          L&apos;assistant ne peut pas appliquer {manquants.join(', ')} : ses
          réponses porteront sur le reste du périmètre ci-dessus.
        </p>
      )}

      <div className="flex min-h-0 flex-1 flex-col">
        <ChatMessageList messages={messages} isThinking={enVol} />
      </div>

      <div className="border-t border-border p-2.5">
        {enVol && (
          <div className="mb-2 space-y-2">
            <p
              className="flex items-center gap-2 text-xs text-muted-foreground"
              aria-live="polite"
            >
              <Spinner className="size-3" />
              L&apos;assistant réfléchit…
            </p>
            <ChatProgress etapes={etapes} />
          </div>
        )}
        <ChatInput onSend={envoyer} disabled={enVol} />
      </div>
    </div>
  );
}
