import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Calendar } from '../components/Calendar';

const meta = {
  title: 'Components/Forms/Calendar',
  component: Calendar,
  tags: ['autodocs'],
  args: { value: '2026-12-08', onChange: fn(), events: ['2026-12-03', '2026-12-15', '2026-12-18'] },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Calendar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Jours: Story = {};
export const BornesEtJoursIndisponibles: Story = { args: { min: '2026-12-02', max: '2026-12-22', disabledDates: ['2026-12-10', '2026-12-11'] } };
export const Mois: Story = { args: { defaultView: 'months' } };
export const Annees: Story = { args: { defaultView: 'years', value: '1990-06-15', events: undefined } };
export const Periode: Story = { args: { value: undefined, rangeStart: '2026-12-03', rangeEnd: '2026-12-09' } };
