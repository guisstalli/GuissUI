'use client';

import { AppShell as Shell } from '@/app/_shell';
import { Can } from '@/components/ui/can';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessagesLog } from '@/features/agent-channels/components/messages-log';
import { SenderCreateDialog } from '@/features/agent-channels/components/sender-create-dialog';
import { SendersTable } from '@/features/agent-channels/components/senders-table';

/**
 * Gestion des canaux de l'assistant IA (WhatsApp, email) : qui peut discuter
 * avec l'agent, avec quels droits — sans passer par le Django admin.
 */
export default function CanauxAssistantPage() {
  return (
    <Can permission="admin:agent-channels">
      <Shell title="Canaux de l'assistant IA">
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Identités autorisées</CardTitle>
              <SenderCreateDialog />
            </CardHeader>
            <CardContent>
              <SendersTable />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Journal des messages</CardTitle>
            </CardHeader>
            <CardContent>
              <MessagesLog />
            </CardContent>
          </Card>
        </div>
      </Shell>
    </Can>
  );
}
