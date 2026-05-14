'use client';

import { AppShell as Shell } from '@/app/_shell';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card/card';
import { Spinner } from '@/components/ui/spinner/spinner';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs/tabs';
import { useGetMe } from '@/features/users/api/get-me';
import { ChangeEmailForm } from '@/features/users/components/change-email-form';
import { ChangePasswordForm } from '@/features/users/components/change-password-form';
import { ProfileHeader } from '@/features/users/components/profile-header';
import { ProfileInfoForm } from '@/features/users/components/profile-info-form';

export default function ProfilPage() {
  const { data: user, isLoading, isError } = useGetMe();

  if (isLoading) {
    return (
      <Shell title="Mon profil">
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="text-center">
            <Spinner size="lg" className="mx-auto" />
            <p className="mt-4 text-sm text-muted-foreground">
              Chargement du profil...
            </p>
          </div>
        </div>
      </Shell>
    );
  }

  if (isError || !user) {
    return (
      <Shell title="Mon profil">
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-sm text-destructive">
            Impossible de charger le profil. Veuillez réessayer.
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell title="Mon profil">
      <div className="space-y-6">
        <ProfileHeader user={user} />

        <Tabs defaultValue="informations">
          <TabsList>
            <TabsTrigger value="informations">Informations</TabsTrigger>
            <TabsTrigger value="securite">Sécurité</TabsTrigger>
          </TabsList>

          {/* Tab: Informations */}
          <TabsContent value="informations" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Modifiez vos informations de profil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileInfoForm user={user} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Sécurité */}
          <TabsContent value="securite" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Mot de passe</CardTitle>
                <CardDescription>
                  Changez votre mot de passe de connexion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChangePasswordForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Adresse e-mail</CardTitle>
                <CardDescription>
                  Modifiez votre adresse email — un code de vérification sera
                  envoyé
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChangeEmailForm currentEmail={user.email} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  );
}
