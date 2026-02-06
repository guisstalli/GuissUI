'use client';

import { ShieldX, LogOut, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function UnauthorizedPage() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-100">
            <ShieldX className="size-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-900">
            Accès Non Autorisé
          </CardTitle>
          <CardDescription className="text-base">
            Vous n&apos;avez pas les permissions nécessaires pour accéder à
            cette page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
            <p className="font-medium">Pourquoi voyez-vous cette page ?</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-red-700">
              <li>Votre compte n&apos;a pas le rôle Administrateur</li>
              <li>Vos permissions ont peut-être été modifiées</li>
              <li>Vous essayez d&apos;accéder à une ressource restreinte</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 size-4" />
              Se déconnecter et changer de compte
            </Button>
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 size-4" />
                Retour à l&apos;accueil
              </Button>
            </Link>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur, contactez
            votre administrateur système.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
