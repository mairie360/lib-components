import type { Meta, StoryObj } from '@storybook/nextjs';
import { Sidebar, SidebarProps } from '../components/Sidebar';

const meta: Meta<typeof Sidebar> = {
  title: 'Components/Navigation/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

export const Admin: StoryObj<SidebarProps> = {
  args: {
    activeItem: 'dashboard',
    isAdmin: true,
    onItemSelect: (item) => alert(`Menu sélectionné : ${item.label}`),
  },
};

export const StandardUser: StoryObj<SidebarProps> = {
  args: {
    activeItem: 'projects',
    isAdmin: false,
    onItemSelect: (item) => alert(`Menu sélectionné : ${item.label}`),
  },
};
