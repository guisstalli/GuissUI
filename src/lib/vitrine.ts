/**
 * Domaines qui servent la VITRINE publique, par opposition a app.guisstalli.com
 * qui sert l'application du personnel.
 *
 * Source UNIQUE, partagee par le middleware (rendu serveur) et par
 * InternalAppGuard (rendu client). Les deux couches DOIVENT appliquer la meme
 * regle : c'est leur divergence qui a produit le defaut corrige ici — le
 * middleware reecrivait `/` vers `/landing`, la garde continuait de voir `/`,
 * la jugeait interne, et recouvrait la vitrine d'un ecran
 * « Redirection vers la connexion ». La page etait servie et invisible.
 */
export const DOMAINES_VITRINE = new Set([
  'guisstalli.com',
  'www.guisstalli.com',
]);

/** Vrai si l'en-tete `Host` designe un domaine vitrine (port ignore). */
export function estHoteVitrine(hote: string | null | undefined): boolean {
  if (!hote) return false;
  const nom = hote.split(':')[0]?.toLowerCase() ?? '';
  return DOMAINES_VITRINE.has(nom);
}
