'use client';

import { Plus, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { useState } from 'react';

import { AppShell as Shell } from '@/app/_shell';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/form/select';
import { Spinner } from '@/components/ui/spinner';
import { useCreateFacture } from '@/features/billing/api/create-facture';
import { useFactures } from '@/features/billing/api/get-factures';
import { CreateFactureForm } from '@/features/billing/components/create-facture-form';
import { FacturesTable } from '@/features/billing/components/factures-table';
import { FACTURE_STATUT_VALUES } from '@/features/billing/types/schemas';
import { useSites } from '@/features/sites/api/get-sites';
import { useDialogCleanup } from '@/hooks/use-dialog-cleanup';

const ITEMS_PER_PAGE = 20;

const STATUT_LABELS: Record<string, string> = {
  brouillon: 'Brouillon',
  emise: 'Émise',
  payee: 'Payée',
  annulee: 'Annulée',
};

export default function FacturationPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [statutFilter, setStatutFilter] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useDialogCleanup([showCreateDialog]);

  const queryParams = {
    limit: ITEMS_PER_PAGE,
    offset: (currentPage - 1) * ITEMS_PER_PAGE,
    ...(statutFilter ? { statut: statutFilter } : {}),
  };

  const { data, isLoading } = useFactures({ params: queryParams });
  const { data: sitesData } = useSites({ params: { limit: 100 } });
  const sites = sitesData?.results ?? [];

  const createMutation = useCreateFacture({
    mutationConfig: { onSuccess: () => setShowCreateDialog(false) },
  });

  const factures = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <Shell title="Facturation">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Factures</h2>
            <p className="text-sm text-muted-foreground">
              {totalCount} facture{totalCount !== 1 ? 's' : ''}
              {statutFilter
                ? ` · ${STATUT_LABELS[statutFilter] ?? statutFilter}`
                : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={statutFilter || '__all__'}
              onValueChange={(v) => {
                setStatutFilter(v === '__all__' ? '' : v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-40 text-sm">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Tous les statuts</SelectItem>
                {FACTURE_STATUT_VALUES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUT_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-1.5 size-3.5" />
              Nouvelle facture
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner />
          </div>
        ) : factures.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
            <FileText className="text-muted-foreground/40 mb-3 size-10" />
            <p className="font-medium text-muted-foreground">
              Aucune facture trouvée
            </p>
            {statutFilter && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => setStatutFilter('')}
              >
                Effacer le filtre
              </Button>
            )}
          </div>
        ) : (
          <FacturesTable factures={factures} />
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
            <DialogTitle>Nouvelle facture</DialogTitle>
            <DialogDescription>
              Créer une nouvelle facture de prestations.
            </DialogDescription>
          </DialogHeader>
          <CreateFactureForm
            onSubmit={(data) => createMutation.mutate(data)}
            isPending={createMutation.isPending}
            sites={sites}
          />
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
