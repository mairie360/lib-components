'use client';

import React from 'react';

import { Day, type DayProps } from './components/Day';

export type DayCell = Omit<DayProps, 'onSelect' | 'onHover'>;

export interface DayGridProps {
  /** Accessible name of the grid: the month shown (« décembre 2026 »). */
  label: string;
  /** Column headers, Monday first: visible initial and full name. */
  weekdays: ReadonlyArray<{ initial: string; name: string }>;
  /** 6 weeks of 7 days. */
  weeks: DayCell[][];
  onSelect: (iso: string) => void;
  onHover?: (iso: string | null) => void;
}

/** The days view of Calendar (MAIR-1099): an ARIA grid, one row per week, Monday first. */
export function DayGrid({ label, weekdays, weeks, onSelect, onHover }: DayGridProps) {
  return (
    <div role="grid" aria-label={label} className="w-full" onMouseLeave={onHover ? () => onHover(null) : undefined}>
      <div role="row" className="grid grid-cols-7">
        {weekdays.map(({ initial, name }) => (
          <span key={name} role="columnheader" title={name} className="grid place-items-center font-semibold text-[var(--mairie-muted)]" style={{ height: 28, fontSize: 'var(--mairie-text-xs)' }}>
            <span aria-hidden="true">{initial}</span>
            <span className="sr-only">{name}</span>
          </span>
        ))}
      </div>
      {weeks.map(week => (
        <div key={week[0].iso} role="row" className="grid grid-cols-7">
          {week.map(day => <Day key={day.iso} {...day} onSelect={onSelect} onHover={onHover ? iso => onHover(iso) : undefined} />)}
        </div>
      ))}
    </div>
  );
}
