import type { Meta, StoryObj } from '@storybook/react-vite';
import { MessageSquare, Shield } from 'lucide-react';
import { Sidebar, SidebarProps, defaultSidebarItems } from '../components/Sidebar';

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

/** MAIR-1092 / MAIR-1094: white band, active indicator bar, Administration like the others, counters « 4 » and « 9+ ». Hover an entry to see its icon animation (MAIR-1093). */
export const WithCounters: StoryObj<SidebarProps> = {
  args: {
    activeItem: 'admin',
    isAdmin: true,
    items: defaultSidebarItems.map((item) => {
      if (item.id === 'messages') return { ...item, icon: MessageSquare, count: 4 };
      if (item.id === 'admin') return { ...item, icon: Shield, count: 12 };
      return item;
    }),
  },
};
