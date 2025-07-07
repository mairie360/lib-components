import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';

import { Alert } from '../components/Alert';

const meta: Meta<typeof Alert> = {

  title: 'Components/Alerts/Alert',
  component: Alert,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['success', 'error', 'warning', 'info'],
    },
    title: { control: 'text' },
    message: { control: 'text' },
    closable: { control: 'boolean' },
    autoDismiss: {
      control: { type: 'number' },
      description: 'Temps avant disparition automatique (en ms)',
    },
    onClose: { action: 'fermé' },
  },
};

export default meta;

type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  args: {
    type: 'info',
    title: 'Information',
    message: 'Ceci est une alerte informative.',
  },
};

export const Closable: Story = {
  args: {
    type: 'warning',
    title: 'Attention',
    message: 'Vous devez vérifier votre saisie.',
    closable: true,
    onClose: fn(),
  },
};

export const Success: Story = {
  args: {
    type: 'success',
    title: 'Succès',
    message: 'L’opération a réussi.',
    closable: true,
  },
};

export const AutoDismiss: Story = {
  args: {
    type: 'error',
    title: 'Erreur',
    message: 'Une erreur est survenue.',
    closable: true,
    autoDismiss: 3000,
  },
};
