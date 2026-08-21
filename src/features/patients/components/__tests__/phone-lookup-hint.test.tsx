/**
 * Tests d'intégration — PhoneLookupHint
 *
 * Le numéro de téléphone est UNIQUE en base. Sans cet indice, l'accueil
 * remplissait tout le formulaire avant de se heurter à un 500.
 *
 * Couvre :
 * - aucun affichage quand le numéro n'est porté par personne
 * - nom + nombre d'examens quand un patient porte déjà le numéro
 * - avertissement spécifique quand le dossier est archivé
 * - aucune requête tant que le numéro n'est pas un E.164 valide
 * - debounce : des frappes rapprochées ne produisent qu'une requête
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, test } from 'vitest';

import { env } from '@/config/env';
import { patientsHandlers } from '@/testing/mocks/handlers/patients';
import { server } from '@/testing/mocks/server';

import { PhoneLookupHint } from '../phone-lookup-hint';

const LOOKUP_URL = `${env.API_URL}/depistage/patients/lookup-telephone/`;

/** Numéro sénégalais porté par « Fatou Diop » dans les fixtures MSW. */
const NUMERO_CONNU = '+221775726004';
/** Numéro d'un dossier archivé dans les fixtures MSW. */
const NUMERO_ARCHIVE = '+221770000000';
/** Numéro valide qu'aucun patient ne porte. */
const NUMERO_LIBRE = '+221781234567';

function renderHint(phoneNumber: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <PhoneLookupHint phoneNumber={phoneNumber} />
    </QueryClientProvider>,
  );
}

/** Compte les appels au endpoint de lookup. */
function compterAppels() {
  const compteur = { total: 0, numeros: [] as string[] };
  server.use(
    http.get(LOOKUP_URL, ({ request }) => {
      compteur.total += 1;
      compteur.numeros.push(
        new URL(request.url).searchParams.get('phone_number') ?? '',
      );
      return HttpResponse.json({ patient_existant: null });
    }),
  );
  return compteur;
}

describe('PhoneLookupHint', () => {
  test("n'affiche rien quand aucun patient ne porte le numéro", async () => {
    // Arrange
    server.use(...patientsHandlers);

    // Act
    renderHint(NUMERO_LIBRE);

    // Assert — l'indicateur de chargement disparaît sans rien laisser
    await waitFor(
      () => expect(screen.queryByText(/vérification/i)).not.toBeInTheDocument(),
      { timeout: 4000 },
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  test('annonce le patient existant, son âge et son nombre d’examens', async () => {
    // Arrange
    server.use(...patientsHandlers);

    // Act
    renderHint(NUMERO_CONNU);

    // Assert
    expect(
      await screen.findByText('Fatou Diop', {}, { timeout: 4000 }),
    ).toBeInTheDocument();
    const indice = screen.getByRole('status');
    expect(indice).toHaveTextContent(/34 ans/);
    expect(indice).toHaveTextContent(/3 examens/);
    expect(
      screen.getByRole('link', { name: /voir le dossier/i }),
    ).toHaveAttribute('href', '/patients/42');
  });

  test('avertit quand le dossier portant le numéro est archivé', async () => {
    // Arrange
    server.use(...patientsHandlers);

    // Act
    renderHint(NUMERO_ARCHIVE);

    // Assert
    const alerte = await screen.findByRole('alert', {}, { timeout: 4000 });
    expect(alerte).toHaveTextContent(/archivé/i);
    expect(alerte).toHaveTextContent('Moussa Fall');
    // Un dossier archivé ne se rattache pas : pas de lien de consultation.
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  test("n'émet aucune requête tant que le numéro est incomplet", async () => {
    // Arrange — le endpoint est limité à 120 req/min : rien ne part sur un
    // numéro qui ne passerait de toute façon pas la validation E.164.
    const compteur = compterAppels();

    // Act
    renderHint('+2217757');

    // Assert
    await new Promise((resolve) => setTimeout(resolve, 900));
    expect(compteur.total).toBe(0);
  });

  test('debounce la saisie : une seule requête pour des frappes rapprochées', async () => {
    // Arrange
    const compteur = compterAppels();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <PhoneLookupHint phoneNumber="+22177572600" />
      </QueryClientProvider>,
    );

    // Act — quatre valeurs successives dans le même tick (< 400 ms)
    for (const valeur of [
      '+221775726001',
      '+221775726002',
      '+221775726003',
      NUMERO_CONNU,
    ]) {
      rerender(
        <QueryClientProvider client={queryClient}>
          <PhoneLookupHint phoneNumber={valeur} />
        </QueryClientProvider>,
      );
    }

    // Assert — une seule requête, portant la dernière valeur saisie
    await waitFor(() => expect(compteur.total).toBe(1), { timeout: 4000 });
    expect(compteur.numeros).toEqual([NUMERO_CONNU]);
  });
});
