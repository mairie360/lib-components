import type { NotificationItem } from '../NotificationCenter';

export type NotificationGroup = 'today' | 'yesterday' | 'earlier';
export const notificationGroupLabels: Record<NotificationGroup, string> = { today: 'Aujourd’hui', yesterday: 'Hier', earlier: 'Plus tôt' };
const order: NotificationGroup[] = ['today', 'yesterday', 'earlier'];

const dayStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

/** Group of a notification, by calendar day in the browser's time zone; no or an unreadable date is « Plus tôt ». */
export function notificationGroup(date: string | undefined, now: Date): NotificationGroup {
  const parsed = date ? new Date(date) : undefined;
  if (!parsed || Number.isNaN(parsed.getTime())) return 'earlier';
  const days = Math.round((dayStart(now) - dayStart(parsed)) / 86_400_000);
  return days <= 0 ? 'today' : days === 1 ? 'yesterday' : 'earlier';
}

/** The non-empty groups in display order, each keeping the order the items were given in. */
export function groupNotifications<T extends Pick<NotificationItem, 'date'>>(items: readonly T[], now: Date): { group: NotificationGroup; label: string; items: T[] }[] {
  return order
    .map(group => ({ group, label: notificationGroupLabels[group], items: items.filter(item => notificationGroup(item.date, now) === group) }))
    .filter(entry => entry.items.length > 0);
}
