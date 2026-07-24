'use client';

import { format } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Check,
  Clock,
  ExternalLink,
  Loader2,
  Phone,
  Plus,
  Receipt,
  User,
  X,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import type { View } from 'react-big-calendar';

import { AppShell as Shell } from '@/app/_shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs/tabs';
import { paths } from '@/config/paths';
import { useRdvList } from '@/features/appointments/api/get-rdv-list';
import { useRdvStats } from '@/features/appointments/api/get-rdv-stats';
import {
  useCancelRdvStaff,
  useConfirmRdv,
  useMarkAbsent,
  useMarkPresent,
} from '@/features/appointments/api/rdv-actions';
import type { RdvEvent } from '@/features/appointments/components/rdv-calendar';
import type { RendezVous } from '@/features/appointments/types/schemas';
import { STATUT_COLORS } from '@/features/appointments/utils/statut-colors';
import { useCreateFacture } from '@/features/billing/api/create-facture';
import { useFactures } from '@/features/billing/api/get-factures';
import { CreateFactureForm } from '@/features/billing/components/create-facture-form';
import { useSites } from '@/features/sites/api/get-sites';
import { usePersistentTabState } from '@/hooks/use-persistent-tab-state';
import { cn } from '@/lib/utils';

// react-big-calendar et recharts sont lourds : chargés seulement quand
// l'onglet correspondant est affiché, hors du bundle initial de la route.
const RdvCalendar = dynamic(
  () =>
    import('@/features/appointments/components/rdv-calendar').then(
      (m) => m.RdvCalendar,
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[620px] rounded-xl" />,
  },
);

const RdvStatsDonut = dynamic(
  () =>
    import('@/features/appointments/components/rdv-stats-donut').then(
      (m) => m.RdvStatsDonut,
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[380px] rounded-xl" />,
  },
);

const STATUT_STYLES: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  en_attente: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-300',
  },
  confirme: {
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-300',
  },
  present: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-300',
  },
  absent: {
    bg: 'bg-slate-50',
    text: 'text-slate-500',
    border: 'border-slate-200',
  },
  annule: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

const STATUT_DOT_CLASS: Record<string, string> = {
  en_attente: 'bg-amber-500',
  confirme: 'bg-blue-600',
  present: 'bg-emerald-600',
  absent: 'bg-slate-400',
  annule: 'bg-red-600',
};

const STATUT_LABELS: Record<string, string> = {
  en_attente: 'En attente',
  confirme: 'Confirmé',
  present: 'Présent',
  absent: 'Absent',
  annule: 'Annulé',
};

