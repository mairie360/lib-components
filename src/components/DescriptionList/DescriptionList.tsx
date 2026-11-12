'use client';

import React from 'react';

import { componentMarker } from '../component-marker';

export interface DescriptionItem {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Stable key when labels repeat. */
  id?: string;
}
export interface DescriptionListProps extends React.HTMLAttributes<HTMLDListElement> {
  items: readonly DescriptionItem[];
  /** Width of the label column on wide screens, in px (160 by default). */
  labelWidth?: number;
}

/**
 * Label / value pairs separated by a hairline (MAIR-930, Figma `DescriptionList`): a `dl` with `dt` / `dd`,
 * long values wrap. The label column stacks above the value on narrow screens.
 */
export function DescriptionList({ items, labelWidth = 160, className = '', style, ...props }: DescriptionListProps) {
  return (
    <dl {...props} {...componentMarker('DescriptionList', props)} className={`flex flex-col ${className}`.trim()} style={{ fontSize: 'var(--mairie-text-s)', ...style }}>
      {items.map((item, index) => (
        <div key={item.id ?? (typeof item.label === 'string' ? item.label : index)} className="flex flex-col gap-0.5 border-b border-[var(--mairie-border)] py-2.5 sm:flex-row sm:gap-4">
          <dt className="shrink-0 text-[var(--mairie-muted)]" style={{ width: `min(100%, ${labelWidth}px)` }}>{item.label}</dt>
          <dd className="m-0 min-w-0 flex-1 break-words text-[var(--mairie-text)]">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
