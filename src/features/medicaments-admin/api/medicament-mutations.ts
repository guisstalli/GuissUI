import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { MedicamentAdmin, MedicamentInput } from '../types/schemas';

const createMedicament = (data: MedicamentInput): Promise<MedicamentAdmin> =>
  api.post('/depistage/medicaments/', data);

const updateMedicament = ({
  id,
  data,
}: {
  id: number;
  data: Partial<MedicamentInput>;
}): Promise<MedicamentAdmin> =>
  api.patch(`/depistage/medicaments/${id}/`, data);

const deleteMedicament = (id: number): Promise<void> =>
  api.delete(`/depistage/medicaments/${id}/`);

const toggleMedicament = (id: number): Promise<MedicamentAdmin> =>
  api.post(`/depistage/medicaments/${id}/toggle/`);

const importFromRxnorm = (
  data: Partial<MedicamentInput> & {
    dci: string;
    forme_galenique: MedicamentInput['forme_galenique'];
  },
): Promise<MedicamentAdmin> =>
  api.post('/depistage/medicaments/import-rxnorm/', data);

function useInvalidator() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ['medicaments-admin'] });
}

export const useCreateMedicament = (opts: { onSuccess?: () => void } = {}) => {
  const invalidate = useInvalidator();
  return useMutation({
    mutationFn: createMedicament,
    onSuccess: () => {
      invalidate();
      opts.onSuccess?.();
    },
  });
};

export const useUpdateMedicament = (opts: { onSuccess?: () => void } = {}) => {
  const invalidate = useInvalidator();
  return useMutation({
    mutationFn: updateMedicament,
    onSuccess: () => {
      invalidate();
      opts.onSuccess?.();
    },
  });
};

export const useDeleteMedicament = (opts: { onSuccess?: () => void } = {}) => {
  const invalidate = useInvalidator();
  return useMutation({
    mutationFn: deleteMedicament,
    onSuccess: () => {
      invalidate();
      opts.onSuccess?.();
    },
  });
};

export const useToggleMedicament = () => {
  const invalidate = useInvalidator();
  return useMutation({
    mutationFn: toggleMedicament,
    onSuccess: () => invalidate(),
  });
};

export const useImportMedicamentFromRxnorm = (
  opts: { onSuccess?: (m: MedicamentAdmin) => void } = {},
) => {
  const invalidate = useInvalidator();
  return useMutation({
    mutationFn: importFromRxnorm,
    onSuccess: (m) => {
      invalidate();
      opts.onSuccess?.(m);
    },
  });
};
