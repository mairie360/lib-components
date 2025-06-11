import type { Meta, StoryObj } from '@storybook/nextjs';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Components/Feedback/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'text',
      description: 'Dimensions du spinner (ex: w-6 h-6)',
      defaultValue: 'w-6 h-6',
    },
    color: {
      control: 'text',
      description: 'Couleur du spinner (ex: text-blue-500)',
      defaultValue: 'text-blue-500',
    },
    border: {
      control: 'text',
      description: 'Épaisseur de la bordure (ex: border-4)',
      defaultValue: 'border-4',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
  args: {
    size: 'w-6 h-6',
    color: 'text-blue-500',
    border: 'border-4',
  },
};

export const SmallGray: Story = {
  args: {
    size: 'w-4 h-4',
    color: 'text-gray-400',
    border: 'border-2',
  },
};

export const LargeIndigo: Story = {
  args: {
    size: 'w-12 h-12',
    color: 'text-indigo-600',
    border: 'border-[6px]',
  },
};
