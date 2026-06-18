import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import type { ClinicSettings } from '@/features/clinic/types/schemas';

export const mockClinicSettings: ClinicSettings = {
  name: 'Clinique Guiss-Talli',
  address: 'UFR Sciences de la Santé, Université Iba Der Thiam, Thiès',
  phone: '+221 33 951 00 00',
  email: 'contact@guiss-talli.sn',
  website: 'https://guiss-talli.sn',
  logo: null,
  numero_etablissement: 'SN-MED-2024-001',
  mentions_legales:
    'Établissement de santé agréé. Toutes données sont confidentielles.',
};

export const clinicHandlers = [
  http.get(`${env.API_URL}/clinic/settings/`, () =>
    HttpResponse.json(mockClinicSettings),
  ),

  http.patch(`${env.API_URL}/clinic/settings/update/`, () =>
    HttpResponse.json({ ...mockClinicSettings, name: 'Clinique Mise à Jour' }),
  ),
];
