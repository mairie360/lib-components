import type { Meta, StoryObj } from '@storybook/react';
import { Header, HeaderProps } from './Header';

const meta: Meta<typeof Header> = {
  title: 'Example/Header',
  component: Header,
  tags: ['autodocs'],
};

export default meta;

const mockLinks = [
  { id: '1', name: 'Accueil', url: '/' },
  { id: '2', name: 'Services', url: '/services' },
  { id: '3', name: 'Contact', url: '/contact' },
];

const LoggedInLinks = [
  { id: '1', name: 'Accueil', url: '/' },
  { id: '2', name: 'Calendriers', url: '/calendars' },
  { id: '3', name: 'Projets', url: '/projects' },
  { id: '4', name: 'Emails', url: '/emails'},
  { id: '5', name: 'Messages', url: '/messages'},
  { id: '6', name: 'Fichiers', url: '/files'},
  { id: '7', name: 'Formation', url: '/e-learning'}
];

export const LoggedOut: StoryObj<HeaderProps> = {
  args: {
    user: undefined,
    links: mockLinks,
    pathname: '/',
    onLogin: () => alert('Connexion'),
    onSelectModule: (module) => alert(`Module sélectionné : ${module.name}`),
  },
};

export const LoggedIn: StoryObj<HeaderProps> = {
  args: {
    user: {
      name: 'Alice Dupont',
      avatarUrl: '/logo.png',
    },
    links: LoggedInLinks,
    pathname: '/services',
    onLogout: () => alert('Déconnexion'),
    onSelectModule: (module) => alert(`Module sélectionné : ${module.name}`),
  },
};
