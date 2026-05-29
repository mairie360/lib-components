import type { Meta, StoryObj } from '@storybook/nextjs';
import { Header, HeaderProps } from '../components/Header';

const meta: Meta<typeof Header> = {
  title: 'Components/Header/Header',
  component: Header,
  tags: ['autodocs'],
};

export default meta;

export const Admin: StoryObj<HeaderProps> = {
  args: {
    user: {
      name: 'Admin Système',
      avatarUrl: '',
      email: 'admin@mairie360.fr',
      role: 'admin',
    },
    isAdmin: true,
    onPageChange: (page) => alert(`Page sélectionnée : ${page}`),
    onLogout: () => alert('Déconnexion'),
  },
};

export const StandardUser: StoryObj<HeaderProps> = {
  args: {
    user: {
      name: 'Alice Dupont',
      avatarUrl: '/logo.png',
      email: 'alice@mairie360.fr',
      role: 'user',
    },
    onPageChange: (page) => alert(`Page sélectionnée : ${page}`),
    onLogout: () => alert('Déconnexion'),
  },
};
