import React from 'react';
import { type LucideIcon } from 'lucide-react';

import { joinClasses } from './calendar/style';

export interface ElearningStatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  iconColor?: string;
}

export const ElearningStatCard = ({
  label,
  value,
  icon: Icon,
  iconColor = '#1256a6',
  className = '',
  ...props
}: ElearningStatCardProps) => (
  <div
    className={joinClasses(
      'flex min-h-[94px] items-center rounded-lg border border-[#d8d2ca] bg-white px-5 text-[#2f3747]',
      className
    )}
    {...props}
  >
    {Icon && (
      <Icon
        aria-hidden="true"
        className="mr-3 size-5 shrink-0"
        color={iconColor}
        strokeWidth={2}
      />
    )}
    <div className="min-w-0">
      <div className="truncate text-sm font-semibold leading-5">{label}</div>
      <div className="text-2xl font-bold leading-7">{value}</div>
    </div>
  </div>
);
