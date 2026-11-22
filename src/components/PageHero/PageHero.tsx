'use client';

import React from 'react';

import { componentMarker } from '../component-marker';
import { PageHeroStat } from './components/PageHeroStat';

export type { PageHeroStatDot, PageHeroStatProps } from './components/PageHeroStat';

export interface PageHeroProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Small line above the title (« Mon compte »). */
  overline?: React.ReactNode;
  /** The page title (h1), e.g. the agent's name. */
  title: React.ReactNode;
  /** Line under the title: rôle · service · e-mail. */
  subtitle?: React.ReactNode;
  /** An `Avatar` (size xl), shown before the identity. */
  avatar?: React.ReactNode;
  /** The indicators: `PageHero.Stat` tiles. `children` are accepted as well. */
  stats?: React.ReactNode;
}

/**
 * Slate header band of a page (MAIR-1105, Figma `Base/PageHero`): avatar, overline, title, subtitle and
 * clickable indicators (`PageHero.Stat`). Under 1100 px the tiles go below the identity in a 3-column grid,
 * under 640 px in one column. White text on `--mairie-hero-background` (AA in both themes).
 */
function PageHeroRoot({ overline, title, subtitle, avatar, stats, children, className = '', style, ...props }: PageHeroProps) {
  const titleId = React.useId();
  const tiles = stats ?? children;
  const count = React.Children.toArray(tiles).length;
  return (
    <section
      {...props}
      {...componentMarker('PageHero', props)}
      aria-labelledby={props['aria-label'] ? undefined : titleId}
      className={`flex flex-col bg-[var(--mairie-hero-background)] text-[var(--mairie-on-hero)] min-[1100px]:flex-row min-[1100px]:items-center ${className}`.trim()}
      style={{ gap: 'var(--mairie-space-l)', padding: 'var(--mairie-space-l) var(--mairie-space-xl)', borderRadius: 'var(--mairie-radius-xl)', boxShadow: 'var(--mairie-shadow-pop)', ...style }}
    >
      <div className="flex min-w-0 flex-1 items-center" style={{ gap: 'var(--mairie-space-m)' }}>
        {avatar ? <div className="shrink-0">{avatar}</div> : null}
        <div className="flex min-w-0 flex-col" style={{ gap: 2 }}>
          {overline ? <p className="m-0 font-semibold uppercase tracking-[0.08em] text-[var(--mairie-hero-overline)]" style={{ fontSize: 'var(--mairie-text-xs)' }}>{overline}</p> : null}
          <h1 id={titleId} className="m-0 font-bold [overflow-wrap:anywhere]" style={{ fontSize: 'var(--mairie-text-xl)', lineHeight: 1.25 }}>{title}</h1>
          {subtitle ? <p className="m-0 text-[var(--mairie-on-hero-muted)] [overflow-wrap:anywhere]" style={{ fontSize: 'var(--mairie-text-s)' }}>{subtitle}</p> : null}
        </div>
      </div>
      {count ? (
        <div data-page-hero-stats className="grid grid-cols-1 sm:grid-cols-3 min-[1100px]:flex min-[1100px]:shrink-0" style={{ gap: 'var(--mairie-space-s)' }}>
          {tiles}
        </div>
      ) : null}
    </section>
  );
}

/** PageHero with its tile: `<PageHero stats={<><PageHero.Stat … /></>} />`. */
export const PageHero = Object.assign(PageHeroRoot, { Stat: PageHeroStat });
