import React from 'react';
import { Plus } from 'lucide-react';

import { joinClasses } from './calendar/style';
import type { PageTitleBarProps } from './calendar/types';

export type { PageTitleBarProps } from './calendar/types';

export const PageTitleBar = ({
  title,
  subtitle,
  actionLabel,
  actionIcon,
  action,
  onAction,
  className = '',
  ...props
}: PageTitleBarProps) => (
  <div
    className={joinClasses('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}
    {...props}
  >
    <div className="min-w-0">
      <h1 className="text-2xl font-bold leading-8 text-[#172033]">{title}</h1>
      {subtitle && <p className="mt-0.5 text-base leading-6 text-[#5f6770]">{subtitle}</p>}
    </div>

    {action ||
      (actionLabel && (
        <button
          type="button"
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-[#1256a6] px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#0f4a8d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/35"
          onClick={onAction}
        >
          {actionIcon || <Plus className="h-4 w-4" />}
          <span>{actionLabel}</span>
        </button>
      ))}
  </div>
);
