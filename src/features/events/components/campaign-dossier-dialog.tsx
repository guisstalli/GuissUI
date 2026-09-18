'use client';

import { FileText, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog/dialog';
import { useNotifications } from '@/components/ui/notifications';

import { useUpdateEventDossier } from '../api/update-dossier';
import type { EventStaff, MembreEquipe } from '../types/schemas';

/**
 * Dossier de campagne : les informations qu'aucun examen ne porte.
 *
 * Le rapport d'activité d'une journée de consultation s'ouvre sur la
 * justification du projet, ses objectifs et sa méthodologie, et se termine par
 * l'équipe. Rien de tout cela ne se déduit des données cliniques : sans cette
 * saisie, le module IA — à qui l'on interdit d'inventer — écrivait un
 * paragraphe générique, ou rien.
 *
 * Tout est facultatif : une campagne de routine n'a pas de dossier à remplir.
 */
type Props = {
  event: EventStaff;
  ouvert: boolean;
  onOuvertChange: (ouvert: boolean) => void;
};

function ChampTexte({
  id,
  label,
  aide,
  valeur,
  onChange,
  lignes = 3,
}: {
  id: string;
  label: string;
  aide?: string;
  valeur: string;
  onChange: (valeur: string) => void;
  lignes?: number;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {aide && <p className="text-xs text-muted-foreground">{aide}</p>}
      <textarea
        id={id}
        rows={lignes}
        value={valeur}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-y rounded-md border border-input bg-background p-2 text-sm"
      />
    </div>
  );
}

function ListeDeTextes({
  label,
  aide,
  valeurs,
  onChange,
}: {
  label: string;
  aide?: string;
  valeurs: string[];
  onChange: (valeurs: string[]) => void;
}) {
  return (
    <fieldset className="space-y-1">
      <legend className="text-sm font-medium">{label}</legend>
      {aide && <p className="text-xs text-muted-foreground">{aide}</p>}
      <div className="space-y-1.5">
        {valeurs.map((valeur, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              aria-label={`${label} ${index + 1}`}
              value={valeur}
              onChange={(event) =>
                onChange(
                  valeurs.map((v, i) => (i === index ? event.target.value : v)),
                )
              }
              className="w-full rounded-md border border-input bg-background p-2 text-sm"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              aria-label={`Retirer ${label.toLowerCase()} ${index + 1}`}
              onClick={() => onChange(valeurs.filter((_, i) => i !== index))}
            >
              <Trash2 className="size-3.5" aria-hidden />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...valeurs, ''])}
        >
          <Plus className="mr-1.5 size-3.5" aria-hidden />
          Ajouter
        </Button>
      </div>
    </fieldset>
  );
}

export function CampaignDossierDialog({
  event,
  ouvert,
  onOuvertChange,
}: Props) {
  const { addNotification } = useNotifications();
  const [projet, setProjet] = useState(event.projet ?? '');
  const [contexte, setContexte] = useState(event.contexte ?? '');
  const [objectifGeneral, setObjectifGeneral] = useState(
    event.objectif_general ?? '',
  );
  const [objectifs, setObjectifs] = useState<string[]>(
    event.objectifs_specifiques ?? [],
  );
  const [methodologie, setMethodologie] = useState(event.methodologie ?? '');
  const [materiel, setMateriel] = useState<string[]>(event.materiel ?? []);
  const [partenaires, setPartenaires] = useState<string[]>(
    event.partenaires ?? [],
  );
  const [equipe, setEquipe] = useState<MembreEquipe[]>(event.equipe ?? []);
  const [populationCible, setPopulationCible] = useState(
    event.population_cible ?? '',
  );

  const { mutate: enregistrer, isPending } = useUpdateEventDossier({
    onSuccess: () => {
      onOuvertChange(false);
      addNotification({
        type: 'success',
        title: 'Dossier enregistré',
        message:
          'Les rapports de cette campagne reprendront ces informations telles quelles.',
      });
    },
    onError: () =>
      addNotification({
        type: 'error',
        title: 'Dossier non enregistré',
        message: 'Le dossier de campagne n’a pas été modifié.',
      }),
  });

  // Les membres sans nom sont écartés ici : le serveur les refuse, et un
  // formulaire laissé à moitié rempli ne doit pas bloquer l'enregistrement du
  // reste du dossier.
  const equipeValide = equipe.filter((membre) => membre.nom.trim());

  return (
    <Dialog open={ouvert} onOpenChange={onOuvertChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-4" aria-hidden />
            Dossier de campagne
          </DialogTitle>
          <DialogDescription>
            Ce que les examens ne disent pas : pourquoi cette campagne, avec
            quels objectifs, quelle méthode et quelle équipe. Les rapports
            d’activité reprennent ces informations — sans elles, ils restent
            génériques. Tout est facultatif.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <ChampTexte
            id="dossier-projet"
            label="Projet de recherche"
            aide="Intitulé exact du projet dont relève la campagne."
            valeur={projet}
            onChange={setProjet}
            lignes={2}
          />
          <ChampTexte
            id="dossier-contexte"
            label="Contexte et justification"
            aide="Pourquoi cette campagne ? Les chiffres cités ici seront repris tels quels."
            valeur={contexte}
            onChange={setContexte}
          />
          <ChampTexte
            id="dossier-objectif"
            label="Objectif général"
            valeur={objectifGeneral}
            onChange={setObjectifGeneral}
            lignes={2}
          />
          <ListeDeTextes
            label="Objectifs spécifiques"
            valeurs={objectifs}
            onChange={setObjectifs}
          />
          <ChampTexte
            id="dossier-methodologie"
            label="Méthodologie"
            aide="Préparation, parcours d’un participant, orientation des cas dépistés."
            valeur={methodologie}
            onChange={setMethodologie}
            lignes={4}
          />
          <ListeDeTextes
            label="Matériel"
            aide="Appareils et moyens mobilisés."
            valeurs={materiel}
            onChange={setMateriel}
          />
          <ListeDeTextes
            label="Partenaires"
            valeurs={partenaires}
            onChange={setPartenaires}
          />
          <ChampTexte
            id="dossier-population"
            label="Population cible"
            valeur={populationCible}
            onChange={setPopulationCible}
            lignes={2}
          />

          <fieldset className="space-y-1">
            <legend className="text-sm font-medium">Équipe</legend>
            <p className="text-xs text-muted-foreground">
              Nom et rôle de chaque membre, tels qu’ils doivent apparaître dans
              le rapport.
            </p>
            <div className="space-y-1.5">
              {equipe.map((membre, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    aria-label={`Nom du membre ${index + 1}`}
                    value={membre.nom}
                    onChange={(event) =>
                      setEquipe(
                        equipe.map((m, i) =>
                          i === index ? { ...m, nom: event.target.value } : m,
                        ),
                      )
                    }
                    placeholder="Nom"
                    className="w-full rounded-md border border-input bg-background p-2 text-sm"
                  />
                  <input
                    aria-label={`Rôle du membre ${index + 1}`}
                    value={membre.role}
                    onChange={(event) =>
                      setEquipe(
                        equipe.map((m, i) =>
                          i === index ? { ...m, role: event.target.value } : m,
                        ),
                      )
                    }
                    placeholder="Rôle"
                    className="w-full rounded-md border border-input bg-background p-2 text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    aria-label={`Retirer le membre ${index + 1}`}
                    onClick={() =>
                      setEquipe(equipe.filter((_, i) => i !== index))
                    }
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEquipe([...equipe, { nom: '', role: '' }])}
              >
                <Plus className="mr-1.5 size-3.5" aria-hidden />
                Ajouter un membre
              </Button>
            </div>
          </fieldset>
        </div>

        <DialogFooter>
          <Button
            disabled={isPending}
            onClick={() =>
              enregistrer({
                eventId: event.id,
                dossier: {
                  projet,
                  contexte,
                  objectif_general: objectifGeneral,
                  objectifs_specifiques: objectifs,
                  methodologie,
                  materiel,
                  partenaires,
                  equipe: equipeValide,
                  population_cible: populationCible,
                },
              })
            }
          >
            Enregistrer le dossier
          </Button>
          <Button
            variant="outline"
            disabled={isPending}
            onClick={() => onOuvertChange(false)}
          >
            Annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
