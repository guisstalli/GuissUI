'use client';

import { Check, ChevronsUpDown, Loader2, Plus, MapPin } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { useSites } from '../api';

import { SiteFormModal } from './site-form-modal';

interface SiteSelectorProps {
  value?: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  className?: string;
}

export const SiteSelector = ({
  value,
  onChange,
  placeholder = 'Sélectionnez un site...',
  className,
}: SiteSelectorProps) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  // Fetch sites based on search
  const { data, isLoading } = useSites({
    params: { search: search || undefined, limit: 10 },
  });

  const sites = data?.results ?? [];
  const selectedSite = sites.find((site) => site.id === value);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn('w-full justify-between', className)}
          >
            <div className="flex items-center gap-2 truncate">
              <MapPin className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">
                {selectedSite ? selectedSite.libelle : placeholder}
              </span>
            </div>
            {isLoading ? (
              <Loader2 className="size-4 shrink-0 animate-spin opacity-50" />
            ) : (
              <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Rechercher un site..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>
                <p className="p-4 text-center text-sm">Aucun site trouvé.</p>
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-none border-t px-4 py-2 text-primary"
                  onClick={() => {
                    setShowCreateModal(true);
                    setOpen(false);
                  }}
                >
                  <Plus className="mr-2 size-4" />
                  Créer &quot;{search}&quot;
                </Button>
              </CommandEmpty>
              <CommandGroup>
                {sites.map((site) => (
                  <CommandItem
                    key={site.id}
                    value={String(site.id)}
                    onSelect={() => {
                      onChange(site.id === value ? null : (site.id ?? null));
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 size-4',
                        value === site.id ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{site.libelle}</span>
                      <span className="text-xs text-muted-foreground">
                        {site.code}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <SiteFormModal open={showCreateModal} onOpenChange={setShowCreateModal} />
    </>
  );
};
