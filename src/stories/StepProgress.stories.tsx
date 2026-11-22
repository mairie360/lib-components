import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { StepProgress } from '../components/StepProgress';

const meta = {
  title: 'Components/Feedback/StepProgress',
  component: StepProgress,
  tags: ['autodocs'],
  args: { steps: ['Identité', 'Rôle', 'Accès', 'Vérification'], current: 1, size: 'm', tone: 'accent' },
  decorators: [(Story) => <div className="max-w-md"><Story /></div>],
} satisfies Meta<typeof StepProgress>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Small: Story = { args: { size: 's' } };
export const ModuleTone: Story = { args: { tone: 'training', steps: 7, current: 4 } };
export const Clickable: Story = { args: { onStepChange: fn() } };

function Controlled() {
  const [current, setCurrent] = React.useState(0);
  return <StepProgress steps={['Bienvenue', 'Tableau de bord', 'Projets', 'Messagerie', 'Formation']} current={current} onStepChange={setCurrent} />;
}
/** Click a dash, or focus one and use the arrow keys. */
export const Interactive: Story = { render: () => <Controlled /> };
