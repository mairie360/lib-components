import type { Meta, StoryObj } from '@storybook/react-vite';

import { OneTimeCodeField } from '../components/OneTimeCodeField';

const meta = { title: 'Components/Forms/OneTimeCodeField', component: OneTimeCodeField, tags: ['autodocs'], decorators: [(Story) => <div className="max-w-sm"><Story /></div>] } satisfies Meta<typeof OneTimeCodeField>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Six digits from the authenticator app; paste « 123 456 » works. */
export const Totp: Story = {};
/** A code of the recovery list, formatted as `A1B2-C3D4`. */
export const Recovery: Story = { args: { kind: 'recovery' } };
/** State=Error (MAIR-1104): the message replaces the hint, red border, announced and linked to the field. */
export const WithError: Story = { args: { error: 'Code incorrect ou expiré.' } };
/** A recovery code already used or unknown. */
export const RecoveryWithError: Story = { args: { kind: 'recovery', error: 'Ce code de secours est incorrect ou a déjà servi.' } };
export const Disabled: Story = { args: { disabled: true } };
