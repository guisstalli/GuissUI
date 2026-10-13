import type { AnalyticsOcularTension } from '../../types/types';

import { Effectif } from './effectif';

type TensionParOeilProps = {
  byEye: NonNullable<AnalyticsOcularTension['by_eye']>;
};

const LIBELLES: Record<string, string> = { od: 'Œil droit', og: 'Œil gauche' };

/** Conclusion par œil (C14, Pre R6) : moyenne et part au-dessus de 21 mmHg. */
export const TensionParOeil = ({ byEye }: TensionParOeilProps) => (
  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
    {(['od', 'og'] as const).map((cote) => {
      const oeil = byEye[cote];
      if (!oeil) return null;
      return (
        <div key={cote} className="bg-muted/50 rounded-md p-2">
          <div className="font-medium text-foreground">{LIBELLES[cote]}</div>
          <div className="text-muted-foreground">
            Moyenne{' '}
            {oeil.to_mean != null ? `${oeil.to_mean.toFixed(1)} mmHg` : 'N/A'}
          </div>
          <div>
            &gt; 21 :{' '}
            <span className="font-medium">{oeil.pct_to_above_21} %</span>{' '}
            <Effectif
              count={oeil.count_to_above_21}
              total={oeil.sample_size}
              unit="œil"
              unitPlural="yeux"
            />
          </div>
        </div>
      );
    })}
  </div>
);
