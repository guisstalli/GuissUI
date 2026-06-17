'use client';

import {
  AlertCircle,
  Download,
  FileImage,
  FileText,
  Loader2,
  Paperclip,
  Trash2,
  Upload,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Label, Textarea } from '@/components/ui/form';
import { useNotifications } from '@/components/ui/notifications';
import {
  downloadAttachment,
  useAttachments,
  useDeleteAttachment,
  useUploadAttachment,
} from '@/features/exams/api/attachments';

interface ExamAttachmentsSectionProps {
  /** clinical_examen.id — attachments are scoped to it; falsy → upload disabled */
  clinicalExamId: number | null | undefined;
  /** Notified after a successful upload (e.g. to mark the section complete) */
  onUploaded?: () => void;
}

/**
 * Self-contained "pièces jointes" panel for a clinical exam: owns its query,
 * upload/delete/download state and handlers. Consumers pass only the clinical
 * exam id and an optional `onUploaded` callback — no prop drilling.
 */
export function ExamAttachmentsSection({
  clinicalExamId,
  onUploaded,
}: ExamAttachmentsSectionProps) {
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
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUploadFiles = () => {
    if (!clinicalExamId || selectedFiles.length === 0) return;

    selectedFiles.forEach((file) => {
      uploadAttachment(
        {
          clinicalExamId,
          file,
          description: fileDescription.trim(),
        },
        {
          onSuccess: () => {
            refetchAttachments();
            setSelectedFiles([]);
            setFileDescription('');
            onUploaded?.();
          },
        },
      );
    });
  };

  const handleDeleteAttachment = (attachmentId: number) => {
    if (!clinicalExamId) return;
    deleteAttachment(
      { id: attachmentId, clinicalExamId },
      {
        onSuccess: () => {
          refetchAttachments();
        },
      },
    );
  };

  const handleDownloadAttachment = async (
    id: number,
    originalFilename: string,
  ) => {
    try {
      setDownloadingId(id);
      const { url } = await downloadAttachment(id);

      // Télécharger via un lien temporaire
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = originalFilename; // Tente de forcer le nom du fichier si cross-origin le permet
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
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-foreground">Fichiers joints</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Ajoutez des images ou documents liés à cet examen clinique.
        </p>
      </div>

      {/* Message si pas d'ID clinique */}
      {!clinicalExamId && (
        <div className="border-warning/30 bg-warning/10 flex items-center gap-3 rounded-lg border p-4">
          <AlertCircle className="size-5 text-warning" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Enregistrez d&apos;abord les données cliniques
            </p>
            <p className="text-sm text-muted-foreground">
              Vous devez sauvegarder les sections cliniques avant de pouvoir
              ajouter des fichiers joints.
            </p>
          </div>
        </div>
      )}

      {/* Upload Form */}
      {clinicalExamId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ajouter des fichiers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Sélectionner des fichiers</Label>
              <Input
                id="file-upload"
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Fichiers sélectionnés</Label>
                <ul className="space-y-1">
                  {selectedFiles.map((file, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Paperclip className="size-3" />
                      {file.name} ({(file.size / 1024).toFixed(1)} Ko)
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="file-description">
                Titre du document <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="file-description"
                value={fileDescription}
                onChange={(e) => setFileDescription(e.target.value)}
                placeholder="Ex: Résultat OCT, Fond d'œil OD..."
                rows={2}
              />
            </div>

            <Button
              type="button"
              onClick={handleUploadFiles}
              disabled={
                selectedFiles.length === 0 ||
                isUploading ||
                !fileDescription.trim()
              }
            >
              {isUploading ? (
                <Loader2 className="mr-1.5 size-4 animate-spin" />
              ) : (
                <Upload className="mr-1.5 size-4" />
              )}
              Uploader les fichiers
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Liste des fichiers existants */}
      {clinicalExamId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fichiers existants</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAttachments ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : attachments.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Aucun fichier joint pour le moment.
              </p>
            ) : (
              <ul className="space-y-3">
                {attachments.map((attachment) => (
                  <li
                    key={attachment.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      {attachment.is_image ? (
                        <FileImage className="size-4 text-blue-500" />
                      ) : attachment.is_pdf ? (
                        <FileText className="size-4 text-red-500" />
                      ) : (
                        <Paperclip className="size-4 text-muted-foreground" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {attachment.original_filename}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {attachment.file_size >= 1024 * 1024
                            ? `${(attachment.file_size / (1024 * 1024)).toFixed(1)} Mo`
                            : `${(attachment.file_size / 1024).toFixed(1)} Ko`}
                          {attachment.description &&
                            ` • ${attachment.description}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {attachment.file_url ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          title="Télécharger"
                        >
                          <a
                            href={attachment.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={attachment.original_filename}
                            aria-label={`Télécharger ${attachment.original_filename}`}
                          >
                            <Download className="size-4 text-muted-foreground" />
                          </a>
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleDownloadAttachment(
                              attachment.id,
                              attachment.original_filename,
                            )
                          }
                          disabled={downloadingId === attachment.id}
                          title="Télécharger"
                        >
                          {downloadingId === attachment.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Download className="size-4 text-muted-foreground" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAttachment(attachment.id)}
                        disabled={isDeleting}
                        title="Supprimer"
                      >
                        {isDeleting ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
