'use client';

import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Shell } from '@/components/layouts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/form';
import {
  TableBody,
  TableCell,
  TableElement as Table,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCreateAdultExam, useCreateChildExam } from '@/features/exams/api';
import { useDeletePatient, usePatients } from '@/features/patients/api';
import { NewPatientModal } from '@/features/patients/components/new-patient-modal';
import type { Sex } from '@/features/patients/types';
import { SEX_LABELS } from '@/features/patients/types/schemas';

const ITEMS_PER_PAGE = 10;

export default function PatientsPage() {
  const router = useRouter();
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sexFilter, setSexFilter] = useState<string>('all');
  const [createdAfter, setCreatedAfter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // État pour la confirmation de suppression
  const [patientToDelete, setPatientToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // État pour le patient en cours de création d'examen
  const [creatingExamForPatient, setCreatingExamForPatient] = useState<
    number | null
  >(null);

  // Construire les paramètres de requête
  const getIsAdultFilter = () => {
    if (typeFilter === 'adult') return true;
    if (typeFilter === 'child') return false;
    return undefined;
  };

  const getSexFilter = (): Sex | undefined => {
    if (sexFilter === 'all') return undefined;
    return sexFilter as Sex;
  };

  const queryParams = {
    search: searchQuery || undefined,
    is_adult: getIsAdultFilter(),
    sex: getSexFilter(),
    created_after: createdAfter || undefined,
    limit: ITEMS_PER_PAGE,
    offset: (currentPage - 1) * ITEMS_PER_PAGE,
  };

  const { data, isLoading, error, refetch } = usePatients({
    params: queryParams,
  });

  const deletePatientMutation = useDeletePatient({
    mutationConfig: {
      onSuccess: () => {
        setPatientToDelete(null);
        refetch();
      },
    },
  });

  // Mutations pour créer un examen
  const createAdultExamMutation = useCreateAdultExam({
    mutationConfig: {
      onSuccess: (data) => {
        setCreatingExamForPatient(null);
        router.push(`/exams/adult/${data.id}`);
      },
      onError: () => {
        setCreatingExamForPatient(null);
      },
    },
  });

  const createChildExamMutation = useCreateChildExam({
    mutationConfig: {
      onSuccess: (data) => {
        setCreatingExamForPatient(null);
        router.push(`/exams/child/${data.id}`);
      },
      onError: () => {
        setCreatingExamForPatient(null);
      },
    },
  });

  const patients = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleSexFilterChange = (value: string) => {
    setSexFilter(value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleCreatedAfterChange = (value: string) => {
    setCreatedAfter(value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handlePatientCreated = () => {
    refetch();
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handleViewPatient = (patientId: number) => {
    router.push(`/patients/${patientId}`);
  };

  const handleEditPatient = (patientId: number) => {
    router.push(`/patients/${patientId}?edit=true`);
  };

  const handleDeletePatient = () => {
    if (patientToDelete) {
      deletePatientMutation.mutate(patientToDelete.id);
    }
  };

  // Handler pour créer un examen
  const handleCreateExam = (patientId: number, isAdult: boolean) => {
    setCreatingExamForPatient(patientId);
    if (isAdult) {
      createAdultExamMutation.mutate({ patient_id: patientId });
    } else {
      createChildExamMutation.mutate({ patient_id: patientId });
    }
  };

  const handleClearFilters = () => {
    setTypeFilter('all');
    setSexFilter('all');
    setCreatedAfter('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    typeFilter !== 'all' || sexFilter !== 'all' || createdAfter !== '';

  return (
    <Shell
      title="Patients"
      showCreatePatient
      onCreatePatient={() => setShowNewPatientModal(true)}
    >
      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search and Toggle Filters */}
        <div className="flex items-center gap-4">
          <div className="relative max-w-sm flex-1">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Rechercher par nom ou ID..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              aria-label="Rechercher des patients"
            />
          </div>

          <Button
            variant={showFilters ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="size-4" />
            Filtres
            {hasActiveFilters && (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                !
              </span>
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="gap-2 text-muted-foreground"
            >
              <X className="size-4" />
              Effacer
            </Button>
          )}
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="bg-muted/30 flex flex-wrap gap-4 rounded-lg border border-border p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Type :
              </span>
              <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
                <SelectTrigger className="w-32" aria-label="Filtrer par type">
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="adult">Adulte</SelectItem>
                  <SelectItem value="child">Enfant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Sexe :
              </span>
              <Select value={sexFilter} onValueChange={handleSexFilterChange}>
                <SelectTrigger className="w-32" aria-label="Filtrer par sexe">
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="H">{SEX_LABELS.H}</SelectItem>
                  <SelectItem value="F">{SEX_LABELS.F}</SelectItem>
                  <SelectItem value="A">{SEX_LABELS.A}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Créé après :
              </span>
              <div className="relative">
                <Input
                  type="date"
                  value={createdAfter}
                  onChange={(e) => handleCreatedAfterChange(e.target.value)}
                  className="w-40 pl-9"
                  aria-label="Filtrer par date de création"
                />
                <CalendarIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <p className="text-destructive">
            Erreur lors du chargement des patients
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Réessayer
          </Button>
        </div>
      )}

      {/* Patients Table */}
      {!isLoading && !error && (
        <>
          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Patient</TableHead>
                  <TableHead>Nom complet</TableHead>
                  <TableHead>Âge</TableHead>
                  <TableHead>Sexe</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Aucun patient trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  patients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {patient.numero_identifiant}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/patients/${patient.id}`}
                          className="text-sm font-medium text-foreground hover:text-primary hover:underline"
                        >
                          {patient.full_name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {patient.age} ans
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {SEX_LABELS[patient.sex] || patient.sex}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            patient.is_adult
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                          }
                        >
                          {patient.is_adult ? 'Adulte' : 'Enfant'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(patient.created).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="size-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewPatient(patient.id)}
                            >
                              <Eye className="mr-2 size-4" />
                              Voir
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditPatient(patient.id)}
                            >
                              <Pencil className="mr-2 size-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleCreateExam(patient.id, patient.is_adult)
                              }
                              disabled={creatingExamForPatient === patient.id}
                            >
                              {creatingExamForPatient === patient.id ? (
                                <>
                                  <Loader2 className="mr-2 size-4 animate-spin" />
                                  Création...
                                </>
                              ) : (
                                <>
                                  <Plus className="mr-2 size-4" />
                                  Créer un examen
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                setPatientToDelete({
                                  id: patient.id,
                                  name: patient.full_name,
                                })
                              }
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 size-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {totalCount > 0 ? (
                <>
                  Affichage de{' '}
                  {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalCount)}{' '}
                  à {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} sur{' '}
                  {totalCount} patients
                </>
              ) : (
                'Aucun patient'
              )}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="mr-1 size-4" aria-hidden="true" />
                Précédent
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
              >
                Suivant
                <ChevronRight className="ml-1 size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* New Patient Modal */}
      <NewPatientModal
        open={showNewPatientModal}
        onOpenChange={setShowNewPatientModal}
        onPatientCreated={handlePatientCreated}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!patientToDelete}
        onOpenChange={(open) => !open && setPatientToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le patient</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le patient{' '}
              <strong>{patientToDelete?.name}</strong> ? Cette action peut être
              annulée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPatientToDelete(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePatient}
              disabled={deletePatientMutation.isPending}
            >
              {deletePatientMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
