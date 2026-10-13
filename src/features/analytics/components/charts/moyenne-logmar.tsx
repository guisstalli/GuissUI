type MoyenneLogmarProps = {
  titre: string;
  decimal?: number | null;
  logmar?: number | null;
  zeros?: number;
  /** Moyenne des dixièmes, affichée si l'API ne renvoie pas encore le LogMAR. */
  repli?: number | null;
};

/**
 * Moyenne d'acuité en LogMAR, ramenée en dixièmes (C17) : la moyenne des
 * dixièmes écrase les basses acuités. Une acuité de 0 y vaut 1,9 par
 * convention ; leur nombre est affiché à côté.
 */
export const MoyenneLogmar = ({
  titre,
  decimal,
  logmar,
  zeros,
  repli,
}: MoyenneLogmarProps) => {
  const valeur =
    decimal != null
      ? `${decimal.toFixed(1)} / 10`
      : repli != null
        ? `${repli.toFixed(2)} / 10`
        : 'N/A';

  return (
    <div className="mt-4 border-t pt-4 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">{titre}</span>
        <span className="text-lg font-bold">{valeur}</span>
      </div>
      {logmar != null && (
        <p className="text-xs text-muted-foreground">
          LogMAR moyen {logmar.toFixed(2)}
          {zeros
            ? ` · ${zeros} ${zeros > 1 ? 'yeux' : 'œil'} à 0 (compté 1,9)`
            : ''}
        </p>
      )}
    </div>
  );
};
