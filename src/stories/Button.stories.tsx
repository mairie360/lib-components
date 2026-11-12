import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Calendar } from 'lucide-react';

import { Button } from '../components/Button';
import { BackButton, CancelButton, CloseButton, ConfirmDeleteButton, CreateButton, DeleteButton, DownloadButton, EditButton, LogoutButton, RefreshButton, RetryButton, SaveButton, SendButton } from '../components/ButtonPresets';
import { CloseIconButton, DeleteIconButton, EditIconButton, IconButton, MoreIconButton, NextIconButton, NotificationsIconButton, PreviousIconButton, SearchIconButton } from '../components/IconButton';
import { LinkButton } from '../components/LinkButton';
import { sizes, tones } from '../kit/theme';

const meta = {
  title: 'Components/Buttons/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: { onClick: fn(), label: 'Bouton', variant: 'solid', tone: 'primary', size: 'm' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const VariantsAndTones: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(['solid', 'outline', 'ghost', 'link'] as const).map((variant) => (
        <div key={variant} className="flex flex-wrap items-center gap-3">
          {tones.map((tone) => <Button key={tone} {...args} label={`${variant} ${tone}`} variant={variant} tone={tone} />)}
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => <div className="flex flex-wrap items-end gap-3">{sizes.map((size) => <Button key={size} {...args} label={size} size={size} icon={Calendar} />)}</div>,
};

export const Loading: Story = { args: { label: 'Enregistrement…', loading: true } };

export const Presets: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <CreateButton /><SaveButton /><CancelButton /><EditButton /><DeleteButton /><ConfirmDeleteButton /><RefreshButton /><RetryButton /><CloseButton /><BackButton /><SendButton /><DownloadButton /><LogoutButton />
    </div>
  ),
};

export const IconButtons: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {(['close', 'more', 'edit', 'delete', 'previous', 'next', 'search', 'notifications'] as const).map((preset) => <IconButton key={preset} preset={preset} />)}
    </div>
  ),
};

/** MAIR-843 / MAIR-862: the IconButton/* presets as components, and the disabled state in every size. */
export const IconButtonPresets: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <PreviousIconButton onClick={fn()} /><NextIconButton onClick={fn()} /><CloseIconButton /><EditIconButton /><DeleteIconButton /><SearchIconButton /><NotificationsIconButton /><MoreIconButton />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {sizes.map((size) => <NextIconButton key={size} size={size} disabled />)}
      </div>
    </div>
  ),
};

/** MAIR-842: with `href`, a button or a preset renders a real link (same look). */
export const AsLink: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <BackButton href="#connexion" label="Retour à la connexion" />
      <Button href="#aide" label="Aide en ligne" variant="outline" tone="secondary" />
      <Button href="#aide" label="Lien désactivé" disabled />
    </div>
  ),
};

export const LinkButtons: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      <LinkButton href="#" label="Mot de passe oublié ?" />
      <LinkButton href="#" label="Voir tout" icon={Calendar} tone="secondary" />
      <LinkButton href="#" icon={Calendar} iconOnly label="Ouvrir le calendrier" />
    </div>
  ),
};
