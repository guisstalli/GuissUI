/**
 * Utilitaires de test.
 *
 * Réduit aux ré-exports de Testing Library : les aides du squelette
 * Bulletproof React d'origine (`renderApp`, `createUser`, `createDiscussion`,
 * `loginAsUser`, `waitForLoadingToFinish`) portaient un domaine que
 * Guiss-Talli n'a pas — discussions, équipes — et aucun test ne les appelait.
 *
 * Les tests montent leurs propres fournisseurs, au plus près de ce qu'ils
 * vérifient : un `QueryClientProvider` local suffit, et rend explicite l'état
 * du cache pour chaque cas.
 */
import { render as rtlRender } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

export * from '@testing-library/react';
export { userEvent, rtlRender };
