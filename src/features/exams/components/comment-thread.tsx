'use client';

import { MessageSquare, Paperclip, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/form';
import { Spinner } from '@/components/ui/spinner';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

import {
  useCreateExamComment,
  useDeleteExamComment,
  useExamComments,
  useUpdateExamComment,
  type ExamComment,
  type ExamenType,
} from '../api/comments';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function initiales(email: string): string {
  return email.slice(0, 2).toUpperCase();
}

/** Zone de saisie réutilisée pour un nouveau fil, une réponse et une édition. */
function CommentComposer({
  initialValue = '',
  placeholder,
  submitLabel,
  isPending,
  onSubmit,
  onCancel,
}: {
  initialValue?: string;
  placeholder: string;
  submitLabel: string;
  isPending: boolean;
  onSubmit: (corps: string) => void;
  onCancel?: () => void;
}) {
  const [corps, setCorps] = useState(initialValue);
  const vide = corps.trim().length === 0;

  return (
    <div className="space-y-2">
      <Textarea
        rows={3}
        value={corps}
        placeholder={placeholder}
        onChange={(event) => setCorps(event.target.value)}
      />
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          disabled={vide || isPending}
          onClick={() => {
            onSubmit(corps.trim());
            setCorps('');
          }}
        >
          {submitLabel}
        </Button>
        {onCancel && (
          <Button size="sm" variant="ghost" onClick={onCancel}>
            Annuler
          </Button>
        )}
      </div>
    </div>
  );
}

function CommentCard({
  comment,
  examenType,
  examenId,
  isReply = false,
}: {
  comment: ExamComment;
  examenType: ExamenType;
  examenId: number;
  isReply?: boolean;
}) {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  const createMutation = useCreateExamComment(examenType, examenId);
  const updateMutation = useUpdateExamComment(examenType, examenId);
  const deleteMutation = useDeleteExamComment(examenType, examenId);

  const estAuteur = user?.id === String(comment.auteur_id);

  return (
    <article className={cn('flex gap-3', isReply && 'ml-8')}>
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground"
        aria-hidden="true"
      >
        {initiales(comment.auteur_email)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
          <span className="font-medium text-foreground">
            {comment.auteur_email}
          </span>
          <time
            className="text-xs text-muted-foreground"
            dateTime={comment.created}
          >
            {formatDate(comment.created)}
          </time>
          {comment.is_edited && (
            <span className="text-xs text-muted-foreground">(modifié)</span>
          )}
        </div>

        {comment.is_deleted ? (
          // On ne fait pas disparaître la ligne : dans un dossier médical, le
          // lecteur doit savoir qu'un propos a existé à cet endroit.
          <p className="mt-1 text-sm italic text-muted-foreground">
            Commentaire supprimé.
          </p>
        ) : isEditing ? (
          <div className="mt-2">
            <CommentComposer
              initialValue={comment.corps ?? ''}
              placeholder="Modifier le commentaire…"
              submitLabel="Enregistrer"
              isPending={updateMutation.isPending}
              onCancel={() => setIsEditing(false)}
              onSubmit={(corps) =>
                updateMutation.mutate(
                  { commentId: comment.id, corps },
                  { onSuccess: () => setIsEditing(false) },
                )
              }
            />
          </div>
        ) : (
          <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
            {comment.corps}
          </p>
        )}

        {comment.attachments.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-2">
            {comment.attachments.map((piece) => (
              <li key={piece.id}>
                <a
                  href={piece.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-foreground hover:bg-muted"
                >
                  <Paperclip className="size-3" aria-hidden="true" />
                  {piece.nom}
                </a>
              </li>
            ))}
          </ul>
        )}

        {!comment.is_deleted && !isEditing && (
          <div className="mt-1.5 flex flex-wrap gap-3 text-xs">
            {/* Une réponse se rattache toujours à la racine : pas de fil en
                arbre dans un dossier clinique. */}
            {!isReply && (
              <button
                type="button"
                onClick={() => setIsReplying((open) => !open)}
                className="text-muted-foreground hover:text-foreground"
              >
                Répondre
              </button>
            )}
            {estAuteur && (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="size-3" aria-hidden="true" />
                  Modifier
                </button>
                <button
                  type="button"
                  disabled={deleteMutation.isPending}
                  onClick={() =>
                    deleteMutation.mutate({ commentId: comment.id })
                  }
                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3" aria-hidden="true" />
                  Supprimer
                </button>
              </>
            )}
          </div>
        )}

        {isReplying && (
          <div className="mt-3">
            <CommentComposer
              placeholder="Votre réponse…"
              submitLabel="Répondre"
              isPending={createMutation.isPending}
              onCancel={() => setIsReplying(false)}
              onSubmit={(corps) =>
                createMutation.mutate(
                  { corps, parent_id: comment.id },
                  { onSuccess: () => setIsReplying(false) },
                )
              }
            />
          </div>
        )}

        {comment.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {comment.replies.map((reply) => (
              <CommentCard
                key={reply.id}
                comment={reply}
                examenType={examenType}
                examenId={examenId}
                isReply
              />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

/**
 * Fil de commentaires d'un examen.
 *
 * Plat par construction : un commentaire, ses réponses, rien de plus profond.
 * Un fil arborescent dans un dossier clinique devient vite illisible et l'on
 * ne sait plus à quoi une remarque répond.
 */
export function CommentThread({
  examenType,
  examenId,
}: {
  examenType: ExamenType;
  examenId: number;
}) {
  const { data: comments, isLoading } = useExamComments(examenType, examenId);
  const createMutation = useCreateExamComment(examenType, examenId);

  return (
    <section className="space-y-5">
      <header className="flex items-center gap-2 border-b border-border pb-2">
        <MessageSquare
          className="size-4 text-muted-foreground"
          aria-hidden="true"
        />
        <h3 className="text-sm font-semibold text-foreground">
          Commentaires
          {comments && comments.length > 0 && (
            <span className="ml-1.5 font-normal text-muted-foreground">
              {comments.length}
            </span>
          )}
        </h3>
      </header>

      <CommentComposer
        placeholder="Ajouter une observation sur cet examen…"
        submitLabel="Commenter"
        isPending={createMutation.isPending}
        onSubmit={(corps) => createMutation.mutate({ corps })}
      />

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Spinner size="sm" />
        </div>
      ) : !comments || comments.length === 0 ? (
        <p className="py-4 text-sm text-muted-foreground">
          Aucun commentaire pour l&apos;instant.
        </p>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              examenType={examenType}
              examenId={examenId}
            />
          ))}
        </div>
      )}
    </section>
  );
}
