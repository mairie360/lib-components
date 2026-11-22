import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Bell, MonitorSmartphone, ShieldCheck } from 'lucide-react';

import { Avatar } from '../components/Avatar';
import { PageHero } from '../components/PageHero';

const meta = {
  title: 'Components/Display/PageHero',
  component: PageHero,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    overline: 'Mon compte',
    title: 'Camille Martin',
    subtitle: 'Agent · Urbanisme · camille.martin@mairie.fr',
    avatar: <Avatar alt="Camille Martin" size="xl" />,
    stats: (
      <>
        <PageHero.Stat icon={ShieldCheck} label="Double authentification" value="Activée" dot="success" href="#securite" />
        <PageHero.Stat icon={MonitorSmartphone} label="Sessions actives" value={3} onClick={fn()} />
        <PageHero.Stat icon={Bell} label="Notifications" value="4 non lues" dot="warning" href="#notifications" />
      </>
    ),
  },
} satisfies Meta<typeof PageHero>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Settings V2.1: under 1100 px the tiles go below the identity (3 columns), under 640 px in one column. */
export const Default: Story = {};
export const WithoutStats: Story = { args: { stats: undefined } };
export const WithoutAvatar: Story = { args: { avatar: undefined, overline: 'Projet', title: 'Rénovation de l’école Jules-Ferry', subtitle: 'Urbanisme · échéance 27 novembre' } };
