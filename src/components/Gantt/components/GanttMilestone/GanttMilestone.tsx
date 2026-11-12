'use client';

import React from 'react';

import { componentMarker } from '../../../component-marker';
import { formatGanttDate, type GanttDate } from '../../gantt-dates';

export interface GanttMilestoneProps extends React.HTMLAttributes<HTMLSpanElement> {
  date: GanttDate;
  /** Reached milestones are filled, the next ones outlined. */
  reached?: boolean;
  label: string;
}

/** A milestone (MAIR-891, Figma `Gantt/Milestone`): a --mairie-secondary diamond with its tooltip on hover and focus. */
export function GanttMilestone({ date, reached = false, label, className = '', ...props }: GanttMilestoneProps) {
  const name = `${label}, ${formatGanttDate(date)}, ${reached ? 'atteint' : 'à venir'}`;
  return (
    <span {...props} {...componentMarker('GanttMilestone', props)} role="img" tabIndex={0} aria-label={name} data-reached={reached}
      className={`group relative inline-grid size-4 place-items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-accent)] ${className}`.trim()}>
      <span aria-hidden="true" className="block size-[11px] rotate-45 rounded-[2px] border-2 border-[var(--mairie-secondary)]" style={{ background: reached ? 'var(--mairie-secondary)' : 'var(--mairie-surface)' }} />
      <span aria-hidden="true" className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-[var(--mairie-radius-s)] bg-[var(--mairie-text)] px-2 py-1 text-[var(--mairie-surface)] shadow group-hover:block group-focus-visible:block" style={{ fontSize: 'var(--mairie-text-xs)' }}>
        {label} · {formatGanttDate(date)}
      </span>
    </span>
  );
}
