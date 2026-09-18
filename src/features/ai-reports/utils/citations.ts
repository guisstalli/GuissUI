/**
 * Citations : rendre cliquables les marqueurs « [n] » posés par le backend.
 *
 * POURQUOI — le backend rattache chaque chiffre de la réponse à l'outil qui l'a
 * produit, et écrit « 4069 [1] patients ». Laissé en texte, le marqueur oblige
 * le lecteur à déplier l'accordéon « Sources » et à recompter les cartes pour
 * savoir laquelle porte le « [1] ». Transformé en lien, il l'y emmène.
 *
 * Rien n'est ajouté ni interprété ici : on ne reconnaît que les marqueurs déjà
 * présents. Deviner une source côté client désignerait la mauvaise carte, ce
 * qui serait pire que pas de citation du tout.
 */

/** Préfixe des ancres de citation, pour distinguer un marqueur d'un vrai lien. */
export const PREFIXE_ANCRE = '#citation-';

/** « [1] », précédé d'une espace — la forme exacte que pose le backend. */
const MARQUEUR = / \[(\d+)\]/g;

/**
 * Zones de code : un marqueur y serait du texte littéral, et le transformer
 * en lien casserait la requête qu'il illustre. Même règle que le backend.
 */
const CODE = /```[\s\S]*?```|`[^`\n]*`/g;

/** Transforme chaque « [n] » en lien markdown vers la carte source n. */
export function lierCitations(markdown: string): string {
  if (!markdown) return markdown;

  let resultat = '';
  let curseur = 0;
  for (const bloc of markdown.matchAll(CODE)) {
    const debut = bloc.index ?? 0;
    resultat += markdown.slice(curseur, debut).replace(MARQUEUR, lien);
    resultat += bloc[0];
    curseur = debut + bloc[0].length;
  }
  return resultat + markdown.slice(curseur).replace(MARQUEUR, lien);
}

function lien(_correspondance: string, numero: string): string {
  return ` [${numero}](${PREFIXE_ANCRE}${numero})`;
}

/** Numéro de source d'un href de citation, `null` pour tout autre lien. */
export function numeroDeCitation(href: string | undefined): number | null {
  if (!href || !href.startsWith(PREFIXE_ANCRE)) return null;
  const numero = Number(href.slice(PREFIXE_ANCRE.length));
  return Number.isInteger(numero) && numero > 0 ? numero : null;
}
