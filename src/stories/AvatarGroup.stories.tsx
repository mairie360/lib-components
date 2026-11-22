import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { AvatarGroup } from '../components/AvatarGroup';

const people = [{ name: 'Marie Martin' }, { name: 'Paul Durand' }, { name: 'Léa Petit' }, { name: 'Ali Ben' }];
const meta = { title: 'Components/Display/AvatarGroup', component: AvatarGroup, tags: ['autodocs'], args: { people, max: 3, size: 'm' }, parameters: { layout: 'padded' } } satisfies Meta<typeof AvatarGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Without a total: the stack shows « +n » after the third avatar. */
export const WithoutCount: Story = {};
/** With the total of the group (« 6 »). */
export const WithCount: Story = { args: { count: 6 } };
/** One accessible button « 6 membres, gérer les membres ». */
export const Clickable: Story = { args: { count: 6, size: 's', onClick: fn() } };
export const AsLink: Story = { args: { count: 6, href: '#membres' } };
