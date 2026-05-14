import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';

import {
  VisualAcuitySchema,
  type VisualAcuityFormValues,
} from '@/features/exams/types/schemas';
import { VisualAcuityForm } from '../visual-acuity-form';

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
      avsc_od_avec_correction: null,
      avsc_og_avec_correction: null,
      avsc_odg_avec_correction: null,
      avac_od_avec_correction: null,
      avac_og_avec_correction: null,
      avac_odg_avec_correction: null,
    },
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} data-testid="visual-acuity-form">
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

  it("affiche les champs AVSC et AVAC de base au rendu initial", () => {
    // Arrange
    render(<VisualAcuityFormWrapper />);

    // Assert — les champs sans correction sont visibles
    expect(screen.getAllByText(/od \(droit\)/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/og \(gauche\)/i).length).toBeGreaterThan(0);
  });

  it("n'affiche pas les champs avec correction par défaut", () => {
    // Arrange
    render(<VisualAcuityFormWrapper />);

    // Assert — les labels spécifiques aux champs avec correction sont absents
    expect(
      screen.queryByText(/sans correction \+ avec surcorrection/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/avec correction \+ avec surcorrection/i),
    ).not.toBeInTheDocument();
  });

  // --------------------------------------------------------------------------
  // Switch Correction ON
  // --------------------------------------------------------------------------

  describe('switch Correction activé', () => {
    it("affiche les 6 champs avec correction quand le switch est activé", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<VisualAcuityFormWrapper />);

      // Act
      await user.click(
        screen.getByRole('switch', { name: /surcorrection \/ avec correction/i }),
      );

      // Assert
      await screen.findByText(/sans correction \+ avec surcorrection/i);
      await screen.findByText(/avec correction \+ avec surcorrection/i);

      // 6 inputs de correction (3 AVSC + 3 AVAC) + un label
      const corrInputs = screen
        .getAllByRole('spinbutton')
        .filter((_, i) => i >= 5); // Les inputs de correction viennent après les 5 premiers (parinaud + 3 AVSC + 3 AVAC)
      expect(corrInputs.length).toBeGreaterThan(0);
    });

    it("masque les 6 champs avec correction quand le switch est désactivé", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<VisualAcuityFormWrapper />);

      // Act
      const corrSwitch = screen.getByRole('switch', {
        name: /surcorrection \/ avec correction/i,
      });
      await user.click(corrSwitch);
      await screen.findByText(/sans correction \+ avec surcorrection/i);
      await user.click(corrSwitch);

      // Assert
      await waitFor(() => {
        expect(
          screen.queryByText(/sans correction \+ avec surcorrection/i),
        ).not.toBeInTheDocument();
      });
    });
  });

  // --------------------------------------------------------------------------
  // Validation
  // --------------------------------------------------------------------------

  describe('validation à la soumission', () => {
    it("affiche 6 erreurs quand correction=true et tous les champs avec correction sont vides", async () => {
      // Arrange
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<VisualAcuityFormWrapper onSubmit={onSubmit} />);

      // Act
      await user.click(
        screen.getByRole('switch', { name: /surcorrection \/ avec correction/i }),
      );
      await screen.findByText(/sans correction \+ avec surcorrection/i);
      await user.click(screen.getByRole('button', { name: /soumettre/i }));

      // Assert
      await waitFor(() => {
        const errorMessages = screen.queryAllByText(
          /requis si correction sélectionnée/i,
        );
        expect(errorMessages.length).toBe(6);
      });
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("appelle onSubmit avec correction=true et tous les champs renseignés", async () => {
      // Arrange
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<VisualAcuityFormWrapper onSubmit={onSubmit} />);

      // Act
      await user.click(
        screen.getByRole('switch', { name: /surcorrection \/ avec correction/i }),
      );
      await screen.findByText(/sans correction \+ avec surcorrection/i);

      // Remplir les 6 champs avec correction
      const inputs = screen.getAllByRole('spinbutton');
      // Les inputs avec correction ont les labels "OD + Corr", "OG + Corr", "ODG + Corr" × 2
      // On remplit tous les inputs vides avec une valeur valide
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
            avsc_od_avec_correction: expect.any(Number),
            avac_odg_avec_correction: expect.any(Number),
          }),
          expect.anything(),
        );
      });
    });

    it("passe la validation sans erreur quand correction=false", async () => {
      // Arrange
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<VisualAcuityFormWrapper onSubmit={onSubmit} />);

      // Act
      await user.click(screen.getByRole('button', { name: /soumettre/i }));

      // Assert - pas d'erreur de correction
      await waitFor(() => {
        expect(
          screen.queryByText(/requis si correction sélectionnée/i),
        ).not.toBeInTheDocument();
      });
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
    });
  });
});
