import { render, screen } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import { describe, it, expect } from 'vitest';

import { ConclusionForm } from '../conclusion-form';

/**
 * L'aptitude visuelle est un verdict de qualification à la CONDUITE. Elle n'a
 * aucun sens pour un patient qui n'est pas conducteur.
 *
 * Mais la masquer sans condition serait destructeur : 140 conclusions de
 * non-conducteurs portent déjà une valeur en base. On ne cache jamais une
 * donnée clinique enregistrée — on la fige.
 */
const APTITUDE = 'Aptitude visuelle';

function Wrapper({
  isDriver,
  vision,
}: {
  isDriver: boolean;
  vision: string | null;
}) {
  const form = useForm({
    defaultValues: {
      conclusion: {
        vision,
        cat: '',
        traitement: '',
        observation: '',
        diagnostic_cim_11: [],
      },
    },
  });

  return (
    <FormProvider {...form}>
      <ConclusionForm namePrefix="conclusion" isDriver={isDriver} />
    </FormProvider>
  );
}

describe('ConclusionForm — aptitude visuelle', () => {
  it('est saisissable pour un conducteur', () => {
    render(<Wrapper isDriver vision={null} />);

    expect(screen.getByText(APTITUDE)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).not.toBeDisabled();
  });

  it('disparaît pour un non-conducteur sans valeur saisie', () => {
    render(<Wrapper isDriver={false} vision={null} />);

    expect(screen.queryByText(APTITUDE)).not.toBeInTheDocument();
  });

  it('reste visible mais figée pour un non-conducteur dont la valeur existe', () => {
    render(<Wrapper isDriver={false} vision="compatible" />);

    expect(screen.getByText(APTITUDE)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByText(/n'est plus modifiable/i)).toBeInTheDocument();
  });

  it('les autres champs de la conclusion ne dépendent pas du statut conducteur', () => {
    render(<Wrapper isDriver={false} vision={null} />);

    expect(screen.getByText(/CAT \(Conduite à tenir\)/i)).toBeInTheDocument();
  });
});
