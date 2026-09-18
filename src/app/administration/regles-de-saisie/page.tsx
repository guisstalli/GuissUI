'use client';

import { AppShell as Shell } from '@/app/_shell';
import { Spinner } from '@/components/ui/spinner';
import { useReglesSaisie } from '@/features/regles-saisie/api/get-regles';
import { TableRegles } from '@/features/regles-saisie/components/table-regles';

/**
 * Écran « Règles de saisie ».
 *
 * Le 17/09/2026, 102 enregistrements d'examens enfant ont été refusés par une
 * règle que personne, dans l'équipe, ne savait rattacher à une source : elle
 * avait été écrite dans le code, jamais discutée. Il a fallu écrire à la Pre
 * pour apprendre qu'elle ne visait que le reflet anormal.
 *
 * Cet écran met les règles à portée d'un médecin, avec ce qui les autorise —
 * ou l'aveu qu'aucune source ne les autorise encore.
 */
export default function ReglesDeSaisiePage() {
  const { data, isLoading } = useReglesSaisie();

  const regles = data?.regles ?? [];
  const aValider = regles.filter((r) => r.statut === 'a_valider');
  const validees = regles.filter((r) => r.statut === 'validee');
  const produit = regles.filter((r) => r.statut === 'produit');

  return (
    <Shell title="Règles de saisie">
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Chaque règle qui impose ou refuse une saisie est un acte clinique.
          Sans sa source, personne ne peut la discuter : ni la relâcher quand
          elle bloque le terrain, ni la durcir quand elle laisse passer une
          aberration.
        </p>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-6">
            <section className="space-y-3">
              <div>
                <h3 className="font-semibold">
                  En attente d’une validation clinique ({aValider.length})
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ces règles s’appliquent aujourd’hui sans que personne ne les
                  ait confirmées. C’est la liste à présenter à un médecin.
                </p>
              </div>
              <TableRegles regles={aValider} />
            </section>

            <section className="space-y-3">
              <div>
                <h3 className="font-semibold">Validées ({validees.length})</h3>
                <p className="text-sm text-muted-foreground">
                  Confirmées par une personne nommée, à une date connue.
                </p>
              </div>
              <TableRegles regles={validees} />
            </section>

            <section className="space-y-3">
              <div>
                <h3 className="font-semibold">
                  Décisions d’outil ({produit.length})
                </h3>
                <p className="text-sm text-muted-foreground">
                  Elles n’attendent aucune validation médicale — les ranger
                  ailleurs évite qu’elles noient celles qui en attendent une.
                </p>
              </div>
              <TableRegles regles={produit} />
            </section>
          </div>
        )}
      </div>
    </Shell>
  );
}
