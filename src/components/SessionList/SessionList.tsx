'use client';

import React from 'react';

import { Monitor, Smartphone, Tablet, type LucideIcon } from 'lucide-react';

import { RetryButton } from '../ButtonPresets';
import { Button } from '../Button';
import { DataState } from '../DataState';
import { StatusBadge, StatusPill, type Status } from '../StatusPill';
import { Skeleton } from '../Skeleton';
import { SessionCard } from './components/SessionCard';
import { SessionDate } from './components/SessionDate';
import { parseSessionTimestamp } from './session-dates';
import { joinClasses } from '../shared-classes';
import { componentMarker } from '../component-marker';

/** One session as the BFF User contract returns it (Administrator and Settings share this shape). */
export interface SessionRecord {
  id: string;
  device_info: string;
  ip_address: string;
  created_at: string;
  expires_at: string | null;
  revoked_at?: string | null;
  /** Approximate place of the connection, when the BFF knows it. */
  location?: string | null;
  /** Last request seen for the session (ISO 8601). */
  last_active_at?: string | null;
}

export type SessionState = 'active' | 'expired' | 'revoked' | 'unknown';

type SessionDates = Pick<SessionRecord, 'expires_at' | 'revoked_at'>;

/** Revoked wins over expiry; an unparsable expiry is reported, never guessed. */
export function sessionState(session: SessionDates, now: number): SessionState {
  if (session.revoked_at) return 'revoked';
  const expiry = parseSessionTimestamp(session.expires_at);
  if (!Number.isFinite(expiry)) return 'unknown';
  return expiry <= now ? 'expired' : 'active';
}

/** Delay until the next session flips to expired: one timer for the whole list, no polling. */
export function nextSessionExpiryDelay(sessions: readonly SessionDates[], now: number): number | null {
  let earliest = Infinity;
  for (const session of sessions) {
    if (session.revoked_at) continue;
    const expiry = parseSessionTimestamp(session.expires_at);
    if (expiry > now && expiry < earliest) earliest = expiry;
  }
  return Number.isFinite(earliest) ? Math.min(earliest - now + 1, 2_147_483_647) : null;
}

export const sessionStateLabels: Record<SessionState, string> = { active: 'Active', expired: 'Expirée', revoked: 'Révoquée', unknown: 'État indéterminé' };
export const sessionStateStatuses: Record<SessionState, Status> = { active: 'active', expired: 'expired', revoked: 'revoked', unknown: 'unknown' };

export interface SessionListProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onSelect'> {
  /** `null` means the sessions could not be loaded (unavailable state); `[]` is the empty state. */
  sessions: readonly SessionRecord[] | null;
  /** Skeleton rows while the first load is in flight. */
  loading?: boolean;
  /** The caller's own session: « Cet appareil » badge, never revocable from here. */
  currentSessionId?: string | null;
  /** MAIR-1000: the current session comes first (default true). */
  currentFirst?: boolean;
  /** When provided, active sessions get a "Déconnecter" action. */
  onRevoke?: (session: SessionRecord) => void;
  /** Session whose revocation is in flight: its action is disabled. */
  revokingId?: string | null;
  /** MAIR-1000: opens the session detail; the device becomes a button and the whole row is clickable. */
  onSelect?: (session: SessionRecord) => void;
  /** MAIR-845: `compact` (two lines per session, no header row) for a sheet or a side panel. */
  layout?: 'default' | 'compact';
  /** Device shown for a session (the raw user-agent by default), e.g. from `describeUserAgent`. */
  deviceLabel?: (session: SessionRecord) => React.ReactNode;
  /** Icon of the device in the compact layout (computer, phone or tablet guessed from the user-agent by default). */
  deviceIcon?: (session: SessionRecord) => LucideIcon;
  /** Header of the end-date column: « Expiration » by default, « Fin » for a history. */
  dateColumnLabel?: string;
  /** Unavailable state: « Réessayer » when provided. */
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  unavailableTitle?: string;
  unavailableDescription?: string;
  /** @deprecated use `emptyTitle`. */
  emptyMessage?: string;
  /** @deprecated use `unavailableTitle`. */
  unavailableMessage?: string;
  /** Column label for the identifier shown under the device, omitted for end users. */
  showIds?: boolean;
  timeZone?: string;
  /** Title of the table (RGAA 5.4), read by screen readers only: the page heading shows it on screen. */
  caption?: string;
  /** Test hook: the instant used to compute states; defaults to the live clock with one expiry timer. */
  now?: number;
}

