import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { describe, it, expect, vi } from 'vitest';

import {
  PlaintesSchema,
  type PlaintesFormValues,
} from '@/features/exams/types/schemas';

import { PlaintesForm } from '../plaintes-form';

// =============================================================================
// Wrapper qui fournit react-hook-form + zod à PlaintesForm
// =============================================================================

const defaultValues: Partial<PlaintesFormValues> = {
  eye_symptom: [],
  diplopie: false,
  strabisme: false,
  nystagmus: false,
  ptosis: false,
  autre: null,
  diplopie_type: null,
  strabisme_type: null,
  strabisme_eye: null,
  nystagmus_eye: null,
  ptosis_eye: null,
  ptosis_type: null,
};

function PlaintesFormWrapper({
  onSubmit = vi.fn(),
}: {
  onSubmit?: (data: PlaintesFormValues) => void;
}) {
  const form = useForm<PlaintesFormValues>({
    resolver: zodResolver(PlaintesSchema),
    defaultValues,
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} data-testid="plaintes-form">
        <PlaintesForm />
        <button type="submit">Soumettre</button>
      </form>
    </FormProvider>
  );
}

describe('PlaintesForm', () => {
  // --------------------------------------------------------------------------
  // Eye Symptoms
  // --------------------------------------------------------------------------

  describe('symptômes oculaires', () => {
    it('affiche la grille des symptômes au rendu initial', () => {
      // Arrange
      render(<PlaintesFormWrapper />);

      // Assert
      expect(screen.getByText('Baisse Acuité Visuelle')).toBeInTheDocument();
      expect(screen.getByText('Rougeur')).toBeInTheDocument();
      expect(screen.getByText('Autres')).toBeInTheDocument();
    });

    it("affiche le champ 'Précisez le symptôme' quand AUTRES est coché", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<PlaintesFormWrapper />);

      // Act
      await user.click(screen.getByRole('checkbox', { name: /autres/i }));

      // Assert
      expect(
        await screen.findByPlaceholderText(/décrivez le symptôme/i),
      ).toBeInTheDocument();
    });

    it("masque le champ 'autre' quand AUTRES est décoché", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<PlaintesFormWrapper />);

      // Act - cocher puis décocher
      const autresCheckbox = screen.getByRole('checkbox', { name: /autres/i });
      await user.click(autresCheckbox);
      expect(
        await screen.findByPlaceholderText(/décrivez le symptôme/i),
      ).toBeInTheDocument();
      await user.click(autresCheckbox);

      // Assert
      await waitFor(() => {
        expect(
          screen.queryByPlaceholderText(/décrivez le symptôme/i),
        ).not.toBeInTheDocument();
      });
    });
  });

  // --------------------------------------------------------------------------
  // Diplopie
  // --------------------------------------------------------------------------

  describe('diplopie conditionnel', () => {
    it('affiche le select Type quand le switch Diplopie est activé', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<PlaintesFormWrapper />);

      // Act
      await user.click(screen.getByRole('switch', { name: /diplopie/i }));

      // Assert
      expect(
        await screen.findByRole('combobox', { name: /type/i }),
      ).toBeInTheDocument();
    });

    it('masque le select Type quand le switch Diplopie est désactivé', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<PlaintesFormWrapper />);

      // Act - activer puis désactiver (re-query après chaque clic car le composant est remonté)
      await user.click(screen.getByRole('switch', { name: /diplopie/i }));
      expect(
        await screen.findByRole('combobox', { name: /type/i }),
      ).toBeInTheDocument();

      // Re-query the switch since ConditionalBooleanField remounts on parent re-render
      await user.click(screen.getByRole('switch', { name: /diplopie/i }));

      // Assert — le select Type disparaît après désactivation
      await waitFor(() => {
        expect(
          screen.queryByRole('combobox', { name: /type/i }),
        ).not.toBeInTheDocument();
      });
    });
  });

  // --------------------------------------------------------------------------
  // Strabisme
  // --------------------------------------------------------------------------

  describe('strabisme conditionnel', () => {
    it('affiche Type et Œil concerné quand le switch Strabisme est activé', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<PlaintesFormWrapper />);

      // Act
      await user.click(screen.getByRole('switch', { name: /strabisme/i }));

      // Assert
      const typeSelects = await screen.findAllByRole('combobox', {
        name: /type/i,
      });
      expect(typeSelects.length).toBeGreaterThan(0);
      expect(
        await screen.findByRole('combobox', { name: /œil concerné/i }),
      ).toBeInTheDocument();
    });

    it('masque Type et Œil concerné quand le switch Strabisme est désactivé', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<PlaintesFormWrapper />);

      // Act - re-query le switch car ConditionalBooleanField est remonté après chaque re-render
      await user.click(screen.getByRole('switch', { name: /strabisme/i }));
      expect(
        await screen.findByRole('combobox', { name: /œil concerné/i }),
      ).toBeInTheDocument();
      await user.click(screen.getByRole('switch', { name: /strabisme/i }));

      // Assert
      await waitFor(() => {
        expect(
          screen.queryByRole('combobox', { name: /œil concerné/i }),
        ).not.toBeInTheDocument();
      });
    });
  });

  // --------------------------------------------------------------------------
  // Nystagmus
  // --------------------------------------------------------------------------

  describe('nystagmus conditionnel', () => {
    it('affiche Œil concerné quand le switch Nystagmus est activé', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<PlaintesFormWrapper />);

      // Act
      await user.click(screen.getByRole('switch', { name: /nystagmus/i }));

      // Assert
      expect(
        await screen.findByRole('combobox', { name: /œil concerné/i }),
      ).toBeInTheDocument();
    });

    it('masque Œil concerné quand le switch Nystagmus est désactivé', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<PlaintesFormWrapper />);

      // Act - re-query le switch car ConditionalBooleanField est remonté après chaque re-render
      await user.click(screen.getByRole('switch', { name: /nystagmus/i }));
      expect(
        await screen.findByRole('combobox', { name: /œil concerné/i }),
      ).toBeInTheDocument();
      await user.click(screen.getByRole('switch', { name: /nystagmus/i }));

      // Assert
      await waitFor(() => {
        expect(
          screen.queryByRole('combobox', { name: /œil concerné/i }),
        ).not.toBeInTheDocument();
      });
    });
  });

  // --------------------------------------------------------------------------
  // Ptosis
  // --------------------------------------------------------------------------

  describe('ptosis conditionnel', () => {
    it('affiche Type et Œil concerné quand le switch Ptosis est activé', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<PlaintesFormWrapper />);

      // Act
      await user.click(screen.getByRole('switch', { name: /ptosis/i }));

      // Assert
      expect(
        await screen.findByRole('combobox', { name: /œil concerné/i }),
      ).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // Validation à la soumission
  // --------------------------------------------------------------------------

  describe('validation à la soumission', () => {
    it('affiche une erreur si aucun symptôme sélectionné', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<PlaintesFormWrapper />);

      // Act
      await user.click(screen.getByRole('button', { name: /soumettre/i }));

      // Assert
      expect(
        await screen.findByText(/au moins un symptôme/i),
      ).toBeInTheDocument();
    });

    it('affiche une erreur si AUTRES coché mais autre non renseigné', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<PlaintesFormWrapper />);

      // Act
      await user.click(screen.getByRole('checkbox', { name: /autres/i }));
      expect(
        await screen.findByPlaceholderText(/décrivez le symptôme/i),
      ).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: /soumettre/i }));

      // Assert
      expect(
        await screen.findByText(/préciser le symptôme/i),
      ).toBeInTheDocument();
    });

    it('affiche une erreur si diplopie=true mais diplopie_type absent', async () => {
      // Arrange
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<PlaintesFormWrapper onSubmit={onSubmit} />);

      // Act
      await user.click(
        screen.getByRole('checkbox', { name: /baisse acuité/i }),
      );
      await user.click(screen.getByRole('switch', { name: /diplopie/i }));
      await user.click(screen.getByRole('button', { name: /soumettre/i }));

      // Assert
      expect(await screen.findByText(/type de diplopie/i)).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('appelle onSubmit avec les données correctes quand le formulaire est valide', async () => {
      // Arrange
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<PlaintesFormWrapper onSubmit={onSubmit} />);

      // Act
      await user.click(
        screen.getByRole('checkbox', { name: /baisse acuité/i }),
      );
      await user.click(screen.getByRole('button', { name: /soumettre/i }));

      // Assert
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            eye_symptom: ['BAV'],
            diplopie: false,
            strabisme: false,
            nystagmus: false,
            ptosis: false,
          }),
          expect.anything(),
        );
      });
    });
  });
});
