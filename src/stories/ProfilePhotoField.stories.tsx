import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { ProfilePhotoField } from '../components/ProfilePhotoField';

const meta = { title: 'Components/Forms/ProfilePhotoField', component: ProfilePhotoField, tags: ['autodocs'], args: { label: 'Photo de profil', initials: 'QT', onChange: fn() } } satisfies Meta<typeof ProfilePhotoField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const Preview: Story = { args: { value: 'https://mairie360.fr/assets/avatar-demo.png' } };
export const Error: Story = { args: { error: 'Ce fichier dépasse 2 Mo. Choisissez une image plus légère.' } };
