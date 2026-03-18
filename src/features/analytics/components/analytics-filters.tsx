import { FilterX } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { type AnalyticsFilters } from '../types';

type Option = { label: string; value: string };

const SEX_OPTIONS: Option[] = [
  { label: 'Tous', value: '' },
  { label: 'Hommes', value: 'H' },
  { label: 'Femmes', value: 'F' },
  { label: 'Autres', value: 'A' },
];

const AGE_BAND_OPTIONS: Option[] = [
  { label: 'Toutes', value: 'all' },
  { label: 'Enfants', value: 'child' },
  { label: 'Adultes', value: 'adult' },
  { label: '+ de 40 ans', value: 'over_40' },
];

const EYE_STRATEGY_OPTIONS: Option[] = [
  { label: 'Séparée', value: 'separate' },
  { label: 'Moyenne', value: 'average' },
  { label: 'Pire œil', value: 'worst' },
];

const EXAM_SCOPE_OPTIONS: Option[] = [
  { label: 'Tous', value: 'all' },
  { label: 'Première visite', value: 'first' },
];

type AnalyticsFiltersProps = {
  draftFilters: AnalyticsFilters;
  sites: { id: number; libelle: string }[];
  isApplying: boolean;
  onChange: (filters: AnalyticsFilters) => void;
  onApply: () => void;
  onReset: () => void;
};

export const AnalyticsFiltersBar = ({
  draftFilters,
  sites,
  isApplying,
  onChange,
  onApply,
  onReset,
}: AnalyticsFiltersProps) => {
  const draftSites = (draftFilters.site_id ?? []).map((id) => id.toString());

  const handleSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValues = Array.from(e.target.selectedOptions).map((opt) =>
      parseInt(opt.value, 10),
    );
    onChange({ ...draftFilters, site_id: selectedValues });
  };

  return (
    <Card className="sticky top-4 z-10 mb-8 border-muted shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end gap-4">
            {/* Sites */}
            <div className="w-full space-y-1 md:w-64">
              <span className="text-sm font-medium">
                Sites (Maintenir Ctrl)
              </span>
              <select
                multiple
                value={draftSites}
                onChange={handleSiteChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id.toString()}>
                    {s.libelle}
                  </option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div className="flex gap-2 space-y-1">
              <div>
                <span className="block text-sm font-medium">Du</span>
                <input
                  type="date"
                  value={draftFilters.date_start ?? ''}
                  onChange={(e) =>
                    onChange({
                      ...draftFilters,
                      date_start: e.target.value || undefined,
                    })
                  }
                  className="flex h-10 w-36 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                />
              </div>
              <div>
                <span className="block text-sm font-medium">Au</span>
                <input
                  type="date"
                  value={draftFilters.date_end ?? ''}
                  onChange={(e) =>
                    onChange({
                      ...draftFilters,
                      date_end: e.target.value || undefined,
                    })
                  }
                  className="flex h-10 w-36 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                />
              </div>
            </div>

            {/* Sex */}
            <div className="w-32 space-y-1">
              <span className="text-sm font-medium">Sexe</span>
              <Select
                value={draftFilters.sex ?? ''}
                onValueChange={(val) =>
                  onChange({ ...draftFilters, sex: (val as any) || undefined })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sexe" />
                </SelectTrigger>
                <SelectContent>
                  {SEX_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value || 'all'}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Age band */}
            <div className="w-32 space-y-1">
              <span className="text-sm font-medium">Âge</span>
              <Select
                value={draftFilters.age_band ?? 'all'}
                onValueChange={(val) =>
                  onChange({ ...draftFilters, age_band: val as any })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Âge" />
                </SelectTrigger>
                <SelectContent>
                  {AGE_BAND_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Eye strategy */}
            <div className="w-32 space-y-1">
              <span className="text-sm font-medium">Strat. Œil</span>
              <Select
                value={draftFilters.eye_strategy ?? 'separate'}
                onValueChange={(val) =>
                  onChange({ ...draftFilters, eye_strategy: val as any })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Stratégie" />
                </SelectTrigger>
                <SelectContent>
                  {EYE_STRATEGY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Exam scope */}
            <div className="w-36 space-y-1">
              <span className="text-sm font-medium">Portée</span>
              <Select
                value={draftFilters.exam_scope ?? 'all'}
                onValueChange={(val) =>
                  onChange({ ...draftFilters, exam_scope: val as any })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type de visite" />
                </SelectTrigger>
                <SelectContent>
                  {EXAM_SCOPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto flex h-10 items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onReset}
                title="Réinitialiser"
              >
                <FilterX className="size-4" />
              </Button>
              <Button onClick={onApply} disabled={isApplying}>
                Appliquer
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
