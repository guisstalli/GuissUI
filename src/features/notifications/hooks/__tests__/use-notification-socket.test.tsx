import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import type { AppNotification } from '../../types/schemas';
import { invaliderInscriptions } from '../use-notification-socket';

/**
 * Le tableau des inscriptions ne se rafraîchissait pas : la notification temps
 * réel arrivait bien, mais rien n'invalidait la requête — il fallait recharger
 * la page à chaque inscription.
 *
 * Ces tests verrouillent surtout le PÉRIMÈTRE de l'invalidation. Invalider
 * `['events']` en bloc corrigerait le symptôme et purgerait au passage le
 * détail de l'événement, ses statistiques et la liste — trois requêtes
 * refaites à chaque inscription, sur un écran d'accueil déjà chargé.
 */
function notification(
  overrides: Partial<AppNotification> = {},
): AppNotification {
  return {
    id: 1,
    title: 'Nouvelle inscription',
    message: 'Mamadou Diallo vient de s’inscrire.',
    category: 'inscription',
    is_read: false,
    metadata: { event_id: 1 },
    created_at: '2026-03-01T09:00:00.000Z',
    ...overrides,
  } as AppNotification;
}

/** Marque une requête comme fraîche pour observer ensuite son invalidation. */
function amorcer(client: QueryClient, key: readonly unknown[]) {
  client.setQueryData(key, { valeur: 'fraiche' });
}

const estPerimee = (client: QueryClient, key: readonly unknown[]) =>
  client.getQueryState(key)?.isInvalidated === true;

describe('invaliderInscriptions', () => {
  it("invalide les inscriptions de l'événement concerné", () => {
    const client = new QueryClient();
    amorcer(client, ['events', 1, 'inscriptions']);

    invaliderInscriptions(client, notification());

    expect(estPerimee(client, ['events', 1, 'inscriptions'])).toBe(true);
  });

  it('épargne les statistiques et le détail du même événement', () => {
    const client = new QueryClient();
    amorcer(client, ['events', 1, 'inscriptions']);
    amorcer(client, ['events', 1, 'stats']);
    amorcer(client, ['events', 1]);
    amorcer(client, ['events']);

    invaliderInscriptions(client, notification());

    expect(estPerimee(client, ['events', 1, 'inscriptions'])).toBe(true);
    expect(estPerimee(client, ['events', 1, 'stats'])).toBe(false);
    expect(estPerimee(client, ['events', 1])).toBe(false);
    expect(estPerimee(client, ['events'])).toBe(false);
  });

  it("n'invalide pas les inscriptions d'un AUTRE événement", () => {
    const client = new QueryClient();
    amorcer(client, ['events', 1, 'inscriptions']);
    amorcer(client, ['events', 2, 'inscriptions']);

    invaliderInscriptions(client, notification());

    expect(estPerimee(client, ['events', 1, 'inscriptions'])).toBe(true);
    expect(estPerimee(client, ['events', 2, 'inscriptions'])).toBe(false);
  });

  it('ignore une notification qui ne concerne pas une inscription', () => {
    const client = new QueryClient();
    amorcer(client, ['events', 1, 'inscriptions']);

    invaliderInscriptions(client, notification({ category: 'appointment' }));

    expect(estPerimee(client, ['events', 1, 'inscriptions'])).toBe(false);
  });

  it("sans identifiant d'événement, se rabat sur les seules listes d'inscriptions", () => {
    const client = new QueryClient();
    amorcer(client, ['events', 1, 'inscriptions']);
    amorcer(client, ['events', 2, 'inscriptions']);
    amorcer(client, ['events', 1, 'stats']);

    invaliderInscriptions(client, notification({ metadata: {} }));

    // Repli volontairement large sur les inscriptions — mais les stats restent
    // intactes : le repli ne doit pas devenir un « invalide tout ».
    expect(estPerimee(client, ['events', 1, 'inscriptions'])).toBe(true);
    expect(estPerimee(client, ['events', 2, 'inscriptions'])).toBe(true);
    expect(estPerimee(client, ['events', 1, 'stats'])).toBe(false);
  });
});
