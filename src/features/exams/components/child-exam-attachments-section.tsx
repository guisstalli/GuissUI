'use client';

import { Loader2, Paperclip, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/form';
import { useNotifications } from '@/components/ui/notifications';
import {
  downloadAttachment,
  useAttachments,
  useDeleteAttachment,
  useUploadAttachment,
} from '@/features/exams/api/attachments';

interface ChildExamAttachmentsSectionProps {
  clinicalExamId: number | null | undefined;
}

/**
 * Self-contained "pièces jointes" panel for a child clinical exam. Owns its
 * query, upload/delete/download state and handlers; consumers pass only the
 * clinical exam id.
 */
export function ChildExamAttachmentsSection({
  clinicalExamId,
}: ChildExamAttachmentsSectionProps) {
  const {
    data: attachments = [],
    isLoading: isLoadingAttachments,
    refetch: refetchAttachments,
  } = useAttachments({
    clinicalExamId: clinicalExamId ?? 0,
    enabled: !!clinicalExamId,
  });

  const { mutate: uploadAttachment, isPending: isUploading } =
    useUploadAttachment();
  const { mutate: deleteAttachment, isPending: isDeleting } =
    useDeleteAttachment();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileDescription, setFileDescription] = useState('');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedFiles(Array.from(e.target.files));
  };

  const handleUploadFiles = () => {
    if (!clinicalExamId || selectedFiles.length === 0) return;
    selectedFiles.forEach((file) => {
      uploadAttachment(
        { clinicalExamId, file, description: fileDescription || undefined },
        {
          onSuccess: () => {
            refetchAttachments();
            setSelectedFiles([]);
            setFileDescription('');
          },
        },
      );
    });
  };

  const handleDeleteAttachment = (id: number) => {
    if (!clinicalExamId) return;
    deleteAttachment(
      { id, clinicalExamId },
      { onSuccess: () => refetchAttachments() },
    );
  };

  const handleDownloadAttachment = async (id: number, filename: string) => {
    try {
      setDownloadingId(id);
      const { url } = await downloadAttachment(id);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } catch {
      useNotifications.getState().addNotification({
        type: 'error',
        title: 'Téléchargement impossible',
        message:
          'Impossible de télécharger le fichier joint. Veuillez réessayer.',
      });
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Paperclip className="size-4" />
          Pièces jointes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!clinicalExamId ? (
          <p className="text-sm text-muted-foreground">
            Enregistrez d&apos;abord les données complémentaires pour pouvoir
            joindre des fichiers.
          </p>
        ) : (
          <>
            <div className="space-y-3">
              <div>
                <Label htmlFor="file-upload-child">Titre du document *</Label>
                <Input
                  id="file-description-child"
                  placeholder="Titre du document (obligatoire)"
                  value={fileDescription}
                  onChange={(e) => setFileDescription(e.target.value)}
                  className="mb-2"
                />
                <input
                  id="file-upload-child"
                  type="file"
                  multiple
                  title="Sélectionner des fichiers"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() =>
                      document.getElementById('file-upload-child')?.click()
                    }
                  >
                    <Upload className="mr-1.5 size-3.5" /> Sélectionner
                  </Button>
                  {selectedFiles.length > 0 && (
                    <Button
                      size="sm"
                      type="button"
                      onClick={handleUploadFiles}
                      disabled={isUploading || !fileDescription.trim()}
                    >
                      {isUploading && (
                        <Loader2 className="mr-2 size-3.5 animate-spin" />
                      )}
                      Envoyer ({selectedFiles.length})
                    </Button>
                  )}
                </div>
                {selectedFiles.length > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selectedFiles.map((f) => f.name).join(', ')}
                  </p>
                )}
              </div>
            </div>
            {isLoadingAttachments ? (
              <div className="flex justify-center py-4">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : attachments.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                Aucune pièce jointe
              </p>
            ) : (
              <ul className="space-y-2">
                {attachments.map((att) => (
                  <li
                    key={att.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {att.description ?? att.original_filename}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {att.original_filename} ·{' '}
                        {(att.file_size / 1024).toFixed(1)} Ko
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() =>
                          handleDownloadAttachment(
                            att.id,
                            att.original_filename,
                          )
                        }
                        disabled={downloadingId === att.id}
                      >
                        {downloadingId === att.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          '↓'
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => handleDeleteAttachment(att.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
