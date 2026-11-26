'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';

import { Icon } from '../../../Icon';
import { componentMarker } from '../../../component-marker';

export type PageHeroStatDot = 'success' | 'warning' | 'danger';

interface PageHeroStatBase {
  icon?: LucideIcon;
  label: string;
  value: React.ReactNode;
  /** Status dot next to the value (e.g. double authentification active). Decorative: say it in `value` too. */
  dot?: PageHeroStatDot;
  /** Accessible name; by default the visible text names the tile (« libellé valeur », WCAG 2.5.3). It must start with that text. */
  'aria-label'?: string;
  className?: string;
}
export type PageHeroStatProps = PageHeroStatBase & (
  | ({ href: string; onClick?: React.MouseEventHandler<HTMLAnchorElement> } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof PageHeroStatBase | 'href' | 'onClick'>)
  | ({ href?: undefined; onClick?: React.MouseEventHandler<HTMLButtonElement> } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof PageHeroStatBase | 'onClick'>)
);

/**
 * One indicator of PageHero (MAIR-1105, Figma `PageHero/Stat`): the whole tile is the link (`href`) or the
 * button (`onClick`), named by its visible text. Default, hover (lighter tile) and visible focus states.
 */
export function PageHeroStat({ icon, label, value, dot, className = '', ...props }: PageHeroStatProps) {
  const tile = `group flex min-h-11 min-w-0 items-center border border-[var(--mairie-hero-tile-border)] bg-[var(--mairie-hero-tile-background)] text-left text-[var(--mairie-on-hero)] no-underline transition-colors hover:bg-[var(--mairie-hero-tile-hover-background)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-on-hero)] ${className}`.trim();
  const tileStyle: React.CSSProperties = { gap: 'var(--mairie-space-s)', padding: 'var(--mairie-space-s) var(--mairie-space-m)', borderRadius: 'var(--mairie-radius-l)', transitionDuration: 'var(--mairie-motion-fast)' };
  const content = (
    <>
      {icon ? <span className="grid size-8 shrink-0 place-items-center text-[var(--mairie-hero-overline)]"><Icon icon={icon} size="m" /></span> : null}
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-[var(--mairie-on-hero-muted)]" style={{ fontSize: 'var(--mairie-text-s)' }}>{label}</span>
        <span className="flex items-center gap-1.5 font-semibold" style={{ fontSize: 'var(--mairie-text-m)' }}>
          {dot ? <span aria-hidden="true" data-dot={dot} className="size-2 shrink-0 rounded-full" style={{ background: `var(--mairie-hero-dot-${dot})` }} /> : null}
          <span className="truncate">{value}</span>
        </span>
      </span>
    </>
  );
  if (props.href !== undefined) {
    const { href, ...rest } = props;
    return <a {...rest} {...componentMarker('PageHeroStat', rest)} href={href} className={tile} style={tileStyle}>{content}</a>;
  }
  const { type = 'button', ...rest } = props;
  delete (rest as { href?: string }).href;
  return <button {...rest} {...componentMarker('PageHeroStat', rest)} type={type} className={tile} style={tileStyle}>{content}</button>;
}
