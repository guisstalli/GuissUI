import * as z from 'zod';

import { FamilialEnum, TypeAddictionEnum } from './schemas';

/**
 * Antécédents d'un patient.
 *
 * Miroir de `Antecedents.clean()` (apps/depistage/models/patient.py) : dès
 * qu'une case est cochée, le serveur exige la précision correspondante. Ces
 * règles manquaient ici (audit du 17/09/2026) — l'enregistrement partait et
 * revenait en 400, sans champ désigné à l'écran.
 *
 * Sorti du composant pour être testable : le fichier du formulaire n'exportait
 * pas son schéma.
 */
export const medicalHistorySchema = z
  .object({
    has_antecedents: z.boolean().default(false),
    has_antecedents_medico_chirurgicaux: z.boolean(),
    antecedents_medico_chirurgicaux: z.array(z.string().max(255)),
    has_pathologie_ophtalmologique: z.boolean(),
    pathologie_ophtalmologique: z.array(z.string().max(255)),
    familial: z.array(FamilialEnum),
    autre_familial_detail: z.string().max(255).nullable().optional(),
    uses_screen: z.boolean().nullable(),
    screen_time_hours_per_day: z
      .number()
      .int()
      .min(0)
      .max(24)
      .nullable()
      .optional(),
    // Addictions (conducteurs)
    addiction: z.boolean().default(false),
    type_addiction: z.array(TypeAddictionEnum),
    autre_addiction_detail: z.string().max(255).nullable().optional(),
    tabagisme_detail: z.string().max(50).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    // Hors antécédent déclaré, le serveur remet tout à zéro : rien à exiger.
    if (!data.has_antecedents) return;

    const exiger = (path: string, message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });

    if (
      data.has_antecedents_medico_chirurgicaux &&
      data.antecedents_medico_chirurgicaux.length === 0
    ) {
      exiger(
        'antecedents_medico_chirurgicaux',
        'Précisez les antécédents médico-chirurgicaux',
      );
    }
    if (
      data.has_pathologie_ophtalmologique &&
      data.pathologie_ophtalmologique.length === 0
    ) {
      exiger(
        'pathologie_ophtalmologique',
        'Précisez les pathologies ophtalmologiques',
      );
    }
    if (data.uses_screen && data.screen_time_hours_per_day == null) {
      exiger(
        'screen_time_hours_per_day',
        "Précisez le nombre d'heures par jour",
      );
    }
    if (data.addiction) {
      if (data.type_addiction.length === 0) {
        exiger('type_addiction', "Précisez le ou les types d'addiction");
      }
      if (
        data.type_addiction.includes('AUTRES') &&
        !data.autre_addiction_detail?.trim()
      ) {
        exiger('autre_addiction_detail', "Précisez l'autre addiction");
      }
    }
  })
  .refine(
    (data) => {
      if (data.familial.includes('OTHER')) {
        return (
          data.autre_familial_detail &&
          data.autre_familial_detail.trim().length > 0
        );
      }
      return true;
    },
    {
      message: "Veuillez préciser l'antécédent familial",
      path: ['autre_familial_detail'],
    },
  );

export type MedicalHistoryFormValues = z.infer<typeof medicalHistorySchema>;
