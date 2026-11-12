import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Gantt } from '../components/Gantt';

const meta = {
  title: 'Components/Display/Gantt',
  component: Gantt,
  tags: ['autodocs'],
  args: {
    label: 'Planning du projet',
    from: '2026-09-01',
    to: '2027-01-01',
    today: '2026-11-12',
    onRowClick: fn(),
    rows: [
      { id: 'cadrage', label: 'Cadrage', state: 'done', start: '2026-09-03', end: '2026-09-30', assigneeInitials: 'MM' },
      { id: 'maquettes', label: 'Maquettes', state: 'done', start: '2026-09-24', end: '2026-10-20', assigneeInitials: 'LB' },
      { id: 'dev', label: 'Développement', state: 'doing', start: '2026-10-15', end: '2026-12-05', assigneeInitials: 'QT' },
      { id: 'recette', label: 'Recette', state: 'todo', start: '2026-12-01', end: '2026-12-24', assigneeInitials: 'HC' },
      { id: 'formation', label: 'Formation des agents', state: 'late', start: '2026-10-08', end: '2026-11-05', assigneeInitials: 'MT' },
    ],
    milestones: [
      { id: 'm1', label: 'Validation des maquettes', date: '2026-10-20', reached: true },
      { id: 'm2', label: 'Mise en service', date: '2026-12-18' },
    ],
  },
} satisfies Meta<typeof Gantt>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Bars and milestones are focusable; a click on a bar opens the task (`onRowClick`). */
export const ProjectPlanning: Story = { render: (args) => <div className="max-w-4xl"><Gantt {...args} /></div> };
