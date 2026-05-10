export const paths = {
  home: {
    getHref: () => '/',
  },

  // Authentication
  auth: {
    login: {
      getHref: (returnTo?: string) =>
        returnTo
          ? `/auth/login?returnTo=${encodeURIComponent(returnTo)}`
          : '/auth/login',
    },
  },

  // Dashboard
  dashboard: {
    getHref: () => '/',
  },

  // Patients
  patients: {
    list: {
      getHref: () => '/patients',
    },
    detail: {
      getHref: (id: number | string) => `/patients/${id}`,
    },
    create: {
      getHref: () => '/patients/new',
    },
    edit: {
      getHref: (id: number | string) => `/patients/${id}/edit`,
    },
    adults: {
      getHref: () => '/patients?type=adult',
    },
    children: {
      getHref: () => '/patients?type=child',
    },
  },

  // Patient Records (Dossier Patient)
  patientRecords: {
    detail: {
      getHref: (patientId: number | string) => `/patients/${patientId}/record`,
    },
  },

  // Exams
  exams: {
    // Adult Exams
    adult: {
      list: {
        getHref: () => '/exams/adult',
      },
      detail: {
        getHref: (id: number | string) => `/exams/adult/${id}`,
      },
      create: {
        getHref: (patientId?: number | string) =>
          patientId
            ? `/exams/adult/new?patient=${patientId}`
            : '/exams/adult/new',
      },
    },
    // Child Exams
    child: {
      list: {
        getHref: () => '/exams/child',
      },
      detail: {
        getHref: (id: number | string) => `/exams/child/${id}`,
      },
      create: {
        getHref: (patientId?: number | string) =>
          patientId
            ? `/exams/child/new?patient=${patientId}`
            : '/exams/child/new',
      },
    },
    // Incomplete Exams
    incomplete: {
      getHref: () => '/exams/incomplete',
    },
    // Exams by patient
    byPatient: {
      getHref: (patientId: number | string) => `/patients/${patientId}/exams`,
    },
  },

  // Consultations
  consultations: {
    list: {
      getHref: () => '/consultations',
    },
    detail: {
      getHref: (id: number | string) => `/consultations/${id}`,
    },
    create: {
      getHref: (patientId?: number | string) =>
        patientId
          ? `/consultations/new?patient=${patientId}`
          : '/consultations/new',
    },
  },

  // Appointments (Rendez-vous)
  appointments: {
    list: {
      getHref: () => '/appointments',
    },
    detail: {
      getHref: (id: number | string) => `/appointments/${id}`,
    },
    create: {
      getHref: (patientId?: number | string) =>
        patientId
          ? `/appointments/new?patient=${patientId}`
          : '/appointments/new',
    },
  },

  // Planning / Agenda
  planning: {
    calendar: {
      getHref: () => '/planning',
    },
    day: {
      getHref: (date: string) => `/planning?view=day&date=${date}`,
    },
    week: {
      getHref: (date: string) => `/planning?view=week&date=${date}`,
    },
  },

  // Analytics
  analytics: {
    getHref: () => '/analytics',
  },

  // Reports
  reports: {
    list: {
      getHref: () => '/reports',
    },
    export: {
      getHref: () => '/reports/export',
    },
  },

  // Sites
  sites: {
    list: {
      getHref: () => '/sites',
    },
    detail: {
      getHref: (id: number | string) => `/sites/${id}`,
    },
    create: {
      getHref: () => '/sites/new',
    },
    edit: {
      getHref: (id: number | string) => `/sites/${id}/edit`,
    },
  },

  // Unauthorized page
  unauthorized: {
    getHref: () => '/unauthorized',
  },

  // Maintenance page
  maintenance: {
    getHref: () => '/maintenance',
  },
} as const;

// Active paths for the internal application
export const activePaths = [
  '/',
  '/patients',
  '/exams',
  '/consultations',
  '/appointments',
  '/planning',
  '/analytics',
  '/reports',
  '/sites',
  '/unauthorized',
  '/maintenance',
] as const;
