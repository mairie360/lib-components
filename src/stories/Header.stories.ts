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

/** MAIR-1109: commune block (« Mairie de » + name) left of the search, the date at the start of the right zone, and the bell Counter (MAIR-1094). */
export const CommuneAndDate: StoryObj<HeaderProps> = {
  args: {
    user: { name: 'Claire Martin', email: 'claire.martin@mairie360.fr', role: 'user' },
    commune: 'Saint-André',
    showDate: true,
    date: 'jeudi 19 novembre',
    onSearch: fn(),
    onNotificationsClick: fn(),
    notificationCount: 12,
  },
};

/** MAIR-1109: a long commune name ends with an ellipsis without breaking the bar. */
export const LongCommuneName: StoryObj<HeaderProps> = {
  args: {
    commune: 'Saint-Remy-en-Bouzemont-Saint-Genest-et-Isson',
    onSearch: fn(),
    onNotificationsClick: fn(),
    notificationCount: 3,
  },
};

/** MAIR-1109: the commune block can be hidden. */
export const WithoutCommune: StoryObj<HeaderProps> = {
  args: { showCommune: false, onSearch: fn() },
};
