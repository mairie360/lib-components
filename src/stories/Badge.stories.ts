import { Meta, StoryObj } from '@storybook/react';
import { Badge } from '../components/Badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    text: { control: 'text' },
    variant: {
      control: { type: 'select' },
      options: ['default', 'green', 'blue', 'red', 'dark'],
    },
    rounded: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    text: 'Default Badge',
    variant: 'default',
    rounded: false,
  },
};

export const Green: Story = {
  args: {
    text: 'Green Badge',
    variant: 'green',
    rounded: false,
  },
};

export const Blue: Story = {
  args: {
    text: 'Blue Badge',
    variant: 'blue',
    rounded: false,
  },
};

export const Red: Story = {
  args: {
    text: 'Red Badge',
    variant: 'red',
    rounded: false,
  },
};

export const Dark: Story = {
  args: {
    text: 'Dark Badge',
    variant: 'dark',
    rounded: false,
  },
};