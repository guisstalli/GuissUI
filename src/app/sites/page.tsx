'use client';

import { Plus, Search } from 'lucide-react';
import { useState } from 'react';

import { Shell } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form';
import { SiteFormModal } from '@/features/sites/components/site-form-modal';
import { SitesTable } from '@/features/sites/components/sites-table';

export default function SitesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Shell title="Sites de dépistage">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un site par nom ou code..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="size-4" />
            Ajouter un site
          </Button>
        </div>

        <SitesTable search={searchQuery} />
      </div>

      <SiteFormModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </Shell>
  );
}
