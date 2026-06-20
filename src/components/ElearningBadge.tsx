import React from 'react';

import { joinClasses } from './calendar/style';

export type ElearningBadgeVariant =
  | 'default'
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'inProgress'
  | 'completed'
  | 'mandatory'
  | 'notStarted';

export interface ElearningBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string;
  variant?: ElearningBadgeVariant;
}

const badgeClasses: Record<ElearningBadgeVariant, string> = {
  default: 'border-[#d8d2ca] bg-white text-[#2f3747]',
  beginner: 'border-[#00a651] bg-white text-[#00a651]',
  intermediate: 'border-[#ff6b1a] bg-white text-[#ff6b1a]',
  advanced: 'border-[#ff1f3d] bg-white text-[#ff1f3d]',
  inProgress: 'border-[#4b908d] bg-[#4b908d] text-white',
  completed: 'border-[#00a651] bg-[#00a651] text-white',
  mandatory: 'border-[#c5323a] bg-[#c5323a] text-white',
  notStarted: 'border-[#d8d2ca] bg-[#f4f2ef] text-[#5f6470]',
};

export const ElearningBadge = ({
  label,
  variant = 'default',
  className = '',
  ...props
}: ElearningBadgeProps) => (
  <span
    className={joinClasses(
      'inline-flex h-[22px] items-center rounded-md border px-2 text-xs font-semibold leading-none',
      badgeClasses[variant],
      className
    )}
    {...props}
  >
    {label}
  </span>
);
