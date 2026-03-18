'use client';

import { Filter, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import {
  AGE_BAND_VALUES,
  ANALYTICS_SCOPE_VALUES,
  EXAM_TYPE_VALUES,
  SEX_VALUES,
} from '../types';
import type { AnalyticsFilters } from '../types';
import type { AnalyticsFilterValidation } from '../utils';

const AGE_LABELS: Record<string, string> = {
  all: 'Tous',
  child: 'Enfant',
  adult: 'Adulte',
  over_40: 'Plus de 40 ans',
};

const SCOPE_LABELS: Record<string, string> = {
  population: 'Population',
  patient: 'Patient',
  exam: 'Examen',
};

const EXAM_TYPE_LABELS: Record<string, string> = {
  all: 'Tous',
  child: 'Enfant',
  adult: 'Adulte',
};

const SEX_LABELS: Record<string, string> = {
  H: 'Homme',
  F: 'Femme',
  A: 'Autre/Anonyme',
};

type SiteOption = {
  id: number;
  libelle: string;
};

export function AnalyticsAgeFilters({
  draftFilters,
  sites,
  validation,
  isApplying,
  onChange,
  onApply,
  onReset,
}: {
  draftFilters: AnalyticsFilters;
  sites: SiteOption[];
  validation: AnalyticsFilterValidation;
  isApplying?: boolean;
  onChange: (next: AnalyticsFilters) => void;
  onApply: () => void;
  onReset: () => void;
}) {
  const selectedSiteIds = draftFilters.site_id ?? [];

  const toggleSite = (siteId: number, checked: boolean) => {
    const current = draftFilters.site_id ?? [];

    const nextSiteIds = checked
      ? [...current, siteId]
      : current.filter((currentSiteId) => currentSiteId !== siteId);

    onChange({
      ...draftFilters,
      site_id: nextSiteIds.length ? nextSiteIds : undefined,
    });
  };

  const selectedSiteCount = selectedSiteIds.length;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Filter className="size-4" aria-hidden="true" />
          Filtres Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="analytics-date-start">Date de début</Label>
            <Input
              id="analytics-date-start"
              type="date"
              value={draftFilters.date_start ?? ''}
              onChange={(event) =>
                onChange({
                  ...draftFilters,
                  date_start: event.target.value || undefined,
                })
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="analytics-date-end">Date de fin</Label>
            <Input
              id="analytics-date-end"
              type="date"
              value={draftFilters.date_end ?? ''}
              onChange={(event) =>
                onChange({
                  ...draftFilters,
                  date_end: event.target.value || undefined,
                })
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="analytics-sex">Sexe</Label>
            <Select
              value={draftFilters.sex ?? 'all'}
              onValueChange={(value) =>
                onChange({
                  ...draftFilters,
                  sex:
                    value === 'all'
                      ? undefined
                      : (value as AnalyticsFilters['sex']),
                })
              }
            >
              <SelectTrigger id="analytics-sex">
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {SEX_VALUES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {SEX_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="analytics-age-band">Tranche d’âge</Label>
            <Select
              value={draftFilters.age_band ?? 'all'}
              onValueChange={(value) =>
                onChange({
                  ...draftFilters,
                  age_band: value as AnalyticsFilters['age_band'],
                })
              }
            >
              <SelectTrigger id="analytics-age-band">
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                {AGE_BAND_VALUES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {AGE_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="analytics-scope">Portée</Label>
            <Select
              value={draftFilters.analytics_scope ?? 'population'}
              onValueChange={(value) =>
                onChange({
                  ...draftFilters,
                  analytics_scope: value as AnalyticsFilters['analytics_scope'],
                })
              }
            >
              <SelectTrigger id="analytics-scope">
                <SelectValue placeholder="Population" />
              </SelectTrigger>
              <SelectContent>
                {ANALYTICS_SCOPE_VALUES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {SCOPE_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="analytics-exam-type">Type d’examen</Label>
            <Select
              value={draftFilters.exam_type ?? 'all'}
              onValueChange={(value) =>
                onChange({
                  ...draftFilters,
                  exam_type: value as AnalyticsFilters['exam_type'],
                })
              }
            >
              <SelectTrigger id="analytics-exam-type">
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                {EXAM_TYPE_VALUES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {EXAM_TYPE_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="analytics-patient-id">Patient ID</Label>
            <Input
              id="analytics-patient-id"
              type="number"
              min={1}
              placeholder="Ex: 42"
              value={draftFilters.patient_id ?? ''}
              onChange={(event) =>
                onChange({
                  ...draftFilters,
                  patient_id: event.target.value
                    ? Number(event.target.value)
                    : undefined,
                })
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="analytics-exam-id">Examen ID</Label>
            <Input
              id="analytics-exam-id"
              type="number"
              min={1}
              placeholder="Ex: 128"
              value={draftFilters.exam_id ?? ''}
              onChange={(event) =>
                onChange({
                  ...draftFilters,
                  exam_id: event.target.value
                    ? Number(event.target.value)
                    : undefined,
                })
              }
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Sites</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between md:w-80"
              >
                {selectedSiteCount > 0
                  ? `${selectedSiteCount} site${selectedSiteCount > 1 ? 's' : ''} sélectionné${selectedSiteCount > 1 ? 's' : ''}`
                  : 'Tous les sites'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" align="start">
              <div
                className="space-y-2"
                role="group"
                aria-label="Filtre multi-sites"
              >
                {sites.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aucun site disponible
                  </p>
                ) : (
                  sites.map((site) => {
                    const isChecked = selectedSiteIds.includes(site.id);

                    return (
                      <div
                        key={site.id}
                        className="flex items-center gap-2 rounded-md p-1"
                      >
                        <Checkbox
                          id={`analytics-site-${site.id}`}
                          checked={isChecked}
                          onCheckedChange={(value) =>
                            toggleSite(site.id, Boolean(value))
                          }
                        />
                        <Label
                          htmlFor={`analytics-site-${site.id}`}
                          className="cursor-pointer text-sm font-normal"
                        >
                          {site.libelle}
                        </Label>
                      </div>
                    );
                  })
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {!validation.isValid && (
          <div
            role="alert"
            aria-live="assertive"
            className="border-destructive/30 bg-destructive/10 rounded-md border p-3 text-sm text-destructive"
          >
            {validation.message}
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onReset}>
            <X className="mr-2 size-4" aria-hidden="true" />
            Réinitialiser
          </Button>
          <Button
            type="button"
            onClick={onApply}
            disabled={!validation.isValid || isApplying}
          >
            Appliquer les filtres
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
