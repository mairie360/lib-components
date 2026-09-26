import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { AppShell } from '../components/AppShell';

const meta: Meta<typeof AppShell> = {
  title: 'Components/Navigation/AppShell',
  component: AppShell,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    activeItem: 'projects',
    isAdmin: false,
    user: { name: 'Marie Martin', email: 'marie@example.fr', role: 'user' },
    hrefs: { dashboard: '/', projects: '/projects', messages: '/messages', settings: '/settings' },
    onNavigate: fn(),
    onLogout: fn(),
    children: <h1 className="text-2xl font-semibold">Projets</h1>,
  },
};

export default meta;
export const Default: StoryObj<typeof AppShell> = {};
