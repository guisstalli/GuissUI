'use client';

import { Loader2, Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { FormDescription, FormLabel, Input } from '@/components/ui/form';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface ICDSearchResult {
  id: string;
  code: string;
  title: string;
}

interface ICDApiResponse {
  destinationEntities?: Array<{
    id: string;
    title: string;
    theCode?: string;
  }>;
}

export interface ICDSelectorProps {
  label: string;
  description?: string;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  maxItems?: number;
  placeholder?: string;
}

// =============================================================================
// ICD-11 API SERVICE
// =============================================================================

const ICD_API_URL = 'https://icd11restapi-developer-test.azurewebsites.net';

/**
 * Recherche dans l'API ICD-11 de l'OMS
 */
async function searchICD11(query: string): Promise<ICDSearchResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const response = await fetch(
      `${ICD_API_URL}/icd/release/11/2024-01/mms/search?q=${encodeURIComponent(query)}&useFlexisearch=true&flatResults=true&highlightingEnabled=false`,
      {
        headers: {
          Accept: 'application/json',
          'Accept-Language': 'fr',
          'API-Version': 'v2',
        },
      },
    );

    if (!response.ok) {
      console.error(`ICD-11 API error: ${response.status}`);
      return [];
    }

    const data: ICDApiResponse = await response.json();

    return (data.destinationEntities || []).map((entity) => ({
      id: entity.id,
      code: entity.theCode || entity.id?.split('/').pop() || '',
      title: (entity.title || '').replace(/<[^>]*>/g, ''),
    }));
  } catch (error) {
    console.error('ICD-11 search error:', error);
    return [];
  }
}

// =============================================================================
// ICD SELECTOR COMPONENT
// =============================================================================

export function ICDSelector({
  label,
  description,
  value,
  onChange,
  error,
  maxItems,
  placeholder = 'Rechercher une pathologie (ICD-11)...',
}: ICDSelectorProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ICDSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchQuery.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      const searchResults = await searchICD11(searchQuery);
      setResults(searchResults);
      setIsOpen(searchResults.length > 0);
      setIsLoading(false);
    }, 300);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleSelect = (result: ICDSearchResult) => {
    const diseaseString = `${result.code} - ${result.title}`;

    if (!value.includes(diseaseString)) {
      onChange([...value, diseaseString]);
    }

    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const isMaxReached = maxItems ? value.length >= maxItems : false;

  return (
    <div className="space-y-3" ref={containerRef}>
      <div>
        <FormLabel className="text-sm font-medium">{label}</FormLabel>
        {description && (
          <FormDescription className="text-sm text-muted-foreground">
            {description}
          </FormDescription>
        )}
      </div>

      {/* Selected items as tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="gap-1 py-1.5 pl-3 pr-1 text-xs"
            >
              <span className="max-w-[300px] truncate">{item}</span>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="hover:bg-muted-foreground/20 ml-1 rounded-full p-0.5 transition-colors"
                aria-label={`Supprimer ${item}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search input */}
      {!isMaxReached && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            className="px-9"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            onKeyDown={handleKeyDown}
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}

          {/* Results dropdown */}
          {isOpen && results.length > 0 && (
            <div className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-md border border-border bg-popover shadow-lg">
              <ul className="py-1">
                {results.map((result) => {
                  const isSelected = value.includes(
                    `${result.code} - ${result.title}`,
                  );
                  return (
                    <li key={result.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(result)}
                        disabled={isSelected}
                        className={cn(
                          'flex w-full items-start gap-3 px-3 py-2 text-left text-sm transition-colors',
                          'hover:bg-muted focus:bg-muted focus:outline-none',
                          isSelected && 'cursor-not-allowed opacity-50',
                        )}
                      >
                        <span className="bg-primary/10 mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-mono text-xs font-medium text-primary">
                          {result.code}
                        </span>
                        <span className="flex-1 text-foreground">
                          {result.title}
                        </span>
                        {isSelected && (
                          <span className="text-xs text-muted-foreground">
                            Ajouté
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* No results message */}
          {isOpen &&
            results.length === 0 &&
            query.length >= 2 &&
            !isLoading && (
              <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover p-3 text-center text-sm text-muted-foreground shadow-lg">
                Aucun résultat trouvé pour `${query}`
              </div>
            )}
        </div>
      )}

      {/* Max items reached message */}
      {isMaxReached && (
        <p className="text-xs text-muted-foreground">
          Maximum {maxItems} éléments atteint
        </p>
      )}

      {/* Error message */}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
