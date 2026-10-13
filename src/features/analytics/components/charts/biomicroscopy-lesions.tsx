import type { AnalyticsBiomicroscopy } from '../../types/types';

import { Effectif } from './effectif';

type BiomicroscopyLesionsProps = {
  lesions: NonNullable<AnalyticsBiomicroscopy['lesions']>;
};

const STRUCTURES: Array<[string, string]> = [
  ['cornee', 'Cornée'],
  ['iris', 'Iris'],
  ['cristallin', 'Cristallin'],
  ['vitre', 'Vitré'],
  ['papille', 'Papille'],
  ['macula', 'Macula'],
  ['retine_peripherique', 'Rétine périphérique'],
  ['vaisseaux_retiniens', 'Vaisseaux rétiniens'],
];

const LIBELLES: Record<string, string> = {
  OPAQUE: 'Cataracte',
  PSEUDOPHAKIE: 'Pseudophakie',
  APHAKIE: 'Aphakie',
  COLOBOME: 'Colobome',
  OPACITE_AXE: 'Opacité dans l’axe',
  OPACITE_PERIPHERIE: 'Opacité périphérique',
  OPACITE_TOTALE: 'Opacité totale',
  EXCAVATION_ELARGIE: 'Excavation élargie',
  ATROPHIE: 'Atrophie',
  OEDEME: 'Œdème',
  DYSMORPHIE: 'Dysmorphie',
  DMLA: 'DMLA',
  CICATRICE: 'Cicatrice',
  HEMORRAGIE: 'Hémorragie',
  EXUDATS: 'Exsudats',
  DEHISCENCE: 'Déhiscence',
  ARTERIOSCLEROSE: 'Artériosclérose',
  OVR: 'OVR',
  OAR: 'OAR',
  NEOVAISSEUX: 'Néovaisseaux',
  CORPS_FLOTTANTS: 'Corps flottants',
  HYALITE: 'Hyalite',
  PVR: 'PVR',
  IRIDODONESIS: 'Iridodonésis',
  RUBEOSE: 'Rubéose',
  SYNECHIES: 'Synéchies',
  AUTRE: 'Autre',
  AUTRES: 'Autres',
};

/**
 * Biomicroscopie : seulement les lésions (C15, Pre R10 et Kamal), en % des yeux
 * examinés et en % des patients examinés. Les yeux normaux restent dans le
 * dénominateur : « cataracte 100 % » pour 2 yeux sur 596 ne peut plus s'afficher.
 */
export const BiomicroscopyLesions = ({
  lesions,
}: BiomicroscopyLesionsProps) => (
  <div className="grid gap-4 p-6 md:grid-cols-2">
    {STRUCTURES.map(([cle, titre]) => {
      const structure = lesions[cle];
      if (!structure) return null;
      return (
        <div key={cle}>
          <h4 className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
            {titre}
          </h4>
          <p className="mb-2 text-xs text-muted-foreground">
            {structure.examined_eyes} yeux · {structure.examined_patients}{' '}
            patients examinés
          </p>
          {structure.items.length === 0 ? (
            <p className="text-xs text-muted-foreground">Aucune lésion.</p>
          ) : (
            <ul className="space-y-1 text-xs">
              {structure.items.map((item) => (
                <li key={item.value} className="flex justify-between gap-2">
                  <span>{LIBELLES[item.value] ?? item.value}</span>
                  <span className="text-right">
                    <span className="font-medium">{item.patients_pct} %</span>{' '}
                    <Effectif
                      count={item.patients}
                      total={structure.examined_patients}
                      unit="patient"
                    />
                    <br />
                    <span className="font-medium">{item.eyes_pct} %</span>{' '}
                    <Effectif
                      count={item.eyes}
                      total={structure.examined_eyes}
                      unit="œil"
                      unitPlural="yeux"
                    />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    })}
  </div>
);
