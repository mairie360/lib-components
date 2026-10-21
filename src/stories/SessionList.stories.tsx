import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { SessionList, type SessionRecord } from '../components/SessionList';

const sessions: SessionRecord[] = [
  { id: '3f9c1a2e-6b4d-4e1f-9c7a-2d8e5b1f0a3c', device_info: 'Chrome 129 · Windows 11', ip_address: '192.168.1.24', created_at: '2026-10-20T07:12:00Z', expires_at: '2999-01-01T00:00:00Z' },
  { id: 'b7e2d4c1-1f3a-4c2b-8d6e-9a0f1b2c3d4e', device_info: 'Safari · iPhone', ip_address: '10.0.0.8', created_at: '2026-10-19T15:40:00Z', expires_at: '2999-01-01T00:00:00Z' },
  { id: 'c1d2e3f4-5a6b-4c7d-8e9f-0a1b2c3d4e5f', device_info: 'Firefox · Fedora', ip_address: '10.0.0.9', created_at: '2026-10-01T06:00:00Z', expires_at: '2026-10-02T06:00:00Z' },
  { id: 'd4e5f6a7-8b9c-4d0e-9f1a-2b3c4d5e6f70', device_info: 'Edge · Windows 10', ip_address: '10.0.0.10', created_at: '2026-10-18T06:00:00Z', expires_at: '2026-10-19T06:00:00Z', revoked_at: '2026-10-18T09:40:00Z' },
];

const meta = {
  title: 'Components/Shared/SessionList',
  component: SessionList,
  tags: ['autodocs'],
  args: { sessions, timeZone: 'Europe/Paris', onRevoke: fn(), onRetry: fn() },
} satisfies Meta<typeof SessionList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Settings: the caller's own sessions, the current one is not revocable. */
export const OwnSessions: Story = { args: { currentSessionId: sessions[0].id } };

/** Administrator: the sessions of another user, read-only with identifiers. */
export const UserSessions: Story = { args: { onRevoke: undefined, showIds: true } };

export const Loading: Story = { args: { sessions: null, loading: true } };

export const Empty: Story = { args: { sessions: [] } };

export const Unavailable: Story = { args: { sessions: null } };
