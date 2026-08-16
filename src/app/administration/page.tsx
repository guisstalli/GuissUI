'use client';

import { AppShell as Shell } from '@/app/_shell';
import { AdminDashboard } from '@/features/administration/components/admin-dashboard';
import { CapabilityGate } from '@/features/administration/components/capability-gate';
import { CAPABILITY } from '@/lib/capabilities';

export default function AdministrationDashboardPage() {
  return (
    <Shell title="Administration">
      <CapabilityGate capability={CAPABILITY.ANALYTICS_ADMIN}>
        <AdminDashboard />
      </CapabilityGate>
    </Shell>
  );
}
