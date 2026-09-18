import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { useNotifications } from '@/components/ui/notifications';
import { api } from '@/lib/api-client';

import type {
  Enregistrement,
  LigneFile,
  NouvellePersonne,
  PersonneVue,
} from '../types/types';

/**
 * 409 = « déjà vu aujourd'hui ». Ce n'est pas une erreur à afficher en rouge :
 * l'écran s'en sert pour proposer de reprendre l'examen ouvert. Le toast
 * automatique du client API doublonnerait ce message.
 */
const REFUS_METIER = { silentStatusCodes: [400, 404, 409] };

export type DemandeEnregistrement = {
  siteId: number | null;
  eventId: number | null;
  patient?: NouvellePersonne;
  patientId?: number;
  motifReprise?: string;
};

export const enregistrerEnCampagne = (
  demande: DemandeEnregistrement,
): Promise<Enregistrement> =>
  api.post<Enregistrement>(
    '/depistage/campagne/enregistrer/',
    {
      site_id: demande.siteId ?? undefined,
      event_id: demande.eventId ?? undefined,
      patient: demande.patient,
      patient_id: demande.patientId,
      motif_reprise: demande.motifReprise,
    },
    REFUS_METIER,
  );

export const useEnregistrerEnCampagne = ({
  onSuccess,
  onDejaVu,
}: {
  onSuccess?: (resultat: Enregistrement) => void;
  onDejaVu?: (info: {
    examenId: number;
    numero: string;
    typeExamen: 'adulte' | 'enfant';
  }) => void;
} = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: enregistrerEnCampagne,
    onSuccess: (resultat) => {
      queryClient.invalidateQueries({ queryKey: ['campagne', 'file'] });
      addNotification({
        type: 'success',
        title: 'Personne enregistrée',
        message: `Examen ${resultat.numero_examen} ouvert, lieu de la campagne posé.`,
      });
      onSuccess?.(resultat);
    },
    onError: (erreur: unknown) => {
      const { status, data } = (erreur ?? {}) as {
        status?: number;
        data?: {
          detail?: string;
          examen_existant_id?: number;
          numero_examen?: string;
          type_examen?: 'adulte' | 'enfant';
        };
      };
      if (status === 409 && data?.examen_existant_id) {
        // Pas un échec : la personne est déjà passée. L'écran propose de
        // reprendre son examen plutôt que d'en ouvrir un second.
        onDejaVu?.({
          examenId: data.examen_existant_id,
          numero: data.numero_examen ?? '',
          typeExamen: data.type_examen ?? 'adulte',
        });
        return;
      }
      addNotification({
        type: 'error',
        title: 'Enregistrement impossible',
        message: data?.detail ?? 'Rien n’a été enregistré.',
      });
    },
  });
};

export const getFileCampagne = (params: {
  siteId: number | null;
  eventId: number | null;
}): Promise<LigneFile[]> =>
  api.get<LigneFile[]>('/depistage/campagne/file/', {
    params: {
      site: params.siteId ?? undefined,
      event: params.eventId ?? undefined,
    },
  });

export const getFileCampagneQueryOptions = (params: {
  siteId: number | null;
  eventId: number | null;
}) =>
  queryOptions({
    queryKey: ['campagne', 'file', params.siteId, params.eventId],
    queryFn: () => getFileCampagne(params),
    enabled: params.siteId !== null || params.eventId !== null,
    // Plusieurs postes saisissent la même file : sans rafraîchissement, chacun
    // pilote la journée sur une vue périmée.
    refetchInterval: 30_000,
  });

export const useFileCampagne = (params: {
  siteId: number | null;
  eventId: number | null;
}) => useQuery(getFileCampagneQueryOptions(params));

export const getDejaVus = (params: {
  nom: string;
  prenom: string;
  naissance?: string;
}): Promise<PersonneVue[]> =>
  api.get<PersonneVue[]>('/depistage/campagne/deja-vu/', {
    params: {
      nom: params.nom || undefined,
      prenom: params.prenom || undefined,
      naissance: params.naissance || undefined,
    },
  });

export const useDejaVus = (params: {
  nom: string;
  prenom: string;
  naissance?: string;
}) =>
  useQuery({
    queryKey: [
      'campagne',
      'deja-vu',
      params.nom,
      params.prenom,
      params.naissance,
    ],
    queryFn: () => getDejaVus(params),
    // Interrogé pendant la frappe : en dessous de deux lettres, la réponse ne
    // discrimine rien et ferait défiler la moitié de la base.
    enabled: params.nom.trim().length >= 2 || params.prenom.trim().length >= 2,
  });

/**
 * Les lieux où une campagne peut s'ouvrir.
 *
 * Interrogé ici plutôt qu'importé de la feature « sites » : une feature n'en
 * importe pas une autre (architecture Bulletproof), et l'écran n'a besoin que
 * du libellé et de l'identifiant.
 */
export const getSitesOuverts = (): Promise<{
  results?: { id: number; libelle: string }[];
}> => api.get('/depistage/sites/', { params: { limit: 100 } });

export const useSitesOuverts = () =>
  useQuery({
    queryKey: ['campagne', 'sites'],
    queryFn: getSitesOuverts,
    staleTime: 5 * 60_000,
  });
