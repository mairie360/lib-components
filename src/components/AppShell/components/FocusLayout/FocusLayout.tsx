'use client';

import React from 'react';
import { ListTree } from 'lucide-react';

import { joinClasses } from '../../../shared-classes';

export interface FocusLayoutProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content'> {
  /** Top bar (64 px, surface, bottom rule): title, step, close action… */
  bar?: React.ReactNode;
  /** Optional table of contents column (300 px, surface, right rule, scrolls on its own). */
  aside?: React.ReactNode;
  /** Name of the table of contents navigation and of its button below 900 px (« Sommaire »). */
  asideLabel?: string;
  /** Sticky action bar (surface, top rule). */
  footer?: React.ReactNode;
  /** Disable the skip link while a consumer-managed modal is open. */
  skipLinkInactive?: boolean;
  children?: React.ReactNode;
}

/**
 * Focus layout of AppShell (MAIR-1139): no navigation band and no Header, only the slots of a
 * focused task in reading order, bar → table of contents → content → actions, with a single `main`.
 * Below 900 px the table of contents folds behind a « Sommaire » disclosure button. Escape never
 * leaves the page: the layout binds no key.
 */
export function FocusLayout({ bar, aside, asideLabel = 'Sommaire', footer, skipLinkInactive = false, children, className, ...props }: FocusLayoutProps) {
  const [asideOpen, setAsideOpen] = React.useState(false);
  const mainId = React.useId();
  const asideId = React.useId();
  const mainRef = React.useRef<HTMLElement>(null);
  const hasAside = aside !== undefined && aside !== null && aside !== false;

  return (
    <div
      {...props}
      data-layout="focus"
      data-aside-open={hasAside ? asideOpen : undefined}
      className={joinClasses('app-focus-shell font-sans text-[var(--mairie-text)]', hasAside ? 'app-focus-shell-with-aside' : undefined, className)}
    >
      <div inert={skipLinkInactive}>
        <a
          href={`#${mainId}`}
          onClick={() => mainRef.current?.focus()}
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-[var(--mairie-surface)] focus:p-3 focus:font-semibold focus:text-[var(--mairie-accent)] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--mairie-accent)]"
        >
          Aller au contenu
        </a>
      </div>
      {bar !== undefined && <header className="app-focus-bar">{bar}</header>}
      {hasAside && (
        <div className="app-focus-aside">
          <button
            type="button"
            className="app-focus-aside-toggle"
            aria-expanded={asideOpen}
            aria-controls={asideId}
            onClick={() => setAsideOpen((open) => !open)}
          >
            <ListTree aria-hidden="true" className="h-4 w-4" />
            {asideLabel}
          </button>
          <nav id={asideId} aria-label={asideLabel} className="app-focus-aside-nav">{aside}</nav>
        </div>
      )}
      <main id={mainId} ref={mainRef} tabIndex={-1} className="app-focus-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--mairie-accent)]">
        {children}
      </main>
      {footer !== undefined && <div className="app-focus-footer">{footer}</div>}
    </div>
  );
}
