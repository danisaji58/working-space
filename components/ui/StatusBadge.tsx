import React from 'react';
import { ReservationStatus } from '@/types/api';
import { getStatusConfig, cn } from '@/lib/utils';

export interface StatusBadgeProps {
  status: ReservationStatus;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({ status, className, showDot = true }: StatusBadgeProps) {
  const config = getStatusConfig(status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border select-none',
        config.badgeClass,
        className
      )}
    >
      {showDot && (
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dotClass)} />
      )}
      <span>{config.label}</span>
    </span>
  );
}
