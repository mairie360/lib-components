import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { PublicBackdrop } from '../components/PublicBackdrop';

const meta: Meta<typeof PublicBackdrop> = {
  title: 'Components/Navigation/PublicBackdrop',
  component: PublicBackdrop,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="relative min-h-screen bg-[var(--mairie-background)]">
      <PublicBackdrop {...args} />
      <main className="relative grid min-h-screen place-items-center p-4">
        <div className="w-full max-w-sm rounded-[var(--mairie-radius-l)] border border-[var(--mairie-border)] bg-[var(--mairie-surface)] p-6 text-[var(--mairie-text)] shadow-[var(--mairie-shadow)]">
          <h1 className="text-xl font-semibold">Connexion</h1>
          <p className="mt-2 text-sm text-[var(--mairie-muted)]">Les rubans ondulent lentement derrière la carte ; ils restent immobiles si le mouvement est réduit.</p>
        </div>
      </main>
    </div>
  ),
};

export default meta;

/** MAIR-1103: the four ribbons of the public pages, waving slowly. */
export const Default: StoryObj<typeof PublicBackdrop> = {};

/** The still image shown under prefers-reduced-motion. */
export const Still: StoryObj<typeof PublicBackdrop> = { args: { animated: false } };
