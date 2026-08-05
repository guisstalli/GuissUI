import Image from 'next/image';

import { cn } from '@/lib/utils';

type UniversiteLogoProps = {
  /** Classes de dimension, ex. `size-8`. */
  className?: string;
  /**
   * Taille de rendu en pixels, pour que Next serve la bonne résolution.
   * Doit correspondre à la classe passée : `size-8` → 32, `size-14` → 56.
   */
  size?: number;
};

/**
 * Sceau de l'Université Iba Der Thiam de Thiès.
 *
 * Remplace l'œil stylisé qui servait de marque. La source est un JPEG de
 * 300 × 287 px : un sceau circulaire portant du texte sur son pourtour.
 *
 * `rounded-full` n'est pas décoratif — le fichier a un fond blanc carré, qui
 * formerait un bloc opaque sur les surfaces sombres. Le cercle le découpe.
 *
 * LIMITE ASSUMÉE : en dessous de ~40 px, le texte du pourtour n'est plus
 * lisible et le sceau se lit comme une pastille. C'est inhérent à un logo
 * institutionnel détaillé, pas au code. Une version simplifiée en SVG serait
 * préférable aux petites tailles, si l'université en fournit une.
 */
export function UniversiteLogo({ className, size = 56 }: UniversiteLogoProps) {
  return (
    <Image
      src="/logo_universite_thies.jpeg"
      alt="Université Iba Der Thiam de Thiès"
      width={size}
      height={size}
      // `object-contain` : le fichier n'est pas carré (300 × 287). Un
      // `object-cover` rognerait le pourtour du sceau, donc son texte.
      className={cn('shrink-0 rounded-full bg-white object-contain', className)}
      priority={false}
    />
  );
}
