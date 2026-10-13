import type { AnalyticsRiskFactors } from '../../types/types';

import { Effectif } from './effectif';

type AntecedentsCouvertureProps = {
  data: AnalyticsRiskFactors;
};

/**
 * Couverture des antécédents et détail (C16, Kamal 10-11/10) : les % portent
 * sur les fiches renseignées, pas sur les patients examinés ; les autres sont
 * « non renseignés ». Le détail « autre » des antécédents familiaux est découpé
 * en catégories, et la liste médico-chirurgicale est affichée.
 */
export const AntecedentsCouverture = ({ data }: AntecedentsCouvertureProps) => {
  const { coverage } = data;
  const categories = data.family_history.other_categories ?? [];
  const medical = (data.medical_antecedents.top_medical ?? []).slice(0, 5);

  return (
    <div className="grid gap-4 border-t p-6 text-xs md:grid-cols-3">
      {coverage && (
        <div>
          <h4 className="mb-2 font-semibold uppercase text-muted-foreground">
            Couverture
          </h4>
          <p>
            <span className="font-medium">{coverage.coverage_pct} %</span>{' '}
            <Effectif
              count={coverage.with_record}
              total={coverage.patients_examined}
              unit="patient"
            />
          </p>
          <p className="text-muted-foreground">
            Non renseigné : {coverage.not_recorded} patient
            {coverage.not_recorded > 1 ? 's' : ''}
          </p>
        </div>
      )}
      {categories.length > 0 && (
        <div>
          <h4 className="mb-2 font-semibold uppercase text-muted-foreground">
            Antécédents familiaux « autre »
          </h4>
          <ul className="space-y-1">
            {categories.map((c) => (
              <li key={c.name} className="flex justify-between gap-2">
                <span>{c.name}</span>
                <span>
                  <span className="font-medium">{c.pct} %</span>{' '}
                  <Effectif
                    count={c.count}
                    total={data.sample_size}
                    unit="fiche"
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {medical.length > 0 && (
        <div>
          <h4 className="mb-2 font-semibold uppercase text-muted-foreground">
            Antécédents médico-chirurgicaux
          </h4>
          <ul className="space-y-1">
            {medical.map((m) => (
              <li key={m.name} className="flex justify-between gap-2">
                <span>{m.name}</span>
                <span className="font-medium">{m.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
