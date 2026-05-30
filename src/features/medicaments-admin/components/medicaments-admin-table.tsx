'use client';

import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog/dialog';
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@/components/ui/form';
import { useNotifications } from '@/components/ui/notifications';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { useMedicamentsAdmin } from '../api/get-medicaments-admin';
import {
  useDeleteMedicament,
  useToggleMedicament,
} from '../api/medicament-mutations';
import {
  FORME_LABELS,
  type FormeGalenique,
  type MedicamentAdmin,
} from '../types/schemas';

import { MedicamentEditDialog } from './medicament-edit-dialog';

const FORMES: FormeGalenique[] = [
  'COLLYRE',
  'POMMADE',
  'COMPRIMES',
  'INJECTION',
  'GEL',
  'SOLUTION',
  'AUTRE',
];

const PAGE_SIZE = 20;

export function MedicamentsAdminTable() {
  const { addNotification } = useNotifications();

  // Filters / pagination
  const [search, setSearch] = useState('');
  const [forme, setForme] = useState<FormeGalenique | 'ALL'>('ALL');
  const [actifFilter, setActifFilter] = useState<'ALL' | 'true' | 'false'>(
    'ALL',
  );
  const [offset, setOffset] = useState(0);

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<MedicamentAdmin | null>(null);
  const [toDelete, setToDelete] = useState<MedicamentAdmin | null>(null);

  const params = {
    q: search.trim() || undefined,
    forme: forme === 'ALL' ? undefined : forme,
    actif: actifFilter === 'ALL' ? undefined : actifFilter === 'true',
    limit: PAGE_SIZE,
    offset,
  };
  const { data, isLoading, isFetching } = useMedicamentsAdmin(params);

  const total = data?.count ?? 0;
  const results = data?.results ?? [];

  const { mutate: toggleMut } = useToggleMedicament();
  const { mutate: deleteMut, isPending: deleting } = useDeleteMedicament({
    onSuccess: () => {
      addNotification({ type: 'success', title: 'Médicament supprimé' });
      setToDelete(null);
    },
  });

  const resetOffsetAnd =
    <T,>(setter: (v: T) => void) =>
    (v: T) => {
      setter(v);
      setOffset(0);
    };

  const canPrev = offset > 0;
  const canNext = offset + PAGE_SIZE < total;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative max-w-xs flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="DCI, nom commercial, ATC…"
              className="pl-8"
              value={search}
              onChange={(e) => resetOffsetAnd(setSearch)(e.target.value)}
            />
          </div>
          <Select
            value={forme}
            onValueChange={(v) =>
              resetOffsetAnd(setForme)(v as FormeGalenique | 'ALL')
            }
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Forme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Toutes les formes</SelectItem>
              {FORMES.map((f) => (
                <SelectItem key={f} value={f}>
                  {FORME_LABELS[f]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={actifFilter}
            onValueChange={(v) =>
              resetOffsetAnd(setActifFilter)(v as 'ALL' | 'true' | 'false')
            }
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous</SelectItem>
              <SelectItem value="true">Actifs</SelectItem>
              <SelectItem value="false">Désactivés</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setEditOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="size-4" />
          Ajouter
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-md" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-md border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          Aucun médicament — ajustez les filtres ou cliquez sur « Ajouter ».
        </div>
      ) : (
        <div
          className={cn(
            'overflow-hidden rounded-md border border-border bg-card',
            isFetching && 'opacity-70',
          )}
        >
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">DCI</th>
                <th className="px-3 py-2 text-left font-semibold">Forme</th>
                <th className="px-3 py-2 text-left font-semibold">
                  Nom commercial
                </th>
                <th className="px-3 py-2 text-left font-semibold">ATC</th>
                <th className="px-3 py-2 text-left font-semibold">Dosage</th>
                <th className="px-3 py-2 text-center font-semibold">Actif</th>
                <th className="px-3 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {results.map((m) => (
                <tr key={m.id} className="hover:bg-muted/40">
                  <td className="px-3 py-2 font-medium text-foreground">
                    {m.dci}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {m.forme_galenique_label}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {m.nom_commercial || '—'}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                    {m.atc_code || '—'}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {m.dosage_defaut || '—'}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Switch
                      checked={m.actif}
                      onCheckedChange={() => toggleMut(m.id)}
                      aria-label={
                        m.actif
                          ? 'Désactiver le médicament'
                          : 'Activer le médicament'
                      }
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditing(m);
                          setEditOpen(true);
                        }}
                        aria-label="Modifier"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setToDelete(m)}
                        className="text-destructive hover:text-destructive"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} sur {total}
          </span>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canPrev}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            >
              <ChevronLeft className="size-4" />
              Précédent
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canNext}
              onClick={() => setOffset(offset + PAGE_SIZE)}
            >
              Suivant
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit dialog */}
      <MedicamentEditDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        medicament={editing}
      />

      {/* Delete confirm */}
      <Dialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce médicament ?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            <strong>{toDelete?.dci}</strong> ({toDelete?.forme_galenique_label})
            sera supprimé du référentiel. Les lignes de prescription existantes
            conservent leur libellé texte mais perdent la référence FK.
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setToDelete(null)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={() => toDelete && deleteMut(toDelete.id)}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
