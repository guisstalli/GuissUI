'use client';

import {
  AlertCircle,
  Check,
  Download,
  FileImage,
  FileText,
  Loader2,
  Paperclip,
  Save,
  Stethoscope,
  Trash2,
  Upload,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Label, Textarea } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BiomicroscopyAnteriorForm } from '@/features/exams/components/forms/biomicroscopy-anterior-form';
import { BiomicroscopyPosteriorForm } from '@/features/exams/components/forms/biomicroscopy-posterior-form';
import { ExamensAdditionelsSection } from '@/features/exams/components/forms/examens-additionnels-section';
import { PerimetryForm } from '@/features/exams/components/forms/perimetry-form';
import { PlaintesForm } from '@/features/exams/components/forms/plaintes-form';
import type { ClinicalSubsection } from '@/features/exams/types/adult-exam';

import type { AdultExamAttachment, SectionStatus } from './adult-exam-types';

interface AdultExamClinicalPanelProps {
  clinicalSubsection: ClinicalSubsection;
  setClinicalSubsection: (s: ClinicalSubsection) => void;
  sectionStatus: SectionStatus;
  handleSaveSection: (section: 'clinical') => void;
  isSaving: boolean;
  // Attachments
  clinicalExamId?: number;
  attachments: AdultExamAttachment[];
  isLoadingAttachments: boolean;
  selectedFiles: File[];
  fileDescription: string;
  setFileDescription: (desc: string) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUploadFiles: () => void;
  handleDeleteAttachment: (id: number) => void;
  handleDownloadAttachment: (id: number, filename: string) => void;
  isUploading: boolean;
  isDeleting: boolean;
  downloadingId: number | null;
}

export function AdultExamClinicalPanel({
  clinicalSubsection,
  setClinicalSubsection,
  sectionStatus,
  handleSaveSection,
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
}: AdultExamClinicalPanelProps) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border p-4">
        <h2 className="flex items-center gap-2 text-lg font-medium text-foreground">
          <Stethoscope className="size-5" aria-hidden="true" />
          Examen Clinique
        </h2>
      </div>

      <Tabs
        value={clinicalSubsection}
        onValueChange={(v) => setClinicalSubsection(v as ClinicalSubsection)}
      >
        <TabsList className="w-full justify-start overflow-x-auto rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="plaintes"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Plaintes
            {sectionStatus.clinical.plaintes && (
              <Check className="ml-1 size-3 text-primary" />
            )}
          </TabsTrigger>
          <TabsTrigger
            value="biomicroscopy"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Biomicroscopie
            {sectionStatus.clinical.biomicroscopy && (
              <Check className="ml-1 size-3 text-primary" />
            )}
          </TabsTrigger>
          <TabsTrigger
            value="perimetry"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Examens complementaires
            {sectionStatus.clinical.perimetry && (
              <Check className="ml-1 size-3 text-primary" />
            )}
          </TabsTrigger>
          <TabsTrigger
            value="attachments"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Paperclip className="mr-1 size-3" />
            Fichiers joints
            {sectionStatus.clinical.attachments && (
              <Check className="ml-1 size-3 text-primary" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plaintes" className="p-6">
          <PlaintesForm namePrefix="plaintes" />
          <div className="mt-6 flex justify-end border-t border-border pt-4">
            <Button
              type="button"
              onClick={() => handleSaveSection('clinical')}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="mr-1.5 size-4 animate-spin" />
              ) : (
                <Save className="mr-1.5 size-4" aria-hidden="true" />
              )}
              Sauvegarder
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="biomicroscopy" className="space-y-8 p-6">
          {/* Biomicroscopy with Eye Tabs */}
          <Tabs defaultValue="od" className="w-full">
            <TabsList className="mb-4 grid w-full grid-cols-2">
              <TabsTrigger value="od">OD (Oeil Droit)</TabsTrigger>
              <TabsTrigger value="og">OG (Oeil Gauche)</TabsTrigger>
            </TabsList>

            <TabsContent value="od" className="space-y-6">
              <Tabs defaultValue="anterior">
                <TabsList>
                  <TabsTrigger value="anterior">Segment Antérieur</TabsTrigger>
                  <TabsTrigger value="posterior">
                    Segment Postérieur
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="anterior" className="pt-4">
                  <BiomicroscopyAnteriorForm
                    namePrefix="od.bp_sg_anterieur"
                    eyeLabel="OD"
                  />
                </TabsContent>
                <TabsContent value="posterior" className="pt-4">
                  <BiomicroscopyPosteriorForm
                    namePrefix="od.bp_sg_posterieur"
                    eyeLabel="OD"
                  />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="og" className="space-y-6">
              <Tabs defaultValue="anterior">
                <TabsList>
                  <TabsTrigger value="anterior">Segment Antérieur</TabsTrigger>
                  <TabsTrigger value="posterior">
                    Segment Postérieur
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="anterior" className="pt-4">
                  <BiomicroscopyAnteriorForm
                    namePrefix="og.bp_sg_anterieur"
                    eyeLabel="OG"
                  />
                </TabsContent>
                <TabsContent value="posterior" className="pt-4">
                  <BiomicroscopyPosteriorForm
                    namePrefix="og.bp_sg_posterieur"
                    eyeLabel="OG"
                  />
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end border-t border-border pt-4">
            <Button
              type="button"
              onClick={() => handleSaveSection('clinical')}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="mr-1.5 size-4 animate-spin" />
              ) : (
                <Save className="mr-1.5 size-4" aria-hidden="true" />
              )}
              Sauvegarder
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="perimetry" className="space-y-6 p-6">
          <PerimetryForm namePrefix="perimetry" />
          <ExamensAdditionelsSection namePrefix="perimetry" />
          <div className="mt-6 flex justify-end border-t border-border pt-4">
            <Button
              type="button"
              onClick={() => handleSaveSection('clinical')}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="mr-1.5 size-4 animate-spin" />
              ) : (
                <Save className="mr-1.5 size-4" aria-hidden="true" />
              )}
              Sauvegarder
            </Button>
          </div>
        </TabsContent>

        {/* NEW: Attachments Tab */}
        <TabsContent value="attachments" className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground">
                Fichiers joints
              </h3>
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
                    Vous devez sauvegarder les sections cliniques avant de
                    pouvoir ajouter des fichiers joints.
                  </p>
                </div>
              </div>
            )}

            {/* Upload Form */}
            {clinicalExamId && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Ajouter des fichiers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="file-upload">
                      Sélectionner des fichiers
                    </Label>
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
                      Titre du document{' '}
                      <span className="text-destructive">*</span>
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
                  <CardTitle className="text-base">
                    Fichiers existants
                  </CardTitle>
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
                              onClick={() =>
                                handleDeleteAttachment(attachment.id)
                              }
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
