import type { Dispatch, SetStateAction } from 'react';

// =============================================================================
// BASE TYPES
// =============================================================================

// ID type
export type ID = undefined | null | number;

// Base entity type for all entities with id
export type BaseEntity = {
  id: number | string;
};

// =============================================================================
// DJANGO REST FRAMEWORK PAGINATION (GUISS API)
// =============================================================================

/**
 * Format de pagination Django REST Framework
 * Utilisé par l'API GUISS pour toutes les listes paginées
 */
export type DjangoPaginatedResponse<T> = {
  /** Nombre total de résultats */
  count: number;
  /** URL de la page suivante (null si dernière page) */
  next: string | null;
  /** URL de la page précédente (null si première page) */
  previous: string | null;
  /** Résultats de la page courante */
  results: T[];
};

/**
 * Query params pour la pagination Django
 */
export type DjangoQueryParams = {
  /** Nombre de résultats par page (défaut: 10) */
  limit?: number;
  /** Index de départ (offset-based pagination) */
  offset?: number;
  /** Champ de tri (préfixe '-' pour ordre décroissant, ex: '-created') */
  ordering?: string;
  /** Terme de recherche */
  search?: string;
};

/**
 * Query params spécifiques pour les patients
 */
export type PatientQueryParams = DjangoQueryParams & {
  /** Filtrer par type: adulte (true) ou enfant (false) */
  is_adult?: boolean;
  /** Filtrer par sexe: H (Homme), F (Femme), A (Anonyme) */
  sex?: 'H' | 'F' | 'A';
  /** Filtrer par date de création (après) */
  created_after?: string;
};

/**
 * Query params spécifiques pour les examens
 */
export type ExamQueryParams = DjangoQueryParams & {
  /** Filtrer par patient ID */
  patient?: number;
  /** Filtrer les examens avec données cliniques */
  has_clinical?: boolean;
  /** Filtrer les examens avec données techniques */
  has_technical?: boolean;
  /** Filtrer les examens complétés */
  is_completed?: boolean;
  /** Filtrer par date de création (après) */
  created_after?: string;
  /** Filtrer par date de création (avant) */
  created_before?: string;
};

// =============================================================================
// LEGACY PAGINATION (Rétrocompatibilité)
// =============================================================================

// Meta type for pagination (legacy)
export type Meta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore?: boolean;
};

// DRF Pagination Structure (legacy format)
export type PaginationState<T> = {
  total_count?: number;
  has_more?: boolean;
  data?: T[];
  items_per_page?: number;
  page?: number;
  filter?: Record<string, unknown>;
};

// =============================================================================
// SORTING, FILTERING, SEARCHING
// =============================================================================

// Sorting
export type SortState = {
  sort?: string;
  order?: 'asc' | 'desc';
};

// Filtering
export type FilterState = {
  filter?: unknown;
};

// Searching
export type SearchState = {
  search?: string;
};

// =============================================================================
// ERROR HANDLING
// =============================================================================

/**
 * Format d'erreur de validation DRF (HackSoft style)
 * Utilisé par le backend GUISS
 *
 * Exemple:
 * {
 *   "message": "Validation error",
 *   "extra": {
 *     "fields": {
 *       "phone_number": ["Un objet Patient avec ce champ existe déjà."]
 *     }
 *   }
 * }
 */
export type DRFValidationError = {
  message: string;
  extra: {
    fields?: Record<string, string[]>;
    [key: string]: unknown;
  };
};

/**
 * Format d'erreur DRF standard
 */
export type DRFStandardError = {
  detail:
    | string
    | Record<string, string[]>
    | Array<{ loc: string[]; msg: string; type: string }>;
};

/**
 * Type union pour tous les formats d'erreur possibles
 */
export type APIError = DRFValidationError | DRFStandardError;

/**
 * Vérifie si l'erreur est une erreur de validation HackSoft
 */
export function isValidationError(error: unknown): error is DRFValidationError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'extra' in error
  );
}

/**
 * Labels français pour les noms de champs
 */
const FIELD_LABELS: Record<string, string> = {
  phone_number: 'Numéro de téléphone',
  last_name: 'Nom',
  name: 'Prénom',
  first_name: 'Prénom',
  date_de_naissance: 'Date de naissance',
  sex: 'Sexe',
  email: 'Email',
  password: 'Mot de passe',
  numero_identifiant: 'Numéro identifiant',
  non_field_errors: 'Erreur',
  __all__: 'Erreur générale',
};

/**
 * Formate le nom d'un champ pour l'affichage
 */
export function formatFieldName(field: string): string {
  return (
    FIELD_LABELS[field] ||
    field.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
  );
}

/**
 * Extrait un message d'erreur lisible à partir d'une réponse d'erreur API
 */
