'use client';

import { AlertTriangle } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';

type AcuityAlertsProps = {
  prefix: string;
};

// 0,5 n'est pas une valeur de l'échelle (Pre 12/10) : exclue des calculs.
const VALEUR_INVALIDE = 0.5;

const EYES = [
  { key: 'od', label: 'OD' },
  { key: 'og', label: 'OG' },
] as const;

const estNombre = (v: unknown): v is number =>
  typeof v === 'number' && !Number.isNaN(v);

/**
 * Alertes NON bloquantes de la saisie d'acuité (C26, professeure et Kamal
 * 11/10) : elles invitent à vérifier, l'enregistrement reste possible.
 */
export function AcuityAlerts({ prefix }: AcuityAlertsProps) {
  const form = useFormContext();
  const values = useWatch({
    control: form.control,
    name: EYES.flatMap(({ key }) => [
      `${prefix}avsc_${key}`,
      `${prefix}avac_${key}`,
    ]),
  }) as unknown[];

  const alertes: string[] = [];
  EYES.forEach(({ label }, i) => {
    const avsc = values[2 * i];
    const avac = values[2 * i + 1];
    if (estNombre(avsc) && estNombre(avac) && avac < avsc) {
      alertes.push(
        `${label} : l'acuité avec lunettes (${avac}) est moins bonne que sans (${avsc}).`,
      );
    }
    [avsc, avac].forEach((v) => {
      if (estNombre(v) && v === VALEUR_INVALIDE) {
        alertes.push(
          `${label} : 0,5 n'est pas une valeur de l'échelle (exclue des calculs). Vouliez-vous 0,05 (1/20) ou 5 ?`,
        );
      }
    });
  });

  if (alertes.length === 0) return null;

  return (
    <div
      role="status"
      className="flex gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
    >
      <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-medium">
          À vérifier (l&apos;enregistrement reste possible)
        </p>
        {alertes.map((a) => (
          <p key={a}>{a}</p>
        ))}
      </div>
    </div>
  );
}
