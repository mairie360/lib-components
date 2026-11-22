import type { Meta, StoryObj } from '@storybook/react-vite';
import { KeyRound, Smartphone } from 'lucide-react';

import { Avatar } from '../components/Avatar';
import { ProgressMeter } from '../components/ProgressMeter';
import { RadioGroup } from '../components/RadioGroup';

const meta = { title: 'Components/Forms/RadioGroup (card)', component: RadioGroup, tags: ['autodocs'], decorators: [(Story) => <div className="max-w-xl"><Story /></div>] } satisfies Meta<typeof RadioGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Choice of a two-factor method: icon, « Recommandé » badge and help text; the selected card has the accent border. */
export const Methods: Story = {
  args: {
    variant: 'card',
    label: 'Méthode d’authentification',
    name: 'method',
    defaultValue: 'passkey',
    options: [
      { value: 'passkey', label: 'Clé d’accès (passkey)', hint: 'Utilisez votre empreinte, votre visage ou la clé de votre appareil. Plus sûr et plus rapide.', icon: KeyRound, badge: 'Recommandé' },
      { value: 'totp', label: 'Application d’authentification', hint: 'Saisissez un code à 6 chiffres à chaque connexion.', icon: Smartphone },
    ],
  },
};

/** MAIR-1132: an Avatar in the `leading` slot (it pops when selected) and the load of each agent in the `footer` slot. */
export const Assignee: Story = {
  args: {
    variant: 'card',
    label: 'Responsable de la tâche',
    name: 'assignee',
    defaultValue: 'camille',
    options: [
      { value: 'camille', label: 'Camille Martin', hint: 'Urbanisme', leading: <Avatar alt="Camille Martin" size="l" />, footer: <ProgressMeter label="Charge" value={60} size="s" /> },
      { value: 'leo', label: 'Léo Roux', hint: 'Services techniques', leading: <Avatar alt="Léo Roux" size="l" />, footer: <ProgressMeter label="Charge" value={85} size="s" tone="warning" /> },
    ],
  },
};
