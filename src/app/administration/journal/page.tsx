'use client';

import { AppShell as Shell } from '@/app/_shell';
import { AuditTrailViewer } from '@/features/administration/components/audit-trail-viewer';
import { CapabilityGate } from '@/features/administration/components/capability-gate';
import { CAPABILITY } from '@/lib/capabilities';

/**
 * Journal des modifications — qui a modifié quel champ, quand, depuis quelle IP.
 *
 * Page DISTINCTE de `/administration/securite`, qui répond à une autre
 * question : qui a CONSULTÉ quel dossier. Les deux journaux ont des sources
 * différentes (auditlog `LogEntry` d'un côté, `SecurityAuditLog` de l'autre)
 * et des volumétries sans rapport ; les fusionner en onglets rendrait les
 * filtres de l'un inopérants sur l'autre.
 */
export default function AdministrationJournalPage() {
  return (
    <Shell title="Journal des modifications">
      <CapabilityGate capability={CAPABILITY.SECURITY_AUDIT_VIEW}>
        <AuditTrailViewer />
      </CapabilityGate>
    </Shell>
  );
}
