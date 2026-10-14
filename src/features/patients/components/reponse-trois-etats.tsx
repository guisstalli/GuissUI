import { cn } from '@/lib/utils';

type ReponseTroisEtatsProps = {
  value: boolean | null;
  onChange: (value: boolean | null) => void;
};

const OPTIONS: Array<{ label: string; value: boolean | null }> = [
  { label: 'Oui', value: true },
  { label: 'Non', value: false },
  { label: 'Non renseigné', value: null },
];

/**
 * Réponse oui / non / non renseigné, sans valeur cochée d'avance (C25,
 * Kamal 11/10) : un « non » prérempli ne se distingue pas d'un vrai « non ».
 */
export const ReponseTroisEtats = ({
  value,
  onChange,
}: ReponseTroisEtatsProps) => (
  <div role="radiogroup" className="flex gap-1 rounded-lg border p-1">
    {OPTIONS.map((option) => {
      const actif = value === option.value;
      return (
        <button
          key={option.label}
          type="button"
          role="radio"
          aria-checked={actif}
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            actif
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted',
          )}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);
