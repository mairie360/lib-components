'use client';

import React from 'react';

import { componentMarker } from '../component-marker';
import { GanttBar } from './components/GanttBar';
import { GanttMilestone } from './components/GanttMilestone';
import { GanttToday } from './components/GanttToday';
import { ganttMonths, ganttPercent, ganttStates, ganttTime, type GanttDate, type GanttState } from './gantt-dates';

export interface GanttRow {
  id: string;
  /** Task name, shown in the first column and in the bar's accessible name. */
  label: string;
  state: GanttState;
  start: GanttDate;
  end: GanttDate;
  assigneeInitials?: string;
}
export interface GanttMilestoneItem { id: string; label: string; date: GanttDate; reached?: boolean }
export interface GanttProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Accessible name of the planning (« Planning du projet »). */
  label?: string;
  from: GanttDate;
  to: GanttDate;
  rows: readonly GanttRow[];
  milestones?: readonly GanttMilestoneItem[];
  /** Position of the « aujourd'hui » marker; hidden when outside the period or omitted. */
  today?: GanttDate;
  /** Opens a task: its bar becomes a button. */
  onRowClick?: (row: GanttRow) => void;
  /** Minimum width of one month, in px, before the planning scrolls horizontally (120 by default). */
  monthWidth?: number;
}

const LABEL_COLUMN = 200;

/**
 * Planning of tasks and milestones (MAIR-891, Figma `Gantt`): months header, milestones line, one line per
 * task, legend; scrolls horizontally. Bars and milestones are focusable and named.
 */
export function Gantt({ label = 'Planning', from, to, rows, milestones = [], today, onRowClick, monthWidth = 120, className = '', style, ...props }: GanttProps) {
  const months = ganttMonths(from, to);
  const at = (date: GanttDate) => `${ganttPercent(date, from, to)}%`;
  const showToday = today !== undefined && ganttTime(today) >= ganttTime(from) && ganttTime(today) <= ganttTime(to);
  const line = 'grid border-b border-[var(--mairie-border)]';
  const columns = { gridTemplateColumns: `${LABEL_COLUMN}px 1fr` };
  const caption = 'text-[var(--mairie-muted)]';
  return (
    <section {...props} {...componentMarker('Gantt', props)} aria-label={label} className={`overflow-hidden rounded-[var(--mairie-radius-l)] border border-[var(--mairie-border)] bg-[var(--mairie-surface)] ${className}`.trim()} style={{ fontSize: 'var(--mairie-text-s)', ...style }}>
      <div className="overflow-x-auto">
        <div className="relative" style={{ minWidth: LABEL_COLUMN + months.length * monthWidth }}>
          <div className={`${line} h-9 items-center`} style={columns} aria-hidden="true">
            <span />
            <div className="relative h-full">
              {months.map(month => <span key={month.start} className={`absolute top-2.5 pl-2 font-medium ${caption}`} style={{ left: at(new Date(Math.max(month.start, ganttTime(from)))), fontSize: 'var(--mairie-text-xs)' }}>{month.label}</span>)}
            </div>
          </div>
          {milestones.length > 0 && (
            <div className={`${line} h-8 items-center`} style={columns}>
              <span className={`px-3 font-medium ${caption}`} style={{ fontSize: 'var(--mairie-text-xs)' }}>Jalons</span>
              <ul className="relative h-full" aria-label="Jalons">
                {milestones.map(item => (
                  <li key={item.id} className="absolute top-2 -translate-x-1/2" style={{ left: at(item.date) }}>
                    <GanttMilestone label={item.label} date={item.date} reached={item.reached} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          <ul aria-label="Tâches">
            {rows.map(row => {
              const left = ganttPercent(row.start, from, to); const width = Math.max(ganttPercent(row.end, from, to) - left, 0);
              return (
                <li key={row.id} className={`${line} h-10 items-center`} style={columns}>
                  <span className="truncate px-3 text-[var(--mairie-text)]">{row.label}</span>
                  <div className="relative h-full">
                    <GanttBar className="absolute top-2" style={{ left: `${left}%`, width: `${width}%` }} state={row.state} start={row.start} end={row.end} label={row.label}
                      assigneeInitials={row.assigneeInitials} onClick={onRowClick ? () => onRowClick(row) : undefined} />
                  </div>
                </li>
              );
            })}
          </ul>
          {showToday && (
            <div className="pointer-events-none absolute inset-y-1" style={{ left: LABEL_COLUMN, right: 0 }}>
              <GanttToday className="absolute -translate-x-1/2" style={{ left: at(today) }} />
            </div>
          )}
        </div>
      </div>
      <ul className="flex flex-wrap items-center gap-4 px-3 py-2.5" aria-label="Légende">
        {(Object.keys(ganttStates) as GanttState[]).map(state => (
          <li key={state} className={`inline-flex items-center gap-1.5 ${caption}`} style={{ fontSize: 'var(--mairie-text-xs)' }}>
            <span aria-hidden="true" className="size-3 rounded-[3px]" style={{ background: ganttStates[state].color }} />{ganttStates[state].label}
          </li>
        ))}
      </ul>
    </section>
  );
}

export { GanttBar, GanttMilestone, GanttToday };
