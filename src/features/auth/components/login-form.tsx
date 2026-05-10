'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button/button';
import { InputRHF } from '@/components/ui/form/input';
import { paths } from '@/config/paths';
import { useLogin } from '@/lib/auth';

import { LoginSchema, type LoginInput } from '../types/schemas';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const [serverError, setServerError] = useState<string | null>(null);

  const { login } = useLogin({
    onSuccess: () => {
      router.push(returnTo ?? paths.home.getHref());
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InputRHF
        label="Adresse e-mail"
        type="email"
        autoComplete="email"
        registration={register('email')}
        error={errors.email}
      />

      <InputRHF
        label="Mot de passe"
        type="password"
        autoComplete="current-password"
        registration={register('password')}
        error={errors.password}
      />

      {serverError && (
        <p className="text-sm text-destructive" role="alert">
          {serverError}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Connexion…' : 'Se connecter'}
      </Button>
    </form>
  );
}
