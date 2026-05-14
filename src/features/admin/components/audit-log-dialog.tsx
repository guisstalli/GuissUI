'use client';

import { Clock, Globe, Info, Shield } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog/dialog';
import { Spinner } from '@/components/ui/spinner/spinner';

import { useAuditLog } from '../api/get-audit-log';
import type { UserListItem } from '../types/schemas';

interface AuditLogDialogProps {
  user: UserListItem;
  trigger: React.ReactElement;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(iso));
}

export function AuditLogDialog({ user, trigger }: AuditLogDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: logs, isLoading } = useAuditLog(open ? user.id : 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="flex max-h-[80vh] max-w-lg flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="size-4" aria-hidden="true" />
            Journal d&apos;audit — {user.email}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex justify-center py-8">
              <Spinner size="md" />
            </div>
          )}

          {!isLoading && (!logs || logs.length === 0) && (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <Info className="size-8" aria-hidden="true" />
              <p className="text-sm">Aucune entrée dans le journal</p>
            </div>
          )}

          {logs && logs.length > 0 && (
            <ol className="space-y-3 p-1">
              {[...logs].reverse().map((log, i) => (
                <li
                  key={i}
                  className="bg-muted/30 rounded-lg border px-4 py-3 text-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-foreground">
                      {log.event}
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" aria-hidden="true" />
                      {formatDate(log.created_at)}
                    </span>
                  </div>
                  {log.ip_address && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Globe className="size-3" aria-hidden="true" />
                      {log.ip_address}
                    </div>
                  )}
                  {Object.keys(log.metadata).length > 0 && (
                    <pre className="mt-2 overflow-x-auto rounded bg-muted p-2 text-xs">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="border-t pt-3">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
