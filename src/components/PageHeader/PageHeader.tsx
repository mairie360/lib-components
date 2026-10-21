'use client';

import React from 'react';

import { CurrentDate } from '../CurrentDate';
import { Help, PageTitle } from '../Text';

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title' | 'children'> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Shows today's date (instance time zone) on the right, before the actions. */
  showDate?: boolean;
  /** Right side: preset buttons (`CreateButton`…). */
  actions?: React.ReactNode;
}

/** Top of a page: h1 and subtitle, today's date and actions on the right (MAIR-608, Figma `Base/PageHeader`). */
export const PageHeader = ({ title, subtitle, showDate = false, actions, className = '', ...props }: PageHeaderProps) => (
  <header {...props} data-variant={actions ? 'with-actions' : showDate ? 'with-date' : 'default'} className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${className}`.trim()}>
    <div className="min-w-0">
      <PageTitle>{title}</PageTitle>
      {subtitle && <Help size="m" className="mt-0.5">{subtitle}</Help>}
    </div>
    {(showDate || actions) && (
      <div className="flex shrink-0 flex-wrap items-center gap-3">
        {showDate && <CurrentDate className="block text-[var(--mairie-muted)]" style={{ fontSize: 'var(--mairie-text-s)' }} />}
        {actions}
      </div>
    )}
  </header>
);
