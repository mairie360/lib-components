'use client';

import React from 'react';

import { componentMarker } from '../component-marker';

export interface CounterProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Number to show; 0 to 9 as is, « 9+ » above (`max` changes the cap). Negative or missing values render nothing. */
  value: number;
  /** Highest value shown as is (9 by default). */
  max?: number;
  /** Accessible name, e.g. « 3 notifications non lues »; without it the counter is decorative (the parent names it). */
  label?: string;
  /** Plays the short pop of the Figma motion when the value appears or grows. */
  animate?: boolean;
}

/** Text of a counter: the value up to `max`, then `max+`. */
export function counterText(value: number, max = 9): string {
  return value > max ? `${max}+` : String(Math.max(0, Math.trunc(value)));
}

/**
 * Notification counter (MAIR-1094, Figma `Base/Counter`): a round badge 0–9, « 9+ » above, on
 * `--mairie-counter-background` / `--mairie-on-counter` with a 2 px ring in the surface colour. Used by the
 * bell of the Header and the navigation entries. Renders nothing for 0 or less.
 */
export function Counter({ value, max = 9, label, animate = true, className = '', style, ...props }: CounterProps) {
  if (!Number.isFinite(value) || value <= 0) return null;
  const text = counterText(value, max);
  return (
    <span
      {...props}
      {...componentMarker('Counter', props)}
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      data-value={text}
      className={`mairie-counter inline-grid shrink-0 place-items-center rounded-full font-bold leading-none tabular-nums ${animate ? 'mairie-counter-pop ' : ''}${className}`.trim()}
      style={{
        minWidth: 18, height: 18, paddingInline: text.length > 1 ? 4 : 0, fontSize: 11,
        background: 'var(--mairie-counter-background)', color: 'var(--mairie-on-counter)', boxShadow: '0 0 0 2px var(--mairie-surface)',
        ...style,
      }}
    >
      {text}
    </span>
  );
}
