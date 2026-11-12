import { act, render, screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { SessionList, nextSessionExpiryDelay, sessionState, type SessionRecord } from './SessionList';
import { formatSessionDate } from './session-dates';

const NOW = Date.parse('2026-10-21T10:00:00Z');
const sessions: SessionRecord[] = [
  { id: 'cur', device_info: 'Chrome 129 · Windows 11', ip_address: '192.168.1.24', created_at: '2026-10-21T09:12:00Z', expires_at: '2026-10-22T09:12:00Z' },
  { id: 'other', device_info: 'Safari · iPhone', ip_address: '10.0.0.8', created_at: '2026-10-20T17:40:00Z', expires_at: '2026-10-21T17:40:00Z' },
  { id: 'old', device_info: 'Firefox · Fedora', ip_address: '10.0.0.9', created_at: '2026-10-01T08:00:00Z', expires_at: '2026-10-02T08:00:00Z' },
  { id: 'gone', device_info: 'Edge · Windows 10', ip_address: '10.0.0.10', created_at: '2026-10-19T08:00:00Z', expires_at: '2026-10-20T08:00:00Z', revoked_at: '2026-10-19T11:40:00Z' },
];

describe('SessionList (MAIR-607)', () => {
  it('derives the state from the dates: revoked wins, then expiry, unknown when unparsable', () => {
    expect(sessionState({ expires_at: '2026-10-22T09:12:00Z', revoked_at: null }, NOW)).toBe('active');
    expect(sessionState({ expires_at: '2026-10-02T08:00:00Z' }, NOW)).toBe('expired');
    expect(sessionState({ expires_at: '2999-01-01T00:00:00Z', revoked_at: '2026-10-19T11:40:00Z' }, NOW)).toBe('revoked');
    expect(sessionState({ expires_at: null }, NOW)).toBe('unknown');
    expect(nextSessionExpiryDelay(sessions, NOW)).toBe(Date.parse('2026-10-21T17:40:00Z') - NOW + 1);
    expect(nextSessionExpiryDelay([sessions[2], sessions[3]], NOW)).toBeNull();
  });

  it('reports an impossible calendar day or a non-ISO expiry as unknown, with no timer and no date (CodeRabbit on #464)', () => {
    const now = Date.parse('2026-02-01T00:00:00Z');
    for (const expires_at of ['2026-02-30T08:00:00Z', '2026-10-21 10:00', '2027-13-01T00:00:00Z']) {
      expect(sessionState({ expires_at, revoked_at: null }, now)).toBe('unknown');
      expect(nextSessionExpiryDelay([{ expires_at, revoked_at: null }], now)).toBeNull();
      expect(formatSessionDate(expires_at, 'Europe/Paris')).toBeNull();
    }
    expect(sessionState({ expires_at: '2026-02-28T08:00:00Z', revoked_at: null }, now)).toBe('active');
  });

  it('formats valid timestamps in the given time zone and reports missing or invalid ones', () => {
    expect(formatSessionDate('2026-10-21T09:12:00Z', 'Europe/Paris')).toBe('21 oct. 2026, 11:12');
    expect(formatSessionDate('2026-13-45', 'Europe/Paris')).toBeNull();
    expect(formatSessionDate('2026-02-30T08:00:00Z', 'Europe/Paris')).toBeNull();
    expect(formatSessionDate('2028-02-29T10:30:00+04:00', 'Europe/Paris')).not.toBeNull();
    expect(formatSessionDate('not-a-date', 'Europe/Paris')).toBeNull();
    expect(formatSessionDate(null, 'Europe/Paris')).toBeNull();
  });

  it('renders one row per session with its state badge, marks the current session and offers revocation only on other active sessions', async () => {
    const user = userEvent.setup();
    const onRevoke = jest.fn();
    render(<SessionList sessions={sessions} currentSessionId="cur" onRevoke={onRevoke} timeZone="Europe/Paris" now={NOW} />);
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows).toHaveLength(4);
    expect(rows[0]).toHaveAttribute('data-session-state', 'active');
    expect(within(rows[0]).getByText('Cet appareil')).toHaveAttribute('data-tone', 'primary');
    expect(within(rows[0]).queryByRole('button')).toBeNull();
    expect(within(rows[1]).getByText('Active')).toBeInTheDocument();
    expect(within(rows[2]).getByText('Expirée')).toBeInTheDocument();
    expect(within(rows[2]).getByText(/Expirée le/)).toBeInTheDocument();
    expect(within(rows[3]).getByText('Révoquée')).toBeInTheDocument();
    expect(within(rows[3]).getByText(/Révoquée le/)).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Déconnecter la session Safari · iPhone' }));
    expect(onRevoke).toHaveBeenCalledWith(sessions[1]);
  });

  it('shows the loading, empty and unavailable states, the last one with a retry action', async () => {
    const user = userEvent.setup();
    const onRetry = jest.fn();
    const { rerender } = render(<SessionList sessions={null} loading />);
    expect(screen.getByText('Chargement des sessions…')).toBeInTheDocument();
    rerender(<SessionList sessions={[]} />);
    expect(screen.getByText('Aucune session à afficher.')).toBeInTheDocument();
    rerender(<SessionList sessions={null} onRetry={onRetry} />);
    expect(screen.getByRole('status')).toHaveTextContent('Les sessions sont temporairement indisponibles.');
    expect(screen.getByRole('status')).not.toHaveTextContent('Utilisez Actualiser');
    await user.click(screen.getByRole('button', { name: 'Réessayer' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('flips an active session to expired when its expiry passes, with a single timer', () => {
    jest.useFakeTimers();
    try {
      const soon = Date.now() + 1_000;
      const list: SessionRecord[] = [{ id: 'soon', device_info: 'Chrome', ip_address: '10.0.0.1', created_at: '2026-10-21T09:12:00Z', expires_at: new Date(soon).toISOString() }];
      render(<SessionList sessions={list} />);
      expect(screen.getByRole('row', { name: /Chrome/ })).toHaveAttribute('data-session-state', 'active');
      act(() => { jest.advanceTimersByTime(1_100); });
      expect(screen.getByRole('row', { name: /Chrome/ })).toHaveAttribute('data-session-state', 'expired');
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('SessionList without a browser window (MAIR-607)', () => {
  it('renders on a server-like runtime that exposes a document stand-in but no window', () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error simulate a server renderer with a document stand-in only
    delete globalThis.window;
    try {
      const html = renderToString(<SessionList sessions={sessions} now={NOW} timeZone="Europe/Paris" />);
      expect(html).toContain('Chrome 129 · Windows 11');
      expect(html).toContain('Expirée');
    } finally {
      globalThis.window = originalWindow;
    }
  });
});

describe('SessionList V2 (MAIR-845, MAIR-1000)', () => {
  it('puts the current session first, opens a session from its row or its device button, and keeps revoke apart', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn(); const onRevoke = jest.fn();
    const ordered = [sessions[1], sessions[0], sessions[2]];
    render(<SessionList sessions={ordered} currentSessionId="cur" onSelect={onSelect} onRevoke={onRevoke} now={NOW} timeZone="Europe/Paris" />);
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0]).toHaveAttribute('data-current', 'true');
    await user.click(rows[2]);
    expect(onSelect).toHaveBeenLastCalledWith(sessions[2]);
    screen.getByRole('button', { name: 'Voir le détail de la session Safari · iPhone' }).focus();
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenLastCalledWith(sessions[1]);
    await user.click(screen.getByRole('button', { name: 'Déconnecter la session Safari · iPhone' }));
    expect(onRevoke).toHaveBeenCalledWith(sessions[1]);
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  it('keeps the given order with currentFirst={false} and names the history column', () => {
    render(<SessionList sessions={[sessions[1], sessions[0]]} currentSessionId="cur" currentFirst={false} dateColumnLabel="Fin" now={NOW} />);
    expect(screen.getAllByRole('row')[1]).not.toHaveAttribute('data-current');
    expect(screen.getByRole('columnheader', { name: 'Fin' })).toBeInTheDocument();
  });

  it('shows two lines per session without a header row in the compact layout', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    render(<SessionList layout="compact" caption="Sessions de Marie" sessions={sessions} currentSessionId="cur" onRevoke={jest.fn()} onSelect={onSelect} now={NOW} timeZone="Europe/Paris"
      deviceLabel={session => session.device_info.split(' · ')[0]} />);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    const items = within(screen.getByRole('list', { name: 'Sessions de Marie' })).getAllByRole('listitem');
    expect(items).toHaveLength(4);
    expect(within(items[0]).getByText('Cet appareil')).toBeInTheDocument();
    expect(within(items[0]).getByText(/Expire le/)).toBeInTheDocument();
    expect(within(items[3]).getByText(/Révoquée le/)).toBeInTheDocument();
    expect(within(items[1]).getByRole('button', { name: 'Déconnecter la session Safari' })).toBeInTheDocument();
    await user.click(within(items[2]).getByText('10.0.0.9'));
    expect(onSelect).toHaveBeenCalledWith(sessions[2]);
    expect(within(items[0]).queryByRole('button', { name: /^Déconnecter/ })).toBeNull();
  });

  it('offers the four states in the compact layout with configurable texts', () => {
    const { rerender, container } = render(<SessionList layout="compact" sessions={null} loading />);
    expect(container.firstElementChild).toHaveAttribute('data-layout', 'compact');
    rerender(<SessionList layout="compact" sessions={[]} emptyTitle="Aucune session dans l’historique" emptyDescription="Les sessions terminées apparaîtront ici." />);
    expect(screen.getByText('Aucune session dans l’historique')).toBeInTheDocument();
    expect(screen.getByText('Les sessions terminées apparaîtront ici.')).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
    rerender(<SessionList layout="compact" sessions={null} unavailableTitle="Sessions indisponibles" unavailableDescription="Réessayez dans un instant." />);
    expect(screen.getByRole('status')).toHaveTextContent('Sessions indisponiblesRéessayez dans un instant.');
    expect(screen.queryByRole('button', { name: 'Réessayer' })).toBeNull();
  });

  it('switches to cards below 640 px', () => {
    const listeners: Array<() => void> = [];
    const query = { matches: true, addEventListener: (_: string, listener: () => void) => listeners.push(listener), removeEventListener: jest.fn() };
    const original = window.matchMedia;
    window.matchMedia = jest.fn().mockReturnValue(query) as unknown as typeof window.matchMedia;
    try {
      render(<SessionList sessions={sessions} now={NOW} />);
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      expect(screen.getByRole('list', { name: 'Sessions de connexion' })).toBeInTheDocument();
    } finally { window.matchMedia = original; }
  });
});
