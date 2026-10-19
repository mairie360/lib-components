import React from 'react';

export interface NotificationItem {
  id: string;
  title: string;
  message?: string;
  category: 'messages' | 'projects' | 'calendar' | 'other';
  read: boolean;
  href?: string;
}

/** Frontend view port. A consumer must map a published backend contract to it. */
export interface NotificationSource {
  list: (signal: AbortSignal) => Promise<NotificationItem[]>;
  markRead: (ids: string[]) => Promise<string[]>;
}

export function notificationHref(value?: string) {
  if (!value || value !== value.trim() || /[\\\u0000-\u0020]/.test(value)) return undefined;
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : undefined;
  } catch { return undefined; }
}

export function NotificationCenter({ source, onClose, onUnreadCount }: {
  source?: NotificationSource;
  onClose: () => void;
  onUnreadCount?: (count: number) => void;
}) {
  const [items, setItems] = React.useState<NotificationItem[]>([]);
  const [loading, setLoading] = React.useState(Boolean(source));
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const [unreadOnly, setUnreadOnly] = React.useState(false);
  const [revision, setRevision] = React.useState(0);
  const dialog = React.useRef<HTMLDivElement>(null);
  const alive = React.useRef(true);
  const writing = React.useRef(false);
  const sourceEpoch = React.useRef(0);

  React.useEffect(() => {
    alive.current = true;
    const trigger = document.activeElement as HTMLElement | null;
    dialog.current?.querySelector<HTMLButtonElement>('button')?.focus();
    return () => { alive.current = false; trigger?.focus(); };
  }, []);

  React.useEffect(() => {
    sourceEpoch.current += 1;
    if (!source) return;
    const controller = new AbortController();
    setLoading(true); setError('');
    void source.list(controller.signal).then(next => {
      if (controller.signal.aborted) return;
      if (!Array.isArray(next) || next.some(item => !item || typeof item.id !== 'string' || !item.id || typeof item.title !== 'string' || typeof item.read !== 'boolean' || !['messages','projects','calendar','other'].includes(item.category) || (item.message !== undefined && typeof item.message !== 'string')) || new Set(next.map(item => item.id)).size !== next.length) {
        throw new Error('Les notifications reçues sont incohérentes.');
      }
      setItems(next);
      onUnreadCount?.(next.filter(item => !item.read).length);
    }).catch(reason => {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'Chargement impossible.');
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [source, revision, onUnreadCount]);

  async function mark(ids: string[]) {
    if (!source || writing.current || loading || !ids.length) return;
    const epoch = sourceEpoch.current;
    writing.current = true; setPending(true); setError('');
    try {
      const confirmed = await source.markRead(ids);
      if (!alive.current || epoch !== sourceEpoch.current) return;
      if (!Array.isArray(confirmed) || confirmed.length !== ids.length || new Set(confirmed).size !== ids.length || ids.some(id => !confirmed.includes(id))) {
        throw new Error('La lecture des notifications n’a pas été confirmée.');
      }
      const next = items.map(item => confirmed.includes(item.id) ? { ...item, read: true } : item);
      setItems(next); onUnreadCount?.(next.filter(item => !item.read).length);
    } catch (reason) {
      if (alive.current && epoch === sourceEpoch.current) setError(reason instanceof Error ? reason.message : 'La lecture n’a pas pu être enregistrée.');
    } finally {
      writing.current = false;
      if (alive.current) setPending(false);
    }
  }

  const visible = items.filter(item => (filter === 'all' || item.category === filter) && (!unreadOnly || !item.read));
  const unread = items.filter(item => !item.read);
  return <div className="fixed inset-0 z-[70] flex justify-end bg-[var(--mairie-overlay-background)]/35" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="notification-center-title" className="h-full w-full max-w-[440px] overflow-y-auto bg-[var(--mairie-surface)] p-5 text-[var(--mairie-text)] shadow-xl" onKeyDown={event => {
      if (event.key === 'Escape') { event.stopPropagation(); onClose(); }
      if (event.key !== 'Tab') return;
      const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), select, input, a[href]'));
      const index = controls.indexOf(document.activeElement as HTMLElement);
      if (index < 0 || (event.shiftKey && index === 0) || (!event.shiftKey && index === controls.length - 1)) {
        event.preventDefault(); controls[event.shiftKey ? controls.length - 1 : 0]?.focus();
      }
    }}>
      <header className="flex items-center justify-between gap-3"><h2 id="notification-center-title" className="text-xl font-bold">Notifications</h2><button type="button" aria-label="Fermer les notifications" className="rounded border px-3 py-2" onClick={onClose}>Fermer</button></header>
      {!source ? <p role="status" className="mt-5">Les notifications ne sont pas encore disponibles pour ce compte.</p> : <>
        <div className="my-5 flex flex-wrap gap-3">
          <label>Activités <select aria-label="Filtrer les notifications" className="rounded border p-2" value={filter} onChange={event => setFilter(event.target.value)}>{[['all','Toutes'],['messages','Messages'],['projects','Projets'],['calendar','Calendrier']].map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={unreadOnly} onChange={event => setUnreadOnly(event.target.checked)} />Non lues uniquement</label>
          <button type="button" className="rounded border px-3 py-2 disabled:opacity-50" disabled={loading || pending || !unread.length} onClick={() => void mark(unread.map(item => item.id))}>Tout marquer comme lu</button>
        </div>
        {loading ? <p role="status">Chargement des notifications…</p> : null}
        {error ? <p role="alert">{error}</p> : null}
        <button type="button" disabled={loading || pending} className="my-3 rounded border px-3 py-2" onClick={() => setRevision(value => value + 1)}>Actualiser les notifications</button>
        {!loading && !error && !visible.length ? <p>Aucune notification à afficher.</p> : null}
        <ul className="space-y-3">{visible.map(item => <li key={item.id} className="rounded border p-4 [overflow-wrap:anywhere]">
          <h3 className="font-semibold">{item.title}</h3>{item.message ? <p>{item.message}</p> : null}<p className="text-sm">{item.read ? 'Lue' : 'Non lue'}</p>
          {notificationHref(item.href) ? <a className="mr-3 underline" href={notificationHref(item.href)}>Ouvrir</a> : null}
          {!item.read ? <button type="button" disabled={loading || pending} className="mt-2 rounded border px-3 py-2" onClick={() => void mark([item.id])}>Marquer comme lu</button> : null}
        </li>)}</ul>
      </>}
    </div>
  </div>;
}
