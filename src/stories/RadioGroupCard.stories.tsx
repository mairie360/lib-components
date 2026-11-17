import type { Meta, StoryObj } from '@storybook/react-vite';
import { KeyRound, Smartphone } from 'lucide-react';

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
