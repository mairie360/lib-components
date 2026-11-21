import type { Meta, StoryObj } from '@storybook/react-vite';

import { Card } from '../components/Card';
import { PublicBackdrop } from '../components/PublicBackdrop';
import { PageTitle } from '../components/Text';

const meta = {
  title: 'Components/Navigation/PublicBackdrop',
  component: PublicBackdrop,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="relative min-h-[480px] bg-[var(--mairie-background)]">
      <PublicBackdrop {...args} />
      <main className="relative grid min-h-[480px] place-items-center p-6" style={{ zIndex: 1 }}>
        <Card className="w-full max-w-md"><PageTitle>Connexion</PageTitle></Card>
      </main>
    </div>
  ),
} satisfies Meta<typeof PublicBackdrop>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Four flat ribbons waving slowly behind the card (the Login pages). */
export const Ribbons: Story = {};
/** The still image shown with `prefers-reduced-motion`. */
export const Still: Story = { args: { animated: false } };
/** No background. */
export const None: Story = { args: { variant: 'none' } };
