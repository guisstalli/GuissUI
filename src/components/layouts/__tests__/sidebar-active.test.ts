import { describe, expect, test } from 'vitest';

import { allNavUrls, resolveActiveUrl } from '../sidebar';

/**
 * Une seule entrée de navigation doit s'allumer à la fois.
 *
 * Constaté en usage : sur « Journal de sécurité », l'entrée « Tableau de
 * bord » restait allumée elle aussi. La règle marquait actif tout lien dont
 * l'URL préfixait le chemin courant — or `/administration` préfixe
 * `/administration/securite`.
 *
 * Ce défaut est structurel : il réapparaîtra dès qu'une section aura une page
 * d'accueil ET des sous-pages. D'où ces tests.
 */
describe('resolveActiveUrl', () => {
  test('le chemin le plus précis gagne sur son parent', () => {
    // Arrange — le cas signalé.
    const candidats = [
      '/administration',
      '/administration/securite',
      '/administration/permissions',
    ];

    // Act
    const actif = resolveActiveUrl('/administration/securite', candidats);

    // Assert
    expect(actif).toBe('/administration/securite');
  });

  test("la page d'accueil d'une section reste active sur elle-même", () => {
    const candidats = ['/administration', '/administration/securite'];

    expect(resolveActiveUrl('/administration', candidats)).toBe(
      '/administration',
    );
  });

  test('un segment plus profond active son entrée la plus proche', () => {
    // Le détail d'un patient doit allumer « Patients », pas autre chose.
    const candidats = ['/patients', '/patients/corbeille'];

    expect(resolveActiveUrl('/patients/1234', candidats)).toBe('/patients');
    expect(resolveActiveUrl('/patients/corbeille', candidats)).toBe(
      '/patients/corbeille',
    );
  });

  test('un préfixe partiel ne correspond pas', () => {
    // `/patients` ne doit pas s'allumer sur `/patientsxyz` : la comparaison
    // porte sur des SEGMENTS, pas sur des caractères.
    expect(resolveActiveUrl('/patientsxyz', ['/patients'])).toBeUndefined();
  });

  test('aucune correspondance renvoie undefined', () => {
    expect(resolveActiveUrl('/inconnu', ['/patients'])).toBeUndefined();
  });
});

describe('allNavUrls', () => {
  test('couvre les sections principales et administratives', () => {
    const urls = allNavUrls();

    expect(urls).toContain('/administration');
    expect(urls).toContain('/administration/securite');
    expect(urls).toContain('/administration/permissions');
    // La racine est exclue : elle préfixe tout et rendrait la résolution
    // inutile.
    expect(urls).not.toContain('/');
  });

  test('chaque URL réelle résout vers elle-même', () => {
    // Le vrai invariant : quelle que soit la page, l'entrée allumée est bien
    // celle sur laquelle on se trouve.
    const urls = allNavUrls();

    for (const url of urls) {
      expect(resolveActiveUrl(url, urls)).toBe(url);
    }
  });
});
