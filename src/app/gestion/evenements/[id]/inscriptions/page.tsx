'use client';

import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  QrCode,
  Search,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { AppShell as Shell } from '@/app/_shell';
import { Badge } from '@/components/ui/badge/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useCheckin } from '@/features/events/api/checkin';
import { useConvertToPatient } from '@/features/events/api/convert-to-patient';
import { useEvent } from '@/features/events/api/get-event';
import {
  useEventStats,
  useInscriptions,
} from '@/features/events/api/get-inscriptions';
import { useEventQRCode } from '@/features/events/api/get-qr-code';
import { cn } from '@/lib/utils';

interface Inscription {
  id: number;
  numero_inscription: string;
  nom: string;
  prenom: string;
  phone_number: string | null;
  date_de_naissance: string | null;
  sex: 'H' | 'F' | 'A' | null;
  statut: 'inscrit' | 'present' | 'absent' | 'annule';
  patient_id: number | null;
  inscrit_at: string;
  presente_at: string | null;
}

interface EventDetail {
  id: number;
  titre: string;
  statut: string;
  date_event: string;
  heure_debut: string;
  heure_fin: string;
  lieu: string;
  capacite_max: number | null;
  places_restantes: number | null;
  slug: string;
}

interface Stats {
  inscrits: number;
  presents: number;
  absents: number;
  annules: number;
  total: number;
  taux_presence: number;
}

