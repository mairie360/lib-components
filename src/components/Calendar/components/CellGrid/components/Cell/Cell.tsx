'use client';

import React from 'react';

export interface CellProps {
  /** Stable key of the cell (« 2026-12 » for a month, « 2026 » for a year). */
  value: string;
  /** Visible text (« Décembre », « 2026 »). */
  text: string;
  /** Accessible name (« décembre 2026 »). */
  label: string;
  selected: boolean;
  /** The current month or year: ringed like today. */
  current: boolean;
  disabled: boolean;
  /** The roving tab stop of the grid. */
  focused: boolean;
  onPick: (value: string) => void;
}

/** A month or a year of Calendar (MAIR-1099, Figma `Calendar/Cell`), three per row. */
export function Cell({ value, text, label, selected, current, disabled, focused, onPick }: CellProps) {
  const look = disabled
    ? 'cursor-not-allowed opacity-40 text-[var(--mairie-muted)]'
    : selected
      ? 'mairie-calendar-pick bg-[var(--mairie-action-background)] font-semibold text-[var(--mairie-on-action)]'
      : `${current ? 'font-semibold text-[var(--mairie-accent)] shadow-[inset_0_0_0_1.5px_var(--mairie-accent)]' : 'text-[var(--mairie-text)]'} hover:bg-[var(--mairie-surface-raised)]`;
  return (
    <button
      type="button"
      data-calendar-cell="cell"
      data-value={value}
      data-focused={focused ? 'true' : undefined}
      tabIndex={focused ? 0 : -1}
      aria-label={label}
      aria-pressed={selected}
      aria-current={current ? 'date' : undefined}
      aria-disabled={disabled || undefined}
      onClick={() => { if (!disabled) onPick(value); }}
      className={`rounded-[var(--mairie-radius-m)] tabular-nums transition-colors duration-[var(--mairie-motion-fast)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--mairie-accent)] ${look}`}
      style={{ height: 52, fontSize: 'var(--mairie-text-s)' }}
    >
      {text}
    </button>
  );
}
