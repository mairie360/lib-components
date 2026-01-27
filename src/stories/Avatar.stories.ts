import type { Meta, StoryObj } from '@storybook/nextjs';
import { Avatar } from '../components/Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    src: { control: 'text' },
    alt: { control: 'text' },
    fallback: { control: 'text' },
    className: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: {
    src: 'https://via.placeholder.com/150',
    alt: 'User Avatar',
    fallback: 'UA',
    className: '',
  },
};

export const WithFallback: Story = {
  args: {
    src: 'https://invalid-url.com/avatar.jpg',
    alt: 'User Avatar',
    fallback: 'UA',
    className: '',
  },
};

export const CustomClass: Story = {
  args: {
    src: 'https://via.placeholder.com/150',
    alt: 'User Avatar',
    fallback: 'UA',
    className: 'border-4 border-red-500',
  },
};