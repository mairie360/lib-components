'use client';

import React from 'react';

// The published `shared` entry holds the instance time zone set by the front's InstanceProvider.
import { getInstanceTimeZone } from '@mairie360/lib-components/shared';
import { RefreshButton } from './ButtonPresets';
import { Button } from './Button';
import { DataState } from './DataState';
import { StatusBadge, type Status } from './StatusPill';
import { Skeleton } from './Skeleton';
import { joinClasses } from './shared/classes';

/** One session as the BFF User contract returns it (Administrator and Settings share this shape). */
export interface SessionRecord {
  id: string;
  device_info: string;
  ip_address: string;
  created_at: string;
  expires_at: string | null;
  revoked_at?: string | null;
}

export type SessionState = 'active' | 'expired' | 'revoked' | 'unknown';

type SessionDates = Pick<SessionRecord, 'expires_at' | 'revoked_at'>;

/** Revoked wins over expiry; an unparsable expiry is reported, never guessed. */
export function sessionState(session: SessionDates, now: number): SessionState {
  if (session.revoked_at) return 'revoked';
  const expiry = session.expires_at ? Date.parse(session.expires_at) : NaN;
  if (!Number.isFinite(expiry)) return 'unknown';
  return expiry <= now ? 'expired' : 'active';
}

/** Delay until the next session flips to expired: one timer for the whole list, no polling. */
export function nextSessionExpiryDelay(sessions: readonly SessionDates[], now: number): number | null {
  let earliest = Infinity;
  for (const session of sessions) {
    if (session.revoked_at) continue;
    const expiry = session.expires_at ? Date.parse(session.expires_at) : NaN;
    if (expiry > now && expiry < earliest) earliest = expiry;
  }
  return Number.isFinite(earliest) ? Math.min(earliest - now + 1, 2_147_483_647) : null;
}

const stateLabels: Record<SessionState, string> = { active: 'Active', expired: 'Expirée', revoked: 'Révoquée', unknown: 'État indéterminé' };
const stateStatuses: Record<SessionState, Status> = { active: 'active', expired: 'expired', revoked: 'revoked', unknown: 'unknown' };

export interface SessionListProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** `null` means the sessions could not be loaded (unavailable state); `[]` is the empty state. */
  sessions: readonly SessionRecord[] | null;
  /** Skeleton rows while the first load is in flight. */
  loading?: boolean;
  /** The caller's own session: shown as "Session actuelle", never revocable from here. */
  currentSessionId?: string | null;
  /** When provided, active sessions get a "Déconnecter" action. */
  onRevoke?: (session: SessionRecord) => void;
  /** Session whose revocation is in flight: its action is disabled. */
  revokingId?: string | null;
  /** Shown as "Actualiser" in the unavailable state. */
  onRetry?: () => void;
  emptyMessage?: string;
  unavailableMessage?: string;
  /** Column label for the identifier shown under the device, omitted for end users. */
  showIds?: boolean;
  timeZone?: string;
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

const isoDateTime = /^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):([0-5]\d):([0-5]\d)(?:\.\d+)?(?:Z|[+-](?:0\d|1[0-4]):[0-5]\d)$/;

/**
 * Format a BFF timestamp in the instance time zone; an invalid or missing value is
 * reported, never guessed (Date would roll "2026-02-30" over to March, so the
 * calendar day is checked explicitly).
 */
export function formatSessionDate(value: string | null | undefined, timeZone = getInstanceTimeZone()): string | null {
  if (!value) return null;
  const match = isoDateTime.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
  if (!daysInMonth || day < 1 || day > daysInMonth) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short', timeZone }).format(date);
}

function SessionDate({ value, timeZone }: { value: string | null | undefined; timeZone?: string }) {
  const label = formatSessionDate(value, timeZone);
  return label && value ? <time dateTime={value}>{label}</time> : <span>Date indisponible</span>;
}

/**
 * The shared session display (MAIR-607): Administrator lists the sessions of a
 * user, Settings lists the caller's own sessions with a revoke action. Same
 * columns, same state badges, same empty / loading / unavailable states.
 */
