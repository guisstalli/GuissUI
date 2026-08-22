import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { InternalAppGuard } from '../internal-app-guard';

const mockPathname = vi.fn(() => '/');
const mockReplace = vi.fn();
const mockSession = vi.fn(() => ({ data: null, status: 'unauthenticated' }));

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({ replace: mockReplace }),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => mockSession(),
}));

/**
 * Regression : la vitrine est servie sur `/` par REECRITURE du middleware,
 * donc usePathname() rend `/` et jamais `/landing`. La garde prenait cette
 * page publique pour une page interne et la recouvrait d'un ecran
 * « Redirection vers la connexion » — HTTP 200, bon titre, contenu invisible.
 */
describe('InternalAppGuard — racine du domaine vitrine', () => {
  it('laisse passer la vitrine sur `/` sans session', () => {
    mockPathname.mockReturnValue('/');

    render(
      <InternalAppGuard hoteVitrine>
        <p>Voir ce que l’œil ne dit pas.</p>
      </InternalAppGuard>,
    );

    expect(screen.getByText('Voir ce que l’œil ne dit pas.')).toBeVisible();
    expect(
      screen.queryByText(/Redirection vers la connexion/),
    ).not.toBeInTheDocument();
  });

  it('protege toujours `/` sur le domaine applicatif', () => {
    mockPathname.mockReturnValue('/');

    render(
      <InternalAppGuard hoteVitrine={false}>
        <p>Tableau de bord</p>
      </InternalAppGuard>,
    );

    expect(screen.queryByText('Tableau de bord')).not.toBeInTheDocument();
    expect(screen.getByText(/Redirection vers la connexion/)).toBeVisible();
  });

  it('protege les pages internes meme sur le domaine vitrine', () => {
    mockPathname.mockReturnValue('/patients');

    render(
      <InternalAppGuard hoteVitrine>
        <p>Liste des patients</p>
      </InternalAppGuard>,
    );

    expect(screen.queryByText('Liste des patients')).not.toBeInTheDocument();
    expect(screen.getByText(/Redirection vers la connexion/)).toBeVisible();
  });
});
