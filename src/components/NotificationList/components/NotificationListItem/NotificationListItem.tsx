'use client';

import React from 'react';
import { CalendarDays, FolderKanban, Info, MessageSquare, type LucideIcon } from 'lucide-react';

import { Button } from '../../../Button';
import { DateTime } from '../../../DateTime';
import { Icon } from '../../../Icon';
import { notificationHref, type NotificationItem } from '../../../NotificationCenter';

const categories: Record<NotificationItem['category'], { icon: LucideIcon; colour: string; label: string }> = {
  messages: { icon: MessageSquare, colour: 'var(--mairie-module-messaging)', label: 'Messagerie' },
  projects: { icon: FolderKanban, colour: 'var(--mairie-module-projects)', label: 'Projets' },
  calendar: { icon: CalendarDays, colour: 'var(--mairie-module-calendar)', label: 'Calendrier' },
  other: { icon: Info, colour: 'var(--mairie-muted)', label: 'Mairie360' },
};

export interface NotificationListItemProps {
  item: NotificationItem;
  now?: Date;
  onNavigate?: (href: string, item: NotificationItem) => void;
  onMarkRead?: (ids: string[]) => void;
}

/** The link target of a row: only `clickable: true` with a safe `href` (relative path or http(s) URL). */
export function notificationLink(item: NotificationItem): string | undefined {
  return item.clickable === true ? notificationHref(item.href) : undefined;
}

/**
 * One row of NotificationList (MAIR-1096, Figma `NotificationList/Item`): unread dot, icon in the module
 * colour, title, message on two lines at most, relative time and module. The whole row is a link only when
 * the service made it clickable; following it marks the notification read. Otherwise an unread row offers
 * « Marquer comme lu ».
 */
export function NotificationListItem({ item, now, onNavigate, onMarkRead }: NotificationListItemProps) {
  const href = notificationLink(item);
  const category = categories[item.category] ?? categories.other;
  const content = (
    <>
      <span aria-hidden="true" className="mt-2.5 size-2 shrink-0 rounded-full bg-[var(--mairie-accent)]" style={{ visibility: item.read ? 'hidden' : 'visible' }} />
      <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center bg-[var(--mairie-surface-raised)]" style={{ color: category.colour, borderRadius: 'var(--mairie-radius-m)' }}>
        <Icon icon={category.icon} size="s" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col [overflow-wrap:anywhere]" style={{ gap: 2 }}>
        <span className={item.read ? 'font-medium' : 'font-semibold'}>
          {item.read ? null : <span className="sr-only">Non lue : </span>}
          {item.title}
        </span>
        {item.message ? <span className="line-clamp-2 text-[var(--mairie-muted)]">{item.message}</span> : null}
        <span className="flex flex-wrap items-center gap-1 text-[var(--mairie-muted)]" style={{ fontSize: 'var(--mairie-text-xs)' }}>
          {item.date ? <><DateTime value={item.date} format="relative" now={now} size="xs" tone="muted" /><span aria-hidden="true">·</span></> : null}
          <span>{category.label}</span>
        </span>
      </span>
    </>
  );
  const row = 'flex w-full items-start gap-2.5 px-4 py-2.5 text-[var(--mairie-text)]';
  return (
    <li data-read={item.read} data-clickable={href ? 'true' : undefined} className="border-b border-[var(--mairie-border)] last:border-b-0" style={{ fontSize: 'var(--mairie-text-s)' }}>
      {href ? (
        <a
          href={href}
          className={`${row} no-underline transition-colors hover:bg-[var(--mairie-surface-raised)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--mairie-accent)]`}
          style={{ transitionDuration: 'var(--mairie-motion-fast)', transitionTimingFunction: 'var(--mairie-ease-standard)' }}
          onClick={event => {
            if (!item.read) onMarkRead?.([item.id]);
            // A router (Next.js) navigates itself: the plain link stays the fallback without JavaScript.
            if (onNavigate && !event.defaultPrevented && !event.metaKey && !event.ctrlKey && !event.shiftKey && event.button === 0) { event.preventDefault(); onNavigate(href, item); }
          }}
        >
          {content}
        </a>
      ) : (
        <div className={row}>
          {content}
          {!item.read && onMarkRead ? (
            <Button variant="link" size="s" label="Marquer comme lu" aria-label={`Marquer comme lu : ${item.title}`} className="shrink-0 self-start" onClick={() => onMarkRead([item.id])} />
          ) : null}
        </div>
      )}
    </li>
  );
}
