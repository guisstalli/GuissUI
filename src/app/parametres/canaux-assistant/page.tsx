'use client';

import { AppShell as Shell } from '@/app/_shell';
import { Can } from '@/components/ui/can';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs/tabs';
import { ChannelStatsBar } from '@/features/agent-channels/components/channel-stats-bar';
import { MessagesLog } from '@/features/agent-channels/components/messages-log';
import { SenderCreateDialog } from '@/features/agent-channels/components/sender-create-dialog';
import { SendersTable } from '@/features/agent-channels/components/senders-table';

/**
 * Canaux de l'assistant IA : qui peut discuter avec l'agent, avec quels
 * droits, et ce qui a réellement circulé.
 *
 * ONGLETS plutôt que deux cartes empilées : les deux domaines ont des régimes
 * d'usage opposés. « Identités » est un écran de gestion — peu de lignes, on y
 * vient pour modifier. « Journal » est un écran d'investigation — filtres,
 * pagination, lecture. Empilés, leurs deux barres d'outils se disputaient la
 * largeur et comprimaient la colonne du message à une vingtaine de caractères,
 * alors que c'est précisément là que se lit un incident.
 *
 * Le bandeau d'indicateurs reste HORS des onglets : le compteur d'échecs doit
 * se voir quel que soit l'onglet ouvert. L'erreur 63112 (compte WhatsApp
 * désactivé par Meta) est restée invisible des heures faute d'un tel signal.
 */
export default function CanauxAssistantPage() {
  return (
    <Can permission="admin:agent-channels">
      <Shell title="Canaux de l'assistant IA">
        <div className="space-y-6">
          <ChannelStatsBar />

          <Tabs defaultValue="identites">
            <TabsList>
              <TabsTrigger value="identites">Identités autorisées</TabsTrigger>
              <TabsTrigger value="journal">Journal des messages</TabsTrigger>
            </TabsList>

            <TabsContent value="identites" className="mt-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Comptes autorisés à dialoguer avec l&apos;assistant depuis
                  WhatsApp ou par email.
                </p>
                <SenderCreateDialog />
              </div>
              <SendersTable />
            </TabsContent>

            <TabsContent value="journal" className="mt-4">
              <MessagesLog />
            </TabsContent>
          </Tabs>
        </div>
      </Shell>
    </Can>
  );
}
