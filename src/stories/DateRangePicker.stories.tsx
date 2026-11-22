import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { DateRangePicker } from '../components/DateRangePicker';

const meta = {
  title: 'Components/Forms/DateRangePicker',
  component: DateRangePicker,
  tags: ['autodocs'],
  args: { label: 'Période', onChange: fn() },
  parameters: { layout: 'padded' },
  decorators: [Story => <div style={{ maxWidth: 520, minHeight: 520 }}><Story /></div>],
} satisfies Meta<typeof DateRangePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Vide: Story = {};
export const Rempli: Story = { args: { defaultValue: { start: '2026-12-03', end: '2026-12-09' } } };
export const SansPreReglages: Story = { args: { presets: false, hint: 'Congés de l’agent' } };
export const Bornes: Story = { args: { min: '2026-12-01', max: '2027-03-31', disabledDates: ['2026-12-25'] } };
export const Erreur: Story = { args: { error: 'Choisissez une période.', required: true } };
