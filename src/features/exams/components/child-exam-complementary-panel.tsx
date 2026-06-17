'use client';

import { Check, Loader2, Paperclip, Trash2, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/form';
import {
  BiomicroscopyAnteriorForm,
  BiomicroscopyPosteriorForm,
  ExamensAdditionelsSection,
  PerimetryForm,
  PlaintesForm,
} from '@/features/exams/components/forms';
import { cn } from '@/lib/utils';

type ComplementarySubsection =
  | 'plaintes'
  | 'biomicroscopy'
  | 'perimetry'
  | 'attachments';

export interface ChildExamAttachment {
  id: number;
  original_filename: string;
  file_url?: string | null;
  file_size: number;
  description?: string | null;
  is_image: boolean;
  is_pdf: boolean;
  created: string;
}

interface ChildExamComplementaryPanelProps {
  examId: string;
  complementarySubsection: ComplementarySubsection;
  setComplementarySubsection: (s: ComplementarySubsection) => void;
  handleSaveComplementary: () => void;
  isSaving: boolean;
  clinicalExamId?: number;
  attachments: ChildExamAttachment[];
  isLoadingAttachments: boolean;
  selectedFiles: File[];
  fileDescription: string;
  setFileDescription: (d: string) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUploadFiles: () => void;
  handleDeleteAttachment: (id: number) => void;
  handleDownloadAttachment: (id: number, filename: string) => void;
  isUploading: boolean;
  isDeleting: boolean;
  downloadingId: number | null;
}

export function ChildExamComplementaryPanel({
  examId,
  complementarySubsection,
  setComplementarySubsection,
  handleSaveComplementary,
  isSaving,
  clinicalExamId,
  attachments,
  isLoadingAttachments,
  selectedFiles,
  fileDescription,
  setFileDescription,
  handleFileSelect,
  handleUploadFiles,
  handleDeleteAttachment,
  handleDownloadAttachment,
  isUploading,
  isDeleting,
  downloadingId,
}: ChildExamComplementaryPanelProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div>
        <h1 className="text-xl font-semibold">Examens Complémentaires</h1>
        <p className="text-sm text-muted-foreground">
          Plaintes, périmétrie, biomicroscopie et pièces jointes
        </p>
      </div>
      <div className="my-2 flex w-fit flex-wrap gap-1 rounded-lg border  p-1">
        {(
          [
            ['plaintes', 'Plaintes'],
            ['biomicroscopy', 'Biomicroscopie'],
            ['perimetry', 'Périmétrie'],
            ['attachments', 'Pièces jointes'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              complementarySubsection === id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
            onClick={() =>
              setComplementarySubsection(id as ComplementarySubsection)
            }
          >
            {label}
          </button>
        ))}
      </div>

      {complementarySubsection === 'plaintes' && (
        <PlaintesForm namePrefix="plaintes" />
      )}
      {complementarySubsection === 'perimetry' && (
        <div className="rounded-lg border border-border bg-card p-4">
          <PerimetryForm namePrefix="perimetry" />
          <ExamensAdditionelsSection namePrefix="perimetry" />
        </div>
      )}
      {complementarySubsection === 'biomicroscopy' && (
        <div className="rounded-lg border border-border bg-card p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Biomicroscopie — OD</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <BiomicroscopyAnteriorForm
                namePrefix="od.bp_sg_anterieur"
                eyeLabel="OD"
              />
              <BiomicroscopyPosteriorForm
                namePrefix="od.bp_sg_posterieur"
                eyeLabel="OD"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Biomicroscopie — OG</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <BiomicroscopyAnteriorForm
                namePrefix="og.bp_sg_anterieur"
                eyeLabel="OG"
              />
              <BiomicroscopyPosteriorForm
                namePrefix="og.bp_sg_posterieur"
                eyeLabel="OG"
              />
            </CardContent>
          </Card>
        </div>
      )}
      {complementarySubsection !== 'attachments' && (
        <div className="mt-6 flex justify-end border-t border-border pt-4">
          <Button
            type="button"
            onClick={handleSaveComplementary}
            disabled={isSaving || examId === 'new'}
          >
            {isSaving ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Check className="mr-2 size-4" />
            )}
            Sauvegarder
          </Button>
        </div>
      )}
      {complementarySubsection === 'attachments' && (
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
                Enregistrez d&apos;abord les données complémentaires pour
                pouvoir joindre des fichiers.
              </p>
            ) : (
              <>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="file-upload-child">
                      Titre du document *
                    </Label>
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
                          document
                            .getElementById('file-upload-child')
                            ?.click()
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
      )}
    </div>
  );
}
