import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';

import { UserProfilePage } from '../components/UserProfilePage';
import type { UserProfilePageProps } from '../components/UserProfilePage';

const meta: Meta<typeof UserProfilePage> = {
  title: 'Components/UserProfile/UserProfilePage',
  component: UserProfilePage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onUpdateUser: fn(),
    headerProps: {
      onPageChange: fn(),
      onLogout: fn(),
      profileHref: '/profil',
    },
    footerProps: {
      year: 2026,
      version: '2.1.0',
    },
  },
};

export default meta;

export const Consultation: StoryObj<UserProfilePageProps> = {
  args: {
    user: {
      name: 'Marie Martin',
      email: 'marie.martin@mairie360.fr',
      phone: '+33 1 23 45 67 90',
      service: 'Communication',
      position: 'Responsable communication',
      role: 'manager',
      address: '12 rue de la Mairie',
      city: 'Saint-Denis',
      lastConnection: "Aujourd'hui à 09:42",
    },
  },
};
