'use client';

import { useFormContext } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RefractionFormProps {
  namePrefix?: string;
}

/**
 * Refraction Form Component
 * Shared between Child and Adult exams
 *
 * FIELDS (per eye OD / OG):
 * - Sphere (-20 to +15)
 * - Cylinder (-8 to +8)
 * - Axis (0–180)
 * - Visual Acuity
 * - Avec Correction: same fields (conditional on correction toggle)
 *
 * RETINOSCOPY:
 * - Standard: Sphere / Cylinder / Axis
 * - Cycloplegic: Sphere / Cylinder / Axis
 *
 * GLOBAL:
 * - Pupillary Distance (DP)
 *
 * DESIGN: Grouped by eye, correction toggle, Tabs for Retinoscopy
 */
export function RefractionForm({ namePrefix = '' }: RefractionFormProps) {
  const form = useFormContext();
  const prefix = namePrefix ? `${namePrefix}.` : '';
  const correction = form.watch(`${prefix}correction`);

  const EyeRefractionFields = ({
    eye,
    label,
    withCorrection = false,
  }: {
    eye: 'od' | 'og';
    label: string;
    withCorrection?: boolean;
  }) => (
    <div className="space-y-3 rounded-md border border-border p-4">
      <Label className="text-sm font-medium">{label}</Label>

      {/* Base Refraction (Sans Correction) */}
      <div>
        <p className="mb-3 text-xs font-semibold text-muted-foreground">
          Sans Correction
        </p>
        <div className="grid grid-cols-4 gap-3">
          <FormField
            control={form.control}
            name={`${prefix}${eye}_sphere`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Sphère (D)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.25"
                    min="-20"
                    max="15"
                    placeholder="-20 à +15"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${prefix}${eye}_cylinder`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Cylindre (D)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.25"
                    min="-8"
                    max="8"
                    placeholder="-8 à +8"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${prefix}${eye}_axis`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Axe (°)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="180"
                    placeholder="0-180"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${prefix}${eye}_visual_acuity`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">AV</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    placeholder="0-10"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Avec Correction Fields (conditional) */}
      {withCorrection && (
        <div className="border-t border-border pt-3">
          <p className="mb-3 text-xs font-semibold text-muted-foreground">
            Avec Correction
          </p>
          <div className="grid grid-cols-4 gap-3">
            <FormField
              control={form.control}
              name={`${prefix}${eye}_sphere_avec_correction`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Sphère (D)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.25"
                      min="-20"
                      max="15"
                      placeholder="-20 à +15"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${prefix}${eye}_cylinder_avec_correction`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Cylindre (D)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.25"
                      min="-8"
                      max="8"
                      placeholder="-8 à +8"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${prefix}${eye}_axis_avec_correction`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Axe (°)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="180"
                      placeholder="0-180"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${prefix}${eye}_visual_acuity_avec_correction`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">AV</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="0-10"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );

  const RetinoscopyFields = ({
    type,
    label,
  }: {
    type: 'retino' | 'cyclo';
    label: string;
  }) => (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-muted-foreground">
        {label}
      </Label>

      {/* OD */}
      <div className="space-y-2">
        <Label className="text-xs">OD (Droit)</Label>
        <div className="grid grid-cols-3 gap-3">
          <FormField
            control={form.control}
            name={`${prefix}${type}_od_sphere`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Focale H</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.25"
                    min="-20"
                    max="15"
                    placeholder="Focale H"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${prefix}${type}_od_cylinder`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Focale V</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.25"
                    min="-8"
                    max="8"
                    placeholder="Focale V"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${prefix}${type}_od_axis`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Axe H (°)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="180"
                    placeholder="Axe H"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* OG */}
      <div className="space-y-2">
        <Label className="text-xs">OG (Gauche)</Label>
        <div className="grid grid-cols-3 gap-3">
          <FormField
            control={form.control}
            name={`${prefix}${type}_og_sphere`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Focale H</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.25"
                    min="-20"
                    max="15"
                    placeholder="Focale H"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${prefix}${type}_og_cylinder`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Focale V</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.25"
                    min="-8"
                    max="8"
                    placeholder="Focale V"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${prefix}${type}_og_axis`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Axe H (°)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="180"
                    placeholder="Axe H"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );

  return (
    <section className="space-y-4">
      <div className="border-b border-border pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Réfraction
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Sphère (-20 à +15 D), Cylindre (-8 à +8 D), Axe (0-180°)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="correction" className="text-xs font-medium">
              Avec Correction
            </Label>
            <FormField
              control={form.control}
              name={`${prefix}correction`}
              render={({ field }) => (
                <FormControl>
                  <Switch
                    id="correction"
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              )}
            />
          </div>
        </div>
      </div>

      {/* Main Refraction by Eye */}
      <div className="space-y-4">
        <EyeRefractionFields
          eye="od"
          label="OD (Oeil Droit)"
          withCorrection={correction}
        />
        <EyeRefractionFields
          eye="og"
          label="OG (Oeil Gauche)"
          withCorrection={correction}
        />
      </div>

      {/* Binocular Visual Acuity (Avec Correction if applicable) */}
      {correction && (
        <div className="rounded-md border border-border p-4">
          <Label className="text-sm font-medium text-muted-foreground">
            Acuité Visuelle Binoculaire
          </Label>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`${prefix}odg_visual_acuity_avec_correction`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    OD + OG Avec Correction
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="0-10"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}

      {/* Retinoscopy Tabs */}
      <Tabs defaultValue="standard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="standard">Rétinoscopie Standard</TabsTrigger>
          <TabsTrigger value="cycloplegic">
            Rétinoscopie Cycloplégique
          </TabsTrigger>
        </TabsList>
        <TabsContent value="standard" className="mt-4">
          <RetinoscopyFields type="retino" label="Standard" />
        </TabsContent>
        <TabsContent value="cycloplegic" className="mt-4">
          <RetinoscopyFields type="cyclo" label="Cycloplégique" />
        </TabsContent>
      </Tabs>

      {/* Pupillary Distance */}
      <div className="max-w-xs">
        <FormField
          control={form.control}
          name={`${prefix}dp`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">
                Distance Pupillaire (DP)
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.5"
                  min="40"
                  max="80"
                  placeholder="40-80 mm"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </section>
  );
}
