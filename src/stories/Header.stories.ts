import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
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

/** MAIR-834: « Déconnexion » opens the confirmation; `onLogout` runs after « Se déconnecter » (a promise keeps it loading). */
export const LogoutConfirmation: StoryObj<HeaderProps> = {
  args: {
    user: { name: 'Quentin Tennerel', email: 'agent@mairie360.fr', role: 'user' },
    onLogout: fn(() => new Promise((resolve) => setTimeout(resolve, 1200))),
  },
};

/** MAIR-835: search as you type, with the ✕ clear button and Échap. */
export const SearchAsYouType: StoryObj<HeaderProps> = {
  args: {
    user: { name: 'Quentin Tennerel', email: 'agent@mairie360.fr', role: 'user' },
    searchLabel: 'Rechercher un événement',
    searchPlaceholder: 'Rechercher un événement…',
    onSearchChange: fn(),
    onSearch: fn(),
  },
};
