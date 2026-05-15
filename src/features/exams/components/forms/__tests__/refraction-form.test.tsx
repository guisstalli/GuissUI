import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';

import { RefractionSchema } from '@/features/exams/types/schemas';

import { RefractionForm } from '../refraction-form';

type FormValues = z.infer<typeof RefractionSchema>;

function RefractionFormWrapper({
  defaultValues,
  onValuesChange,
}: {
  defaultValues?: Partial<FormValues>;
  onValuesChange?: (values: FormValues) => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(RefractionSchema),
    defaultValues: {
      correction: false,
      od_sphere: null,
      od_cylinder: null,
      od_axis: null,
      od_visual_acuity: null,
      og_sphere: null,
      og_cylinder: null,
      og_axis: null,
      og_visual_acuity: null,
      od_sphere_avec_correction: -1.5,
      od_cylinder_avec_correction: -0.5,
      od_axis_avec_correction: 90,
      od_visual_acuity_avec_correction: 0.8,
      og_sphere_avec_correction: -2.0,
      og_cylinder_avec_correction: -0.75,
      og_axis_avec_correction: 180,
      og_visual_acuity_avec_correction: 0.7,
      odg_visual_acuity_avec_correction: 0.6,
      ...defaultValues,
    },
  });

  React.useEffect(() => {
    const subscription = form.watch((values) => {
      onValuesChange?.(values as FormValues);
    });
    return () => subscription.unsubscribe();
  }, [form, onValuesChange]);

  return (
    <FormProvider {...form}>
      <form>
        <RefractionForm />
      </form>
    </FormProvider>
  );
}

describe('RefractionForm — useEffect cleanup (W3-BUG-4 regression)', () => {
  it('clears avec-correction fields when correction switch is turned off', async () => {
    const capturedValues: FormValues[] = [];
    const onValuesChange = vi.fn((v: FormValues) =>
      capturedValues.push({ ...v }),
    );

    render(
      <RefractionFormWrapper
        defaultValues={{ correction: true }}
        onValuesChange={onValuesChange}
      />,
    );

    const switchEl = screen.getAllByRole('switch')[0];
    await userEvent.click(switchEl);

    const lastValues = capturedValues[capturedValues.length - 1];
    expect(lastValues?.correction).toBe(false);
    expect(lastValues?.od_sphere_avec_correction).toBeNull();
    expect(lastValues?.od_cylinder_avec_correction).toBeNull();
    expect(lastValues?.od_axis_avec_correction).toBeNull();
    expect(lastValues?.od_visual_acuity_avec_correction).toBeNull();
    expect(lastValues?.og_sphere_avec_correction).toBeNull();
    expect(lastValues?.og_cylinder_avec_correction).toBeNull();
    expect(lastValues?.og_axis_avec_correction).toBeNull();
    expect(lastValues?.og_visual_acuity_avec_correction).toBeNull();
    expect(lastValues?.odg_visual_acuity_avec_correction).toBeNull();
  });

  it('does not clear avec-correction fields when correction is already true (toggle off then back on)', async () => {
    const capturedValues: FormValues[] = [];
    const onValuesChange = vi.fn((v: FormValues) =>
      capturedValues.push({ ...v }),
    );

    render(
      <RefractionFormWrapper
        defaultValues={{ correction: true }}
        onValuesChange={onValuesChange}
      />,
    );

    const switchEl = screen.getAllByRole('switch')[0];

    // Turn off → fields cleared
    await userEvent.click(switchEl);

    // Turn back on → fields should NOT be cleared by the effect
    await userEvent.click(switchEl);

    const lastValues = capturedValues[capturedValues.length - 1];
    expect(lastValues?.correction).toBe(true);
    // avec-correction fields remain null (cleared when turning off) — effect doesn't re-clear them
    expect(lastValues?.od_sphere_avec_correction).toBeNull();
  });
});
