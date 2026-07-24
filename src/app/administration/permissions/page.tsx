'use client';

import { AppShell as Shell } from '@/app/_shell';
import { CapabilityGate } from '@/features/administration/components/capability-gate';
import { PermissionGroupsManager } from '@/features/administration/components/permission-groups-manager';
import { CAPABILITY } from '@/lib/capabilities';

export default function AdministrationPermissionsPage() {
  return (
    <Shell title="Gestion des permissions">
      <CapabilityGate capability={CAPABILITY.PERMISSIONS_MANAGE}>
        <PermissionGroupsManager />
      </CapabilityGate>
    </Shell>
  );
}
