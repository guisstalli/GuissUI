import { Badge } from '@/components/ui/badge';

import { PROPOSAL_STATUS_LABELS, type ProposalStatus } from '../types';

const variantMap: Record<
  ProposalStatus,
  'default' | 'outline' | 'destructive' | 'secondary'
> = {
  pending: 'secondary',
  applied: 'default',
  rejected: 'destructive',
  quarantined: 'outline',
  stale: 'outline',
};

interface ProposalStatusBadgeProps {
  status: string;
}

export function ProposalStatusBadge({ status }: ProposalStatusBadgeProps) {
  const s = status as ProposalStatus;
  const label = PROPOSAL_STATUS_LABELS[s] ?? status;
  const variant = variantMap[s] ?? 'outline';
  return <Badge variant={variant}>{label}</Badge>;
}
