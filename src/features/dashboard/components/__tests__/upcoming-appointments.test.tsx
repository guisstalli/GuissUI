import { describe, expect, test } from 'vitest';

import { rtlRender, screen } from '@/testing/test-utils';

import type { ProchainsRendezVous } from '../../types/schemas';
import { UpcomingAppointments } from '../upcoming-appointments';

const mockAppointments: ProchainsRendezVous[] = [
  {
    id: 1,
    heure_debut: '2026-05-11T09:30:00Z',
    patient_nom: 'Dupont',
    patient_prenom: 'Marie',
    statut: 'CONFIRME',
  },
  {
    id: 2,
    heure_debut: '2026-05-11T10:00:00Z',
    patient_nom: 'Martin',
    patient_prenom: 'Jean',
    statut: 'PLANIFIE',
  },
];

describe('UpcomingAppointments', () => {
  test('renders the list title', () => {
    rtlRender(<UpcomingAppointments appointments={mockAppointments} />);
    expect(screen.getByText('Prochains rendez-vous')).toBeInTheDocument();
  });

  test('renders one list item per appointment', () => {
    rtlRender(<UpcomingAppointments appointments={mockAppointments} />);
    expect(screen.getByText('Dupont Marie')).toBeInTheDocument();
    expect(screen.getByText('Martin Jean')).toBeInTheDocument();
  });

  test('displays the statut badge for each appointment', () => {
    rtlRender(<UpcomingAppointments appointments={mockAppointments} />);
    expect(screen.getByText('Confirmé')).toBeInTheDocument();
    expect(screen.getByText('Planifié')).toBeInTheDocument();
  });

  test('displays an empty-state message when there are no appointments', () => {
    rtlRender(<UpcomingAppointments appointments={[]} />);
    expect(screen.getByText('Aucun rendez-vous à venir.')).toBeInTheDocument();
  });

  test('does not render list items when appointments array is empty', () => {
    rtlRender(<UpcomingAppointments appointments={[]} />);
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  test('falls back to the raw statut string for unknown statut values', () => {
    const appt: ProchainsRendezVous = {
      id: 99,
      heure_debut: '2026-05-11T11:00:00Z',
      patient_nom: 'Unknown',
      patient_prenom: 'Status',
      statut: 'INCONNU',
    };
    rtlRender(<UpcomingAppointments appointments={[appt]} />);
    expect(screen.getByText('INCONNU')).toBeInTheDocument();
  });
});
