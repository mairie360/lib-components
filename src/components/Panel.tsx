'use client';

import React, { useId } from 'react';

import { DataState, type DataStateProps } from './DataState';
import { Help, SectionTitle } from './Text';

export type PanelState = 'default' | 'loading' | 'empty' | 'unavailable';
export interface PanelProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title' | 'children'> {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Right side of the header (a preset button, a link…). */
  action?: React.ReactNode;
  /** `loading`, `empty` and `unavailable` replace the content with a DataState. */
  state?: PanelState;
  /** Props of the DataState shown for the non-default states (title, description, action, onRetry). */
  stateProps?: Partial<Omit<DataStateProps, 'state'>>;
  /** No inner padding: tables and lists fill the panel. */
  flush?: boolean;
  children?: React.ReactNode;
}

/** Page block with a header (title, description, action) and content; states through DataState (MAIR-608, Figma `Base/Panel`). */
export const Panel = ({ title, description, action, state = 'default', stateProps, flush = false, children, className = '', ...props }: PanelProps) => {
  const titleId = useId();
  return (
    <section {...props} aria-labelledby={titleId} aria-busy={state === 'loading' || undefined} data-state={state}
      className={`flex flex-col rounded-lg border border-[var(--mairie-border)] bg-[var(--mairie-surface)] text-[var(--mairie-text)] ${className}`.trim()} style={{ borderRadius: 'var(--mairie-radius-l)' }}>
      <header className="flex items-start justify-between gap-4 px-5 pt-4" style={{ paddingBottom: 'var(--mairie-space-m)' }}>
        <div className="min-w-0">
          <SectionTitle id={titleId}>{title}</SectionTitle>
          {description && <Help className="mt-0.5">{description}</Help>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      {state === 'default' ? <div className={flush ? '' : 'px-5 pb-5'}>{children}</div> : <div className="px-5 pb-5"><DataState size="s" {...stateProps} state={state} /></div>}
    </section>
  );
};
