'use client';

import React from 'react';

import { Button } from '../Button';
import { Counter } from '../Counter';
import { DataState } from '../DataState';
import { Drawer } from '../Drawer';
import { IconButton } from '../IconButton';
import type { NotificationItem } from '../NotificationCenter';
import { SegmentedControl } from '../SegmentedControl';
import { Overline, PanelTitle } from '../Text';
import { componentMarker, withoutMarker } from '../component-marker';
import { NotificationListItem } from './components/NotificationListItem';
import { groupNotifications } from './notification-groups';

export type NotificationListVariant = 'panel' | 'page' | 'drawer';
export type NotificationListState = 'ready' | 'loading' | 'error' | 'unavailable';
export type NotificationListFilter = 'all' | 'unread';

export interface NotificationListProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** The notifications, newest first; the list groups them by `date`. */
  items: readonly NotificationItem[];
  /** `panel` the popover of the bell (360 px), `page` the « Toutes les notifications » page, `drawer` a side panel. */
  variant?: NotificationListVariant;
  /** Data state of the source; `ready` shows the items (or the empty state). */
  state?: NotificationListState;
  /** Rows shown at first, then « Afficher plus » shows as many more. All by default. */
  limit?: number;
  title?: string;
  /** Called with the target of a clickable row instead of the browser navigation (e.g. `router.push`). */
  onNavigate?: (href: string, item: NotificationItem) => void;
  /** Marks rows read: a clicked row, « Marquer comme lu », or every unread row when `onMarkAllRead` is absent. */
  onMarkRead?: (ids: string[]) => void;
  onMarkAllRead?: () => void;
  /** `error` and `unavailable` offer « Réessayer ». */
  onRetry?: () => void;
  /** Close button of the panel, closing of the drawer. */
  onClose?: () => void;
  /** `drawer` only: whether the drawer is shown (default true). */
  open?: boolean;
  /** Reference time of the groups and relative dates (tests, stories); now by default. */
  now?: Date;
}

/**
 * The standard list of notifications (MAIR-1096, Figma `NotificationList`): one look in the bell panel, on
 * the notifications page and in a drawer. Header with the unread Counter and « Tout marquer comme lu »,
 * Toutes / Non lues filter, groups Aujourd’hui / Hier / Plus tôt, loading / empty / error through DataState.
 * The fronts only provide the data and the callbacks; the list is controlled (it never marks a row itself).
 */
