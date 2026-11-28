'use client';

import React, { useId, useLayoutEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';

import type { Size } from '@mairie360/lib-components/theme';
import { Icon } from '../Icon';
import { componentMarker } from '../component-marker';

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
  /**
   * MAIR-1111: `underline` (default) or `pill` (Figma `Base/Tabs` Style=Pill): a floating bar (surface, border,
   * radius l, shadow) whose active pill slides to the selected tab.
   */
  variant?: 'underline' | 'pill';
  /** MAIR-1111, `pill` only: the bar sticks to the top of its scrolling container. */
  sticky?: boolean;
}
export const tabsIds = (id: string, key: string) => ({ tab: `${id}-tab-${key}`, panel: `${id}-panel-${key}` });
const heights: Record<TabsSize, number> = { s: 36, m: 44, l: 52 };

/** Position of the sliding pill, measured on the selected tab. */
type Indicator = { left: number; width: number };
// useLayoutEffect warns during server rendering; the measure only matters in the browser.
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? React.useEffect : useLayoutEffect;

/**
 * Page tabs to switch views on one screen; arrow keys move between tabs (MAIR-608, Figma `Base/Tabs`).
 * MAIR-1111 `variant="pill"`: the active pill slides (`--mairie-motion-base`, `--mairie-ease-standard`, none
 * under reduced motion); until it is measured the selected tab carries the pill itself.
 */
export function Tabs<Key extends string = string>({ label, items, value, onChange, size = 'm', panels, id: idProp, hostPanel = false, variant = 'underline', sticky = false, className = '', style, ...props }: TabsProps<Key>) {
  const generated = useId(); const id = idProp ?? generated;
  const pill = variant === 'pill';
  const listRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<Indicator | null>(null);
  useIsomorphicLayoutEffect(() => {
    if (!pill) return undefined;
    const measure = () => {
      const tab = listRef.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
      setIndicator(tab && tab.offsetWidth > 0 ? { left: tab.offsetLeft, width: tab.offsetWidth } : null);
    };
    measure();
    if (typeof ResizeObserver === 'undefined' || !listRef.current) return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(listRef.current);
    return () => observer.disconnect();
  }, [pill, value, items.length]);
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
    <div {...props} {...componentMarker('Tabs', props)} id={idProp ? `${idProp}-tabs` : undefined} data-size={size} data-variant={variant} data-sticky={(pill && sticky) || undefined}
      className={`${pill && sticky ? 'sticky top-0 z-10' : ''} ${className}`.trim() || undefined} style={style}>
      <div ref={listRef} role="tablist" aria-label={label}
        className={pill ? 'relative flex max-w-full overflow-x-auto border border-[var(--mairie-border)] bg-[var(--mairie-surface)] shadow-md' : 'flex flex-wrap gap-1 border-b border-[var(--mairie-border)]'}
        style={pill ? { padding: 6, gap: 4, borderRadius: 'var(--mairie-radius-l)' } : undefined}>
        {pill && indicator && (
          <span aria-hidden="true" data-indicator="" className="pointer-events-none absolute border border-[var(--mairie-accent)] bg-[var(--mairie-accent-surface)]"
            style={{ top: 6, bottom: 6, left: indicator.left, width: indicator.width, borderRadius: 'var(--mairie-radius-m)', transitionProperty: 'left, width', transitionDuration: 'var(--mairie-motion-base)', transitionTimingFunction: 'var(--mairie-ease-standard)' }} />
        )}
        {items.map((item, index) => {
          const selected = item.key === value;
          const look = pill
            ? `relative inline-flex shrink-0 items-center gap-2 whitespace-nowrap border font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-accent)] disabled:cursor-not-allowed disabled:opacity-50 ${selected ? `text-[var(--mairie-accent)] ${indicator ? 'border-transparent' : 'border-[var(--mairie-accent)] bg-[var(--mairie-accent-surface)]'}` : 'border-transparent text-[var(--mairie-muted)] hover:text-[var(--mairie-text)]'}`
            : `-mb-px inline-flex items-center gap-2 border-b-2 px-3 font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-accent)] disabled:cursor-not-allowed disabled:opacity-50 ${selected ? 'border-[var(--mairie-accent)] text-[var(--mairie-accent)]' : 'border-transparent text-[var(--mairie-muted)] hover:text-[var(--mairie-text)]'}`;
          const box: React.CSSProperties = pill
            ? { height: 38, paddingInline: 14, borderRadius: 'var(--mairie-radius-m)', fontSize: `var(--mairie-text-${size})` }
            : { height: heights[size], fontSize: `var(--mairie-text-${size})` };
          return (
            <button key={item.key} id={tabId(item.key)} role="tab" type="button" aria-selected={selected} aria-controls={panels || (hostPanel && selected) ? panelId(item.key) : undefined} tabIndex={selected ? 0 : -1} disabled={item.disabled}
              onClick={() => onChange(item.key)}
              onKeyDown={event => { if (event.key === 'ArrowRight') { event.preventDefault(); move(index, 1); } if (event.key === 'ArrowLeft') { event.preventDefault(); move(index, -1); } if (event.key === 'Home') { event.preventDefault(); edge(false); } if (event.key === 'End') { event.preventDefault(); edge(true); } }}
              className={look} style={box}>
              {item.icon && <Icon icon={item.icon} size={size} />}
              {item.label}
              {typeof item.count === 'number' && <span data-tab-count="" className="rounded-full border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] font-semibold text-[var(--mairie-muted)]" style={{ fontSize: 12, lineHeight: '18px', paddingInline: 7 }}>{item.count}</span>}
            </button>
          );
        })}
      </div>
      {panels && items.map(item => item.key === value ? <div key={item.key} id={panelId(item.key)} role="tabpanel" aria-labelledby={tabId(item.key)} tabIndex={0} className="pt-4">{panels[item.key]}</div> : null)}
    </div>
  );
}
