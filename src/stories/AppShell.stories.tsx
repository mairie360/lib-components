import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

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

export const Anonymous: StoryObj<typeof AppShell> = {
  args: {
    user: undefined,
    onLogout: undefined,
    children: <h1 className="text-2xl font-semibold">Connexion</h1>,
  },
};

export const MobileKeyboardNavigation: StoryObj<typeof AppShell> = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: {
      description: {
        story: 'Open the mobile menu to verify that focus starts inside the drawer and returns to the menu button after Escape.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const menuButton = canvas.queryByRole('button', { name: 'Ouvrir la navigation' });
    if (!menuButton) return;
    await userEvent.click(menuButton);
    await expect(canvas.getByRole('button', { name: 'Fermer la navigation' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect(menuButton).toHaveFocus();
  },
};
