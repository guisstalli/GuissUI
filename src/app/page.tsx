import { redirect } from 'next/navigation';

import { paths } from '@/config/paths';

/**
 * Racine = entrée du personnel : redirection vers le tableau de bord.
 * Un visiteur non connecté est intercepté par le middleware et arrive sur
 * la page de connexion — l'habitude « taper le domaine → login » est
 * conservée. La vitrine publique vit sur /landing.
 */
export default function RootPage() {
  redirect(paths.dashboard.getHref());
}
