import React from 'react';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { SessionList, formatSessionDate, nextSessionExpiryDelay, sessionState, type SessionRecord } from '../components/SessionList';

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
    expect(within(rows[0]).getByText('Session actuelle')).toBeInTheDocument();
    expect(within(rows[0]).queryByRole('button')).toBeNull();
    expect(within(rows[1]).getByText('Active')).toBeInTheDocument();
    expect(within(rows[2]).getByText('Expirée')).toBeInTheDocument();
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
    await user.click(screen.getByRole('button', { name: 'Actualiser' }));
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
      const { renderToString } = require('react-dom/server') as typeof import('react-dom/server');
      const html = renderToString(<SessionList sessions={sessions} now={NOW} timeZone="Europe/Paris" />);
      expect(html).toContain('Chrome 129 · Windows 11');
      expect(html).toContain('Expirée');
    } finally {
      globalThis.window = originalWindow;
    }
  });
});
