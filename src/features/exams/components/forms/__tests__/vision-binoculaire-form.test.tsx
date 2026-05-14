import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';

import {
  VisionBinoculaireSchema,
  type VisionBinoculaireFormValues,
} from '@/features/exams/types/schemas';
import { VisionBinoculaireForm } from '../vision-binoculaire-form';

// =============================================================================
// Wrapper
// =============================================================================

function VisionBinoculaireFormWrapper({
  onSubmit = vi.fn(),
}: {
  onSubmit?: (data: VisionBinoculaireFormValues) => void;
}) {
  const form = useForm<VisionBinoculaireFormValues>({
    resolver: zodResolver(VisionBinoculaireSchema),
    defaultValues: {
      hirschberg_type: null,
      hirschberg_detail: null,
      stereoscopy_lang: null,
      pupillary_reflex: null,
      pupillary_reflex_laterality: null,
      cover_test_vl_type: null,
      cover_test_vl_direction: null,
      cover_test_vp_type: null,
      cover_test_vp_direction: null,
    },
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} data-testid="vb-form">
        <VisionBinoculaireForm />
        <button type="submit">Soumettre</button>
      </form>
    </FormProvider>
  );
}

describe('VisionBinoculaireForm', () => {
  // --------------------------------------------------------------------------
  // Hirschberg
  // --------------------------------------------------------------------------

  describe('hirschberg_detail conditionnel', () => {
    it("n'affiche pas le champ Détail quand hirschberg_type est vide", () => {
      // Arrange
      render(<VisionBinoculaireFormWrapper />);

      // Assert - le select Détail n'est pas présent (il y a des selects Type mais pas Détail)
      // Vérifier l'absence du label "Détail *" spécifique
      const labels = screen.queryAllByText(/détail/i);
      // Aucun label "Détail *" visible
      expect(labels.filter((el) => el.textContent?.includes('*'))).toHaveLength(0);
    });

    it("affiche le champ Détail quand hirschberg_type=esotropie sélectionné", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<VisionBinoculaireFormWrapper />);

      // Act - sélectionner esotropie dans le premier Select Type (Hirschberg)
      const hirschbergTypeSelect = screen.getAllByRole('combobox', {
        name: /type/i,
      })[0];
      await user.click(hirschbergTypeSelect);
      await user.click(screen.getByRole('option', { name: /ésotropie/i }));

      // Assert
      await screen.findByRole('combobox', { name: /détail/i });
    });

    it("affiche le champ Détail quand hirschberg_type=exotropie sélectionné", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<VisionBinoculaireFormWrapper />);

      // Act
      const hirschbergTypeSelect = screen.getAllByRole('combobox', {
        name: /type/i,
      })[0];
      await user.click(hirschbergTypeSelect);
      await user.click(screen.getByRole('option', { name: /exotropie/i }));

      // Assert
      await screen.findByRole('combobox', { name: /détail/i });
    });

    it("n'affiche pas le champ Détail quand hirschberg_type=orthotropie", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<VisionBinoculaireFormWrapper />);

      // Act
      const hirschbergTypeSelect = screen.getAllByRole('combobox', {
        name: /type/i,
      })[0];
      await user.click(hirschbergTypeSelect);
      await user.click(screen.getByRole('option', { name: /orthotropie/i }));

      // Assert - Détail ne doit pas apparaître
      await waitFor(() => {
        expect(
          screen.queryByRole('combobox', { name: /détail/i }),
        ).not.toBeInTheDocument();
      });
    });

    it("affiche une erreur de validation si hirschberg_type=esotropie et Détail non renseigné", async () => {
      // Arrange
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<VisionBinoculaireFormWrapper onSubmit={onSubmit} />);

      // Act
      const hirschbergTypeSelect = screen.getAllByRole('combobox', {
        name: /type/i,
      })[0];
      await user.click(hirschbergTypeSelect);
      await user.click(screen.getByRole('option', { name: /ésotropie/i }));
      await screen.findByRole('combobox', { name: /détail/i });
      await user.click(screen.getByRole('button', { name: /soumettre/i }));

      // Assert
      await screen.findByText(/détail requis/i);
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  // --------------------------------------------------------------------------
  // Pupillary Reflex
  // --------------------------------------------------------------------------

  describe('pupillary_reflex_laterality conditionnel', () => {
    it("affiche le champ Latéralité quand pupillary_reflex=leucocorie sélectionné", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<VisionBinoculaireFormWrapper />);

      // Act - le select Réflexe est dans la section Réflexe Pupillaire
      const reflexeSelect = screen.getByRole('combobox', { name: /réflexe/i });
      await user.click(reflexeSelect);
      await user.click(screen.getByRole('option', { name: /leucocorie/i }));

      // Assert
      await screen.findByRole('combobox', { name: /latéralité/i });
    });

    it("affiche le champ Latéralité quand pupillary_reflex=anormal sélectionné", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<VisionBinoculaireFormWrapper />);

      // Act
      const reflexeSelect = screen.getByRole('combobox', { name: /réflexe/i });
      await user.click(reflexeSelect);
      await user.click(screen.getByRole('option', { name: /anormal/i }));

      // Assert
      await screen.findByRole('combobox', { name: /latéralité/i });
    });

    it("n'affiche pas le champ Latéralité quand pupillary_reflex=rouge (normal)", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<VisionBinoculaireFormWrapper />);

      // Act
      const reflexeSelect = screen.getByRole('combobox', { name: /réflexe/i });
      await user.click(reflexeSelect);
      await user.click(screen.getByRole('option', { name: /rouge/i }));

      // Assert
      await waitFor(() => {
        expect(
          screen.queryByRole('combobox', { name: /latéralité/i }),
        ).not.toBeInTheDocument();
      });
    });

    it("affiche une erreur si pupillary_reflex=leucocorie et latéralité non renseignée", async () => {
      // Arrange
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<VisionBinoculaireFormWrapper onSubmit={onSubmit} />);

      // Act
      const reflexeSelect = screen.getByRole('combobox', { name: /réflexe/i });
      await user.click(reflexeSelect);
      await user.click(screen.getByRole('option', { name: /leucocorie/i }));
      await screen.findByRole('combobox', { name: /latéralité/i });
      await user.click(screen.getByRole('button', { name: /soumettre/i }));

      // Assert
      await screen.findByText(/latéralité requise/i);
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  // --------------------------------------------------------------------------
  // Cover Test VL
  // --------------------------------------------------------------------------

  describe('cover_test_vl_direction conditionnel', () => {
    it("affiche le champ Direction VL quand cover_test_vl_type=tropie sélectionné", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<VisionBinoculaireFormWrapper />);

      // Act - le premier select Type dans la section Cover Test / VL
      // Il y a plusieurs selects nommés "Type" (Hirschberg VL, VP)
      // On cible celui de Cover Test VL
      const typeSelects = screen.getAllByRole('combobox', { name: /type/i });
      // Index 1 = Cover Test VL (0 = Hirschberg)
      const vlTypeSelect = typeSelects[1];
      await user.click(vlTypeSelect);
      await user.click(screen.getByRole('option', { name: /^tropie$/i }));

      // Assert - le select Direction apparaît
      const directionSelects = await screen.findAllByRole('combobox', {
        name: /direction/i,
      });
      expect(directionSelects.length).toBeGreaterThan(0);
    });

    it("affiche une erreur si cover_test_vl_type=tropie et direction VL non renseignée", async () => {
      // Arrange
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<VisionBinoculaireFormWrapper onSubmit={onSubmit} />);

      // Act
      const typeSelects = screen.getAllByRole('combobox', { name: /type/i });
      const vlTypeSelect = typeSelects[1];
      await user.click(vlTypeSelect);
      await user.click(screen.getByRole('option', { name: /^tropie$/i }));
      await screen.findAllByRole('combobox', { name: /direction/i });
      await user.click(screen.getByRole('button', { name: /soumettre/i }));

      // Assert
      await screen.findByText(/direction requise/i);
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("n'affiche pas le champ Direction quand cover_test_vl_type=orthotropie", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<VisionBinoculaireFormWrapper />);

      // Act
      const typeSelects = screen.getAllByRole('combobox', { name: /type/i });
      const vlTypeSelect = typeSelects[1];
      await user.click(vlTypeSelect);
      await user.click(
        screen.getAllByRole('option', { name: /orthotropie/i })[0],
      );

      // Assert
      await waitFor(() => {
        expect(
          screen.queryByRole('combobox', { name: /direction/i }),
        ).not.toBeInTheDocument();
      });
    });
  });

  // --------------------------------------------------------------------------
  // Cover Test VP
  // --------------------------------------------------------------------------

  describe('cover_test_vp_direction conditionnel', () => {
    it("affiche le champ Direction VP quand cover_test_vp_type=phorie sélectionné", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<VisionBinoculaireFormWrapper />);

      // Act - VP = dernier select Type
      const typeSelects = screen.getAllByRole('combobox', { name: /type/i });
      const vpTypeSelect = typeSelects[typeSelects.length - 1];
      await user.click(vpTypeSelect);
      await user.click(screen.getByRole('option', { name: /^phorie$/i }));

      // Assert
      const directionSelects = await screen.findAllByRole('combobox', {
        name: /direction/i,
      });
      expect(directionSelects.length).toBeGreaterThan(0);
    });
  });

  // --------------------------------------------------------------------------
  // Test complet avec toutes les branches activées simultanément
  // --------------------------------------------------------------------------

  describe('soumission avec toutes les branches activées', () => {
    it("valide et appelle onSubmit quand tous les champs conditionnels sont renseignés", async () => {
      // Arrange
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<VisionBinoculaireFormWrapper onSubmit={onSubmit} />);

      // Act - Hirschberg: esotropie + détail
      const typeSelects = screen.getAllByRole('combobox', { name: /type/i });
      await user.click(typeSelects[0]);
      await user.click(screen.getByRole('option', { name: /ésotropie/i }));
      const detailSelect = await screen.findByRole('combobox', {
        name: /détail/i,
      });
      await user.click(detailSelect);
      await user.click(screen.getByRole('option', { name: /iris/i }));

      // Reflexe pupillaire: leucocorie + latéralité
      const reflexeSelect = screen.getByRole('combobox', { name: /réflexe/i });
      await user.click(reflexeSelect);
      await user.click(screen.getByRole('option', { name: /leucocorie/i }));
      const lateraliteSelect = await screen.findByRole('combobox', {
        name: /latéralité/i,
      });
      await user.click(lateraliteSelect);
      await user.click(
        screen.getByRole('option', { name: /od \(droit\)/i }),
      );

      // Cover Test VL: tropie + direction
      const updatedTypeSelects = screen.getAllByRole('combobox', {
        name: /type/i,
      });
      const vlSelect = updatedTypeSelects[1];
      await user.click(vlSelect);
      await user.click(screen.getByRole('option', { name: /^tropie$/i }));
      const dirSelects = await screen.findAllByRole('combobox', {
        name: /direction/i,
      });
      await user.click(dirSelects[0]);
      await user.click(screen.getByRole('option', { name: /eso/i }));

      // Soumettre
      await user.click(screen.getByRole('button', { name: /soumettre/i }));

      // Assert
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            hirschberg_type: 'esotropie',
            hirschberg_detail: 'iris',
            pupillary_reflex: 'leucocorie',
            pupillary_reflex_laterality: 'od',
            cover_test_vl_type: 'tropie',
            cover_test_vl_direction: 'eso',
          }),
          expect.anything(),
        );
      });
    });
  });
});
