'use client';

import React from 'react';

export interface DateShortcut {
  id: string;
  label: string;
  /** ISO day the shortcut picks. */
  value: string;
}

export interface DateShortcutsProps {
  shortcuts: readonly DateShortcut[];
  /** Chosen day: its shortcut is pressed. */
  value: string | null;
  isDisabled: (iso: string) => boolean;
  onPick: (iso: string) => void;
}

/** Shortcut chips above the calendar of DatePicker (MAIR-1099): Aujourd’hui, Demain, Lundi prochain… */
export function DateShortcuts({ shortcuts, value, isDisabled, onPick }: DateShortcutsProps) {
  return (
    <div role="group" aria-label="Raccourcis" className="flex flex-wrap border-b border-[var(--mairie-border)]" style={{ gap: 6, paddingBottom: 10, marginBottom: 8, width: 280, maxWidth: '100%' }}>
      {shortcuts.map(shortcut => {
        const pressed = shortcut.value === value;
        return (
          <button
            key={shortcut.id}
            type="button"
            aria-pressed={pressed}
            disabled={isDisabled(shortcut.value)}
            onClick={() => onPick(shortcut.value)}
            className={`rounded-full border transition-colors duration-[var(--mairie-motion-fast)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--mairie-accent)] disabled:cursor-not-allowed disabled:opacity-45 ${pressed ? 'border-[var(--mairie-accent)] bg-[var(--mairie-accent-surface)] font-semibold text-[var(--mairie-accent)]' : 'border-[var(--mairie-border)] bg-[var(--mairie-surface)] text-[var(--mairie-text)] enabled:hover:bg-[var(--mairie-surface-raised)]'}`}
            style={{ height: 28, paddingInline: 10, fontSize: 'var(--mairie-text-s)' }}
          >
            {shortcut.label}
          </button>
        );
      })}
    </div>
  );
}
