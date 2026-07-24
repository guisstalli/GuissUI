'use client';

import { AppShell as Shell } from '@/app/_shell';
import { CapabilityGate } from '@/features/administration/components/capability-gate';
import { SecurityLogViewer } from '@/features/administration/components/security-log-viewer';
import { CAPABILITY } from '@/lib/capabilities';

export default function AdministrationSecurityPage() {
  return (
    <Shell title="Journal de sécurité">
      <CapabilityGate capability={CAPABILITY.SECURITY_AUDIT_VIEW}>
        <SecurityLogViewer />
      </CapabilityGate>
    </Shell>
  );
}
