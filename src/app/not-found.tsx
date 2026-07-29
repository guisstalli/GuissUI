import { FileQuestion } from 'lucide-react';

import { Link } from '@/components/ui/link';
import { paths } from '@/config/paths';

/**
 * Page 404.
 *
 * Elle ne s'affiche que pour un utilisateur authentifié : le middleware
 * redirige un visiteur anonyme vers la connexion avant que Next ne puisse la
 * rendre. C'est volontaire — répondre 404 à un anonyme révélerait quelles
 * routes existent.
 */
const NotFoundPage = () => {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-muted">
        <FileQuestion
          className="size-7 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
      <p className="text-sm font-medium text-muted-foreground">Erreur 404</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
        Cette page n&apos;existe pas
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Le lien est peut-être erroné, ou la page a été déplacée. Vérifiez
        l&apos;adresse ou revenez à l&apos;accueil.
      </p>
      <Link
        href={paths.home.getHref()}
        replace
        className="hover:bg-primary/90 mt-6 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors"
      >
        Retour à l&apos;accueil
      </Link>
    </main>
  );
};

export default NotFoundPage;
