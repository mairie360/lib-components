import type { Meta, StoryObj } from '@storybook/react-vite';

import { SessionDetails } from '../components/SessionDetails';

const session = {
  id: 'sess_7f3a9c2e41b8',
  device_info: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',
  ip_address: '192.0.2.24',
  created_at: '2026-11-12T07:42:00Z',
  expires_at: '2026-11-19T07:42:00Z',
  location: 'Lyon, France',
  last_active_at: '2026-11-12T09:30:00Z',
};

const meta = { title: 'Components/Shared/SessionDetails', component: SessionDetails, tags: ['autodocs'], args: { session, current: true, timeZone: 'Europe/Paris', now: Date.parse('2026-11-12T10:00:00Z') } } satisfies Meta<typeof SessionDetails>;
export default meta;
type Story = StoryObj<typeof meta>;

export const CurrentDevice: Story = { render: (args) => <div className="max-w-xl"><SessionDetails {...args} /></div> };
export const Revoked: Story = { args: { current: false, session: { ...session, device_info: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1', revoked_at: '2026-11-12T09:45:00Z' } }, render: (args) => <div className="max-w-xl"><SessionDetails {...args} /></div> };
