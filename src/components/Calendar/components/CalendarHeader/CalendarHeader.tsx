'use client';

import React from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

import { Icon } from '../../../Icon';

export interface CalendarHeaderProps {
  /** Visible title (« décembre 2026 », « 2026 », « 2016 – 2027 »). */
  title: string;
  /** Accessible name of the title button, which changes the view (« décembre 2026 : choisir un autre mois »). */
  titleLabel: string;
  /** The title opens a wider view (true) or goes back to the days (false: the chevron turns over). */
  zoomOut: boolean;
  previousLabel: string;
  nextLabel: string;
  previousDisabled: boolean;
  nextDisabled: boolean;
  onTitle: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

const navClass = 'shrink-0 rounded-[var(--mairie-radius-s)] text-[var(--mairie-text)] transition-colors duration-[var(--mairie-motion-fast)] hover:bg-[var(--mairie-surface-raised)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--mairie-accent)] disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent';

/** Title and arrows of Calendar (MAIR-1099): the title zooms out (days → months → years → days). */
export function CalendarHeader({ title, titleLabel, zoomOut, previousLabel, nextLabel, previousDisabled, nextDisabled, onTitle, onPrevious, onNext }: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between" style={{ gap: 4, marginBottom: 4 }}>
      <button type="button" onClick={onTitle} aria-label={titleLabel} className={`${navClass} inline-flex items-center gap-1 font-semibold tabular-nums`} style={{ height: 32, paddingInline: '10px 8px', fontSize: 'var(--mairie-text-m)' }}>
        <span className="inline-block first-letter:uppercase">{title}</span>
        <Icon icon={ChevronDown} size="s" className={`text-[var(--mairie-muted)] transition-transform duration-[var(--mairie-motion-fast)] ${zoomOut ? '' : 'rotate-180'}`} />
      </button>
      <span className="flex" style={{ gap: 2 }}>
        <button type="button" onClick={onPrevious} disabled={previousDisabled} aria-label={previousLabel} title={previousLabel} className={`${navClass} grid place-items-center`} style={{ width: 32, height: 32 }}>
          <Icon icon={ChevronLeft} size="s" />
        </button>
        <button type="button" onClick={onNext} disabled={nextDisabled} aria-label={nextLabel} title={nextLabel} className={`${navClass} grid place-items-center`} style={{ width: 32, height: 32 }}>
          <Icon icon={ChevronRight} size="s" />
        </button>
      </span>
    </div>
  );
}
