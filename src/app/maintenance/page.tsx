'use client';

import { Construction, ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-amber-100">
            <Construction className="size-8 text-amber-600" />
          </div>
          <CardTitle className="text-2xl">
            Fonctionnalité en maintenance
          </CardTitle>
          <CardDescription>
            Cette section est temporairement indisponible pendant que nous
            effectuons des améliorations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Seule la gestion des utilisateurs est actuellement disponible. Les
            autres fonctionnalités seront bientôt de retour.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/users">
              <Button className="w-full">
                <Users className="mr-2 size-4" />
                Aller à la gestion des utilisateurs
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 size-4" />
                Retour à l&apos;accueil
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