export function NotificationList({
  items, variant = 'panel', state = 'ready', limit, title = 'Notifications', onNavigate, onMarkRead, onMarkAllRead, onRetry, onClose, open = true, now,
  className = '', style, ...props
}: NotificationListProps) {
  const titleId = React.useId();
  const [filter, setFilter] = React.useState<NotificationListFilter>('all');
  const step = limit && limit > 0 ? Math.trunc(limit) : Infinity;
  // Pages shown beyond the first one; a filter change starts again from the first page.
  const [pages, setPages] = React.useState(1);
  const shown = step * pages;
  const changeFilter = (next: NotificationListFilter) => { setFilter(next); setPages(1); };
  const reference = now ?? new Date();
  const unread = items.filter(item => !item.read);
  const filtered = filter === 'unread' ? unread : items;
  const visible = filtered.slice(0, shown);
  const groups = groupNotifications(visible, reference);
  const stateSize = variant === 'panel' ? 's' : 'm';
  const markAll = onMarkAllRead ?? (onMarkRead ? () => onMarkRead(unread.map(item => item.id)) : undefined);

  let content: React.ReactNode;
  if (state === 'loading') content = <DataState state="loading" size={stateSize} title="Chargement des notifications…" />;
  else if (state === 'error') content = <DataState state="error" size={stateSize} title="Les notifications n’ont pas pu être chargées." onRetry={onRetry} />;
  else if (state === 'unavailable') content = <DataState state="unavailable" size={stateSize} title="Notifications indisponibles." onRetry={onRetry} />;
  else if (items.length === 0) content = <DataState state="empty" size={stateSize} title="Aucune notification" description="Vous serez prévenu ici des messages, tâches et réunions qui vous concernent." />;
  else if (filtered.length === 0) content = <DataState state="empty" size={stateSize} title="Tout est lu" description="Aucune notification non lue." />;
  else content = (
    <>
      {groups.map(group => (
        <div key={group.group} role="group" aria-labelledby={`${titleId}-${group.group}`}>
          <Overline as="h3" id={`${titleId}-${group.group}`} className="sticky top-0 z-[1] m-0 bg-[var(--mairie-surface)] px-4 pb-1 pt-2.5">{group.label}</Overline>
          <ul className="m-0 list-none p-0">
            {group.items.map(item => <NotificationListItem key={item.id} item={item} now={reference} onNavigate={onNavigate} onMarkRead={onMarkRead} />)}
          </ul>
        </div>
      ))}
      {filtered.length > visible.length ? (
        <div className="flex justify-center border-t border-[var(--mairie-border)] p-2">
          <Button variant="ghost" tone="neutral" size="s" label={`Afficher plus (${filtered.length - visible.length})`} onClick={() => setPages(value => value + 1)} />
        </div>
      ) : null}
    </>
  );

  const toolbar = (
    <div className="flex flex-col" style={{ gap: 'var(--mairie-space-s)', padding: variant === 'drawer' ? '0 0 var(--mairie-space-s)' : 'var(--mairie-space-m) var(--mairie-space-m) var(--mairie-space-s)' }}>
      <div className="flex items-center" style={{ gap: 'var(--mairie-space-s)' }}>
        {variant === 'drawer' ? null : <PanelTitle id={titleId} as="h2" className="m-0">{title}</PanelTitle>}
        <Counter value={unread.length} max={99} label={`${unread.length} notification${unread.length > 1 ? 's' : ''} non lue${unread.length > 1 ? 's' : ''}`} />
        <span className="flex-1" />
        {markAll ? <Button variant="link" size="s" label="Tout marquer comme lu" disabled={state !== 'ready' || unread.length === 0} onClick={markAll} /> : null}
        {variant === 'panel' && onClose ? <IconButton preset="close" size="s" label="Fermer les notifications" onClick={onClose} /> : null}
      </div>
      {state === 'ready' && items.length > 0 ? (
        <SegmentedControl<NotificationListFilter> label="Filtrer les notifications" size="s" className="self-start" value={filter} onChange={changeFilter}
          options={[{ key: 'all', label: 'Toutes' }, { key: 'unread', label: unread.length ? `Non lues (${unread.length})` : 'Non lues' }]} />
      ) : null}
    </div>
  );
  const body = <div data-notification-list-body className={`border-t border-[var(--mairie-border)] ${variant === 'drawer' ? '' : 'min-h-0 flex-1 overflow-y-auto'}`.trim()}>{content}</div>;

  if (variant === 'drawer') {
    return (
      <Drawer {...props} {...componentMarker('NotificationList', props)} open={open} title={title} onClose={onClose ?? (() => undefined)} closeLabel="Fermer les notifications" data-variant={variant} className={className} style={style}>
        {/* Rows run edge to edge, like in the panel: the drawer body padding is undone. */}
        <div className="-mx-6 -mt-6">
          <div className="px-6 pt-4">{toolbar}</div>
          {body}
        </div>
      </Drawer>
    );
  }
  return (
    <section
      {...withoutMarker(props)}
      {...componentMarker('NotificationList', props)}
      aria-labelledby={titleId}
      data-variant={variant}
      className={`flex min-w-0 flex-col overflow-hidden border border-[var(--mairie-border)] bg-[var(--mairie-surface)] text-[var(--mairie-text)] ${className}`.trim()}
      style={variant === 'panel'
        ? { width: 360, maxWidth: 'calc(100vw - 32px)', maxHeight: 520, borderRadius: 'var(--mairie-radius-l)', boxShadow: 'var(--mairie-shadow-pop)', ...style }
        : { width: '100%', borderRadius: 'var(--mairie-radius-l)', ...style }}
    >
      {toolbar}
      {body}
    </section>
  );
}
