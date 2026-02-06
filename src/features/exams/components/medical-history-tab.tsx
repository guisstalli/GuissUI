'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Loader2, Search, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';

const MAX_DISEASES = 5;

interface ICDResult {
  code: string;
  title: string;
}

interface SelectedDisease {
  id: string;
  code: string;
  title: string;
  category: string;
}

// Simulated ICD search results (in production would use ICD WHO API)
const mockICDSearch = async (query: string): Promise<ICDResult[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (!query || query.length < 2) return [];

  const mockResults: ICDResult[] = [
    { code: 'E11', title: 'Type 2 diabetes mellitus' },
    { code: 'E10', title: 'Type 1 diabetes mellitus' },
    { code: 'I10', title: 'Essential (primary) hypertension' },
    { code: 'H40.1', title: 'Primary open-angle glaucoma' },
    { code: 'H40.2', title: 'Primary angle-closure glaucoma' },
    { code: 'H35.3', title: 'Degeneration of macula and posterior pole' },
    { code: 'H26.9', title: 'Cataract, unspecified' },
    { code: 'H52.1', title: 'Myopia' },
    { code: 'H52.0', title: 'Hypermetropia' },
    { code: 'H52.2', title: 'Astigmatism' },
    { code: 'H47.1', title: 'Papilloedema' },
    { code: 'H46', title: 'Optic neuritis' },
  ];

  return mockResults.filter(
    (r) =>
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.code.toLowerCase().includes(query.toLowerCase()),
  );
};

const medicalHistorySchema = z.object({
  screenUsage: z.string().optional(),
  notes: z.string().optional(),
});

type MedicalHistoryFormValues = z.infer<typeof medicalHistorySchema>;

interface MedicalHistoryTabProps {
  patientId: string;
  initialData?: {
    selectedDiseases: SelectedDisease[];
    screenUsage?: string;
    notes?: string;
  };
  onSave?: (data: {
    selectedDiseases: SelectedDisease[];
    screenUsage?: string;
    notes?: string;
  }) => void;
}

