import type { Meta, StoryObj } from '@storybook/react-vite';

import { CopyField } from '../components/CopyField';

const meta = { title: 'Components/Forms/CopyField', component: CopyField, tags: ['autodocs'], args: { label: 'Clé secrète', value: 'JBSWY3DPEHPK3PXP' } } satisfies Meta<typeof CopyField>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Key of an authenticator app: monospace, click the button to copy. */
export const Default: Story = { render: (args) => <div className="max-w-md"><CopyField {...args} /></div> };
/** Grouped by 4 for reading; the raw value is what is copied. */
export const Grouped: Story = { args: { display: 'JBSW Y3DP EHPK 3PXP' }, render: (args) => <div className="max-w-md"><CopyField {...args} /></div> };
