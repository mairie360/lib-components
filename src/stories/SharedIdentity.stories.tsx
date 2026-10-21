import type { Meta, StoryObj } from '@storybook/react-vite';

import { UserIdentity } from '../components/UserIdentity';
import { AvatarStack } from '../components/AvatarStack';
import { Avatar } from '../components/Avatar';
import { Spinner } from '../components/Spinner';
import { SessionExpiredNotice } from '../components/SessionExpiredNotice';
import { PendingFeatureNotice } from '../components/PendingFeatureNotice';
import { sizes } from '../kit/theme';

const meta = { title: 'Components/Shared business/UserIdentity', component: UserIdentity, tags: ['autodocs'], args: { name: 'Marie Martin', email: 'marie.martin@mairie.fr', size: 'm', variant: 'full' } } satisfies Meta<typeof UserIdentity>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Sizes: Story = { render: (args) => <div className="flex flex-col gap-3">{sizes.map((size) => <UserIdentity key={size} {...args} size={size} />)}</div> };
export const Variants: Story = { render: (args) => <div className="flex gap-6"><UserIdentity {...args} /><UserIdentity {...args} variant="nameOnly" /><UserIdentity {...args} variant="photo" /></div> };
export const Avatars: Story = { render: () => <div className="flex items-end gap-3">{sizes.map((size) => <Avatar key={size} alt="Marie Martin" size={size} />)}<Spinner size="l" label="Chargement" /></div> };
export const Stack: Story = { render: () => <AvatarStack label="Membres du projet" max={3} people={[{ name: 'Marie Martin' }, { name: 'Paul Durand' }, { name: 'Léa Petit' }, { name: 'Ali Ben' }, { name: 'Nora Diallo' }]} /> };
export const Notices: Story = { render: () => <div className="flex w-[600px] flex-col gap-6"><SessionExpiredNotice loginHref="#" /><PendingFeatureNotice feature="Pièces jointes" /></div> };
