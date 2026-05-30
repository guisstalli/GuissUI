'use client';

import {
  Banknote,
  ChevronLeft,
  ChevronRight,
  FileText,
  Plus,
  Receipt,
  Search,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { AppShell as Shell } from '@/app/_shell';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useCreateFacture } from '@/features/billing/api/create-facture';
import { useFactureStats } from '@/features/billing/api/get-facture-stats';
import { useFactures } from '@/features/billing/api/get-factures';
import { CreateFactureForm } from '@/features/billing/components/create-facture-form';
import { FacturesTable } from '@/features/billing/components/factures-table';
import { FACTURE_STATUT_VALUES } from '@/features/billing/types/schemas';
import { KpiCard } from '@/features/dashboard/components/kpi-card';
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
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useDialogCleanup([showCreateDialog]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  const queryParams = {
    limit: ITEMS_PER_PAGE,
    offset: (currentPage - 1) * ITEMS_PER_PAGE,
    ...(statutFilter ? { statut: statutFilter } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(dateStart ? { date_start: dateStart } : {}),
    ...(dateEnd ? { date_end: dateEnd } : {}),
  };

  const statsParams = {
    ...(dateStart ? { date_start: dateStart } : {}),
    ...(dateEnd ? { date_end: dateEnd } : {}),
  };

  const { data, isLoading } = useFactures({ params: queryParams });
  const { data: statsData } = useFactureStats({ params: statsParams });
  const { data: sitesData } = useSites({ params: { limit: 100 } });
  const sites = sitesData?.results ?? [];

  const createMutation = useCreateFacture({
    mutationConfig: { onSuccess: () => setShowCreateDialog(false) },
  });

  const factures = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const fmtXOF = (val?: string) => {
    if (!val) return '0 XOF';
    const n = parseFloat(val);
    return isNaN(n) ? val : `${n.toLocaleString('fr-FR')} XOF`;
  };

  return (
    <Shell title="Facturation">
      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          title="Total factures"
          value={statsData?.total ?? 0}
          subtitle="dans la période"
          icon={FileText}
        />
        <KpiCard
          title="Montant émis"
          value={fmtXOF(statsData?.montant_total_emis)}
          subtitle={`${statsData?.emise ?? 0} factures émises`}
          icon={Receipt}
          className="border-blue-200 dark:border-blue-900/40"
        />
        <KpiCard
          title="Montant payé"
          value={fmtXOF(statsData?.montant_total_paye)}
          subtitle={`${statsData?.payee ?? 0} factures payées`}
          icon={TrendingUp}
          className="border-emerald-200 dark:border-emerald-900/40"
        />
        <KpiCard
          title="Solde dû"
          value={fmtXOF(statsData?.solde_du)}
          subtitle="non encore encaissé"
          icon={Banknote}
          className="border-amber-200 dark:border-amber-900/40"
        />
      </div>

      <div className="space-y-4">
        {/* Search + Filters row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="N° facture ou patient..."
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Input
            type="date"
            className="w-40"
            value={dateStart}
            onChange={(e) => {
              setDateStart(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Date de début"
          />
          <Input
            type="date"
            className="w-40"
            value={dateEnd}
            onChange={(e) => {
              setDateEnd(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Date de fin"
          />
          <Select
            value={statutFilter || '__all__'}
            onValueChange={(v) => {
              setStatutFilter(v === '__all__' ? '' : v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-40 text-sm">
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

        <p className="text-sm text-muted-foreground">
          {totalCount} facture{totalCount !== 1 ? 's' : ''}
          {statutFilter
            ? ` · ${STATUT_LABELS[statutFilter] ?? statutFilter}`
            : ''}
        </p>

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
