/**
 * Tests de OrdonnanceFormDialog — champ « œil concerné »
 * suite à la migration OU/NA → OD/OG/ODG.
 *
 * Architecture de test :
 * - Les mutations (useGenerateAdultOrdonnance / useGenerateChildOrdonnance)
 *   sont mockées via vi.mock car elles déclenchent un téléchargement PDF
 *   (downloadPdf) non interceptable proprement par MSW en jsdom.
 * - Les requêtes réseau (prefill) sont couvertes par un handler MSW injecté
 *   via server.use(...) — jamais de mock direct de fetch ou axios.
 * - MedicamentSelector est mocké pour éviter ses propres appels API.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { env } from '@/config/env';
import { useGenerateAdultOrdonnance } from '@/features/exams/api/adult/ordonnance';
import { useGenerateChildOrdonnance } from '@/features/exams/api/child/ordonnance';
import { server } from '@/testing/mocks/server';

import {
  OrdonnanceFormDialog,
  normalizeOeil,
  type PrescriptionData,
} from '../ordonnance-form-dialog';

// ---------------------------------------------------------------------------
// Mocks des mutations + MedicamentSelector
// ---------------------------------------------------------------------------
vi.mock('@/features/exams/api/adult/ordonnance', () => ({
  useGenerateAdultOrdonnance: vi.fn(),
}));
vi.mock('@/features/exams/api/child/ordonnance', () => ({
  useGenerateChildOrdonnance: vi.fn(),
}));
vi.mock('@/components/medicament-selector/medicament-selector', () => ({
  MedicamentSelector: ({ value }: { value: string }) => (
    <input aria-label="Medicament" defaultValue={value} />
  ),
}));

const mutateFn = vi.fn();

beforeEach(() => {
  vi.mocked(useGenerateAdultOrdonnance).mockReturnValue({
    mutate: mutateFn,
    isPending: false,
  } as unknown as ReturnType<typeof useGenerateAdultOrdonnance>);
  vi.mocked(useGenerateChildOrdonnance).mockReturnValue({
    mutate: mutateFn,
    isPending: false,
  } as unknown as ReturnType<typeof useGenerateChildOrdonnance>);
  mutateFn.mockReset();
});

// ---------------------------------------------------------------------------
// Handler MSW pour le prefill (évite onUnhandledRequest: 'error')
// ---------------------------------------------------------------------------
const prefillHandler = http.get(
  `${env.API_URL}/depistage/examens/adultes/:id/ordonnance/prefill/`,
  () =>
    HttpResponse.json({
      od: { sphere: null, cylindre: null, axe: null },
      og: { sphere: null, cylindre: null, axe: null },
      dp_loin: null,
      dp: null,
      addition_od: null,
      addition_og: null,
      av_od: null,
      av_og: null,
    }),
);

// ---------------------------------------------------------------------------
// Wrapper minimal (QueryClient uniquement — notifications via Zustand)
// ---------------------------------------------------------------------------
function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  };
}

function renderDialog(
  props: Partial<Parameters<typeof OrdonnanceFormDialog>[0]> = {},
) {
  const defaults = {
    examId: 42,
    examType: 'adult' as const,
    mode: 'medicamenteuse' as const,
    open: true,
    onClose: vi.fn(),
    initialData: null as PrescriptionData | null,
    ...props,
  };
  return render(<OrdonnanceFormDialog {...defaults} />, {
    wrapper: makeWrapper(),
  });
}

// =============================================================================
// normalizeOeil — fonction pure, pas de rendu
// =============================================================================
describe('normalizeOeil', () => {
  it('passe OD, OG, ODG tels quels', () => {
    expect(normalizeOeil('OD')).toBe('OD');
    expect(normalizeOeil('OG')).toBe('OG');
    expect(normalizeOeil('ODG')).toBe('ODG');
  });

  it('mappe OU → ODG (ancienne valeur "les deux yeux")', () => {
    expect(normalizeOeil('OU')).toBe('ODG');
  });

  it('mappe NA → ODG (ancienne valeur "non applicable")', () => {
    expect(normalizeOeil('NA')).toBe('ODG');
  });

  it('mappe undefined → ODG (repli sûr)', () => {
    expect(normalizeOeil(undefined)).toBe('ODG');
  });

  it('mappe null → ODG (repli sûr)', () => {
    expect(normalizeOeil(null)).toBe('ODG');
  });

  it('mappe toute valeur inconnue → ODG', () => {
    expect(normalizeOeil('INCONNU')).toBe('ODG');
  });
});

// =============================================================================
// OrdonnanceFormDialog — formulaire médicamenteux
// =============================================================================
describe('OrdonnanceFormDialog — mode médicamenteux', () => {
  it('affiche le dialog quand open=true', () => {
    server.use(prefillHandler);
    renderDialog();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it("ajoute une ligne avec la valeur d'œil par défaut ODG (Les deux yeux)", async () => {
    server.use(prefillHandler);
    const user = userEvent.setup();
    renderDialog();

    await user.click(
      // Le bouton contient "Ajouter un médicament" — on cherche via le texte visible
      screen.getByRole('button', { name: /médicament/i }),
    );

    // Le trigger du Select doit afficher le libellé français ODG
    await waitFor(() => {
      // getAllByText car le SelectTrigger peut avoir un jumeau dans le portail
      const nodes = screen.getAllByText('Les deux yeux');
      expect(nodes.length).toBeGreaterThan(0);
    });
  });

  it('affiche le libelle francais correct pour OD (Oeil droit)', async () => {
    // Verifier le libelle via la valeur initiale OD dans initialData
    const initialData: PrescriptionData = {
      medicaments: [
        {
          nom_prescrit: 'Atropine',
          forme_galenique: 'COMPRIMES',
          oeil: 'OD',
          posologie: '1 goutte',
        },
      ],
    };
    renderDialog({ initialData });

    await waitFor(() => {
      expect(screen.getAllByText('Œil droit').length).toBeGreaterThan(0);
    });

    // Les valeurs mortes ne doivent pas etre affichees
    expect(screen.queryByText('OU')).not.toBeInTheDocument();
    expect(screen.queryByText('NA')).not.toBeInTheDocument();
  });

  it('affiche le libelle francais correct pour OG (Oeil gauche)', async () => {
    const initialData: PrescriptionData = {
      medicaments: [
        {
          nom_prescrit: 'Timolol',
          forme_galenique: 'COMPRIMES',
          oeil: 'OG',
          posologie: '1 comprime',
        },
      ],
    };
    renderDialog({ initialData });

    await waitFor(() => {
      expect(screen.getAllByText('Œil gauche').length).toBeGreaterThan(0);
    });
  });

  it('affiche le libelle francais correct pour ODG (Les deux yeux)', async () => {
    const initialData: PrescriptionData = {
      medicaments: [
        {
          nom_prescrit: 'Vitamine C',
          forme_galenique: 'COMPRIMES',
          oeil: 'ODG',
          posologie: '1 comprime',
        },
      ],
    };
    renderDialog({ initialData });

    await waitFor(() => {
      expect(screen.getAllByText('Les deux yeux').length).toBeGreaterThan(0);
    });
  });

  it("ne plante pas quand initialData contient la valeur héritée 'OU'", () => {
    const initialData: PrescriptionData = {
      medicaments: [
        {
          nom_prescrit: 'Timolol 0.5%',
          forme_galenique: 'COMPRIMES',
          oeil: 'OU',
          posologie: '1 comprimé matin et soir',
          duree_jours: 30,
        },
      ],
    };

    // Le rendu ne doit pas lever d'exception
    expect(() => renderDialog({ initialData })).not.toThrow();
  });

  it("affiche 'Les deux yeux' quand la valeur héritée est 'OU' (normalisée ODG)", async () => {
    const initialData: PrescriptionData = {
      medicaments: [
        {
          nom_prescrit: 'Vitamine A',
          forme_galenique: 'COMPRIMES',
          oeil: 'OU',
          posologie: '1 comprimé par jour',
          duree_jours: 30,
        },
      ],
    };

    renderDialog({ initialData });

    await waitFor(() => {
      const nodes = screen.getAllByText('Les deux yeux');
      expect(nodes.length).toBeGreaterThan(0);
    });
  });

  it("ne plante pas quand initialData contient la valeur héritée 'NA'", () => {
    const initialData: PrescriptionData = {
      medicaments: [
        {
          nom_prescrit: 'Riboflavine',
          forme_galenique: 'COMPRIMES',
          oeil: 'NA',
          posologie: '1 comprimé par jour',
          duree_jours: 30,
        },
      ],
    };

    expect(() => renderDialog({ initialData })).not.toThrow();
  });

  it('utilise oeil_concerne comme repli si oeil est absent (ancien format)', async () => {
    const initialData: PrescriptionData = {
      medicaments: [
        {
          nom_prescrit: 'Atropine 1%',
          forme_galenique: 'COMPRIMES',
          oeil_concerne: 'OD',
          posologie: '1 goutte',
          duree_jours: 7,
        },
      ],
    };

    renderDialog({ initialData });

    // OD est normalisé correctement → libellé "Œil droit"
    await waitFor(() => {
      const nodes = screen.getAllByText('Œil droit');
      expect(nodes.length).toBeGreaterThan(0);
    });
  });
});
