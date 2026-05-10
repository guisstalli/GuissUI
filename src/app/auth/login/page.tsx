import { Suspense } from 'react';

import { LoginForm } from '@/features/auth/components/login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">GUISS</h1>
          <p className="text-sm text-muted-foreground">
            Connectez-vous à votre compte
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
