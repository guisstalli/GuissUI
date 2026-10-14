type UnitesEchantillonProps = {
  /** Nombre d'yeux (cartes par œil) ou d'examens (acuité au meilleur œil). */
  count: number;
  /** « œil » (défaut) ou « examen ». */
  unit?: 'œil' | 'examen';
  patients?: number;
};

const PLURIEL = { œil: 'yeux', examen: 'examens' } as const;

/**
 * Échantillon d'une carte : « 4 807 yeux · 2 415 patients » (C12), ou
 * « 2 915 examens » pour l'acuité, comptée au meilleur œil (C20).
 */
export const UnitesEchantillon = ({
  count,
  unit = 'œil',
  patients,
}: UnitesEchantillonProps) => {
  const n = count ?? 0;
  return (
    <div className="text-right">
      <div className="text-xs text-muted-foreground">Échantillon</div>
      <div className="text-sm font-bold">
        {n.toLocaleString('fr-FR')} {n > 1 ? PLURIEL[unit] : unit}
      </div>
      {patients != null && (
        <div className="text-xs text-muted-foreground">
          {patients.toLocaleString('fr-FR')} patient{patients > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};