export function extractErrorMessage(errorData: unknown): string {
  // Format HackSoft: { message: "...", extra: { fields: { ... } } }
  if (isValidationError(errorData)) {
    const fields = errorData.extra?.fields;
    if (
      fields &&
      typeof fields === 'object' &&
      Object.keys(fields).length > 0
    ) {
      // Extraire les messages des champs
      const fieldErrors = Object.entries(fields)
        .map(([field, messages]) => {
          const fieldName = formatFieldName(field);
          const message = Array.isArray(messages)
            ? messages.join(', ')
            : String(messages);
          return `${fieldName}: ${message}`;
        })
        .join('\n');

      if (fieldErrors) {
        return fieldErrors;
      }
    }
    return errorData.message;
  }

  // Format DRF standard: { detail: "..." } ou { detail: { field: [...] } }
  if (
    typeof errorData === 'object' &&
    errorData !== null &&
    'detail' in errorData
  ) {
    const detail = (errorData as DRFStandardError).detail;

    if (typeof detail === 'string') {
      return detail;
    }

    if (Array.isArray(detail)) {
      // Format FastAPI validation: [{ loc: [...], msg: "...", type: "..." }]
      return detail
        .map((err) => `${err.loc?.join('.')}: ${err.msg}`)
        .join(', ');
    }

    if (typeof detail === 'object') {
      // Format DRF: { field: ["error1", "error2"] }
      return Object.entries(detail)
        .map(([field, messages]) => {
          const fieldName = formatFieldName(field);
          const message = Array.isArray(messages)
            ? messages.join(', ')
            : String(messages);
          return `${fieldName}: ${message}`;
        })
        .join('\n');
    }
  }

  // Fallback: essayer de convertir en string
  if (typeof errorData === 'string') {
    return errorData;
  }

  return 'Une erreur est survenue';
}

/**
 * Extrait le titre d'erreur approprié
 */
export function extractErrorTitle(
  errorData: unknown,
  statusCode?: number,
): string {
  if (isValidationError(errorData)) {
    return 'Erreur de validation';
  }

  if (statusCode === 404) {
    return 'Non trouvé';
  }

  if (statusCode === 400) {
    return 'Requête invalide';
  }

  if (statusCode && statusCode >= 500) {
    return 'Erreur serveur';
  }

  return 'Erreur';
}

// =============================================================================
// QUERY STATE (Unified)
// =============================================================================

// Unified Query State - supporte les deux formats
export type QueryState = {
  // Django pagination params
  limit?: number;
  offset?: number;
  ordering?: string;
  search?: string;
  // Legacy params
  page?: number;
  item_per_page?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  filter?: unknown;
  // Response state
  total_count?: number;
  has_more?: boolean;
  data?: unknown[];
};

// Query Request Context
export type QueryRequestContextProps = {
  state: QueryState;
  updateState: (updates: Partial<QueryState>) => void;
};

// Default Query State
export const initialQueryState: QueryState = {
  limit: 10,
  offset: 0,
};

// Default Query Context
export const initialQueryRequest: QueryRequestContextProps = {
  state: initialQueryState,
  updateState: () => {},
};

// =============================================================================
// QUERY RESPONSE CONTEXT
// =============================================================================

// Réponse paginée (legacy)
export type PaginationResponse<T> = PaginationState<T>;

// Réponse simple
export type ApiResponse<T> = {
  data?: T;
  detail?: string;
  type?: string;
};

// Query Response Context adapted to DRF
export type QueryResponseContextProps<T> = {
  response?:
    | ApiResponse<Array<T>>
    | PaginationResponse<T>
    | DjangoPaginatedResponse<T>
    | undefined;
  refetch: () => void;
  isLoading: boolean;
  query: string;
};

export const initialQueryResponse: QueryResponseContextProps<unknown> = {
  refetch: () => {},
  isLoading: false,
  query: '',
};

// =============================================================================
// LIST VIEW CONTEXT
// =============================================================================

// List view context for selection and modal editing
export type ListViewContextProps = {
  selected: Array<ID>;
  onSelect: (selectedId: ID) => void;
  onSelectAll: () => void;
  clearSelected: () => void;
  itemIdForUpdate?: ID;
  setItemIdForUpdate: Dispatch<SetStateAction<ID>>;
  isAllSelected: boolean;
  disabled: boolean;
};

export const initialListView: ListViewContextProps = {
  selected: [],
  onSelect: () => {},
  onSelectAll: () => {},
  clearSelected: () => {},
  setItemIdForUpdate: () => {},
  isAllSelected: false,
  disabled: false,
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Convertit les query params en URLSearchParams pour l'API Django
 */
export function buildDjangoQueryParams(
  params: DjangoQueryParams & Record<string, unknown>,
): URLSearchParams {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'boolean') {
        searchParams.set(key, value.toString());
      } else {
        searchParams.set(key, String(value));
      }
    }
  });

  return searchParams;
}

/**
 * Calcule l'offset à partir de la page et du limit
 */
export function pageToOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Calcule la page à partir de l'offset et du limit
 */
export function offsetToPage(offset: number, limit: number): number {
  return Math.floor(offset / limit) + 1;
}

/**
 * Calcule le nombre total de pages
 */
export function getTotalPages(count: number, limit: number): number {
  return Math.ceil(count / limit);
}
