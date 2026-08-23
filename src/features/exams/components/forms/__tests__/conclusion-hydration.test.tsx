import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, test } from 'vitest';

import { ConclusionForm } from '@/features/exams/components/forms/conclusion-form';
import { setSectionValues } from '@/features/exams/utils/form-hydration';
import { rtlRender, screen } from '@/testing/test-utils';

/**
 * Reproduit la perte des DIAGNOSTICS CIM-11 a la relecture d'un examen.
 *
 * La page charge les donnees avec `form.setValue('conclusion', {...})`, soit
 * l'OBJET entier. React Hook Form descend alors dans l'objet et affecte les
 * feuilles une a une ; pour un TABLEAU il descend jusqu'aux index
 * (`conclusion.diagnostic_cim_11.0`), qui ne sont enregistres par personne.
 * Le Controller enregistre AU NIVEAU du tableau ne recoit donc jamais la
 * valeur : les champs scalaires (vision, cat) se rechargent, les tableaux non.
 *
 * Constate en production : le diagnostic etait bien EN BASE, l'API le
 * renvoyait, et le formulaire l'affichait vide.
 */
function Hote({ valeurs }: { valeurs: string[] }) {
  const form = useForm({
    defaultValues: {
      conclusion: {
        vision: null,
        cat: null,
        traitement: null,
        observation: null,
        diagnostic_cim_11: [],
      },
    },
  });

  // Comme la page : rechargement de la section depuis un EFFET, donc APRES le
  // montage du Controller. Avec `form.setValue` brut, le tableau n'arrivait
  // jamais jusqu'au champ (le scalaire, lui, passait) — d'ou setSectionValues.
  useEffect(() => {
    setSectionValues(form as never, 'conclusion', {
      vision: null,
      cat: 'TEMOIN',
      traitement: null,
      observation: null,
      diagnostic_cim_11: valeurs,
    });
  }, [form, valeurs]);

  return (
    <FormProvider {...form}>
      <ConclusionForm namePrefix="conclusion" isDriver />
    </FormProvider>
  );
}

describe('Rechargement de la conclusion', () => {
  test('les diagnostics CIM-11 deja enregistres sont affiches', async () => {
    rtlRender(<Hote valeurs={['LA12.1 - Cataracte congénitale']} />);

    // Le champ scalaire se recharge : temoin que l'effet a bien tourne.
    expect(await screen.findByDisplayValue('TEMOIN')).toBeInTheDocument();

    expect(
      await screen.findByText('LA12.1 - Cataracte congénitale'),
    ).toBeInTheDocument();
  });
});
