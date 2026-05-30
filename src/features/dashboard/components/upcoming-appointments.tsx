import { Calendar, Clock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { ProchainsRendezVous } from '../types/schemas';

interface UpcomingAppointmentsProps {
  appointments: ProchainsRendezVous[];
}

const STATUT_LABEL: Record<string, string> = {
  PLANIFIE: 'Planifié',
  CONFIRME: 'Confirmé',
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
  ANNULE: 'Annulé',
  ABSENT: 'Absent',
};

const STATUT_VARIANT: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PLANIFIE: 'outline',
  CONFIRME: 'secondary',
  EN_COURS: 'default',
  TERMINE: 'secondary',
  ANNULE: 'destructive',
  ABSENT: 'destructive',
};

function formatTime(timeString: string | null | undefined): string {
  if (!timeString) return '--:--';
  if (/^\d{2}:\d{2}/.test(timeString)) return timeString.slice(0, 5);
  return '--:--';
}

export function UpcomingAppointments({
  appointments,
}: UpcomingAppointmentsProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Calendar
            className="size-4 text-muted-foreground"
            aria-hidden="true"
          />
          Prochains rendez-vous
        </CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Aucun rendez-vous à venir.
          </p>
        ) : (
          <ul className="space-y-3">
            {appointments.map((appt) => (
              <li
                key={appt.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div className="flex items-start gap-2.5">
                  <div className="bg-primary/10 mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full">
                    <Clock
                      className="size-3.5 text-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {appt.patient_nom} {appt.patient_prenom}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(appt.heure_debut ?? undefined)}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={STATUT_VARIANT[appt.statut] ?? 'outline'}
                  className="shrink-0 text-xs"
                >
                  {STATUT_LABEL[appt.statut] ?? appt.statut}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
