import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';

/**
 * Valide les champs d'une section AVANT de l'enregistrer.
 *
 * POURQUOI — les écrans d'examen lisent leurs valeurs avec `getValues()` et
 * appellent l'API directement. `zodResolver` ne s'exécutant qu'à la soumission,
 * qui n'a jamais lieu ici, AUCUNE règle du formulaire ne s'appliquait : un
 * cylindre hors bornes ou un nystagmus sans œil affecté partaient au serveur,
 * qui les refusait (Sentry GUISSAPI-17, GUISSAPI-N, prod 17/09/2026).
 *
 * La validation reste LIMITÉE à la section enregistrée : un examen se remplit
 * en plusieurs fois, et une plainte incomplète ne doit pas empêcher de
 * sauvegarder la réfraction.
 */
export async function validerSection<T extends FieldValues>(
  form: UseFormReturn<T>,
  champs: Path<T>[],
  signaler: (message: string) => void,
): Promise<boolean> {
  const valide = await form.trigger(champs);
  if (valide) return true;

  // `form.formState.errors` est un proxy qui ne se remplit que pour un
  // composant ABONNÉ au rendu. Appelé depuis un gestionnaire de clic, il
  // renvoie un objet vide : on lit l'état interne, seule source à jour ici.
  const erreurs =
    (form.control as unknown as { _formState?: { errors?: unknown } })._formState
      ?.errors ?? form.formState.errors;

  signaler(premierMessage(erreurs, champs));
  return false;
}

/** Premier message d'erreur de la section, pour dire QUOI corriger. */
function premierMessage(erreurs: unknown, champs: string[]): string {
  const parDefaut = 'Certains champs ne respectent pas les règles de saisie.';
  const trouve = (noeud: unknown): string | null => {
    if (!noeud || typeof noeud !== 'object') return null;
    const message = (noeud as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
    for (const valeur of Object.values(noeud as Record<string, unknown>)) {
      const trouvee = trouve(valeur);
      if (trouvee) return trouvee;
    }
    return null;
  };

  for (const champ of champs) {
    const message = trouve((erreurs as Record<string, unknown>)?.[champ]);
    if (message) return message;
  }
  return parDefaut;
}
