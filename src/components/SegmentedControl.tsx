'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';

import type { Size } from '@mairie360/lib-components/theme';
import { Icon } from './Icon';

export type SegmentedSize = Extract<Size, 's' | 'm' | 'l'>;
export interface SegmentedOption<Key extends string = string> { key: Key; label: string; icon?: LucideIcon; disabled?: boolean }
export interface SegmentedControlProps<Key extends string = string> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Accessible name, e.g. « Vue des projets ». */
  label: string;
  options: SegmentedOption<Key>[];
  value: Key;
  onChange: (key: Key) => void;
  size?: SegmentedSize;
}
const heights: Record<SegmentedSize, string> = { s: 'var(--mairie-control-s)', m: 'var(--mairie-control-m)', l: 'var(--mairie-control-l)' };

/** Exclusive choice between 2–4 views or filters (MAIR-608, Figma `Base/SegmentedControl`). A radio group for assistive technology. */
export function SegmentedControl<Key extends string = string>({ label, options, value, onChange, size = 'm', className = '', style, ...props }: SegmentedControlProps<Key>) {
  const enabled = options.filter(option => !option.disabled);
  const buttons = React.useRef(new Map<Key, HTMLButtonElement>());
  // Focus follows the selection (WAI-ARIA radio group).
  const step = (direction: number) => { const index = enabled.findIndex(option => option.key === value); const next = enabled[(index + direction + enabled.length) % enabled.length]; if (next) { onChange(next.key); buttons.current.get(next.key)?.focus(); } };
  return (
    <div {...props} role="radiogroup" aria-label={label} data-size={size} className={`inline-flex items-center gap-0.5 rounded-md border border-[var(--mairie-control-border)] bg-[var(--mairie-surface-raised)] p-0.5 ${className}`.trim()} style={{ height: heights[size], ...style }}
      onKeyDown={event => { if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); step(1); } if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); step(-1); } }}>
      {options.map(option => {
        const checked = option.key === value;
        return (
          <button key={option.key} ref={(node) => { if (node) buttons.current.set(option.key, node); else buttons.current.delete(option.key); }} type="button" role="radio" aria-checked={checked} tabIndex={checked ? 0 : -1} disabled={option.disabled} onClick={() => onChange(option.key)}
            className={`inline-flex h-full items-center gap-1.5 rounded-[5px] px-3 font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-accent)] disabled:cursor-not-allowed disabled:opacity-50 ${checked ? 'bg-[var(--mairie-surface)] text-[var(--mairie-text)] shadow-sm' : 'text-[var(--mairie-muted)] hover:text-[var(--mairie-text)]'}`}
            style={{ fontSize: `var(--mairie-text-${size})` }}>
            {option.icon && <Icon icon={option.icon} size={size} />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
