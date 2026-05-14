'use client';

import dayjs from 'dayjs';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { AppShell as Shell } from '@/app/_shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog/dialog';
import { Input } from '@/components/ui/form/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/form/select';
import { Spinner } from '@/components/ui/spinner';
import {
  TableBody,
  TableCell,
  TableElement as Table,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCreateDriver } from '@/features/drivers/api/create-driver';
import { useDeleteDriver } from '@/features/drivers/api/delete-driver';
import { useDrivers } from '@/features/drivers/api/get-drivers';
import { DriverForm } from '@/features/drivers/components/driver-form';
import {
  REGIONS,
  SERVICE_VALUES,
  TYPE_PERMIS_VALUES,
  type Driver,
} from '@/features/drivers/types/schemas';
import { useDialogCleanup } from '@/hooks/use-dialog-cleanup';

const ITEMS_PER_PAGE = 15;

const SERVICE_LABELS: Record<string, string> = {
  Public: 'Public',
  Prive: 'Privé',
  Particulier: 'Particulier',
};
const TYPE_PERMIS_LABELS: Record<string, string> = {
  Leger: 'Léger',
  Lourd: 'Lourd',
  Autres: 'Autres',
};

export default function ConducteursPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [typePermisFilter, setTypePermisFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useDialogCleanup([showCreateDialog, !!driverToDelete]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    setCurrentPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 300);
  }, []);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  const queryParams = {
    limit: ITEMS_PER_PAGE,
    offset: (currentPage - 1) * ITEMS_PER_PAGE,
    ...(serviceFilter ? { service: serviceFilter } : {}),
    ...(typePermisFilter ? { type_permis: typePermisFilter } : {}),
    ...(regionFilter ? { zone_de_residence: regionFilter } : {}),
  };

  const { data, isLoading } = useDrivers({ params: queryParams });

  const createMutation = useCreateDriver({
    mutationConfig: { onSuccess: () => setShowCreateDialog(false) },
  });

  const deleteMutation = useDeleteDriver({
    mutationConfig: { onSuccess: () => setDriverToDelete(null) },
  });

  const drivers = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const hasActiveFilters =
    !!serviceFilter ||
    !!typePermisFilter ||
    !!regionFilter ||
    !!debouncedSearch;

  const clearFilters = () => {
    setServiceFilter('');
    setTypePermisFilter('');
    setRegionFilter('');
    setSearchInput('');
    setDebouncedSearch('');
    setCurrentPage(1);
  };

  return (
    <Shell title="Conducteurs">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Liste des conducteurs</h2>
            <p className="text-sm text-muted-foreground">
              {totalCount} conducteur{totalCount !== 1 ? 's' : ''} trouvé
              {totalCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters((v) => !v)}
            >
              <Filter className="mr-1.5 size-3.5" />
              Filtres
              {hasActiveFilters && (
                <span className="ml-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  !
                </span>
              )}
            </Button>
            <Button size="sm" onClick={() => setShowCreateDialog(true)}>
              <UserPlus className="mr-1.5 size-3.5" />
              Nouveau conducteur
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-muted/30 rounded-lg border p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Rechercher…"
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
              <Select
                value={serviceFilter}
                onValueChange={(v) => {
                  setServiceFilter(v === '__all__' ? '' : v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Secteur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Tous les secteurs</SelectItem>
                  {SERVICE_VALUES.map((v) => (
                    <SelectItem key={v} value={v}>
                      {SERVICE_LABELS[v]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={typePermisFilter}
                onValueChange={(v) => {
                  setTypePermisFilter(v === '__all__' ? '' : v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type de permis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Tous les permis</SelectItem>
                  {TYPE_PERMIS_VALUES.map((v) => (
                    <SelectItem key={v} value={v}>
                      {TYPE_PERMIS_LABELS[v]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={regionFilter}
                onValueChange={(v) => {
                  setRegionFilter(v === '__all__' ? '' : v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Région" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Toutes les régions</SelectItem>
                  {REGIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {hasActiveFilters && (
              <div className="mt-3 flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-1.5 size-3.5" />
                  Effacer les filtres
                </Button>
              </div>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner />
          </div>
        ) : drivers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
            <p className="font-medium text-muted-foreground">
              Aucun conducteur trouvé
            </p>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={clearFilters}
              >
                Effacer les filtres
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Conducteur</TableHead>
                  <TableHead>N° Permis</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Secteur</TableHead>
                  <TableHead>Région</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell className="font-medium">
                      <div>{driver.patient.full_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {driver.patient.numero_identifiant}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {driver.numero_permis}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {TYPE_PERMIS_LABELS[driver.type_permis] ??
                          driver.type_permis}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {SERVICE_LABELS[driver.service] ?? driver.service}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {driver.zone_de_residence}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {dayjs(driver.created).format('DD/MM/YYYY')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/conducteurs/${driver.id}`}>Ouvrir</Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDriverToDelete(driver)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {currentPage} sur {totalPages} ({totalCount} résultats)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create dialog */}
      <Dialog
        open={showCreateDialog}
        onOpenChange={(open) => {
          if (!open) setShowCreateDialog(false);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouveau conducteur</DialogTitle>
            <DialogDescription>
              Créer un conducteur et son dossier patient associé.
            </DialogDescription>
          </DialogHeader>
          <DriverForm
            onSubmit={(data) => createMutation.mutate(data)}
            isPending={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        open={!!driverToDelete}
        onOpenChange={(open) => {
          if (!open) setDriverToDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="size-5" />
              Supprimer le conducteur
            </DialogTitle>
            <DialogDescription>
              Voulez-vous supprimer{' '}
              <span className="font-semibold">
                {driverToDelete?.patient.full_name}
              </span>{' '}
              ? Cette action est{' '}
              <span className="font-semibold text-destructive">
                irréversible
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDriverToDelete(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() =>
                driverToDelete && deleteMutation.mutate(driverToDelete.id)
              }
            >
              {deleteMutation.isPending ? 'Suppression…' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
