import type { Meta, StoryObj } from '@storybook/nextjs';
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
      <button className="px-4 py-2 bg-blue-500 text-white rounded">Survoler moi</button>
    </ToolTip>
  ),
};

export const WithIcon: Story = {
  args: {
    text: 'Icône avec info',
  },
  render: (args) => (
    <ToolTip {...args}>
      <span className="text-xl cursor-help">❓</span>
    </ToolTip>
  ),
};