function statutBadge(s: string) {
  switch (s) {
    case 'inscrit':
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
          Inscrit
        </Badge>
      );
    case 'present':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
          Présent
        </Badge>
      );
    case 'absent':
      return (
        <Badge className="bg-muted text-muted-foreground hover:bg-muted">
          Absent
        </Badge>
      );
    case 'annule':
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
          Annulé
        </Badge>
      );
    default:
      return <Badge variant="secondary">{s}</Badge>;
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function QRCodeDialog({ eventId }: { eventId: number }) {
  const [open, setOpen] = useState(false);
  const { data: qrSrc, isLoading: qrLoading } = useEventQRCode(eventId, open);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <QrCode className="mr-2 size-4" />
        QR Code
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>QR Code d&apos;inscription</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            {qrLoading ? (
              <div className="flex size-56 items-center justify-center rounded-lg border border-border bg-muted">
                <QrCode className="size-10 text-muted-foreground/40" />
              </div>
            ) : qrSrc ? (
              <img
                src={qrSrc}
                alt="QR code inscription"
                className="size-56 rounded-lg border border-border"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Impossible de charger le QR code.
              </p>
            )}
            <p className="text-center text-xs text-muted-foreground">
              Présentez ce code aux participants pour leur permettre de
              s&apos;inscrire à l&apos;événement.
            </p>
            {qrSrc && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = qrSrc;
                  a.download = `qr-event-${eventId}.png`;
                  a.click();
                }}
              >
                Télécharger PNG
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function EventInscriptionsPage() {
  const params = useParams();
  const eventId = Number(params.id);

  const [statutFilter, setStatutFilter] = useState<string>('all');
  const [checkinValue, setCheckinValue] = useState('');
  const [checkinResult, setCheckinResult] = useState<Inscription | null>(null);
  const [checkinError, setCheckinError] = useState('');
  const [convertingId, setConvertingId] = useState<number | null>(null);

  const { data: eventData, isLoading: eventLoading } = useEvent(eventId);
  const event = eventData as EventDetail | null;

  const { data: inscriptionsData, isLoading: inscriptionsLoading } =
    useInscriptions(eventId, {
      statut: statutFilter !== 'all' ? statutFilter : undefined,
      limit: 200,
    });

  const { data: statsData } = useEventStats(eventId);
  const stats = statsData as Stats | null;

  const inscriptions: Inscription[] =
    (inscriptionsData as { results?: Inscription[] })?.results ??
    (Array.isArray(inscriptionsData)
      ? (inscriptionsData as Inscription[])
      : []);

  const { mutate: checkin, isPending: checkinPending } = useCheckin(eventId, {
    onSuccess: (data) => {
      setCheckinResult(data as Inscription);
      setCheckinError('');
      setCheckinValue('');
    },
    onError: () => {
      setCheckinError('Participant introuvable ou déjà enregistré.');
      setCheckinResult(null);
    },
  });

  const { mutate: convertToPatient } = useConvertToPatient(eventId, {
    onSuccess: () => setConvertingId(null),
    onError: () => setConvertingId(null),
  });

  const handleCheckin = () => {
    if (!checkinValue.trim()) return;
    setCheckinError('');
    setCheckinResult(null);
    const isPhone = /^\+?[\d\s-]{8,}$/.test(checkinValue.trim());
    checkin(
      isPhone
        ? { phone_number: checkinValue.trim() }
        : { numero_inscription: checkinValue.trim() },
    );
  };

  const TABS = [
    { value: 'all', label: 'Tous' },
    { value: 'inscrit', label: 'Inscrits' },
    { value: 'present', label: 'Présents' },
    { value: 'absent', label: 'Absents' },
    { value: 'annule', label: 'Annulés' },
  ];

  return (
    <Shell title={event ? `Inscriptions — ${event.titre}` : 'Inscriptions'}>
      <div className="flex flex-1 flex-col gap-6">
        {/* Back + header */}
        <div className="flex flex-col gap-4">
          <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
            <Link href="/gestion/evenements">
              <ArrowLeft className="mr-2 size-4" />
              Retour aux événements
            </Link>
          </Button>

          {eventLoading ? (
            <Skeleton className="h-16 rounded-xl" />
          ) : event ? (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-lg font-bold text-foreground">
                  {event.titre}
                </span>
                <QRCodeDialog eventId={eventId} />
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="size-4" />
                  {formatDate(event.date_event)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-4" />
                  {event.heure_debut.slice(0, 5)} –{' '}
                  {event.heure_fin.slice(0, 5)}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="size-4" />
                  {event.lieu}
                </span>
                {event.capacite_max && (
                  <span className="flex items-center gap-1">
                    <Users className="size-4" />
                    {event.places_restantes ?? '?'} / {event.capacite_max}{' '}
                    places restantes
                  </span>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Stats KPI row */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: 'Inscrits',
                value: stats.inscrits,
                color: 'text-blue-700',
                bg: 'bg-blue-50',
              },
              {
                label: 'Présents',
                value: stats.presents,
                color: 'text-emerald-700',
                bg: 'bg-emerald-50',
              },
              {
                label: 'Absents',
                value: stats.absents,
                color: 'text-slate-600',
                bg: 'bg-slate-50',
              },
              {
                label: 'Taux de présence',
                value: `${stats.taux_presence.toFixed(0)} %`,
                color: 'text-foreground',
                bg: 'bg-muted/50',
              },
            ].map((kpi) => (
              <div key={kpi.label} className={cn('rounded-xl p-4', kpi.bg)}>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                <p className={cn('mt-1 text-2xl font-bold', kpi.color)}>
                  {kpi.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Check-in block (only for en_cours events) */}
        {event?.statut === 'en_cours' && (
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 font-semibold">Check-in jour J</h2>
            <div className="flex gap-2">
              <Input
                placeholder="Numéro d'inscription ou téléphone"
                value={checkinValue}
                onChange={(e) => {
                  setCheckinValue(e.target.value);
                  setCheckinError('');
                  setCheckinResult(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCheckin();
                }}
                className="max-w-sm"
              />
              <Button onClick={handleCheckin} disabled={checkinPending}>
                <Search className="mr-2 size-4" />
                {checkinPending ? 'Recherche...' : 'Check-in'}
              </Button>
            </div>

            {checkinError && (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
                <XCircle className="size-4" />
                {checkinError}
              </div>
            )}
            {checkinResult && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>
                  <strong>
                    {checkinResult.prenom} {checkinResult.nom}
                  </strong>{' '}
                  — {checkinResult.numero_inscription} — check-in enregistré
                </span>
              </div>
            )}
          </div>
        )}

        {/* Inscriptions list */}
        <div>
          <div className="mb-3 flex gap-1 overflow-x-auto rounded-xl bg-muted p-1">
            {TABS.map((tab) => (
              <button
                type="button"
                key={tab.value}
                onClick={() => setStatutFilter(tab.value)}
                className={cn(
                  'shrink-0 flex-1 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
                  statutFilter === tab.value
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {inscriptionsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : inscriptions.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-border py-12 text-center">
              <Users className="text-muted-foreground/40 mx-auto mb-3 size-10" />
              <p className="font-semibold text-muted-foreground">
                Aucune inscription
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      N°
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Participant
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Téléphone
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Inscrit le
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Présent le
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {inscriptions.map((ins) => (
                    <tr
                      key={ins.id}
                      className="border-b border-border last:border-0 hover:bg-muted/20"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {ins.numero_inscription}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {ins.prenom} {ins.nom}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {ins.phone_number ?? '—'}
                      </td>
                      <td className="px-4 py-3">{statutBadge(ins.statut)}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDateTime(ins.inscrit_at)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {ins.presente_at
                          ? formatDateTime(ins.presente_at)
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {ins.patient_id ? (
                          <Link
                            href={`/patients/${ins.patient_id}`}
                            className="text-xs text-primary hover:underline"
                          >
                            Voir patient
                          </Link>
                        ) : ins.statut === 'inscrit' ||
                          ins.statut === 'absent' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1.5 text-xs"
                            disabled={convertingId === ins.id}
                            onClick={() => {
                              setConvertingId(ins.id);
                              convertToPatient(ins.id);
                            }}
                          >
                            <UserPlus className="size-3.5" />
                            {convertingId === ins.id ? '...' : 'Créer patient'}
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
