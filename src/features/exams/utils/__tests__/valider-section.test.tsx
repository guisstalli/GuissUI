import { zodResolver } from '@hookform/resolvers/zod';
import { renderHook, act } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import * as z from 'zod';

import { validerSection } from '../valider-section';

/**
 * Prod, 17/09/2026 (Sentry GUISSAPI-17 et GUISSAPI-N). Les écrans d'examen
 * lisaient leurs valeurs avec `getValues()` et enregistraient directement :
 * les règles du formulaire ne s'exécutaient JAMAIS. Un cylindre hors bornes et
 * un nystagmus sans œil affecté partaient donc au serveur, qui les refusait.
 */
const schema = z.object({
  refraction: z.object({
    og_cylinder: z.coerce.number().min(-8).max(8).nullable(),
  }),
  plaintes: z
    .object({
      nystagmus: z.boolean(),
      nystagmus_eye: z.enum(['od', 'og', 'odg']).nullable(),
    })
    .refine((d) => !d.nystagmus || !!d.nystagmus_eye, {
      message: "Précisez l'œil affecté",
      path: ['nystagmus_eye'],
    }),
});

const monterFormulaire = (valeurs: z.input<typeof schema>) =>
  renderHook(() =>
    useForm({ resolver: zodResolver(schema), defaultValues: valeurs }),
  ).result;

describe('validerSection', () => {
  it('laisse passer une section valide', async () => {
    const form = monterFormulaire({
      refraction: { og_cylinder: 2 },
      plaintes: { nystagmus: false, nystagmus_eye: null },
    });
    const signaler = vi.fn();

    let ok = false;
    await act(async () => {
      ok = await validerSection(form.current, ['refraction'], signaler);
    });

    expect(ok).toBe(true);
    expect(signaler).not.toHaveBeenCalled();
  });

  it('bloque un cylindre hors bornes et signale le champ', async () => {
    const form = monterFormulaire({
      refraction: { og_cylinder: 12 },
      plaintes: { nystagmus: false, nystagmus_eye: null },
    });
    const signaler = vi.fn();

    let ok = true;
    await act(async () => {
      ok = await validerSection(form.current, ['refraction'], signaler);
    });

    expect(ok).toBe(false);
    expect(signaler).toHaveBeenCalledOnce();
    expect(signaler.mock.calls[0][0]).toMatch(/8/);
  });

  it('bloque un nystagmus sans œil affecté', async () => {
    const form = monterFormulaire({
      refraction: { og_cylinder: 0 },
      plaintes: { nystagmus: true, nystagmus_eye: null },
    });
    const signaler = vi.fn();

    let ok = true;
    await act(async () => {
      ok = await validerSection(form.current, ['plaintes'], signaler);
    });

    expect(ok).toBe(false);
    expect(signaler.mock.calls[0][0]).toMatch(/œil affecté/i);
  });

  it("ne bloque pas sur une section qu'on n'enregistre pas", async () => {
    // Un examen se remplit section par section : une plainte incomplète ne
    // doit pas empêcher d'enregistrer la réfraction.
    const form = monterFormulaire({
      refraction: { og_cylinder: 1 },
      plaintes: { nystagmus: true, nystagmus_eye: null },
    });
    const signaler = vi.fn();

    let ok = false;
    await act(async () => {
      ok = await validerSection(form.current, ['refraction'], signaler);
    });

    expect(ok).toBe(true);
  });
});
