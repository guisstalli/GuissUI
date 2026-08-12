/**
 * MessageStatusBadge — un statut ne doit jamais promettre plus qu'on ne sait.
 *
 * INCIDENT À L'ORIGINE DE CES TESTS : le backend écrivait « sent » dès que le
 * fournisseur avait accepté la requête. Des réponses affichées « Envoyé »
 * avaient en réalité échoué (erreur 63112, compte WhatsApp désactivé par
 * Meta) et n'ont jamais été reçues. Personne ne l'a vu, parce que rien à
 * l'écran ne distinguait « accepté » de « remis ».
 *
 * D'où le test central : `queued` ne doit JAMAIS s'afficher « Envoyé ».
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { MessageStatusBadge } from '../message-status-badge';

describe('MessageStatusBadge', () => {
  test('« queued » n’annonce jamais un envoi réussi', () => {
    render(<MessageStatusBadge status="queued" direction="out" />);

    // Le libellé dit explicitement que la remise n'est pas confirmée.
    expect(screen.getByText('Accepté (non remis)')).toBeInTheDocument();
    // Et surtout : le mot « Envoyé » ne doit apparaître nulle part.
    expect(screen.queryByText('Envoyé')).not.toBeInTheDocument();
  });

  test('« delivered » est le seul à confirmer la remise', () => {
    render(<MessageStatusBadge status="delivered" direction="out" />);

    expect(screen.getByText('Remis')).toBeInTheDocument();
  });

  test('« sent » reste distinct de « delivered »', () => {
    render(<MessageStatusBadge status="sent" direction="out" />);

    expect(screen.getByText('Envoyé')).toBeInTheDocument();
    expect(screen.queryByText('Remis')).not.toBeInTheDocument();
  });

  test('un échec est libellé sans ambiguïté', () => {
    render(<MessageStatusBadge status="failed" direction="out" />);

    expect(screen.getByText('Échec')).toBeInTheDocument();
  });

  test('les libellés entrants diffèrent des sortants', () => {
    // `processed` n'existe que côté entrant : sans distinction de direction,
    // le badge retomberait sur le code brut.
    render(<MessageStatusBadge status="processed" direction="in" />);

    expect(screen.getByText('Traité')).toBeInTheDocument();
  });

  test('un statut inconnu s’affiche tel quel plutôt que de disparaître', () => {
    render(<MessageStatusBadge status="etat_inedit" direction="out" />);

    expect(screen.getByText('etat_inedit')).toBeInTheDocument();
  });
});
