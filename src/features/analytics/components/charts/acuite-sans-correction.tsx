import type { AnalyticsVisualAcuity } from '../../types/types';

import { Effectif } from './effectif';

type AcuiteSansCorrectionProps = {
  resume: NonNullable<AnalyticsVisualAcuity['uncorrected_best_eye']>;
};

/**
 * Second indicateur d'acuité (C19, Pre R2) : la « température » de la
 * population, sans correction, au meilleur œil, une valeur par examen.
 */
export const AcuiteSansCorrection = ({ resume }: AcuiteSansCorrectionProps) => (
  <div className="bg-muted/50 mt-4 rounded-md p-3 text-xs">
    <div className="mb-1 font-medium text-foreground">
      Sans correction, meilleur œil
    </div>
    <div className="flex justify-between">
      <span className="text-muted-foreground">Moyenne (LogMAR)</span>
      <span className="font-medium">
        {resume.av_logmar_decimal != null
          ? `${resume.av_logmar_decimal.toFixed(1)} / 10`
          : 'N/A'}
      </span>
    </div>
    <div className="flex justify-between">
      <span className="text-muted-foreground">&lt; 3/10</span>
      <span>
        <span className="font-medium">{resume.pct_av_less_than_3} %</span>{' '}
        <Effectif
          count={resume.count_av_less_than_3}
          total={resume.sample_size}
          unit="examen"
        />
      </span>
    </div>
  </div>
);
