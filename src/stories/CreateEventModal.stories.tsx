import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';

import { CreateEventModal } from '../components/CreateEventModal';

const meta = {
  title: 'Components/Calendar/CreateEventModal',
  component: CreateEventModal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  args: {
    isOpen: true,
    people: [
      { id: 'alice', name: 'Alice Dupont', role: 'Communication' },
      { id: 'karim', name: 'Karim Payet', role: 'Logistique' },
      { id: 'lea', name: 'Léa Martin', role: 'Culture' },
      { id: 'thomas', name: 'Thomas Robert', role: 'Sécurité' },
    ],
    initialValues: {
      category: 'meeting',
    },
    onCancel: fn(),
    onCreate: fn(),
  },
} satisfies Meta<typeof CreateEventModal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
