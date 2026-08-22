import { Badge } from '@/components/ui/badge';

import { PROPOSAL_OPERATION_LABELS, type ProposalOperation } from '../types';

const variantMap: Record<
  ProposalOperation,
  'default' | 'outline' | 'destructive' | 'secondary'
> = {
  add: 'default',
  edit: 'secondary',
  remove: 'destructive',
  agree: 'outline',
};

interface ProposalOperationBadgeProps {
  operation: string;
}

export function ProposalOperationBadge({
  operation,
}: ProposalOperationBadgeProps) {
  const op = operation as ProposalOperation;
  const label = PROPOSAL_OPERATION_LABELS[op] ?? operation;
  const variant = variantMap[op] ?? 'outline';
  return <Badge variant={variant}>{label}</Badge>;
}
