import type { Meta, StoryObj } from '@storybook/react';
import { Bell } from 'lucide-react';

import { Counter } from '../components/Counter';
import { Icon } from '../components/Icon';

const meta = { title: 'Components/Feedback/Counter', component: Counter, tags: ['autodocs'], args: { value: 3 }, parameters: { layout: 'padded' } } satisfies Meta<typeof Counter>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Capped: Story = { args: { value: 12, label: '12 notifications non lues' } };
export const OnTheBell: Story = {
  render: () => (
    <span className="relative inline-flex p-2" aria-label="Notifications, 4 non lues" role="img">
      <Icon icon={Bell} size="l" />
      <Counter value={4} className="absolute right-0 top-0" />
    </span>
  ),
};
