import { describe, expect, test } from 'vitest';

import { dashboardSchema } from '../schemas';

const validDashboard = {
  generated_at: '2026-05-11T08:00:00Z',
  examens: {
    today: { adult: 12, child: 5, total: 17 },
    last_7_days: [
      { date: '2026-05-05', total: 10 },
      { date: '2026-05-11', total: 17 },
    ],
  },
  patients: { total: 340, today_new: 3 },
  conducteurs: { total: 120, today_new: 1 },
  rendez_vous: {
    today: { total: 9, by_statut: { PLANIFIE: 4, CONFIRME: 5 } },
    prochains: [
      {
        id: 1,
        heure_debut: '2026-05-11T09:30:00Z',
        patient_nom: 'Dupont',
        patient_prenom: 'Marie',
        statut: 'CONFIRME',
      },
    ],
  },
  evenements: {
    en_cours: [
      { id: 10, titre: 'Campagne A', lieu: 'Nord', inscrits: 50, presents: 42 },
    ],
    planifies_7j: [
      {
        id: 11,
        titre: 'Journée santé',
        date_event: '2026-05-14',
        lieu: 'Hôpital',
        inscrits: 30,
      },
    ],
    inscriptions_aujourd_hui: 7,
  },
};

describe('dashboardSchema', () => {
  test('parses a valid dashboard payload', () => {
    // Arrange & Act
    const result = dashboardSchema.safeParse(validDashboard);

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.examens.today.total).toBe(17);
      expect(result.data.patients.total).toBe(340);
      expect(result.data.rendez_vous.prochains).toHaveLength(1);
    }
  });

  test('parses a dashboard with an empty prochains array', () => {
    // Arrange
    const payload = {
      ...validDashboard,
      rendez_vous: { ...validDashboard.rendez_vous, prochains: [] },
    };

    // Act
    const result = dashboardSchema.safeParse(payload);

    // Assert
    expect(result.success).toBe(true);
  });

  test('parses a dashboard with an empty evenements.en_cours array', () => {
    // Arrange
    const payload = {
      ...validDashboard,
      evenements: { ...validDashboard.evenements, en_cours: [] },
    };

    // Act
    const result = dashboardSchema.safeParse(payload);

    // Assert
    expect(result.success).toBe(true);
  });

  test('rejects a payload missing the examens field', () => {
    // Arrange
    const { examens: _removed, ...withoutExamens } = validDashboard;

    // Act
    const result = dashboardSchema.safeParse(withoutExamens);

    // Assert
    expect(result.success).toBe(false);
  });

  test('rejects a payload with a non-numeric patients.total', () => {
    // Arrange
    const payload = {
      ...validDashboard,
      patients: { total: 'not-a-number', today_new: 3 },
    };

    // Act
    const result = dashboardSchema.safeParse(payload);

    // Assert
    expect(result.success).toBe(false);
  });

  test('rejects a last_7_days item missing the date field', () => {
    // Arrange
    const payload = {
      ...validDashboard,
      examens: {
        ...validDashboard.examens,
        last_7_days: [{ total: 10 }],
      },
    };

    // Act
    const result = dashboardSchema.safeParse(payload);

    // Assert
    expect(result.success).toBe(false);
  });

  test('rejects a prochains item with a missing patient_nom', () => {
    // Arrange
    const payload = {
      ...validDashboard,
      rendez_vous: {
        ...validDashboard.rendez_vous,
        prochains: [
          {
            id: 1,
            heure_debut: '2026-05-11T09:30:00Z',
            patient_prenom: 'Marie',
            statut: 'CONFIRME',
          },
        ],
      },
    };

    // Act
    const result = dashboardSchema.safeParse(payload);

    // Assert
    expect(result.success).toBe(false);
  });

  test('accepts by_statut with arbitrary string keys', () => {
    // Arrange
    const payload = {
      ...validDashboard,
      rendez_vous: {
        ...validDashboard.rendez_vous,
        today: { total: 5, by_statut: { CUSTOM_STATUS: 5 } },
      },
    };

    // Act
    const result = dashboardSchema.safeParse(payload);

    // Assert
    expect(result.success).toBe(true);
  });
});