export const SessionList = ({ sessions, loading = false, currentSessionId = null, onRevoke, revokingId = null, onRetry, emptyMessage = 'Aucune session à afficher.', unavailableMessage = 'Les sessions sont temporairement indisponibles.', showIds = false, timeZone, now: fixedNow, className = '', ...props }: SessionListProps) => {
  const now = useNow(sessions, fixedNow);
  const frame = joinClasses('session-list overflow-hidden rounded-lg border border-[var(--mairie-border)] bg-[var(--mairie-surface)]', className);

  if (loading && !sessions) {
    return (
      <div {...props} className={frame} aria-busy="true">
        <div className="p-4"><Skeleton.TableRow label="Chargement des sessions…" columns={5} /></div>
      </div>
    );
  }
  if (!sessions) {
    return (
      <div {...props} className={frame}>
        <DataState
          state="unavailable"
          size="s"
          role="status"
          title={unavailableMessage}
          description="Utilisez Actualiser pour réessayer."
          action={onRetry ? <RefreshButton size="s" onClick={onRetry} /> : undefined}
        />
      </div>
    );
  }
  if (sessions.length === 0) {
    return (
      <div {...props} className={frame}>
        <DataState state="empty" size="s" title={emptyMessage} description={null} />
      </div>
    );
  }

  return (
    <div {...props} className={joinClasses(frame, 'overflow-x-auto')}>
      <table className="min-w-[760px] w-full text-left text-sm">
        <thead className="bg-[var(--mairie-surface-raised)] text-xs font-semibold uppercase tracking-wide text-[var(--mairie-muted)]">
          <tr>
            <th scope="col" className="px-4 py-3">Appareil</th>
            <th scope="col" className="px-4 py-3">Adresse IP</th>
            <th scope="col" className="px-4 py-3">Créée le</th>
            <th scope="col" className="px-4 py-3">Expiration</th>
            <th scope="col" className="px-4 py-3">État</th>
            {onRevoke ? <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--mairie-border)]">
          {sessions.map(session => {
            const state = sessionState(session, now);
            const current = currentSessionId !== null && session.id === currentSessionId;
            const revocable = Boolean(onRevoke) && state === 'active' && !current;
            return (
              <tr key={session.id} data-session-state={state}>
                <td className="px-4 py-3.5">
                  <div className="font-semibold text-[var(--mairie-text)]">{session.device_info}</div>
                  {current ? <div className="mt-0.5 text-xs text-[var(--mairie-muted)]">Session actuelle</div> : null}
                  {showIds ? <div className="mt-0.5 font-mono text-xs text-[var(--mairie-muted)]">{session.id}</div> : null}
                </td>
                <td className="px-4 py-3.5 text-[var(--mairie-text)]">{session.ip_address}</td>
                <td className="px-4 py-3.5 text-[var(--mairie-text)]"><SessionDate value={session.created_at} timeZone={timeZone} /></td>
                <td className="px-4 py-3.5 text-[var(--mairie-text)]">
                  {state === 'revoked'
                    ? <>Révoquée le <SessionDate value={session.revoked_at} timeZone={timeZone} /></>
                    : <SessionDate value={session.expires_at} timeZone={timeZone} />}
                </td>
                <td className="px-4 py-3.5"><StatusBadge status={stateStatuses[state]} label={stateLabels[state]} size="s" /></td>
                {onRevoke ? (
                  <td className="px-4 py-3.5 text-right">
                    {revocable ? (
                      <Button
                        label={revokingId === session.id ? 'Déconnexion…' : 'Déconnecter'}
                        size="s"
                        variant="outline"
                        tone="danger"
                        loading={revokingId === session.id}
                        aria-label={`Déconnecter la session ${session.device_info}`}
                        onClick={() => onRevoke?.(session)}
                      />
                    ) : <span className="text-[var(--mairie-muted)]" aria-hidden="true">—</span>}
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
