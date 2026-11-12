import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { SettingToggle, SettingToggleGroup } from '../components/SettingToggle';

const meta = { title: 'Components/Forms/SettingToggle', component: SettingToggle, tags: ['autodocs'] } satisfies Meta<typeof SettingToggle>;
export default meta;
type Story = StoryObj<typeof meta>;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function Setting({ label, description, initial, fail = false }: { label: string; description: string; initial: boolean; fail?: boolean }) {
  const [checked, setChecked] = useState(initial);
  return <SettingToggle label={label} description={description} checked={checked}
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
