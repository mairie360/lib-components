import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { DatePicker } from '../components/DatePicker';

const meta = {
  title: 'Components/Forms/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  args: { label: 'Date de début', hint: 'Premier jour du chantier', onChange: fn() },
  parameters: { layout: 'padded' },
  decorators: [Story => <div style={{ maxWidth: 360, minHeight: 460 }}><Story /></div>],
} satisfies Meta<typeof DatePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Vide: Story = {};
export const Rempli: Story = { args: { defaultValue: '2026-12-08' } };
export const Etroit: Story = { args: { defaultValue: '2026-12-08' }, decorators: [Story => <div style={{ width: 200 }}><Story /></div>] };
export const BornesEtJoursFeries: Story = { args: { min: '2026-12-01', max: '2027-01-31', disabledDates: ['2026-12-25', '2027-01-01'], hint: 'Hors jours fériés' } };
export const DateDeNaissance: Story = { args: { label: 'Date de naissance', hint: undefined, startView: 'years', shortcuts: false, max: '2026-12-03' } };
export const Erreur: Story = { args: { error: 'Choisissez une date.', required: true } };
export const Desactive: Story = { args: { defaultValue: '2026-12-08', disabled: true } };
