'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button/button';
import { paths } from '@/config/paths';
import { cn } from '@/utils/cn';

import { useRequestPasswordReset } from '../api/request-password-reset';
import {
  ForgotPasswordSchema,
  type ForgotPasswordInput,
} from '../types/schemas';

const inputCx =
  'h-11 w-full rounded-lg border border-white/10 bg-white/[0.04] pl-10 pr-3 text-sm text-white placeholder:text-slate-500 transition-colors focus:border-cyan-400/60 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-cyan-400/30';

export function ForgotPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const mutation = useRequestPasswordReset({
    onSuccess: () => setSubmitted(true),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setServerError(null);
    try {
      await mutation.mutateAsync(data);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : 'Une erreur est survenue.',
      );
    }
  };

  if (submitted) {
    return (
      <div className="space-y-5">
        <div
          role="status"
          className="rounded-lg border border-cyan-400/30 bg-cyan-400/5 px-4 py-3 text-sm text-cyan-100"
        >
          Si un compte est associé à cette adresse, un e-mail contenant les
          instructions de réinitialisation vient d&apos;être envoyé.
        </div>
        <Link
          href={paths.auth.login.getHref()}
          className="inline-flex items-center gap-2 text-sm text-cyan-400 transition-colors hover:text-cyan-300"
        >
          <ArrowLeft className="size-4" />
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-xs font-medium text-slate-300"
        >
          Adresse e-mail
        </label>
        <div className="relative">
          <Mail
            aria-hidden
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500"
          />
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="vous@example.com"
            aria-invalid={errors.email ? true : undefined}
            className={cn(inputCx, errors.email && 'border-red-500/60')}
            {...register('email')}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-400" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {serverError && (
        <div
          role="alert"
          className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
        >
          {serverError}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting || mutation.isPending}
        className="h-11 w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-sm font-semibold text-white shadow-[0_0_24px_rgba(34,211,238,0.35)] transition-all hover:from-cyan-400 hover:to-blue-500"
      >
        {isSubmitting || mutation.isPending ? 'Envoi…' : 'Envoyer le lien'}
      </Button>

      <div className="text-center">
        <Link
          href={paths.auth.login.getHref()}
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-slate-200"
        >
          <ArrowLeft className="size-4" />
          Retour à la connexion
        </Link>
      </div>
    </form>
  );
}
