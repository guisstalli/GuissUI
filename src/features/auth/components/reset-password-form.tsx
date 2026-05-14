'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button/button';
import { paths } from '@/config/paths';
import { cn } from '@/utils/cn';

import { useConfirmPasswordReset } from '../api/confirm-password-reset';
import { ResetPasswordSchema, type ResetPasswordInput } from '../types/schemas';

const inputCx =
  'h-11 w-full rounded-lg border border-white/10 bg-white/[0.04] pl-10 pr-10 text-sm text-white placeholder:text-slate-500 transition-colors focus:border-cyan-400/60 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-cyan-400/30';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const mutation = useConfirmPasswordReset({
    onSuccess: () => {
      router.push(`${paths.auth.login.getHref()}?reset=success`);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { token },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setServerError(null);
    try {
      await mutation.mutateAsync({
        token: data.token,
        new_password: data.password,
      });
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : 'Une erreur est survenue.',
      );
    }
  };

  if (!token) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
      >
        Lien de réinitialisation invalide. Veuillez recommencer la procédure.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <input type="hidden" {...register('token')} />

      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-xs font-medium text-slate-300"
        >
          Nouveau mot de passe
        </label>
        <div className="relative">
          <Lock
            aria-hidden
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500"
          />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            aria-invalid={errors.password ? true : undefined}
            className={cn(inputCx, errors.password && 'border-red-500/60')}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={
              showPassword
                ? 'Masquer le mot de passe'
                : 'Afficher le mot de passe'
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-400" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="confirmPassword"
          className="block text-xs font-medium text-slate-300"
        >
          Confirmer le mot de passe
        </label>
        <div className="relative">
          <Lock
            aria-hidden
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500"
          />
          <input
            id="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            aria-invalid={errors.confirmPassword ? true : undefined}
            className={cn(
              inputCx,
              errors.confirmPassword && 'border-red-500/60',
            )}
            {...register('confirmPassword')}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((s) => !s)}
            aria-label={
              showConfirm
                ? 'Masquer la confirmation'
                : 'Afficher la confirmation'
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
          >
            {showConfirm ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-red-400" role="alert">
            {errors.confirmPassword.message}
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
        {isSubmitting || mutation.isPending
          ? 'Réinitialisation…'
          : 'Réinitialiser le mot de passe'}
      </Button>
    </form>
  );
}
