import type { UseFormReturn } from 'react-hook-form';

/**
 * Recharge une section du formulaire d'examen depuis les donnees de l'API.
 *
 * PIEGE CORRIGE : la page appelait `form.setValue('conclusion', {...})`, soit
 * l'OBJET entier, depuis un effet — donc APRES le montage des champs. React
 * Hook Form descend alors dans l'objet et affecte les feuilles ; pour un
 * TABLEAU il descend jusqu'aux index (`conclusion.diagnostic_cim_11.0`), que
 * personne n'enregistre. Le Controller enregistre AU NIVEAU du tableau ne
 * recoit donc jamais la valeur.
 *
 * Consequence observee en production : les diagnostics CIM-11 etaient bien
 * ecrits EN BASE, l'API les renvoyait, et le formulaire les affichait vides.
 * A la sauvegarde suivante, le tableau vide du formulaire ecrasait la base —
 * la saisie du clinicien disparaissait sans le moindre message.
 *
 * Le meme piege vise tous les champs tableau : `pbo` (symptomes des plaintes),
 * `examens_additionnels`, `ttt_hypotonisant_value`, les antecedents. D'ou une
 * reparation GENERIQUE plutot qu'un correctif par champ : un tableau ajoute
 * demain sera couvert sans y penser.
 *
 * Nuance de timing : appele pendant le rendu initial, le meme `setValue`
 * fonctionne. Seul l'appel post-montage est touche — ce qui explique qu'un
 * test naif passe alors que l'ecran est casse.
 */
export function setSectionValues(
  form: UseFormReturn<never>,
  name: string,
  values: unknown,
): void {
  (form.setValue as (n: string, v: unknown) => void)(name, values);
  reappliquerTableaux(form, name, values);
}

function reappliquerTableaux(
  form: UseFormReturn<never>,
  chemin: string,
  valeur: unknown,
): void {
  const set = form.setValue as (n: string, v: unknown) => void;

  if (Array.isArray(valeur)) {
    set(chemin, valeur);
    return;
  }

  if (valeur !== null && typeof valeur === 'object') {
    for (const [cle, sousValeur] of Object.entries(valeur)) {
      reappliquerTableaux(form, `${chemin}.${cle}`, sousValeur);
    }
  }
}
