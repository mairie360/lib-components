import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';

import { Button } from '../components/Button';

// Configuration de la story : https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Components/Buttons/Button',
  component: Button,
  parameters: {
    // Paramètre facultatif pour centrer le composant dans le Canvas.
    layout: 'centered',
  },
  // Génère automatiquement une page Autodocs pour ce composant.
  tags: ['autodocs'],
  // Configuration des contrôles Storybook.
  argTypes: {
    backgroundColor: { control: 'color' },
  },
  // Utilise `fn` pour afficher les clics dans le panneau Actions.
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Exemple avec arguments.
export const Default: Story = {
  args: {
    label: 'Bouton',
  },
};
