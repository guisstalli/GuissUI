import type { AnalyticsRefraction } from '../../types/types';

import { Effectif } from './effectif';

type RefractionDetailsProps = {
  data: AnalyticsRefraction;
};

const dioptries = (v?: number | null) =>
  v != null ? `${v > 0 ? '+' : ''}${v.toFixed(2)} D` : 'N/A';

/**
 * Détail de la réfraction mesurée (C13, Pre 12 et 13/10) : EQS moyen de chaque
 * œil (un EQS moyen unique mélange myopes et hypermétropes), EQS moyen des
 * myopes et des hypermétropes, gravité, anisométropie et astigmatisme.
 */
export const RefractionDetails = ({ data }: RefractionDetailsProps) => {
  const { kpis, severity } = data;
  const enfants =
    data.filters?.exam_type === 'child' || data.filters?.age_band === 'child';

  return (
    <div className="mt-4 space-y-2 border-t pt-4 text-xs">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-muted-foreground">EQS moyen OD </span>
          <span className="font-medium">{dioptries(kpis.eqs_mean_od)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">EQS moyen OG </span>
          <span className="font-medium">{dioptries(kpis.eqs_mean_og)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Myopes </span>
          <span className="font-medium">{dioptries(kpis.eqs_mean_myopes)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Hypermétropes </span>
          <span className="font-medium">
            {dioptries(kpis.eqs_mean_hypermetropes)}
          </span>
        </div>
      </div>
      {severity && (
        <p className="text-muted-foreground">
          Myopie : {severity.myopie.legere} légère, {severity.myopie.moyenne}{' '}
          moyenne, {severity.myopie.forte} forte · Hypermétropie :{' '}
          {severity.hypermetropie.legere} légère,{' '}
          {severity.hypermetropie.moyenne} moyenne,{' '}
          {severity.hypermetropie.forte} forte (yeux ; &lt; 3 D, 3 à 6 D, &gt; 6
          D)
        </p>
      )}
      {kpis.anisometropia_evaluable != null && (
        <div>
          Anisométropie (≥ 2 D) :{' '}
          <Effectif
            count={kpis.anisometropia_count}
            total={kpis.anisometropia_evaluable}
            unit="examen"
          />
        </div>
      )}
      {kpis.astigmatism_evaluable != null && (
        <div>
          Astigmatisme (cylindre ≥ 1 D) :{' '}
          <Effectif
            count={kpis.astigmatism_count}
            total={kpis.astigmatism_evaluable}
            unit="œil"
            unitPlural="yeux"
          />
        </div>
      )}
      {enfants && (
        <p className="font-medium text-amber-700 dark:text-amber-400">
          Réfraction mesurée sans cycloplégie.
        </p>
      )}
    </div>
  );
};
