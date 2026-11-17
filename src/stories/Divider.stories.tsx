import type { Meta, StoryObj } from '@storybook/react-vite';

import { Divider } from '../components/Divider';
import { PasswordField } from '../components/FieldPresets';

const meta = { title: 'Components/Display/Divider', component: Divider, tags: ['autodocs'], parameters: { layout: 'padded' } } satisfies Meta<typeof Divider>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Plain line (an `<hr>`). */
export const Plain: Story = {};
/** « ou » between two ways to sign in (the Login screen). */
export const WithLabel: Story = { args: { label: 'ou' }, render: (args) => <div className="max-w-sm"><PasswordField /><div className="my-4"><Divider {...args} /></div></div> };
/** Vertical, in a row of actions. */
export const Vertical: Story = { render: () => <div className="flex h-10 items-center gap-4"><span>Modifier</span><Divider orientation="vertical" /><span>Supprimer</span></div> };
