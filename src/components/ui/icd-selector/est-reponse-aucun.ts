/**
 * Vrai pour une réponse « Aucun… » de la nomenclature ICD-11 (« AUCUN obstacle
 * (aucun, absence, négligeable, ...) 0-4 % », « Aucune déficience visuelle ») :
 * ce n'est pas un antécédent (C27, Kamal 11/10).
 */
export const estReponseAucun = (title: string): boolean =>
  /^aucune?\b/i.test(
    title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim(),
  );
