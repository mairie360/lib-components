import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToolTip } from '../components/ToolTip';

const meta: Meta<typeof ToolTip> = {
  title: 'Components/Feedback/ToolTip',
  component: ToolTip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    text: {
      control: 'text',
      description: 'Texte à afficher dans le tooltip',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ToolTip>;

export const Default: Story = {
  args: {
    text: 'Info bulle par défaut',
  },
  render: (args) => (
    <ToolTip {...args}>
      <button type="button" className="px-4 py-2 bg-[var(--mairie-action-background)] text-[var(--mairie-on-action)] rounded">Survolez-moi</button>
    </ToolTip>
  ),
};

export const WithIcon: Story = {
  args: {
    text: 'Icône avec info',
  },
  render: (args) => (
    <ToolTip {...args}>
      <button type="button" aria-label="Aide" className="text-xl cursor-help">❓</button>
    </ToolTip>
  ),
};

/** MAIR-1095: shown at once (0 ms delay) with an 80 ms fade, on the neutral solid tokens; no fade under reduced motion. */
export const Immediate: Story = {
  args: { text: 'Supprimer le document' },
  render: (args) => (
    <ToolTip {...args}>
      <button type="button" className="rounded border border-[var(--mairie-control-border)] px-3 py-2">Supprimer</button>
    </ToolTip>
  ),
};

/** Under the trigger and lined up with its end: a button at the top right of a clipped panel, under the top bar. */
export const BelowEnd: Story = {
  args: { text: 'Nouvelle conversation', placement: 'bottom', align: 'end' },
  render: (args) => (
    <div className="flex justify-end">
      <ToolTip {...args}>
        <button type="button" aria-label="Nouvelle conversation" className="rounded border border-[var(--mairie-control-border)] px-3 py-2">+</button>
      </ToolTip>
    </div>
  ),
};
