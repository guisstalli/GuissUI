import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';

import {
  BiomicroscopyAnteriorSchema,
  type BiomicroscopyAnteriorFormValues,
  defaultBiomicroscopyAnterior,
} from '@/features/exams/types/schemas';
import { BiomicroscopyAnteriorForm } from '../biomicroscopy-anterior-form';

// =============================================================================
// Wrapper qui fournit react-hook-form + zod à BiomicroscopyAnteriorForm
// =============================================================================

function BiomicroscopyAnteriorFormWrapper({
  onSubmit = vi.fn(),
  namePrefix = 'od.bp_sg_anterieur',
}: {
  onSubmit?: (data: { bio: BiomicroscopyAnteriorFormValues }) => void;
  namePrefix?: string;
}) {
  const form = useForm({
    resolver: zodResolver(
      BiomicroscopyAnteriorSchema.transform((v) => v).pipe(
        BiomicroscopyAnteriorSchema,
      ),
    ) as never,
    defaultValues: {
      [namePrefix.split('.')[0]]: {
        [namePrefix.split('.')[1]]: defaultBiomicroscopyAnterior,
      },
    },
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as never)} data-testid="bio-ant-form">
        <BiomicroscopyAnteriorForm
          namePrefix={namePrefix}
          eyeLabel="OD (Oeil Droit)"
        />
        <button type="submit">Soumettre</button>
      </form>
    </FormProvider>
  );
}

// Wrapper simplifié avec champ à la racine pour les tests de validation
function SimpleBioAntWrapper({
  onSubmit = vi.fn(),
}: {
  onSubmit?: (data: BiomicroscopyAnteriorFormValues) => void;
}) {
  const form = useForm<BiomicroscopyAnteriorFormValues>({
    resolver: zodResolver(BiomicroscopyAnteriorSchema),
    defaultValues: defaultBiomicroscopyAnterior,
  });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        data-testid="bio-ant-form"
      >
        <BiomicroscopyAnteriorForm
          namePrefix=""
          eyeLabel="OD (Oeil Droit)"
        />
        <button type="submit">Soumettre</button>
      </form>
    </FormProvider>
  );
}

// Note: namePrefix="" cause un trailing dot issue dans le form, on utilise un
// namePrefix réel. Refactorisons pour utiliser un namePrefix simple.
function BioAntWithPrefix({
  onSubmit = vi.fn(),
  initialSegment = 'NORMAL' as const,
}: {
  onSubmit?: (data: { segment: string; [key: string]: unknown }) => void;
  initialSegment?: 'NORMAL' | 'PRESENCE_LESION' | 'REMANIEMENT_TOTAL';
}) {
  const form = useForm({
    defaultValues: {
      segment: initialSegment,
      cornee: null,
      cornee_autre: null,
      profondeur: null,
      transparence: null,
      type_anomalie_value: null,
      type_anomalie_autre: null,
      quantite_anomalie: null,
      pupille: null,
      axe_visuel: null,
      rpm: null,
      iris: null,
      iris_autres: null,
      cristallin: null,
      position_cristallin: null,
    },
  });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit as never)}
        data-testid="bio-ant-form"
      >
        <BiomicroscopyAnteriorForm
          namePrefix="test_prefix"
          eyeLabel="OD (Oeil Droit)"
        />
        <button type="submit">Soumettre</button>
      </form>
    </FormProvider>
  );
}

// Wrapper le plus simple avec un préfixe qui fonctionne
function BioAntWrapper({
  onSubmit = vi.fn(),
  initialValues = defaultBiomicroscopyAnterior,
}: {
  onSubmit?: (data: unknown) => void;
  initialValues?: Partial<BiomicroscopyAnteriorFormValues>;
}) {
  const form = useForm({
    defaultValues: {
      bp: {
        ...defaultBiomicroscopyAnterior,
        ...initialValues,
      },
    },
  });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((d) => onSubmit(d.bp))}
        data-testid="bio-ant-form"
      >
        <BiomicroscopyAnteriorForm
          namePrefix="bp"
          eyeLabel="OD (Oeil Droit)"
        />
        <button type="submit">Soumettre</button>
      </form>
    </FormProvider>
  );
}

