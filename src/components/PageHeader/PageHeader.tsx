'use client';

import React from 'react';

import { CurrentDate } from '../CurrentDate';
import { Help, PageTitle, Text } from '../Text';
import { componentMarker } from '../component-marker';

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title' | 'children'> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Shows today's date (instance time zone) on the right, before the actions. */
  showDate?: boolean;
  /** Right side: preset buttons (`CreateButton`…). */
  actions?: React.ReactNode;
  /**
   * MAIR-1113: `default` (PageTitle 20 px) or `welcome` (« Bonjour Marie »: 34 px bold title, -2 % letter
   * spacing, 14 px muted subtitle 2 px below; the charte's one exception to the 20 px limit). Still the page's single h1.
   */
  variant?: 'default' | 'welcome';
}

/** Top of a page: h1 and subtitle, today's date and actions on the right (MAIR-608, Figma `Base/PageHeader`). */
export const PageHeader = ({ title, subtitle, showDate = false, actions, variant = 'default', className = '', ...props }: PageHeaderProps) => (
  <header {...props} {...componentMarker('PageHeader', props)} data-variant={variant === 'welcome' ? 'welcome' : actions ? 'with-actions' : showDate ? 'with-date' : 'default'} className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${className}`.trim()}>
    {variant === 'welcome' ? (
      <div className="min-w-0">
        <Text as="h1" weight="bold" data-preset="WelcomeTitle" style={{ fontSize: 34, lineHeight: 1.15, letterSpacing: '-0.02em' }}>{title}</Text>
        {subtitle && <Help size="s" style={{ marginTop: 2 }}>{subtitle}</Help>}
      </div>
    ) : (
      <div className="min-w-0">
        <PageTitle>{title}</PageTitle>
        {subtitle && <Help size="m" className="mt-0.5">{subtitle}</Help>}
      </div>
    )}
    {(showDate || actions) && (
      <div className="flex shrink-0 flex-wrap items-center gap-3">
        {showDate && <CurrentDate className="block text-[var(--mairie-muted)]" style={{ fontSize: 'var(--mairie-text-s)' }} />}
        {actions}
      </div>
    )}
  </header>
);
