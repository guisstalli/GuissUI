'use client';

import {
  Building2,
  CalendarRange,
  ChevronDown,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

import {
  type AnalyticsFilters,
  SEX_VALUES,
  AGE_BAND_VALUES,
  EYE_STRATEGY_VALUES,
  EXAM_SCOPE_VALUES,
} from '../types';

type Option = { label: string; value: string };

const SEX_OPTIONS: Option[] = [
  { label: 'Tous', value: '' },
  { label: 'Hommes', value: 'H' },
  { label: 'Femmes', value: 'F' },
  { label: 'Autres', value: 'A' },
];

const AGE_BAND_OPTIONS: Option[] = [
  { label: 'Toutes tranches', value: 'all' },
  { label: 'Enfants (< 18 ans)', value: 'child' },
  { label: 'Adultes (18-40 ans)', value: 'adult' },
  { label: 'Séniors (> 40 ans)', value: 'over_40' },
];

const EYE_STRATEGY_OPTIONS: Option[] = [
  { label: 'Yeux séparés', value: 'separate' },
  { label: 'Moyenne OD/OG', value: 'average' },
  { label: 'Pire œil', value: 'worst' },
];

const EXAM_SCOPE_OPTIONS: Option[] = [
  { label: 'Tous les examens', value: 'all' },
  { label: 'Première visite uniquement', value: 'first' },
];

type AnalyticsFiltersProps = {
  draftFilters: AnalyticsFilters;
  sites: { id: number; libelle: string }[];
  isApplying: boolean;
  onChange: (filters: AnalyticsFilters) => void;
  onApply: () => void;
  onReset: () => void;
  lockDriverOnly?: boolean;
};

function countActiveFilters(filters: AnalyticsFilters): number {
  let count = 0;
  if (filters.site_id && filters.site_id.length > 0) count++;
  if (filters.date_start) count++;
  if (filters.date_end) count++;
  if (filters.sex) count++;
  if (filters.age_band && filters.age_band !== 'all') count++;
  if (filters.eye_strategy && filters.eye_strategy !== 'separate') count++;
  if (filters.exam_scope && filters.exam_scope !== 'all') count++;
  if (filters.driver_only) count++;
  return count;
}

function SitesMultiSelect({
  sites,
  selectedIds,
  onChange,
}: {
  sites: { id: number; libelle: string }[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}) {
  const [open, setOpen] = React.useState(false);

  const toggle = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((s) => s !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const label =
    selectedIds.length === 0
      ? 'Tous les sites'
      : selectedIds.length === 1
        ? (sites.find((s) => s.id === selectedIds[0])?.libelle ?? '1 site')
        : `${selectedIds.length} sites sélectionnés`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
            'hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'transition-colors',
          )}
        >
          <span
            className={cn(
              selectedIds.length === 0
                ? 'text-muted-foreground'
                : 'text-foreground',
            )}
          >
            {label}
          </span>
          <ChevronDown className="ml-2 size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start">
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-xs font-medium text-muted-foreground">
            {sites.length} site{sites.length > 1 ? 's' : ''}
          </span>
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" />
              Tout désélectionner
            </button>
          )}
        </div>
        <div className="max-h-56 overflow-y-auto">
          {sites.length === 0 ? (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">
              Aucun site disponible
            </p>
          ) : (
            sites.map((site) => {
              const checked = selectedIds.includes(site.id);
              return (
                <button
                  key={site.id}
                  type="button"
                  onClick={() => toggle(site.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    checked && 'bg-primary/10 text-primary font-medium',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-4 shrink-0 items-center justify-center rounded border',
                      checked
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input bg-background',
                    )}
                  >
                    {checked && (
                      <svg
                        className="size-2.5"
                        fill="none"
                        viewBox="0 0 10 10"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <polyline points="1.5,5 4,7.5 8.5,2.5" />
                      </svg>
                    )}
                  </span>
                  <span className="truncate text-left">{site.libelle}</span>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </span>
  );
}

function FilterSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="size-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
      {children}
    </div>
  );
}

export const AnalyticsFiltersBar = ({
  draftFilters,
  sites,
  isApplying,
  onChange,
  onApply,
  onReset,
  lockDriverOnly = false,
}: AnalyticsFiltersProps) => {
  const selectedSiteIds = draftFilters.site_id ?? [];
  const activeCount = countActiveFilters(draftFilters);

  return (
    <Card className="border-border/60 sticky top-4 z-10 mb-8 shadow-md">
      <CardContent className="p-5">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 flex size-7 items-center justify-center rounded-md">
              <SlidersHorizontal className="size-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold">Filtres analytiques</span>
            {activeCount > 0 && (
              <Badge variant="default" className="px-2 py-0.5 text-xs">
                {activeCount} actif{activeCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3.5" />
              Réinitialiser
            </Button>
            <Button
              size="sm"
              onClick={onApply}
              disabled={isApplying}
              className="h-8 gap-1.5 text-xs"
            >
              <Filter className="size-3.5" />
              {isApplying ? 'Application…' : 'Appliquer'}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Row 1 — Périmètre */}
          <FilterSection icon={Building2} title="Périmètre">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Sites */}
              <div>
                <FilterLabel>Sites</FilterLabel>
                <SitesMultiSelect
                  sites={sites}
                  selectedIds={selectedSiteIds}
                  onChange={(ids) =>
                    onChange({
                      ...draftFilters,
                      site_id: ids.length ? ids : undefined,
                    })
                  }
                />
              </div>

              {/* Date début */}
              <div>
                <FilterLabel>Période — du</FilterLabel>
                <div className="relative">
                  <CalendarRange className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="date"
                    aria-label="Date de début"
                    title="Date de début"
                    value={draftFilters.date_start ?? ''}
                    onChange={(e) =>
                      onChange({
                        ...draftFilters,
                        date_start: e.target.value || undefined,
                      })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </div>

              {/* Date fin */}
              <div>
                <FilterLabel>Période — au</FilterLabel>
                <div className="relative">
                  <CalendarRange className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="date"
                    aria-label="Date de fin"
                    title="Date de fin"
                    value={draftFilters.date_end ?? ''}
                    onChange={(e) =>
                      onChange({
                        ...draftFilters,
                        date_end: e.target.value || undefined,
                      })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </div>
            </div>
          </FilterSection>

          {/* Row 2 — Population & Paramètres */}
          <FilterSection icon={Filter} title="Population & Paramètres">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              {/* Sexe */}
              <div>
                <FilterLabel>Sexe</FilterLabel>
                <Select
                  value={draftFilters.sex ?? 'all'}
                  onValueChange={(val) => {
                    const sex = SEX_VALUES.includes(
                      val as (typeof SEX_VALUES)[number],
                    )
                      ? (val as (typeof SEX_VALUES)[number])
                      : undefined;
                    onChange({ ...draftFilters, sex });
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEX_OPTIONS.map((o) => (
                      <SelectItem
                        key={o.value || 'all'}
                        value={o.value || 'all'}
                      >
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Âge */}
              <div>
                <FilterLabel>Tranche d&apos;âge</FilterLabel>
                <Select
                  value={draftFilters.age_band ?? 'all'}
                  onValueChange={(val) =>
                    onChange({
                      ...draftFilters,
                      age_band: val as (typeof AGE_BAND_VALUES)[number],
                    })
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Toutes" />
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
              <div>
                <FilterLabel>Stratégie œil</FilterLabel>
                <Select
                  value={draftFilters.eye_strategy ?? 'separate'}
                  onValueChange={(val) =>
                    onChange({
                      ...draftFilters,
                      eye_strategy: val as (typeof EYE_STRATEGY_VALUES)[number],
                    })
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Séparée" />
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
              <div>
                <FilterLabel>Type de visite</FilterLabel>
                <Select
                  value={draftFilters.exam_scope ?? 'all'}
                  onValueChange={(val) =>
                    onChange({
                      ...draftFilters,
                      exam_scope: val as (typeof EXAM_SCOPE_VALUES)[number],
                    })
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Tous" />
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

              {/* Conducteurs seulement */}
              <div className="flex items-end pb-1">
                <label
                  htmlFor="driver-only-toggle"
                  className={cn(
                    'flex cursor-pointer items-center gap-2.5 rounded-md border border-input bg-background px-3 py-2.5 transition-colors hover:bg-accent/50',
                    lockDriverOnly && 'cursor-not-allowed opacity-60',
                    draftFilters.driver_only &&
                      'border-primary/50 bg-primary/5',
                  )}
                >
                  <Switch
                    id="driver-only-toggle"
                    checked={draftFilters.driver_only ?? false}
                    onCheckedChange={(checked) =>
                      onChange({
                        ...draftFilters,
                        driver_only: checked || undefined,
                      })
                    }
                    disabled={lockDriverOnly}
                  />
                  <span className="text-sm font-medium leading-tight">
                    Conducteurs
                    <br />
                    <span className="text-xs text-muted-foreground">
                      seulement
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </FilterSection>
        </div>
      </CardContent>
    </Card>
  );
};
