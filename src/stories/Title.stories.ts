import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';

import { Title } from '../components/Title';

// Configuration de la story : https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Components/Text/Title',
  component: Title,
  parameters: {
    // Paramètre facultatif pour centrer le composant dans le Canvas.
    layout: 'centered',
  },
  // Génère automatiquement une page Autodocs pour ce composant.
  tags: ['autodocs'],
  // Configuration des contrôles Storybook.
  argTypes: {
    onClick: { action: 'clicked' },
  },
} satisfies Meta<typeof Title>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TitleWithoutSubtitle: Story = {
  args: {
    title: 'Titre',
  },
};

export const TitleWithSubtitle: Story = {
  args: {
    title: 'Titre',
    subtitle: 'Sous-titre',
  },
};
