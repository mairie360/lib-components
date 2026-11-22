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

/** MAIR-1092: the footer is no longer part of the page base; `showFooter` brings it back. */
export const WithFooter: StoryObj<typeof AppShell> = {
  args: { collapsibleSidebar: true, showFooter: true, footerProps: { year: 2026 } },
};

/** MAIR-1092 / MAIR-1093: the collapsible white band (72 ↔ 248 px); hover the entries to see their icon animations. */
export const CollapsibleNavigation: StoryObj<typeof AppShell> = {
  args: {
    collapsibleSidebar: true,
    isAdmin: true,
    hrefs: { dashboard: '/', projects: '/projects', calendar: '/calendar', messages: '/messages', training: '/training', admin: '/admin', settings: '/settings' },
    headerProps: { showDate: true, date: 'jeudi 19 novembre', notificationCount: 4 },
  },
};

/** MAIR-1139: focus layout, without navigation band nor Header: bar, table of contents, content and sticky actions. */
export const FocusLayout: StoryObj<typeof AppShell> = {
  args: {
    layout: 'focus',
    bar: <strong>Nouvelle demande d’intervention</strong>,
    aside: (
      <ol className="flex flex-col gap-2 text-sm">
        <li><a href="#identite">Identité du demandeur</a></li>
        <li><a href="#lieu">Lieu</a></li>
        <li><a href="#pieces">Pièces jointes</a></li>
      </ol>
    ),
    content: <h1 className="text-2xl font-semibold">Identité du demandeur</h1>,
    footer: <button type="button">Enregistrer</button>,
  },
};
