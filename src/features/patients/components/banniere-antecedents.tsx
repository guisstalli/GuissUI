'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form/input';

import { useAntecedent, useUpdateAntecedent } from '../api/antecedent';

interface BanniereAntecedentsProps {
  patientId: number;
}

/**
 * « Les antécédents n'ont pas été demandés » — visible, jamais bloquant.
 *
 * Le rapport de la Gare Routière de Thiès pointe des antécédents manquants sur
 * une large part des dossiers. L'équipe projet a retenu de ne pas bloquer un dépistage
 * de masse sur un champ déclaratif — une file de cent personnes s'arrête à la
 * première question sans réponse. Mais un manque qu'aucun écran ne montre ne se
 * rattrape jamais : le lendemain, la personne n'est plus joignable.
 *
 * D'où cette bannière : elle reste tant que la question n'a pas été posée, et
 * elle porte sa propre réponse. Trois clics, pas un formulaire de deux écrans —
 * une saisie longue au comptoir ne se fait pas, quelle que soit sa qualité.
 *
 * « Aucun antécédent » est une RÉPONSE, pas un silence : elle crée la ligne et
 * fait disparaître la bannière. C'est ce qui distingue l'opérateur
 * consciencieux de celui qui n'a pas posé la question.
 */
export function BanniereAntecedents({ patientId }: BanniereAntecedentsProps) {
  const [ouvert, setOuvert] = useState(false);
  const [medical, setMedical] = useState('');
  const [ophtalmo, setOphtalmo] = useState('');

  const { data: antecedents, isLoading } = useAntecedent({ patientId });
  const enregistrer = useUpdateAntecedent({
    mutationConfig: { onSuccess: () => setOuvert(false) },
  });

  // La bannière ne s'affiche que si la question n'a JAMAIS été posée :
  // l'absence de ligne d'antécédents est la seule trace fiable de ce silence.
  if (isLoading || antecedents) return null;

  const repondre = (avecAntecedents: boolean) =>
    enregistrer.mutate({
      patientId,
      data: {
        patient: patientId,
        has_antecedents_medico_chirurgicaux:
          avecAntecedents && !!medical.trim(),
        antecedents_medico_chirurgicaux: medical.trim()
          ? medical
              .split(',')
              .map((v) => v.trim())
              .filter(Boolean)
          : [],
        has_pathologie_ophtalmologique: avecAntecedents && !!ophtalmo.trim(),
        pathologie_ophtalmologique: ophtalmo.trim()
          ? ophtalmo
              .split(',')
              .map((v) => v.trim())
              .filter(Boolean)
          : [],
      },
    });

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm dark:border-amber-800 dark:bg-amber-950/30">
      <div className="flex flex-wrap items-center gap-2">
        <AlertTriangle className="size-4 text-amber-700 dark:text-amber-300" />
        <span className="font-medium">
          Les antécédents de ce patient n’ont pas été demandés.
        </span>
        <span className="text-muted-foreground">
          Rien ne bloque — mais la question ne se repose pas plus tard.
        </span>
        {!ouvert && (
          <Button size="sm" variant="outline" onClick={() => setOuvert(true)}>
            Poser la question maintenant
          </Button>
        )}
      </div>

      {ouvert && (
        <div className="mt-3 space-y-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <label
              htmlFor="antecedents-medical"
              className="flex flex-col gap-1 text-xs text-muted-foreground"
            >
              Maladies, opérations (séparées par des virgules)
              <Input
                id="antecedents-medical"
                value={medical}
                onChange={(e) => setMedical(e.target.value)}
                placeholder="diabète, cataracte opérée…"
              />
            </label>
            <label
              htmlFor="antecedents-ophtalmo"
              className="flex flex-col gap-1 text-xs text-muted-foreground"
            >
              Problèmes des yeux déjà connus
              <Input
                id="antecedents-ophtalmo"
                value={ophtalmo}
                onChange={(e) => setOphtalmo(e.target.value)}
                placeholder="glaucome, traumatisme…"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              disabled={enregistrer.isPending}
              onClick={() => repondre(true)}
            >
              {enregistrer.isPending && (
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              )}
              Enregistrer ces antécédents
            </Button>
            {/* Une réponse à part entière : le patient a été interrogé et n'a
                rien signalé. Sans ce bouton, il n'y aurait aucun moyen de
                distinguer ce cas d'une question jamais posée. */}
            <Button
              size="sm"
              variant="outline"
              disabled={enregistrer.isPending}
              onClick={() => repondre(false)}
            >
              Aucun antécédent signalé
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={enregistrer.isPending}
              onClick={() => setOuvert(false)}
            >
              Plus tard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
