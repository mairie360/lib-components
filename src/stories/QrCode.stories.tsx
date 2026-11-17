import type { Meta, StoryObj } from '@storybook/react-vite';

import { CopyField } from '../components/CopyField';
import { QrCode } from '../components/QrCode';

const secret = 'JBSWY3DPEHPK3PXP';
const uri = `otpauth://totp/Mairie360:camille@example.fr?secret=${secret}&issuer=Mairie360`;
const meta = { title: 'Components/Display/QrCode', component: QrCode, tags: ['autodocs'], args: { value: uri } } satisfies Meta<typeof QrCode>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Always black on white, also in dark mode. */
export const Default: Story = {};
/** Authenticator setup: the QR code and the same secret as text, for people who cannot scan. */
export const WithSecret: Story = { render: (args) => <div className="flex max-w-md flex-col gap-4"><QrCode {...args} /><CopyField label="Clé secrète" value={secret} display="JBSW Y3DP EHPK 3PXP" /></div> };
