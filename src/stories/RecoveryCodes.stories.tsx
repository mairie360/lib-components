import type { Meta, StoryObj } from '@storybook/react-vite';

import { RecoveryCodes } from '../components/RecoveryCodes';

const codes = ['K3F9-27QX', 'M8TA-4WLB', 'Z2PD-91CR', 'H7GV-60NE', 'Q5JB-38YA', 'X1LU-72DS', 'R9WC-15KT', 'B4NF-83MH', 'T6EA-20ZP', 'D0YS-57VG'];
const meta = { title: 'Components/Forms/RecoveryCodes', component: RecoveryCodes, tags: ['autodocs'], args: { codes } } satisfies Meta<typeof RecoveryCodes>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Shown once after the two-factor setup: copy or download them. */
export const Default: Story = { render: (args) => <div className="max-w-xl"><RecoveryCodes {...args} /></div> };