function useNow(sessions: readonly SessionRecord[] | null, fixed?: number) {
  const [now, setNow] = React.useState(() => fixed ?? Date.now());
  React.useEffect(() => {
    // Server renderers may define a document stand-in without a window: no timer there.
    if (fixed !== undefined || !sessions || typeof document === 'undefined' || typeof window === 'undefined') return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      const current = Date.now();
      setNow(current);
      clearTimeout(timer);
      const delay = nextSessionExpiryDelay(sessions, current);
      if (delay !== null) timer = setTimeout(refresh, delay);
    };
    const onVisibility = () => { if (document.visibilityState === 'visible') refresh(); };
    refresh();
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [sessions, fixed]);
  return fixed ?? now;
}

/** MAIR-1000: below 640 px the table becomes cards (the compact layout). */
function useNarrowScreen() {
  const [narrow, setNarrow] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(max-width: 639px)');
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);
  return narrow;
}

const guessDeviceIcon = (session: SessionRecord): LucideIcon =>
  /\biPad\b|\bTablet\b/.test(session.device_info) ? Tablet : /\bMobile\b|\biPhone\b|\bAndroid\b/.test(session.device_info) ? Smartphone : Monitor;

/** End date of a session and the words that introduce it. */
function sessionEnd(session: SessionRecord, state: SessionState, columnLabel: string) {
  if (state === 'revoked') return { at: session.revoked_at, label: 'Révoquée le' };
  if (state === 'expired') return { at: session.expires_at, label: 'Expirée le' };
  return { at: session.expires_at, label: columnLabel === 'Expiration' ? 'Expire le' : `${columnLabel} le` };
}

/**
 * The shared session display (MAIR-607): Administrator lists the sessions of a
 * user, Settings lists the caller's own sessions with a revoke action. Same
 * columns, same state badges, same empty / loading / unavailable states.
 * MAIR-845 adds the compact layout, MAIR-1000 the clickable rows, the « Cet appareil »
 * badge, the history column and the configurable states.
 */