function RdvDetailPanel({
  rdv,
  onClose,
}: {
  rdv: RendezVous;
  onClose: () => void;
}) {
  const styles = STATUT_STYLES[rdv.statut] ?? STATUT_STYLES.en_attente;
  const [showCreateFacture, setShowCreateFacture] = useState(false);

  const { mutate: confirm, isPending: confirming } = useConfirmRdv(rdv.id, {
    onSuccess: onClose,
  });
  const { mutate: cancel, isPending: cancelling } = useCancelRdvStaff(rdv.id, {
    onSuccess: onClose,
  });
  const { mutate: markPresent, isPending: markingPresent } = useMarkPresent(
    rdv.id,
    { onSuccess: onClose },
  );
  const { mutate: markAbsent, isPending: markingAbsent } = useMarkAbsent(
    rdv.id,
    { onSuccess: onClose },
  );

  const { data: factureData, isLoading: loadingFacture } = useFactures({
    params: { rendez_vous_id: rdv.id, limit: 1 },
  });
  const linkedFacture = factureData?.results?.[0] ?? null;

  const { data: sitesData } = useSites({ params: { limit: 100 } });
  const sites = sitesData?.results ?? [];

  const createFactureMutation = useCreateFacture({
    mutationConfig: {
      onSuccess: () => setShowCreateFacture(false),
    },
  });

  return (
    <div className="space-y-5">
      {/* Status */}
      <div
        className={cn('rounded-xl border px-4 py-3', styles.bg, styles.border)}
      >
        <p className={cn('text-sm font-semibold', styles.text)}>
          {STATUT_LABELS[rdv.statut]}
        </p>
        <p className="text-xs text-slate-500">{rdv.numero_rdv}</p>
      </div>

      {/* Patient */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <User className="size-4 shrink-0 text-slate-400" />
          <span className="font-semibold">
            {rdv.patient_prenom} {rdv.patient_nom}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <Phone className="size-4 shrink-0 text-slate-400" />
          {rdv.patient_phone}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <CalendarIcon className="size-4 shrink-0 text-slate-400" />
          {new Date(rdv.date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <Clock className="size-4 shrink-0 text-slate-400" />
          {rdv.heure_debut.slice(0, 5)} – {rdv.heure_fin.slice(0, 5)}
        </div>
        {rdv.motif && (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
            {rdv.motif}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        {rdv.statut === 'en_attente' && (
          <Button
            size="sm"
            className="gap-1.5 bg-blue-600 hover:bg-blue-700"
            onClick={() => confirm()}
            disabled={confirming}
          >
            <Check className="size-3.5" />
            Confirmer
          </Button>
        )}
        {rdv.statut === 'confirme' && (
          <Button
            size="sm"
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
            onClick={() => markPresent()}
            disabled={markingPresent}
          >
            <Check className="size-3.5" />
            Présent
          </Button>
        )}
        {(rdv.statut === 'confirme' || rdv.statut === 'en_attente') && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-slate-600"
            onClick={() => markAbsent()}
            disabled={markingAbsent}
          >
            Absent
          </Button>
        )}
        {rdv.statut !== 'annule' && rdv.statut !== 'present' && (
          <Button
            size="sm"
            variant="outline"
            className="col-span-2 gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => cancel()}
            disabled={cancelling}
          >
            <X className="size-3.5" />
            Annuler le RDV
          </Button>
        )}
      </div>

      {/* Billing */}
      <div className="border-t pt-4">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <Receipt className="size-3.5" />
          Facturation
        </p>
        {loadingFacture ? (
          <Loader2 className="size-4 animate-spin text-slate-400" />
        ) : linkedFacture ? (
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
            <span className="font-medium text-slate-800">
              {linkedFacture.numero}
            </span>
            <a
              href={paths.billing.detail.getHref(linkedFacture.id)}
              className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              <ExternalLink className="size-3" />
              Voir le détail
            </a>
          </div>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 text-slate-700"
              onClick={() => setShowCreateFacture(true)}
            >
              <Plus className="size-3.5" />
              Créer une facture
            </Button>
            {showCreateFacture && (
              <div className="mt-3 rounded-lg border bg-white p-3">
                <CreateFactureForm
                  isPending={createFactureMutation.isPending}
                  sites={sites}
                  defaultValues={{
                    patient_nom: rdv.patient_nom,
                    patient_prenom: rdv.patient_prenom,
                    patient_phone: rdv.patient_phone,
                    rendez_vous_id: rdv.id,
                  }}
                  onSubmit={(data) => createFactureMutation.mutate(data)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const STATUT_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'confirme', label: 'Confirmés' },
  { value: 'present', label: 'Présents' },
  { value: 'absent', label: 'Absents' },
  { value: 'annule', label: 'Annulés' },
];

export default function GestionRendezVousPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = usePersistentTabState({
    paramKey: 'tab',
    storageKey: 'guiss.tab.gestion-rdv',
    defaultValue: 'agenda',
    allowed: ['agenda', 'liste', 'stats'],
  });
  const initialStatut = searchParams.get('statut') ?? 'all';

  const [selectedRdv, setSelectedRdv] = useState<RendezVous | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>('week');
  const [listStatut, setListStatut] = useState<string>(initialStatut);

  const { data: statsData } = useRdvStats();

  const { data, isLoading } = useRdvList({
    limit: 200,
    date_from: format(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      'yyyy-MM-dd',
    ),
    date_to: format(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0),
      'yyyy-MM-dd',
    ),
  });

  const { data: listData, isLoading: isListLoading } = useRdvList({
    limit: 100,
    statut: listStatut !== 'all' ? listStatut : undefined,
  });
  const listRdv: RendezVous[] = listData?.results ?? [];

  // Mémoïsé depuis data?.results : un tableau recréé à chaque render
  // invaliderait le useMemo des events en permanence.
  const rdvList: RendezVous[] = useMemo(
    () => data?.results ?? [],
    [data?.results],
  );

  const events: RdvEvent[] = useMemo(
    () =>
      rdvList.map((rdv) => {
        const start = new Date(`${rdv.date}T${rdv.heure_debut}`);
        const end = new Date(`${rdv.date}T${rdv.heure_fin}`);
        return {
          id: rdv.id,
          title: `${rdv.patient_prenom} ${rdv.patient_nom}`,
          start,
          end,
          rdv,
        };
      }),
    [rdvList],
  );

  const handleSelectEvent = useCallback((event: RdvEvent) => {
    setSelectedRdv(event.rdv);
  }, []);

  const statsTotal = statsData
    ? statsData.en_attente +
      statsData.confirme +
      statsData.present +
      statsData.absent +
      statsData.annule
    : 0;

  const statsChartData = statsData
    ? [
        {
          name: 'En attente',
          value: statsData.en_attente,
          fill: STATUT_COLORS.en_attente,
        },
        {
          name: 'Confirmé',
          value: statsData.confirme,
          fill: STATUT_COLORS.confirme,
        },
        {
          name: 'Présent',
          value: statsData.present,
          fill: STATUT_COLORS.present,
        },
        { name: 'Absent', value: statsData.absent, fill: STATUT_COLORS.absent },
        { name: 'Annulé', value: statsData.annule, fill: STATUT_COLORS.annule },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <Shell title="Agenda">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-1 flex-col gap-4"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agenda</h1>
            <p className="text-sm text-muted-foreground">
              Gérez les rendez-vous de la consultation
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Legend (agenda tab only) */}
            <div className="hidden flex-wrap gap-3 sm:flex">
              {Object.entries(STATUT_LABELS).map(([key, label]) => (
                <div
                  key={key}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <span
                    className={cn(
                      'size-2.5 rounded-full',
                      STATUT_DOT_CLASS[key] ?? 'bg-slate-400',
                    )}
                  />
                  {label}
                </div>
              ))}
            </div>
            <TabsList>
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
              <TabsTrigger value="liste">Liste</TabsTrigger>
              <TabsTrigger value="stats">Statistiques</TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Agenda tab */}
        <TabsContent value="agenda" className="flex flex-col gap-4">
          {isLoading ? (
            <Skeleton className="h-[600px] rounded-xl" />
          ) : (
            <RdvCalendar
              events={events}
              view={view}
              date={currentDate}
              onNavigate={setCurrentDate}
              onView={setView}
              onSelectEvent={handleSelectEvent}
            />
          )}
        </TabsContent>

        {/* Liste tab */}
        <TabsContent value="liste" className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Filtrer&nbsp;:
            </span>
            {STATUT_FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setListStatut(opt.value)}
                className={cn(
                  'rounded-md px-3 py-1 text-sm font-medium transition-colors',
                  listStatut === opt.value
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {isListLoading ? (
            <Skeleton className="h-[400px] rounded-xl" />
          ) : listRdv.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                Aucun rendez-vous correspondant à ce filtre.
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">
                      Patient
                    </th>
                    <th className="px-4 py-2 text-left font-semibold">
                      Téléphone
                    </th>
                    <th className="px-4 py-2 text-left font-semibold">Date</th>
                    <th className="px-4 py-2 text-left font-semibold">Heure</th>
                    <th className="px-4 py-2 text-left font-semibold">
                      Statut
                    </th>
                    <th className="px-4 py-2 text-right font-semibold">
                      Numéro
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {listRdv.map((rdv) => {
                    const styles =
                      STATUT_STYLES[rdv.statut] ?? STATUT_STYLES.en_attente;
                    return (
                      <tr
                        key={rdv.id}
                        onClick={() => setSelectedRdv(rdv)}
                        className="hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-foreground">
                          {rdv.patient_prenom} {rdv.patient_nom}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {rdv.patient_phone}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(rdv.date).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {rdv.heure_debut.slice(0, 5)} –{' '}
                          {rdv.heure_fin.slice(0, 5)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold',
                              styles.bg,
                              styles.text,
                              styles.border,
                            )}
                          >
                            {STATUT_LABELS[rdv.statut] ?? rdv.statut}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                          {rdv.numero_rdv}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* Stats tab */}
        <TabsContent value="stats" className="space-y-6">
          {!statsData ? (
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              {/* KPI row */}
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {[
                  {
                    label: 'Total',
                    value: statsTotal,
                    color: 'text-foreground',
                    bg: 'bg-slate-50',
                  },
                  {
                    label: 'En attente',
                    value: statsData.en_attente,
                    color: 'text-amber-700',
                    bg: 'bg-amber-50',
                  },
                  {
                    label: 'Confirmés',
                    value: statsData.confirme,
                    color: 'text-blue-700',
                    bg: 'bg-blue-50',
                  },
                  {
                    label: 'Présents',
                    value: statsData.present,
                    color: 'text-emerald-700',
                    bg: 'bg-emerald-50',
                  },
                  {
                    label: 'Annulés',
                    value: statsData.annule,
                    color: 'text-red-600',
                    bg: 'bg-red-50',
                  },
                ].map(({ label, value, color, bg }) => (
                  <Card key={label} className={cn('border-0', bg)}>
                    <CardContent className="p-4">
                      <p className="text-xs font-medium text-muted-foreground">
                        {label}
                      </p>
                      <p className={cn('mt-1 text-3xl font-bold', color)}>
                        {value}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Donut chart */}
              {statsChartData.length > 0 ? (
                <RdvStatsDonut data={statsChartData} />
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-sm text-muted-foreground">
                    Aucune donnée de rendez-vous disponible.
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* RDV detail dialog */}
      <Dialog open={!!selectedRdv} onOpenChange={() => setSelectedRdv(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Détail du rendez-vous</DialogTitle>
          </DialogHeader>
          {selectedRdv && (
            <RdvDetailPanel
              rdv={selectedRdv}
              onClose={() => setSelectedRdv(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
