import React from 'react';
import { Plus } from 'lucide-react';

import { joinClasses } from './shared/classes';

export interface PageTitleBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  action?: React.ReactNode;
  onAction?: () => void;
}


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
      <h1 className="text-2xl font-bold leading-8 text-[var(--mairie-text)]">{title}</h1>
      {subtitle && <p className="mt-0.5 text-base leading-6 text-[var(--mairie-muted)]">{subtitle}</p>}
    </div>

    {action ||
      (actionLabel && (
        <button
          type="button"
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-[var(--mairie-action-background)] px-4 text-sm font-medium text-[var(--mairie-on-action)] shadow-sm transition-colors hover:bg-[var(--mairie-action-hover-background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/35"
          onClick={onAction}
        >
          {actionIcon || <Plus className="h-4 w-4" />}
          <span>{actionLabel}</span>
        </button>
      ))}
  </div>
);
