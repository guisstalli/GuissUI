import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider } from 'react-hook-form';
import { describe, it, expect, vi } from 'vitest';

import {
  VisualAcuitySchema,
  type VisualAcuityFormValues,
} from '@/features/exams/types/schemas';

import { VisualAcuityForm } from '../visual-acuity-form';

// =============================================================================
// Libellés tels que rendus par le composant (source de vérité)
// =============================================================================

/** Switch "Avec Correction prescrite ?" */
const CORRECTION_SWITCH_NAME = /avec correction prescrite/i;
/** Titre de la section conditionnelle "Acuité avec correction prescrite (AVAC)" */
const CORRECTION_SECTION_TEXT = /acuité avec correction prescrite/i;
/** Message d'erreur Zod sur les 3 champs prescrits */
const CORRECTION_ERROR_TEXT = /requis si correction sélectionnée/i;

// =============================================================================
// Wrapper
// =============================================================================

function VisualAcuityFormWrapper({
  onSubmit = vi.fn(),
}: {
  onSubmit?: (data: VisualAcuityFormValues) => void;
}) {
  const form = useForm<VisualAcuityFormValues>({
    resolver: zodResolver(VisualAcuitySchema),
    defaultValues: {
      correction: false,
      avsc_od: null,
      avsc_og: null,
      avsc_odg: null,
      avac_od: null,
      avac_og: null,
      avac_odg: null,
      avac_od_prescrite: null,
      avac_og_prescrite: null,
      avac_odg_prescrite: null,
    },
  });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        data-testid="visual-acuity-form"
      >
        <VisualAcuityForm />
        <button type="submit">Soumettre</button>
      </form>
    </FormProvider>
  );
}

describe('VisualAcuityForm', () => {
  // --------------------------------------------------------------------------
  // État initial
  // --------------------------------------------------------------------------

  it('affiche les champs AVSC et AVAC de base au rendu initial', () => {
    // Arrange
    render(<VisualAcuityFormWrapper />);

    // Assert — les champs sans correction sont visibles
    expect(screen.getAllByText(/od \(droit\)/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/og \(gauche\)/i).length).toBeGreaterThan(0);
  });

  it("n'affiche pas la section avec correction prescrite par défaut", () => {
    // Arrange
    render(<VisualAcuityFormWrapper />);

    // Assert — la section conditionnelle est absente quand correction=false
    expect(screen.queryByText(CORRECTION_SECTION_TEXT)).not.toBeInTheDocument();
  });

  // --------------------------------------------------------------------------
  // Switch Correction ON
  // --------------------------------------------------------------------------

  describe('switch Correction activé', () => {
    it('affiche les 3 champs prescrits quand le switch est activé', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<VisualAcuityFormWrapper />);
      const before = screen.getAllByRole('spinbutton').length;

      // Act
      await user.click(
        screen.getByRole('switch', { name: CORRECTION_SWITCH_NAME }),
      );

      // Assert — la section + 3 inputs avac_*_prescrite apparaissent
      await screen.findByText(CORRECTION_SECTION_TEXT);
      const after = screen.getAllByRole('spinbutton').length;
      expect(after).toBe(before + 3);
    });

    it('masque les champs prescrits quand le switch est désactivé', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<VisualAcuityFormWrapper />);

      // Act
      const corrSwitch = screen.getByRole('switch', {
        name: CORRECTION_SWITCH_NAME,
      });
      await user.click(corrSwitch);
      await screen.findByText(CORRECTION_SECTION_TEXT);
      await user.click(corrSwitch);

      // Assert
      await waitFor(() => {
        expect(
          screen.queryByText(CORRECTION_SECTION_TEXT),
        ).not.toBeInTheDocument();
      });
    });
  });

  // --------------------------------------------------------------------------
  // Validation
  // --------------------------------------------------------------------------

  describe('validation à la soumission', () => {
    it('affiche 3 erreurs quand correction=true et les champs prescrits sont vides', async () => {
      // Arrange
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<VisualAcuityFormWrapper onSubmit={onSubmit} />);

      // Act
      await user.click(
        screen.getByRole('switch', { name: CORRECTION_SWITCH_NAME }),
      );
      await screen.findByText(CORRECTION_SECTION_TEXT);
      await user.click(screen.getByRole('button', { name: /soumettre/i }));

      // Assert
      await waitFor(() => {
        const errorMessages = screen.queryAllByText(CORRECTION_ERROR_TEXT);
        expect(errorMessages.length).toBe(3);
      });
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('appelle onSubmit avec correction=true et tous les champs renseignés', async () => {
      // Arrange
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<VisualAcuityFormWrapper onSubmit={onSubmit} />);

      // Act
      await user.click(
        screen.getByRole('switch', { name: CORRECTION_SWITCH_NAME }),
      );
      await screen.findByText(CORRECTION_SECTION_TEXT);

      // Remplir tous les inputs vides (dont les 3 champs prescrits) avec une valeur valide
      const inputs = screen.getAllByRole('spinbutton');
      for (const input of inputs) {
        if ((input as HTMLInputElement).value === '') {
          await user.clear(input);
          await user.type(input, '1');
        }
      }

      await user.click(screen.getByRole('button', { name: /soumettre/i }));

      // Assert
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            correction: true,
            avac_od_prescrite: expect.any(Number),
            avac_odg_prescrite: expect.any(Number),
          }),
          expect.anything(),
        );
      });
    });

    it('passe la validation sans erreur quand correction=false', async () => {
      // Arrange
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<VisualAcuityFormWrapper onSubmit={onSubmit} />);

      // Act
      await user.click(screen.getByRole('button', { name: /soumettre/i }));

      // Assert - pas d'erreur de correction
      await waitFor(() => {
        expect(
          screen.queryByText(CORRECTION_ERROR_TEXT),
        ).not.toBeInTheDocument();
      });
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
    });
  });
});
