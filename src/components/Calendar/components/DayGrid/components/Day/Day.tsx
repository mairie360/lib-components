'use client';

import React from 'react';

/** Where a day sits in a period: its first day, its last, both (one-day period) or between them. */
export type DayRangePosition = 'start' | 'end' | 'single' | 'middle';

export interface DayProps {
  /** ISO day. */
  iso: string;
  /** Number shown in the circle. */
  dayNumber: number;
  /** Accessible name (« jeudi 3 décembre 2026, aujourd’hui »). */
  label: string;
  /** False for the days of the previous / next month that complete the weeks. */
  inMonth: boolean;
  today: boolean;
  /** The chosen day of a DatePicker. */
  selected: boolean;
  disabled: boolean;
  /** Position in the period of a DateRangePicker. */
  rangePosition?: DayRangePosition;
  /** The period is a hover preview (end not chosen yet). */
  preview?: boolean;
  hasEvent: boolean;
  /** The roving tab stop of the grid. */
  focused: boolean;
  onSelect: (iso: string) => void;
  onHover?: (iso: string) => void;
}

// The period band is painted on the cell, behind the circle: a half band on its first and last day.
const bands: Record<DayRangePosition, string | undefined> = {
  middle: 'var(--mairie-accent-surface)',
  start: 'linear-gradient(90deg, transparent 50%, var(--mairie-accent-surface) 50%)',
  end: 'linear-gradient(90deg, var(--mairie-accent-surface) 50%, transparent 50%)',
  single: undefined,
};

/**
 * One day of the Calendar grid (MAIR-1099, Figma `Calendar/Day`): a gridcell holding the button. Today is
 * ringed, the chosen day filled with the action colour, a disabled day struck through, a dot marks events.
 */
export function Day({ iso, dayNumber, label, inMonth, today, selected, disabled, rangePosition, preview = false, hasEvent, focused, onSelect, onHover }: DayProps) {
  const ends = rangePosition === 'start' || rangePosition === 'end' || rangePosition === 'single';
  const filled = !disabled && (selected || (ends && !(preview && rangePosition === 'end')));
  const dashed = !disabled && preview && (rangePosition === 'end');
  const look = disabled
    ? 'cursor-not-allowed text-[var(--mairie-muted)] line-through opacity-50'
    : filled
      ? 'mairie-calendar-pick bg-[var(--mairie-action-background)] font-semibold text-[var(--mairie-on-action)]'
      : `${today ? 'font-semibold text-[var(--mairie-accent)] shadow-[inset_0_0_0_1.5px_var(--mairie-accent)]' : inMonth ? 'text-[var(--mairie-text)]' : 'text-[var(--mairie-muted)]'} hover:bg-[var(--mairie-surface-raised)]`;
  return (
    <div
      role="gridcell"
      aria-selected={selected || rangePosition !== undefined}
      data-range={rangePosition}
      className="relative flex items-center justify-center"
      style={{ height: 38, background: rangePosition ? bands[rangePosition] : undefined }}
    >
      <button
        type="button"
        data-calendar-cell="day"
        data-iso={iso}
        data-focused={focused ? 'true' : undefined}
        data-today={today ? 'true' : undefined}
        data-outside={inMonth ? undefined : 'true'}
        tabIndex={focused ? 0 : -1}
        aria-label={label}
        aria-current={today ? 'date' : undefined}
        aria-disabled={disabled || undefined}
        onClick={() => { if (!disabled) onSelect(iso); }}
        onMouseEnter={onHover ? () => onHover(iso) : undefined}
        onFocus={onHover ? () => onHover(iso) : undefined}
        className={`relative z-[1] grid place-items-center rounded-full tabular-nums transition-colors duration-[var(--mairie-motion-fast)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--mairie-accent)] ${dashed ? 'outline-dashed outline-[1.5px] -outline-offset-2 outline-[var(--mairie-accent)]' : ''} ${look}`.replace(/\s+/g, ' ').trim()}
        style={{ width: 34, height: 34, fontSize: 'var(--mairie-text-s)' }}
      >
        <span aria-hidden="true">{dayNumber}</span>
        {hasEvent ? (
          <span
            aria-hidden="true"
            data-event-dot="true"
            className={`absolute left-1/2 rounded-full ${filled ? 'bg-[var(--mairie-on-action)]' : 'bg-[var(--mairie-accent)]'}`}
            style={{ bottom: 3, width: 4, height: 4, marginLeft: -2 }}
          />
        ) : null}
      </button>
    </div>
  );
}
