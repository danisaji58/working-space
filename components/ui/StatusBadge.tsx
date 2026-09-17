import React from 'react';
import { ReservationStatus } from '@/types/api';
import { getStatusConfig, cn } from '@/lib/utils';

export interface StatusBadgeProps {
  status: ReservationStatus;
  className?: string;
}

export function StatusBadge({ status, className,}: StatusBadgeProps) {
  const config = getStatusConfig(status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border select-none',
        config.badgeClass,
        className
      )}
    >
      <span>{config.label}</span>
    </span>
  );
}