export function MedicalHistoryTab({
  initialData,
  onSave,
}: MedicalHistoryTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ICDResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDiseases, setSelectedDiseases] = useState<SelectedDisease[]>(
    initialData?.selectedDiseases || [],
  );
  const [currentCategory, setCurrentCategory] = useState<string>('medical');

  const form = useForm<MedicalHistoryFormValues>({
    resolver: zodResolver(medicalHistorySchema),
    defaultValues: {
      screenUsage: initialData?.screenUsage || '',
      notes: initialData?.notes || '',
    },
  });

  // Debounced search
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await mockICDSearch(query);
      setSearchResults(results);
    } catch (error) {
      console.error('ICD search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSelectDisease = (result: ICDResult) => {
    if (selectedDiseases.length >= MAX_DISEASES) return;
    if (selectedDiseases.some((d) => d.code === result.code)) return;

    const newDisease: SelectedDisease = {
      id: `${result.code}-${Date.now()}`,
      code: result.code,
      title: result.title,
      category: currentCategory,
    };

    setSelectedDiseases([...selectedDiseases, newDisease]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveDisease = (diseaseId: string) => {
    setSelectedDiseases(selectedDiseases.filter((d) => d.id !== diseaseId));
  };

  const handleSave = () => {
    const formData = form.getValues();
    onSave?.({
      selectedDiseases,
      screenUsage: formData.screenUsage,
      notes: formData.notes,
    });
  };

  const diseasesAtLimit = selectedDiseases.length >= MAX_DISEASES;

  const categorizedDiseases = {
    medical: selectedDiseases.filter((d) => d.category === 'medical'),
    surgical: selectedDiseases.filter((d) => d.category === 'surgical'),
    ophthalmologic: selectedDiseases.filter(
      (d) => d.category === 'ophthalmologic',
    ),
    family: selectedDiseases.filter((d) => d.category === 'family'),
  };

  return (
    <div className="space-y-8">
      {/* ICD Disease Search */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">
            Medical and Ophthalmologic History
          </h3>
          <span className="text-xs text-muted-foreground">
            {selectedDiseases.length}/{MAX_DISEASES} conditions selected
          </span>
        </div>

        {/* Category Selection */}
        <div className="flex items-center gap-4">
          <Label htmlFor="category" className="text-sm text-muted-foreground">
            Category:
          </Label>
          <Select value={currentCategory} onValueChange={setCurrentCategory}>
            <SelectTrigger id="category" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="medical">Medical / Surgical</SelectItem>
              <SelectItem value="surgical">Surgical History</SelectItem>
              <SelectItem value="ophthalmologic">Ophthalmologic</SelectItem>
              <SelectItem value="family">Family History</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ICD Search */}
        <div className="space-y-2">
          <Label htmlFor="icd-search" className="text-sm text-muted-foreground">
            Search ICD-11 (WHO Release 2.5)
          </Label>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="icd-search"
              type="search"
              placeholder="Search by disease name or ICD code..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              disabled={diseasesAtLimit}
              aria-label="Search ICD diseases"
            />
            {isSearching && (
              <Loader2
                className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
                aria-hidden="true"
              />
            )}
          </div>

          {/* Limit Warning */}
          {diseasesAtLimit && (
            <div className="border-warning/30 bg-warning/10 flex items-center gap-2 rounded-md border px-3 py-2">
              <AlertCircle className="size-4 text-warning" aria-hidden="true" />
              <p className="text-sm text-warning">
                Maximum of {MAX_DISEASES} conditions reached. Remove a condition
                to add more.
              </p>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="rounded-lg border border-border bg-card shadow-sm">
              <ul className="divide-y divide-border" role="listbox">
                {searchResults.slice(0, 10).map((result) => {
                  const isSelected = selectedDiseases.some(
                    (d) => d.code === result.code,
                  );
                  return (
                    <li key={result.code}>
                      <button
                        type="button"
                        onClick={() => handleSelectDisease(result)}
                        disabled={isSelected || diseasesAtLimit}
                        className={cn(
                          'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                          'hover:bg-muted/50 focus-visible:outline-none focus-visible:bg-muted/50',
                          'disabled:cursor-not-allowed disabled:opacity-50',
                        )}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <Badge
                          variant="outline"
                          className="shrink-0 font-mono text-xs"
                        >
                          {result.code}
                        </Badge>
                        <span className="text-sm text-foreground">
                          {result.title}
                        </span>
                        {isSelected && (
                          <span className="ml-auto text-xs text-muted-foreground">
                            Already selected
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Selected Diseases by Category */}
        <div className="space-y-4">
          {Object.entries(categorizedDiseases).map(([category, diseases]) => {
            if (diseases.length === 0) return null;
            const categoryLabels: Record<string, string> = {
              medical: 'Medical / Surgical History',
              surgical: 'Surgical History',
              ophthalmologic: 'Ophthalmologic History',
              family: 'Family History',
            };
            return (
              <div key={category} className="space-y-2">
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {categoryLabels[category]}
                </h4>
                <ul className="space-y-2">
                  {diseases.map((disease) => (
                    <li
                      key={disease.id}
                      className="bg-muted/30 flex items-center justify-between rounded-md border border-border px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className="shrink-0 font-mono text-xs"
                        >
                          {disease.code}
                        </Badge>
                        <span className="text-sm text-foreground">
                          {disease.title}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => handleRemoveDisease(disease.id)}
                        aria-label={`Remove ${disease.title}`}
                      >
                        <X className="size-4" aria-hidden="true" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Screen Usage */}
      <Form {...form}>
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Screen Usage</h3>
          <FormField
            control={form.control}
            name="screenUsage"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground">
                  Daily screen time and device usage
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., 8+ hours computer work, regular smartphone use..."
                    className="min-h-20 resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground">
                  Additional notes
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any other relevant medical information..."
                    className="min-h-20 resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
        <Button variant="outline">Cancel changes</Button>
        <Button onClick={handleSave}>Save medical history</Button>
      </div>
    </div>
  );
}
