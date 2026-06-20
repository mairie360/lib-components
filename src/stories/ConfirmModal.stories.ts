import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';

import { ConfirmModal } from '../components/ConfirmModal';

// Configuration de la story : https://storybook.js.org/docs/writing-stories#default-export
const meta: Meta<typeof ConfirmModal> = {
  title: 'Components/ConfirmModal/ConfirmModal',
  component: ConfirmModal,
  parameters: {
    // Paramètre facultatif pour centrer le composant dans le Canvas.
    layout: 'centered',
  },
  // Génère automatiquement une page Autodocs pour ce composant.
  tags: ['autodocs'],
  // Configuration des contrôles Storybook.
  argTypes: {
    onConfirm: { action: 'confirmed' },
    onCancel: { action: 'cancelled' },
  },
  // Utilise `fn` pour afficher les actions déclenchées dans le panneau Actions.
  args: {
    title: 'Confirmation',
    message: 'Êtes-vous sûr de vouloir continuer ?',
    isOpen: true,
    onConfirm: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof ConfirmModal>;
export default meta;
type Story = StoryObj<typeof meta>;
// Exemple avec arguments.
export const Default: Story = {
  args: {
    title: 'Supprimer un élément',
    message: 'Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.',
    isOpen: true,
    onConfirm: () => alert('Élément supprimé'),
    onCancel: () => alert('Suppression annulée'),
  },
};