describe('BiomicroscopyAnteriorForm', () => {
  // --------------------------------------------------------------------------
  // Segment NORMAL
  // --------------------------------------------------------------------------

  describe('segment = NORMAL (état initial)', () => {
    it("n'affiche pas le bloc de champs détaillés quand segment=NORMAL", () => {
      // Arrange
      render(<BioAntWrapper />);

      // Assert — les selects de cornée, iris, etc. ne sont pas dans le DOM
      expect(screen.queryByText(/profondeur ca/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/transparence/i)).not.toBeInTheDocument();
    });

    it("affiche les boutons radio de statut du segment", () => {
      // Arrange
      render(<BioAntWrapper />);

      // Assert
      expect(screen.getByRole('radio', { name: /normal/i })).toBeInTheDocument();
      expect(
        screen.getByRole('radio', { name: /présence de lésion/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('radio', { name: /remaniement total/i }),
      ).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // Segment PRESENCE_LESION
  // --------------------------------------------------------------------------

  describe('segment = PRESENCE_LESION', () => {
    it("affiche le bloc de champs détaillés quand segment=PRESENCE_LESION", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<BioAntWrapper />);

      // Act
      await user.click(screen.getByRole('radio', { name: /présence de lésion/i }));

      // Assert
      await screen.findByText(/profondeur ca/i);
      await screen.findByText(/transparence/i);
      await screen.findByText(/cornée/i);
    });

    it("masque le bloc quand segment repasse à NORMAL", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<BioAntWrapper />);

      // Act
      await user.click(screen.getByRole('radio', { name: /présence de lésion/i }));
      await screen.findByText(/profondeur ca/i);
      await user.click(screen.getByRole('radio', { name: /normal/i }));

      // Assert
      await waitFor(() => {
        expect(screen.queryByText(/profondeur ca/i)).not.toBeInTheDocument();
      });
    });

    // ----------------------------------------------------------------------
    // cornee = AUTRE
    // ----------------------------------------------------------------------

    it("affiche le champ 'Précisez' (cornee_autre) quand cornée=Autre est sélectionné", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<BioAntWrapper />);

      // Act - activer PRESENCE_LESION
      await user.click(screen.getByRole('radio', { name: /présence de lésion/i }));
      await screen.findByText(/cornée/i);

      // Ouvrir le select cornée et choisir Autre
      const corneeSelect = await screen.findByRole('combobox', {
        name: /cornée/i,
      });
      await user.click(corneeSelect);
      await user.click(screen.getByRole('option', { name: /autre/i }));

      // Assert — le label "Précisez" et le champ texte associé apparaissent
      await screen.findByLabelText(/précisez/i);
    });

    // ----------------------------------------------------------------------
    // iris = AUTRES
    // ----------------------------------------------------------------------

    it("affiche le champ iris_autres quand iris=Autres est sélectionné", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<BioAntWrapper />);

      // Act
      await user.click(screen.getByRole('radio', { name: /présence de lésion/i }));
      await screen.findByText(/iris/i);

      const irisSelect = screen.getByRole('combobox', { name: /^iris/i });
      await user.click(irisSelect);
      await user.click(screen.getByRole('option', { name: /autres/i }));

      // Assert - un champ texte apparaît pour iris_autres
      const preciseLabels = await screen.findAllByText(/précisez/i);
      expect(preciseLabels.length).toBeGreaterThan(0);
    });

    // ----------------------------------------------------------------------
    // transparence = ANORMALE → sous-bloc anomalie
    // ----------------------------------------------------------------------

    it("affiche le sous-bloc type_anomalie quand transparence=Anormale est sélectionnée", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<BioAntWrapper />);

      // Act
      await user.click(screen.getByRole('radio', { name: /présence de lésion/i }));
      await screen.findByText(/transparence/i);

      const transparenceSelect = screen.getByRole('combobox', {
        name: /transparence/i,
      });
      await user.click(transparenceSelect);
      await user.click(screen.getByRole('option', { name: /anormale/i }));

      // Assert
      await screen.findByText(/type d'anomalie/i);
      await screen.findByText(/quantité/i);
    });

    // ----------------------------------------------------------------------
    // Chemin complet 3 niveaux : PRESENCE_LESION → transparence ANORMALE → type_anomalie AUTRE
    // ----------------------------------------------------------------------

    it("affiche type_anomalie_autre quand transparence=ANORMALE et type_anomalie=AUTRE (chemin 3 niveaux)", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<BioAntWrapper />);

      // Act - niveau 1: segment
      await user.click(screen.getByRole('radio', { name: /présence de lésion/i }));
      await screen.findByText(/transparence/i);

      // Niveau 2: transparence
      const transparenceSelect = screen.getByRole('combobox', {
        name: /transparence/i,
      });
      await user.click(transparenceSelect);
      await user.click(screen.getByRole('option', { name: /anormale/i }));
      await screen.findByText(/type d'anomalie/i);

      // Niveau 3: type_anomalie
      const typeAnomalieSelect = screen.getByRole('combobox', {
        name: /type d'anomalie/i,
      });
      await user.click(typeAnomalieSelect);
      await user.click(screen.getByRole('option', { name: /autre/i }));

      // Assert - un champ texte "Précisez" supplémentaire doit apparaître
      const preciseLabels = await screen.findAllByText(/précisez/i);
      expect(preciseLabels.length).toBeGreaterThan(0);
    });

    it("ne affiche plus le sous-bloc anomalie quand transparence repasse à NORMAL", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<BioAntWrapper />);

      // Act
      await user.click(screen.getByRole('radio', { name: /présence de lésion/i }));
      const transparenceSelect = await screen.findByRole('combobox', {
        name: /transparence/i,
      });
      await user.click(transparenceSelect);
      await user.click(screen.getByRole('option', { name: /anormale/i }));
      await screen.findByText(/type d'anomalie/i);

      // Repasser à normale
      await user.click(transparenceSelect);
      await user.click(screen.getByRole('option', { name: /^normale$/i }));

      // Assert
      await waitFor(() => {
        expect(screen.queryByText(/type d'anomalie/i)).not.toBeInTheDocument();
      });
    });
  });
});
