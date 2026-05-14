'use client';

import { format, getDay, parse, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Loader2,
  Phone,
  Plus,
  Receipt,
  User,
  X,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import {
  Calendar,
  dateFnsLocalizer,
  type Event,
  type View,
} from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { AppShell as Shell } from '@/app/_shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useRdvList } from '@/features/appointments/api/get-rdv-list';
import { useRdvStats } from '@/features/appointments/api/get-rdv-stats';
import {
  useCancelRdvStaff,
  useConfirmRdv,
  useMarkAbsent,
  useMarkPresent,
} from '@/features/appointments/api/rdv-actions';
import type { RendezVous } from '@/features/appointments/types/schemas';
import { useCreateFacture } from '@/features/billing/api/create-facture';
import { useFactures } from '@/features/billing/api/get-factures';
import { CreateFactureForm } from '@/features/billing/components/create-facture-form';
import { useSites } from '@/features/sites/api/get-sites';
import { cn } from '@/lib/utils';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { locale: fr }),
  getDay,
  locales: { fr },
});

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

const STATUT_COLORS: Record<string, string> = {
  en_attente: '#d97706',
  confirme: '#2563eb',
  present: '#059669',
  absent: '#94a3b8',
  annule: '#dc2626',
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

interface RdvEvent extends Event {
  rdv: RendezVous;
}

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
              href={`/facturation`}
              className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              <ExternalLink className="size-3" />
              Voir
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

function CustomToolbar({
  date,
  view,
  onNavigate,
  onView,
}: {
  date: Date;
  view: View;
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
  onView: (view: View) => void;
}) {
  const label = format(
    date,
    view === 'day' ? 'EEEE d MMMM yyyy' : "'Semaine du' d MMMM yyyy",
    { locale: fr },
  );

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('PREV')}
          className="size-8 p-0"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('TODAY')}
          className="px-3"
        >
          Aujourd&apos;hui
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('NEXT')}
          className="size-8 p-0"
        >
          <ChevronRight className="size-4" />
        </Button>
        <h2 className="ml-2 text-base font-semibold capitalize text-slate-900">
          {label}
        </h2>
      </div>
      <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
        {(['week', 'day', 'agenda'] as View[]).map((v) => (
          <button
            type="button"
            key={v}
            onClick={() => onView(v)}
            className={cn(
              'rounded-md px-3 py-1 text-sm font-medium transition-colors',
              view === v
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700',
            )}
          >
            {v === 'week' ? 'Semaine' : v === 'day' ? 'Jour' : 'Agenda'}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function GestionRendezVousPage() {
  const [selectedRdv, setSelectedRdv] = useState<RendezVous | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>('week');

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

  const rdvList: RendezVous[] = data?.results ?? [];

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

  const eventStyleGetter = useCallback((event: RdvEvent) => {
    const color = STATUT_COLORS[event.rdv.statut] ?? '#94a3b8';
    return {
      style: {
        backgroundColor: `${color}20`,
        borderLeft: `3px solid ${color}`,
        color: color,
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
        padding: '2px 6px',
      },
    };
  }, []);

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
      <Tabs defaultValue="agenda" className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Agenda</h1>
            <p className="text-sm text-slate-500">
              Gérez les rendez-vous de la consultation
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Legend (agenda tab only) */}
            <div className="hidden flex-wrap gap-3 sm:flex">
              {Object.entries(STATUT_LABELS).map(([key, label]) => (
                <div
                  key={key}
                  className="flex items-center gap-1.5 text-xs text-slate-600"
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
              <TabsTrigger value="stats">Statistiques</TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Agenda tab */}
        <TabsContent value="agenda" className="flex flex-col gap-4">
          {isLoading ? (
            <Skeleton className="h-[600px] rounded-xl" />
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[600px] rounded-xl border border-slate-200 bg-white p-4 [&_.rbc-calendar]:font-sans [&_.rbc-event]:border-0 [&_.rbc-header]:py-2 [&_.rbc-header]:text-sm [&_.rbc-header]:font-medium [&_.rbc-header]:text-slate-600 [&_.rbc-off-range-bg]:bg-slate-50/50 [&_.rbc-time-slot]:border-slate-100 [&_.rbc-timeslot-group]:border-slate-100 [&_.rbc-today]:bg-blue-50/40">
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 620 }}
                  view={view}
                  date={currentDate}
                  onNavigate={setCurrentDate}
                  onView={setView}
                  onSelectEvent={handleSelectEvent}
                  eventPropGetter={eventStyleGetter}
                  culture="fr"
                  messages={{
                    today: "Aujourd'hui",
                    previous: 'Précédent',
                    next: 'Suivant',
                    month: 'Mois',
                    week: 'Semaine',
                    day: 'Jour',
                    agenda: 'Agenda',
                    date: 'Date',
                    time: 'Heure',
                    event: 'Événement',
                    noEventsInRange: 'Aucun rendez-vous cette période.',
                  }}
                  components={{
                    toolbar: (props) => (
                      <CustomToolbar
                        date={props.date}
                        view={props.view}
                        onNavigate={
                          props.onNavigate as (
                            action: 'PREV' | 'NEXT' | 'TODAY',
                          ) => void
                        }
                        onView={props.onView}
                      />
                    ),
                  }}
                />
              </div>
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
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Répartition par statut
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statsChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={110}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {statsChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [value, 'RDV']}
                            contentStyle={{ borderRadius: '8px' }}
                          />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
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
