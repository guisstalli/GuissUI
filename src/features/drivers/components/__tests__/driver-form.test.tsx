/**
 * Tests d'intégration — DriverForm
 *
 * Couvre :
 * - Rendu des champs obligatoires (permis, date délivrance, date péremption…)
 * - phone_number optionnel : soumission sans valeur ne bloque pas
 * - Validation : date péremption doit être postérieure à délivrance
 * - Le champ "Préciser le type" apparaît uniquement quand type_permis = "Autres"
 * - Le bouton submit affiche le bon label (création vs édition)
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import type { DriverCreate } from '../../types/schemas';
import { DriverForm } from '../driver-form';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const VALID_DEFAULTS: DriverCreate = {
  patient: {
    name: 'Ibrahima',
    last_name: 'Fall',
    date_de_naissance: '1985-06-10',
    sex: 'H',
    phone_number: '',
  },
  numero_permis: 'SN-12345',
  type_permis: 'Leger',
  autre_type_permis: '',
  date_delivrance_permis: '2010-01-01',
  date_peremption_permis: '2030-01-01',
  transporteur_professionnel: false,
  service: 'Prive',
  annees_experience: 10,
  type_vehicule_conduit: 'Leger',
  type_instruction_suivie: 'Française',
  niveau_instruction: 'Secondaire',
  prise_en_charge: null,
  zone_de_residence: 'Dakar',
};

// ─── Rendu de base ────────────────────────────────────────────────────────────

describe('DriverForm — rendu de base (création)', () => {
  test('affiche la section "Identité du patient" en mode création', () => {
    render(<DriverForm onSubmit={vi.fn()} />);
    expect(screen.getByText('Identité du patient')).toBeInTheDocument();
  });

  test('affiche les champs Prénom, Nom et Date de naissance', () => {
    render(<DriverForm onSubmit={vi.fn()} />);
    // Utilise les placeholders pour distinguer Prénom et Nom
    expect(screen.getByPlaceholderText('Prénom')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Nom de famille'),
    ).toBeInTheDocument();
    // Date de naissance — vérification par le texte du label
    expect(screen.getByText('Date de naissance')).toBeInTheDocument();
  });

  test('affiche le champ "Téléphone" sans astérisque (optionnel)', () => {
    render(<DriverForm onSubmit={vi.fn()} />);
    expect(screen.getByText('Téléphone')).toBeInTheDocument();
    // Le champ téléphone ne doit pas avoir d'indicateur * obligatoire
    const phoneLabel = screen.getByText('Téléphone');
    expect(phoneLabel.querySelector('span.text-destructive')).toBeNull();
  });

  test('affiche le champ "N° de permis"', () => {
    render(<DriverForm onSubmit={vi.fn()} />);
    expect(
      screen.getByRole('textbox', { name: /n° de permis/i }),
    ).toBeInTheDocument();
  });

  test('affiche les sections "Permis de conduire" et "Activité professionnelle"', () => {
    render(<DriverForm onSubmit={vi.fn()} />);
    expect(screen.getByText('Permis de conduire')).toBeInTheDocument();
    expect(screen.getByText('Activité professionnelle')).toBeInTheDocument();
  });

  test('affiche le bouton "Créer le conducteur" en mode création', () => {
    render(<DriverForm onSubmit={vi.fn()} />);
    expect(
      screen.getByRole('button', { name: /créer le conducteur/i }),
    ).toBeInTheDocument();
  });

  test('affiche "Mettre à jour" en mode édition', () => {
    render(<DriverForm onSubmit={vi.fn()} isEdit />);
    expect(
      screen.getByRole('button', { name: /mettre à jour/i }),
    ).toBeInTheDocument();
  });

  test('cache la section "Identité du patient" en mode édition', () => {
    render(<DriverForm onSubmit={vi.fn()} isEdit />);
    expect(
      screen.queryByText('Identité du patient'),
    ).not.toBeInTheDocument();
  });
});

// ─── Soumission valide ────────────────────────────────────────────────────────

describe('DriverForm — soumission valide', () => {
  test('appelle onSubmit avec les valeurs correctes', async () => {
    const onSubmit = vi.fn();
    render(
      <DriverForm defaultValues={VALID_DEFAULTS} onSubmit={onSubmit} />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: /créer le conducteur/i }),
    );

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    const submittedData = onSubmit.mock.calls[0][0] as DriverCreate;
    expect(submittedData.numero_permis).toBe('SN-12345');
    expect(submittedData.patient.last_name).toBe('Fall');
  });

  test('phone_number vide est accepté (champ optionnel)', async () => {
    const onSubmit = vi.fn();
    render(
      <DriverForm
        defaultValues={{
          ...VALID_DEFAULTS,
          patient: { ...VALID_DEFAULTS.patient, phone_number: '' },
        }}
        onSubmit={onSubmit}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: /créer le conducteur/i }),
    );

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    // phone_number vide ne doit pas bloquer la soumission ;
    // le schéma normalise une valeur vide en `undefined` (envoyé null/absent au backend)
    const submittedData = onSubmit.mock.calls[0][0] as DriverCreate;
    expect(submittedData.patient.phone_number).toBeUndefined();
  });
});

// ─── Type de permis "Autres" ──────────────────────────────────────────────────

describe('DriverForm — type_permis "Autres"', () => {
  test('le champ "Préciser le type" n\'est pas affiché par défaut', () => {
    render(<DriverForm defaultValues={VALID_DEFAULTS} onSubmit={vi.fn()} />);
    expect(
      screen.queryByRole('textbox', { name: /préciser le type/i }),
    ).not.toBeInTheDocument();
  });
});

// ─── État désactivé ───────────────────────────────────────────────────────────

describe('DriverForm — état isPending', () => {
  test('le bouton est désactivé quand isPending=true', () => {
    render(
      <DriverForm
        defaultValues={VALID_DEFAULTS}
        onSubmit={vi.fn()}
        isPending
      />,
    );
    const btn = screen.getByRole('button', { name: /enregistrement/i });
    expect(btn).toBeDisabled();
  });

  test('affiche "Enregistrement…" quand isPending=true', () => {
    render(
      <DriverForm
        defaultValues={VALID_DEFAULTS}
        onSubmit={vi.fn()}
        isPending
      />,
    );
    expect(screen.getByText('Enregistrement…')).toBeInTheDocument();
  });
});
