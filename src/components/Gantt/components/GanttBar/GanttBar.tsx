'use client';

import React from 'react';

import { componentMarker } from '../../../component-marker';
import { formatGanttDate, ganttStates, type GanttDate, type GanttState } from '../../gantt-dates';

export interface GanttBarProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onClick'> {
  state: GanttState;
  start: GanttDate;
  end: GanttDate;
  /** Task name: with the state and the dates it makes the accessible name. */
  label: string;
  /** Initials of the assignee, drawn at the end of the bar. */
  assigneeInitials?: string;
  /** Opens the task: the bar becomes a button. */
  onClick?: () => void;
}

/** One task over its dates (MAIR-891, Figma `Gantt/Bar`): focusable, named by task, state and dates. */
export function GanttBar({ state, start, end, label, assigneeInitials, onClick, className = '', style, ...props }: GanttBarProps) {
  const name = `${label}, ${ganttStates[state].label.toLowerCase()}, du ${formatGanttDate(start)} au ${formatGanttDate(end)}`;
  const shared = {
    ...props,
    ...componentMarker('GanttBar', props),
    'aria-label': name,
    title: name,
    'data-state': state,
    className: `inline-flex h-6 min-w-6 items-center justify-end rounded-[var(--mairie-radius-s)] px-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-accent)] ${onClick ? 'cursor-pointer' : ''} ${className}`.trim(),
    style: { background: ganttStates[state].color, ...style },
  };
  const initials = assigneeInitials
    ? <span aria-hidden="true" className="grid size-[18px] place-items-center rounded-full bg-[var(--mairie-surface)] text-[9px] font-semibold text-[var(--mairie-text)]">{assigneeInitials}</span>
    : null;
  return onClick
    ? <button type="button" {...shared} onClick={onClick}>{initials}</button>
    : <span role="img" tabIndex={0} {...shared}>{initials}</span>;
}
