'use client';

import { AppShell as Shell } from '@/app/_shell';
import { CapabilityGate } from '@/features/administration/components/capability-gate';
import { AiInsightsPanel } from '@/features/ai-insights/components/ai-insights-panel';
import { CAPABILITY } from '@/lib/capabilities';

export default function AiInsightsProposalsPage() {
  return (
    <Shell title="Propositions d'insights IA">
      <CapabilityGate capability={CAPABILITY.ANALYTICS_ADMIN}>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            L&apos;agent IA propose des règles pour améliorer son comportement.{' '}
            <strong>Ces règles ne s&apos;appliquent jamais seules</strong> — un
            administrateur doit les examiner et les valider ici.
          </p>
          <AiInsightsPanel />
        </div>
      </CapabilityGate>
    </Shell>
  );
}
