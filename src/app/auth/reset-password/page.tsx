import { Suspense } from 'react';

import { AuthShell } from '@/features/auth/components/auth-shell';
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Nouveau mot de passe"
      subtitle="Choisissez un mot de passe sécurisé pour votre compte"
    >
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
