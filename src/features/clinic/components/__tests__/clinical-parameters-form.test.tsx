import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, test } from 'vitest';

import { mockClinicSettings } from '@/testing/mocks/handlers/clinic';
import { rtlRender, screen } from '@/testing/test-utils';

import { ClinicalParametersForm } from '../clinical-parameters-form';

// Lot 4 du plan : paramètres cliniques administrables (LogMAR du 0, âges, ruptures).

function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return rtlRender(
    <QueryClientProvider client={queryClient}>
      <ClinicalParametersForm settings={mockClinicSettings} />
    </QueryClientProvider>,
  );
}

describe('Paramètres cliniques administrables', () => {
  test('affiche les valeurs enregistrées', () => {
    renderForm();
    expect(screen.getByLabelText('LogMAR d’une acuité de 0')).toHaveValue(1.9);
    expect(screen.getByLabelText('Âge du formulaire adulte')).toHaveValue(16);
    expect(screen.getByLabelText('Âge minimal du permis')).toHaveValue(18);
    expect(
      screen.getByLabelText('Ruptures : taille de la fenêtre'),
    ).toHaveValue(30);
  });
});
