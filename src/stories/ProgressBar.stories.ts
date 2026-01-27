import type { Meta, StoryObj } from '@storybook/nextjs';
import { ProgressBar } from '../components/ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'Components/ProgressBar/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
    argTypes: {
    className: { control: 'text' },
    value: { control: 'number', min: 0, max: 100 },
  },
};

export default meta;

type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
  args: {
    className: '',
    value: 50,
  },
};

export const Full: Story = {
  args: {
    className: '',
    value: 100,
  },
};

export const Empty: Story = {
  args: {
    className: '',
    value: 0,
  },
};

export const CustomClass: Story = {
  args: {
    className: 'border-2 border-green-500',
    value: 75,
  },
};