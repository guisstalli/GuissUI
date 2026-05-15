import { AuthShell } from '@/features/auth/components/auth-shell';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Mot de passe oublié"
      subtitle="Saisissez votre adresse e-mail pour recevoir un lien de réinitialisation"
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