export const SessionList = ({
  sessions, loading = false, currentSessionId = null, currentFirst = true, onRevoke, revokingId = null, onSelect, layout = 'default',
  deviceLabel = session => session.device_info, deviceIcon = guessDeviceIcon, dateColumnLabel = 'Expiration', onRetry,
  emptyMessage = 'Aucune session à afficher.', emptyTitle = emptyMessage, emptyDescription,
  unavailableMessage = 'Les sessions sont temporairement indisponibles.', unavailableTitle = unavailableMessage, unavailableDescription,
  showIds = false, timeZone, caption = 'Sessions de connexion', now: fixedNow, className = '', ...props
}: SessionListProps) => {
  const now = useNow(sessions, fixedNow);
  const narrow = useNarrowScreen();
  const compact = layout === 'compact' || narrow;
  const frame = joinClasses('session-list overflow-hidden rounded-lg border border-[var(--mairie-border)] bg-[var(--mairie-surface)]', className);
  const marker = componentMarker('SessionList', props);

  if (loading && !sessions) {
    return (
      <div {...props} {...marker} className={frame} aria-busy="true" data-layout={compact ? 'compact' : 'default'}>
        <div className="p-4"><Skeleton.TableRow label="Chargement des sessions…" columns={compact ? 2 : 5} /></div>
      </div>
    );
  }
  if (!sessions) {
    return (
      <div {...props} {...marker} className={frame}>
        <DataState
          state="unavailable"
          size="s"
          role="status"
          title={unavailableTitle}
          description={unavailableDescription ?? null}
          action={onRetry ? <RetryButton size="s" onClick={onRetry} /> : undefined}
        />
      </div>
    );
  }
  if (sessions.length === 0) {
    return (
      <div {...props} {...marker} className={frame}>
        <DataState state="empty" size="s" title={emptyTitle} description={emptyDescription ?? null} />
      </div>
    );
  }

  const isCurrent = (session: SessionRecord) => currentSessionId !== null && session.id === currentSessionId;
  const ordered = currentFirst && currentSessionId !== null ? [...sessions].sort((a, b) => Number(isCurrent(b)) - Number(isCurrent(a))) : sessions;
  const name = (session: SessionRecord) => { const label = deviceLabel(session); return typeof label === 'string' ? label : session.device_info; };
  const revokeButton = (session: SessionRecord) => (
    <Button
      label={revokingId === session.id ? 'Déconnexion…' : 'Déconnecter'}
      size="s"
      variant="outline"
      tone="danger"
      loading={revokingId === session.id}
      aria-label={`Déconnecter la session ${name(session)}`}
      onClick={event => { event.stopPropagation(); onRevoke?.(session); }}
    />
  );
  const rows = ordered.map(session => {
    const state = sessionState(session, now);
    const current = isCurrent(session);
    return { session, state, current, revocable: Boolean(onRevoke) && state === 'active' && !current, end: sessionEnd(session, state, dateColumnLabel) };
  });

  if (compact) {
    return (
      <div {...props} {...marker} className={frame} data-layout="compact">
        <ul aria-label={caption} className="divide-y divide-[var(--mairie-border)] text-sm">
          {rows.map(({ session, state, current, revocable, end }) => (
            <li key={session.id} data-session-state={state} data-current={current || undefined}>
              <SessionCard
                device={deviceLabel(session)}
                deviceIcon={deviceIcon(session)}
                current={current}
                status={sessionStateStatuses[state]}
                statusLabel={sessionStateLabels[state]}
                ipAddress={session.ip_address}
                createdAt={session.created_at}
                endAt={end.at}
                endLabel={end.label}
                timeZone={timeZone}
                action={revocable ? revokeButton(session) : undefined}
                onSelect={onSelect ? () => onSelect(session) : undefined}
                selectLabel={`Voir le détail de la session ${name(session)}`}
              />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div {...props} {...marker} className={joinClasses(frame, 'overflow-x-auto')} data-layout="default">
      <table className="min-w-[760px] w-full text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-[var(--mairie-surface-raised)] text-xs font-semibold uppercase tracking-wide text-[var(--mairie-muted)]">
          <tr>
            <th scope="col" className="px-4 py-3">Appareil</th>
            <th scope="col" className="px-4 py-3">Adresse IP</th>
            <th scope="col" className="px-4 py-3">Créée le</th>
            <th scope="col" className="px-4 py-3">{dateColumnLabel}</th>
            <th scope="col" className="px-4 py-3">État</th>
            {onRevoke ? <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--mairie-border)]">
          {rows.map(({ session, state, current, revocable, end }) => (
            <tr key={session.id} data-session-state={state} data-current={current || undefined}
              className={onSelect ? 'cursor-pointer hover:bg-[var(--mairie-surface-raised)]' : undefined}
              onClick={onSelect ? () => onSelect(session) : undefined}>
              <td className="px-4 py-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  {onSelect
                    // The row is clickable with the mouse; the keyboard reaches the same action through this button.
                    ? <button type="button" aria-label={`Voir le détail de la session ${name(session)}`} onClick={event => { event.stopPropagation(); onSelect(session); }} className="rounded-sm text-left font-semibold text-[var(--mairie-text)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-accent)]">{deviceLabel(session)}</button>
                    : <span className="font-semibold text-[var(--mairie-text)]">{deviceLabel(session)}</span>}
                  {current ? <StatusPill tone="primary" size="s" label="Cet appareil" /> : null}
                </div>
                {showIds ? <div className="mt-0.5 font-mono text-xs text-[var(--mairie-muted)]">{session.id}</div> : null}
              </td>
              <td className="px-4 py-3.5 text-[var(--mairie-text)]">{session.ip_address}</td>
              <td className="px-4 py-3.5 text-[var(--mairie-text)]"><SessionDate value={session.created_at} timeZone={timeZone} /></td>
              <td className="px-4 py-3.5 text-[var(--mairie-text)]">
                {state === 'active' || state === 'unknown'
                  ? <SessionDate value={end.at} timeZone={timeZone} />
                  : <>{end.label} <SessionDate value={end.at} timeZone={timeZone} /></>}
              </td>
              <td className="px-4 py-3.5"><StatusBadge status={sessionStateStatuses[state]} label={sessionStateLabels[state]} size="s" /></td>
              {onRevoke ? (
                <td className="px-4 py-3.5 text-right">
                  {revocable ? revokeButton(session) : <span className="text-[var(--mairie-muted)]" aria-hidden="true">—</span>}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
