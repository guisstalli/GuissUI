import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type {
  InscriptionConfirmation,
  InscriptionPubliqueInput,
} from '../types/schemas';

export const registerEvent = (
  slug: string,
  data: InscriptionPubliqueInput,
): Promise<InscriptionConfirmation> =>
  api.post(`/events/public/${slug}/inscrire/`, data);

export const useRegisterEvent = (
  slug: string,
  { onSuccess }: { onSuccess?: (data: InscriptionConfirmation) => void } = {},
) =>
  useMutation({
    mutationFn: (data: InscriptionPubliqueInput) => registerEvent(slug, data),
    onSuccess,
  });
