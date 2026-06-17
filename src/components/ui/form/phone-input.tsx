'use client';

import * as React from 'react';
import RPNInput, { type Country, type Value } from 'react-phone-number-input';

import { cn } from '@/lib/utils';

export type PhoneInputProps = Omit<
  React.ComponentProps<typeof RPNInput>,
  'value' | 'onChange' | 'defaultCountry'
> & {
  /** Valeur E.164 (ex: "+221771234567"). Vide/undefined accepté. */
  value?: string | null;
  /** Renvoie la valeur E.164, ou une chaîne vide quand le champ est effacé. */
  onChange?: (value: string) => void;
  /** Pays par défaut. Sénégal par défaut. */
  defaultCountry?: Country;
  className?: string;
};

/**
 * Champ de saisie de numéro de téléphone international.
 *
 * Thin wrapper autour de `react-phone-number-input`.
 * - Sénégal (`SN`) par défaut.
 * - Sortie au format E.164 (ex: `+221771234567`).
 * - Compatible React Hook Form : se branche directement avec `{...field}`
 *   (la lib renvoie `undefined` quand le champ est vidé, normalisé ici en `''`).
 * - Optionnel : aucune valeur n'est requise, pas de crash sur `null`/`undefined`.
 */
const PhoneInput = React.forwardRef<
  React.ElementRef<typeof RPNInput>,
  PhoneInputProps
>(({ className, value, onChange, defaultCountry = 'SN', ...props }, ref) => {
  return (
    <RPNInput
      ref={ref}
      international
      defaultCountry={defaultCountry}
      value={(value ?? undefined) as Value | undefined}
      onChange={(next) => onChange?.((next ?? '') as string)}
      className={cn('flex items-center gap-2', className)}
      numberInputProps={{
        className: cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors',
          'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'disabled:cursor-not-allowed disabled:opacity-50',
        ),
      }}
      {...props}
    />
  );
});
PhoneInput.displayName = 'PhoneInput';

export { PhoneInput };
