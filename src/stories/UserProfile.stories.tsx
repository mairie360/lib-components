import type { Meta, StoryObj } from '@storybook/nextjs';

import { UserProfile } from '../components/UserProfile';
import type { UserProfileProps } from '../components/UserProfile';

const meta: Meta<typeof UserProfile> = {
  title: 'Components/UserProfile/UserProfile',
  component: UserProfile,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

export const Consultation: StoryObj<UserProfileProps> = {
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
