'use client';

import React from 'react';
import { ChevronDown, Plus } from 'lucide-react';

import { Icon } from '../Icon';
import { IconButton } from '../IconButton';
import { StatusPill, type StatusPillTone } from '../StatusPill';
import { componentMarker } from '../component-marker';

export interface KanbanColumnProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Column name, shown in a StatusPill of `tone`. */
  title: string;
  tone?: StatusPillTone;
  /** Number of cards, shown next to the title. */
  count?: number;
  /** Shows the « + » button (« Ajouter dans <titre> »). */
  onAdd?: () => void;
  /** Adds the fold button; the column keeps its width, only the header stays. */
  collapsible?: boolean;
  /** Controlled fold state. */
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** A card is dragged over the column: accent border and surface, « Déposez ici ». A folded column accepts it too. */
  dropActive?: boolean;
  /** Text of a column without cards. */
  emptyLabel?: string;
  /** The cards. */
  children?: React.ReactNode;
  /** Under the cards (e.g. « Ajouter une carte »). */
  footer?: React.ReactNode;
}

/**
 * A column of a kanban board (MAIR-1130, Figma `Base/KanbanColumn`): StatusPill title, count, « + », fold
 * button and the cards. Folding keeps the header and the width; the content folds up (rows 1fr → 0fr and
 * opacity, 280 ms, standard easing, no motion under prefers-reduced-motion) and leaves the tab order.
 */
export function KanbanColumn({
  title, tone = 'neutral', count, onAdd, collapsible = false, collapsed, defaultCollapsed = false, onCollapsedChange, dropActive = false,
  emptyLabel = 'Aucune carte', children, footer, className = '', style, ...props
}: KanbanColumnProps) {
  const titleId = React.useId(); const contentId = React.useId();
  const [ownCollapsed, setOwnCollapsed] = React.useState(defaultCollapsed);
  const folded = collapsible && (collapsed ?? ownCollapsed);
  const toggle = () => { const next = !folded; if (collapsed === undefined) setOwnCollapsed(next); onCollapsedChange?.(next); };
  const empty = React.Children.toArray(children).length === 0;
  return (
    <section
      {...props}
      {...componentMarker('KanbanColumn', props)}
      aria-labelledby={titleId}
      data-collapsed={folded || undefined}
      data-drop-active={dropActive || undefined}
      className={`flex min-w-0 flex-col border bg-[var(--mairie-surface-raised)] transition-colors motion-reduce:transition-none ${dropActive ? 'border-dashed border-[var(--mairie-accent)] bg-[var(--mairie-accent-surface)]' : 'border-[var(--mairie-border)]'} ${className}`.trim()}
      style={{ borderRadius: 'var(--mairie-radius-l)', padding: 'var(--mairie-space-s)', gap: folded ? 0 : 'var(--mairie-space-s)', ...style }}
    >
      <header className="flex items-center" style={{ gap: 'var(--mairie-space-s)', padding: '2px 4px' }}>
        <h3 id={titleId} className="m-0 flex min-w-0 items-center" style={{ gap: 'var(--mairie-space-s)' }}>
          <StatusPill tone={tone} label={title} size="s" />
          {count !== undefined ? <span className="tabular-nums text-[var(--mairie-muted)]" style={{ fontSize: 'var(--mairie-text-s)' }}><span className="sr-only">, </span>{count}<span className="sr-only"> {count > 1 ? 'cartes' : 'carte'}</span></span> : null}
        </h3>
        <span className="flex-1" />
        {onAdd ? <IconButton icon={Plus} label={`Ajouter dans ${title}`} size="s" onClick={onAdd} /> : null}
        {collapsible ? (
          <button
            type="button"
            aria-expanded={!folded}
            aria-controls={contentId}
            aria-label={`${folded ? 'Déplier' : 'Replier'} la colonne ${title}`}
            onClick={toggle}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-[var(--mairie-muted)] hover:bg-[var(--mairie-surface)] hover:text-[var(--mairie-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-accent)]"
          >
            <Icon icon={ChevronDown} size="s" className="transition-transform motion-reduce:transition-none" style={{ transform: folded ? 'rotate(-90deg)' : 'none', transitionDuration: '280ms', transitionTimingFunction: 'var(--mairie-ease-standard)' }} />
          </button>
        ) : null}
      </header>
      {dropActive ? <p role="status" className="m-0 text-center font-medium text-[var(--mairie-accent)]" style={{ fontSize: 'var(--mairie-text-s)' }}>Déposez ici</p> : null}
      <div
        id={contentId}
        data-kanban-content
        aria-hidden={folded || undefined}
        inert={folded || undefined}
        className="grid transition-[grid-template-rows,opacity] motion-reduce:transition-none"
        style={{ gridTemplateRows: folded ? '0fr' : '1fr', opacity: folded ? 0 : 1, transitionDuration: '280ms', transitionTimingFunction: 'var(--mairie-ease-standard)' }}
      >
        <div className="flex min-h-0 flex-col overflow-hidden" style={{ gap: 'var(--mairie-space-s)' }}>
          {empty ? <p className="m-0 py-4 text-center text-[var(--mairie-muted)]" style={{ fontSize: 'var(--mairie-text-s)' }}>{emptyLabel}</p> : children}
          {footer}
        </div>
      </div>
    </section>
  );
}
