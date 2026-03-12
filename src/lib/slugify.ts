export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // Supprime les accents
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-') // Remplace les espaces par -
    .replace(/[^\w-]+/g, '') // Supprime les caractères non-alphanumériques (sauf -)
    .replace(/--+/g, '-') // Remplace les doubles -- par un seul -
    .replace(/^-+/, '') // Supprime les - au début
    .replace(/-+$/, ''); // Supprime les - à la fin
};
