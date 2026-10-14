import { type ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, test } from 'vitest';

import { rtlRender, screen } from '@/testing/test-utils';

import { STEREOSCOPY_LANG_VALUES } from '../../../types/schemas';
import { AcuityAlerts } from '../acuity-alerts';

// Lot 4 du plan : saisie sans valeur par défaut — examens (C26, C27b).

function AvecFormulaire({
  values,
  children,
}: {
  values: Record<string, unknown>;
  children: ReactNode;
}) {
  const form = useForm({ defaultValues: values });
  return <FormProvider {...form}>{children}</FormProvider>;
}

describe('C26 — alertes non bloquantes de l’acuité', () => {
  test('lunettes moins bonnes que sans', () => {
    rtlRender(
      <AvecFormulaire values={{ avsc_od: 8, avac_od: 6 }}>
        <AcuityAlerts prefix="" />
      </AvecFormulaire>,
    );
    expect(
      screen.getByText(
        /OD : l'acuité avec lunettes \(6\) est moins bonne que sans \(8\)/,
      ),
    ).toBeInTheDocument();
  });

  test('0,5 signalé comme hors échelle', () => {
    rtlRender(
      <AvecFormulaire values={{ avsc_og: 0.5 }}>
        <AcuityAlerts prefix="" />
      </AvecFormulaire>,
    );
    expect(
      screen.getByText(/0,5 n'est pas une valeur de l'échelle/),
    ).toBeInTheDocument();
  });

  test('aucune alerte pour une saisie cohérente', () => {
    rtlRender(
      <AvecFormulaire values={{ avsc_od: 6, avac_od: 9 }}>
        <AcuityAlerts prefix="" />
      </AvecFormulaire>,
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

describe('C27b — Lang II saisi en résultat', () => {
  test('réussi, échoué ou non fait', () => {
    expect([...STEREOSCOPY_LANG_VALUES]).toEqual([
      'reussi',
      'echoue',
      'non_fait',
    ]);
  });
});
