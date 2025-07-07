import type { Meta, StoryObj } from '@storybook/nextjs';
import { Tooltip } from '../components/ToolTip';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Feedback/Tooltip',
  component: Tooltip,
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
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    text: 'Info bulle par défaut',
  },
  render: (args) => (
    <Tooltip {...args}>
      <button className="px-4 py-2 bg-blue-500 text-white rounded">Survoler moi</button>
    </Tooltip>
  ),
};

export const WithIcon: Story = {
  args: {
    text: 'Icône avec info',
  },
  render: (args) => (
    <Tooltip {...args}>
      <span className="text-xl cursor-help">❓</span>
    </Tooltip>
  ),
};
