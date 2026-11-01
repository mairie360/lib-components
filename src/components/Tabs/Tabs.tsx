'use client';

import React, { useId } from 'react';
import type { LucideIcon } from 'lucide-react';

import type { Size } from '@mairie360/lib-components/theme';
import { Icon } from '../Icon';

export type TabsSize = Extract<Size, 's' | 'm' | 'l'>;
export interface TabItem<Key extends string = string> { key: Key; label: string; icon?: LucideIcon; disabled?: boolean; /** Optional counter shown after the label. */ count?: number }
export interface TabsProps<Key extends string = string> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Accessible name of the tab list, e.g. « Sections de l’administration ». */
  label: string;
  items: TabItem<Key>[];
  value: Key;
  onChange: (key: Key) => void;
  size?: TabsSize;
  /** The tab panels, keyed by tab; omit when the page renders them itself. */
  panels?: Partial<Record<Key, React.ReactNode>>;
  /** Stable id base (`<id>-tab-<key>` / `<id>-panel-<key>`); defaults to a React id. */
  id?: string;
  /** The host renders `<div id="<id>-panel-<key>" role="tabpanel">` itself: the selected tab still points to it. */
  hostPanel?: boolean;
}
export const tabsIds = (id: string, key: string) => ({ tab: `${id}-tab-${key}`, panel: `${id}-panel-${key}` });
const heights: Record<TabsSize, number> = { s: 36, m: 44, l: 52 };

/** Underlined page tabs to switch views on one screen; arrow keys move between tabs (MAIR-608, Figma `Base/Tabs`). */
export function Tabs<Key extends string = string>({ label, items, value, onChange, size = 'm', panels, id: idProp, hostPanel = false, className = '', ...props }: TabsProps<Key>) {
  const generated = useId(); const id = idProp ?? generated;
  const tabId = (key: Key) => `${id}-tab-${key}`; const panelId = (key: Key) => `${id}-panel-${key}`;
  const focusTab = (key: Key) => { onChange(key); document.getElementById(tabId(key))?.focus(); };
  const enabled = items.filter(item => !item.disabled);
  /** Arrow keys wrap over the enabled tabs; Home and End go to the first and last enabled tab. */
  const move = (from: number, step: number) => {
    if (enabled.length === 0) return;
    const current = enabled.findIndex(item => item.key === items[from].key);
    focusTab(enabled[(current + step + enabled.length) % enabled.length].key);
  };
  const edge = (last: boolean) => { if (enabled.length) focusTab(enabled[last ? enabled.length - 1 : 0].key); };
  return (
    <div {...props} id={idProp ? `${idProp}-tabs` : undefined} data-size={size} className={className}>
      <div role="tablist" aria-label={label} className="flex gap-1 border-b border-[var(--mairie-border)]">
        {items.map((item, index) => {
          const selected = item.key === value;
          return (
            <button key={item.key} id={tabId(item.key)} role="tab" type="button" aria-selected={selected} aria-controls={panels || (hostPanel && selected) ? panelId(item.key) : undefined} tabIndex={selected ? 0 : -1} disabled={item.disabled}
              onClick={() => onChange(item.key)}
              onKeyDown={event => { if (event.key === 'ArrowRight') { event.preventDefault(); move(index, 1); } if (event.key === 'ArrowLeft') { event.preventDefault(); move(index, -1); } if (event.key === 'Home') { event.preventDefault(); edge(false); } if (event.key === 'End') { event.preventDefault(); edge(true); } }}
              className={`-mb-px inline-flex items-center gap-2 border-b-2 px-3 font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-accent)] disabled:cursor-not-allowed disabled:opacity-50 ${selected ? 'border-[var(--mairie-accent)] text-[var(--mairie-accent)]' : 'border-transparent text-[var(--mairie-muted)] hover:text-[var(--mairie-text)]'}`}
              style={{ height: heights[size], fontSize: `var(--mairie-text-${size})` }}>
              {item.icon && <Icon icon={item.icon} size={size} />}
              {item.label}
              {typeof item.count === 'number' && <span className="rounded-full bg-[var(--mairie-surface-raised)] px-1.5 text-[var(--mairie-text)]" style={{ fontSize: 'var(--mairie-text-xs)' }}>{item.count}</span>}
            </button>
          );
        })}
      </div>
      {panels && items.map(item => item.key === value ? <div key={item.key} id={panelId(item.key)} role="tabpanel" aria-labelledby={tabId(item.key)} tabIndex={0} className="pt-4">{panels[item.key]}</div> : null)}
    </div>
  );
}
