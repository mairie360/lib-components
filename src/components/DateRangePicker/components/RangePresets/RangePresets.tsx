'use client';

import React from 'react';

export interface DateRangePreset {
  id: string;
  label: string;
  /** First day (ISO). */
  start: string;
  /** Last day (ISO), included. */
  end: string;
}

export interface RangePresetsProps {
  presets: readonly DateRangePreset[];
  /** Period being chosen: its preset is pressed. */
  start: string | null;
  end: string | null;
  /** A preset reaching a refused day (outside `min` / `max`) is disabled. */
  isDisabled: (preset: DateRangePreset) => boolean;
  onPick: (preset: DateRangePreset) => void;
}

/** Ready-made periods beside the calendar of DateRangePicker (MAIR-1099): 7 derniers jours, Ce mois-ci… */
export function RangePresets({ presets, start, end, isDisabled, onPick }: RangePresetsProps) {
  return (
    <div role="group" aria-label="Périodes prédéfinies" className="flex flex-row flex-wrap border-b border-[var(--mairie-border)] pb-2.5 sm:min-w-[156px] sm:flex-col sm:flex-nowrap sm:border-r sm:border-b-0 sm:pr-3 sm:pb-0" style={{ gap: 2 }}>
      {presets.map(preset => {
        const pressed = preset.start === start && preset.end === end;
        return (
          <button
            key={preset.id}
            type="button"
            aria-pressed={pressed}
            disabled={isDisabled(preset)}
            onClick={() => onPick(preset)}
            className={`whitespace-nowrap rounded-[var(--mairie-radius-s)] text-left transition-colors duration-[var(--mairie-motion-fast)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--mairie-accent)] disabled:cursor-not-allowed disabled:opacity-45 ${pressed ? 'bg-[var(--mairie-accent-surface)] font-semibold text-[var(--mairie-accent)]' : 'text-[var(--mairie-text)] enabled:hover:bg-[var(--mairie-surface-raised)]'}`}
            style={{ height: 34, paddingInline: 10, fontSize: 'var(--mairie-text-s)' }}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
}
