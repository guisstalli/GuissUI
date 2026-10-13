type UnitesEchantillonProps = {
  eyes: number;
  patients?: number;
};

/**
 * Échantillon d'une carte « par œil » : « 4 807 yeux · 2 415 patients » (C12).
 * « Échantillon 4 824 » à côté de 1 195 patients se lisait comme une erreur.
 */
export const UnitesEchantillon = ({
  eyes,
  patients,
}: UnitesEchantillonProps) => (
  <div className="text-right">
    <div className="text-xs text-muted-foreground">Échantillon</div>
    <div className="text-sm font-bold">
      {eyes.toLocaleString('fr-FR')} {eyes > 1 ? 'yeux' : 'œil'}
    </div>
    {patients != null && (
      <div className="text-xs text-muted-foreground">
        {patients.toLocaleString('fr-FR')} patient{patients > 1 ? 's' : ''}
      </div>
    )}
  </div>
);
