'use client';

import React, { useId } from 'react';

import type { LucideIcon } from 'lucide-react';

import { DataState, type DataStateProps } from '../DataState';
import { IconChip } from '../IconChip';
import { Help, SectionTitle } from '../Text';
import { componentMarker } from '../component-marker';

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
  /** MAIR-1114: icon chip (IconChip l, neutral) left of the title and description. */
  icon?: LucideIcon;
  /** MAIR-1114: the panel fills the height of its grid row; the content stretches so its actions sit at the bottom. */
  fill?: boolean;
  /** MAIR-1260: a rule under the header (the artifacts' dashboard panels). */
  divider?: boolean;
  children?: React.ReactNode;
}

/**
 * Page block with a header (title, description, action) and content; states through DataState (MAIR-608, Figma `Base/Panel`).
 * MAIR-1114: radius 16 (`--mairie-radius-xl`) in every state, optional icon chip and `fill`.
 */
export const Panel = ({ title, description, action, state = 'default', stateProps, flush = false, icon, fill = false, divider = false, children, className = '', style, ...props }: PanelProps) => {
  const titleId = useId();
  const heading = (
    <div className="min-w-0">
      <SectionTitle id={titleId}>{title}</SectionTitle>
      {description && <Help className="mt-0.5">{description}</Help>}
    </div>
  );
  const body = fill ? 'flex flex-1 flex-col' : '';
  return (
    <section {...props} {...componentMarker('Panel', props)} aria-labelledby={titleId} aria-busy={state === 'loading' || undefined} data-state={state} data-fill={fill || undefined}
      className={`flex flex-col border border-[var(--mairie-border)] bg-[var(--mairie-surface)] text-[var(--mairie-text)] ${fill ? 'h-full' : ''} ${className}`.replace(/\s+/g, ' ').trim()} style={{ borderRadius: 'var(--mairie-radius-xl)', ...style }}>
      <header data-divider={divider || undefined} className={`flex items-start justify-between gap-4 px-5 pt-4 ${divider ? 'mb-4 border-b border-[var(--mairie-border)]' : ''}`.trim()} style={{ paddingBottom: 'var(--mairie-space-m)' }}>
        {icon ? <div className="flex min-w-0 items-center" style={{ gap: 12 }}><IconChip icon={icon} size="l" />{heading}</div> : heading}
        {action && <div className="shrink-0">{action}</div>}
      </header>
      {state === 'default' ? <div className={`${flush ? '' : 'px-5 pb-5'} ${body}`.trim()}>{children}</div> : <div className={`px-5 pb-5 ${body}`.trim()}><DataState size="s" {...stateProps} state={state} /></div>}
    </section>
  );
};
