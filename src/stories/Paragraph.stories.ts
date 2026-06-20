import type { Meta, StoryObj } from '@storybook/nextjs';
import { expect, userEvent, within } from 'storybook/test';

import { Paragraph } from '../components/Paragraph';

// Configuration de la story : https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Components/Text/Paragraph',
  component: Paragraph,
  parameters: {
    // Paramètre facultatif pour centrer le composant dans le Canvas.
    layout: 'centered',
  },
  // Génère automatiquement une page Autodocs pour ce composant.
  tags: ['autodocs'],
  // Configuration des contrôles Storybook.
} satisfies Meta<typeof Paragraph>;

export default meta;
type Story = StoryObj<typeof meta>;

// Exemple avec arguments.
export const ParagraphWithText: Story = {
  args: {
    text: 'Paragraphe',
  },
};
