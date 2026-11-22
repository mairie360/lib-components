import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Button } from '../components/Button';
import { Onboarding } from '../components/Onboarding';

const meta = {
  title: 'Components/Feedback/Onboarding',
  component: Onboarding,
  tags: ['autodocs'],
  args: { onDone: fn() },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Onboarding>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The five slides; the first plays the logo intro once (nothing moves under reduced motion). */
export const Default: Story = {};
export const LastSlide: Story = { args: { initialSlide: 4 } };
export const TrainingTone: Story = { args: { tone: 'training' } };

function FirstConnection() {
  const [open, setOpen] = React.useState(false);
  const [result, setResult] = React.useState('');
  return (
    <div className="flex flex-col items-center gap-2">
      <Button label="Revoir la présentation" variant="outline" onClick={() => setOpen(true)} />
      {result ? <p role="status">{result === 'done' ? 'Présentation terminée.' : 'Présentation passée.'}</p> : null}
      {open ? <Onboarding modal onDone={value => { setOpen(false); setResult(value); }} /> : null}
    </div>
  );
}
/** As a dialog at the first connection: focus kept inside, Escape = Passer. */
export const Modal: Story = { render: () => <FirstConnection /> };
