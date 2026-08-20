/**
 * Tests — DriverRecordDialog (dossier conducteur à l'accueil)
 *
 * Le formulaire public d'un événement « pour conducteurs » ne recueille que
 * quatre champs ; le dossier complet en exige onze. Ces quatre valeurs
 * remontaient jusqu'en base sans jamais être relues : le staff ressaisissait.
 * Ces tests verrouillent le pré-remplissage et le masquage de l'état civil.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { DriverRecordDialog } from '../driver-record-dialog';

function renderDialog(
  driverData: Parameters<typeof DriverRecordDialog>[0]['driverData'],
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <DriverRecordDialog
        open
        onOpenChange={() => {}}
        patientId={42}
        patientNom="Ibrahima Fall"
        driverData={driverData}
      />
    </QueryClientProvider>,
  );
}

describe('DriverRecordDialog', () => {
  test('pré-remplit le numéro de permis fourni en ligne', () => {
    renderDialog({ numero_permis: 'SN-98765', type_permis: 'Lourd' });

    expect(screen.getByDisplayValue('SN-98765')).toBeInTheDocument();
  });

  test('annonce combien de champs viennent de l inscription', () => {
    renderDialog({
      numero_permis: 'SN-1',
      type_permis: 'Leger',
      service: 'Prive',
      zone_de_residence: 'Dakar',
    });

    expect(screen.getByText(/4 champs pré-remplis/i)).toBeInTheDocument();
  });

  test('une chaîne vide n est pas comptée comme pré-remplie', () => {
    // `allow_blank=True` côté API rend ce cas courant : sans la garde, le
    // formulaire annoncerait des champs remplis… avec du vide.
    renderDialog({ numero_permis: '   ', type_permis: '' });

    expect(screen.getByText(/Aucune donnée conducteur/i)).toBeInTheDocument();
  });

  test('sans donnée en ligne, invite à saisir le dossier complet', () => {
    renderDialog(null);

    expect(screen.getByText(/Aucune donnée conducteur/i)).toBeInTheDocument();
  });

  test("masque l'état civil : le patient existe déjà", () => {
    renderDialog({ numero_permis: 'SN-2' });

    expect(screen.queryByText(/Identité du patient/i)).not.toBeInTheDocument();
  });

  test('le bouton annonce une création, pas une mise à jour', () => {
    renderDialog(null);

    expect(
      screen.getByRole('button', { name: /Créer le dossier conducteur/i }),
    ).toBeInTheDocument();
  });
});
