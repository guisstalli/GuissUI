'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button/button';
import { paths } from '@/config/paths';
import { useLogin } from '@/lib/auth';
import { cn } from '@/utils/cn';

import { LoginSchema, type LoginInput } from '../types/schemas';

const inputCx =
  'h-11 w-full rounded-lg border border-white/10 bg-white/[0.04] pl-10 pr-3 text-sm text-white placeholder:text-slate-500 transition-colors focus:border-cyan-400/60 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-cyan-400/30';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useLogin({
    onSuccess: () => {
      const safePath =
        returnTo?.startsWith('/') ? returnTo : paths.home.getHref();
      router.push(safePath);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    const result = await login(data.email, data.password);
    if (result?.error) {
      setServerError('Identifiants incorrects. Veuillez réessayer.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Email */}
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

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="block text-xs font-medium text-slate-300"
          >
            Mot de passe
          </label>
          <Link
            href={paths.auth.forgotPassword.getHref()}
            className="text-xs text-cyan-400 transition-colors hover:text-cyan-300"
          >
            Mot de passe oublié ?
          </Link>
        </div>
        <div className="relative">
          <Lock
            aria-hidden
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500"
          />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={errors.password ? true : undefined}
            className={cn(
              inputCx,
              'pr-10',
              errors.password && 'border-red-500/60',
            )}
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
        disabled={isSubmitting}
        className="h-11 w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-sm font-semibold text-white shadow-[0_0_24px_rgba(34,211,238,0.35)] transition-all hover:from-cyan-400 hover:to-blue-500 hover:shadow-[0_0_32px_rgba(34,211,238,0.55)]"
      >
        {isSubmitting ? 'Connexion…' : 'Se connecter'}
      </Button>
    </form>
  );
}
