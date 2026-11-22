import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { AtSign, KeyRound, MessageSquare, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { IconChipColor, IconChipTone } from '../components/IconChip';

import { SettingToggle, SettingToggleGroup } from '../components/SettingToggle';

const meta = { title: 'Components/Forms/SettingToggle', component: SettingToggle, tags: ['autodocs'] } satisfies Meta<typeof SettingToggle>;
export default meta;
type Story = StoryObj<typeof meta>;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function Setting({ label, description, initial, fail = false, icon, iconTone, iconColor }: { label: string; description: string; initial: boolean; fail?: boolean; icon?: LucideIcon; iconTone?: IconChipTone; iconColor?: IconChipColor }) {
  const [checked, setChecked] = useState(initial);
  return <SettingToggle label={label} description={description} checked={checked} icon={icon} iconTone={iconTone} iconColor={iconColor}
    onChange={async (next) => { await wait(800); if (fail) throw new Error('Échec'); setChecked(next); }} onError={() => undefined} />;
}

/** Saved at once: locked (aria-busy) while saving; « Échec simulé » goes back to its previous value. */
export const Notifications: Story = {
  args: { label: 'Nouveaux messages', checked: true, onChange: () => undefined },
  render: () => (
    <div className="max-w-xl">
      <SettingToggleGroup title="Types de notifications">
        <Setting label="Nouveaux messages" description="Recevoir une notification quand un agent vous écrit." initial />
        <Setting label="Mentions" description="Être averti quand on vous mentionne avec @." initial={false} />
        <Setting label="Échec simulé" description="L’enregistrement échoue : l’interrupteur revient en arrière." initial={false} fail />
      </SettingToggleGroup>
    </div>
  ),
};

/** MAIR-1116: icon chip (module colour for notification types) and the whole row clickable, with a hover background (none while saving or disabled). */
export const WithIcons: Story = {
  args: { label: 'Nouveaux messages', checked: true, onChange: () => undefined },
  render: () => (
    <div className="max-w-xl">
      <SettingToggleGroup title="Sécurité et notifications">
        <Setting label="Double authentification" description="Un code est demandé à chaque connexion." initial icon={ShieldCheck} />
        <Setting label="Passkeys" description="Se connecter sans mot de passe." initial={false} icon={KeyRound} />
        <Setting label="Nouveaux messages" description="Recevoir une notification quand un agent vous écrit." initial icon={MessageSquare} iconTone="module" iconColor="messaging" />
        <Setting label="Mentions" description="Être averti quand on vous mentionne avec @." initial={false} icon={AtSign} iconTone="module" iconColor="messaging" />
      </SettingToggleGroup>
      <SettingToggle label="Réglage verrouillé" description="Imposé par la mairie." checked disabled icon={ShieldCheck} onChange={() => undefined} />
    </div>
  ),
};
