import type { Meta, StoryObj } from '@storybook/react-vite';
import { Calendar, Users } from 'lucide-react';

import { Icon } from '../components/Icon';
import { Logo } from '../components/Logo';
import { sizes } from '../kit/theme';

const meta = {
  title: 'Components/Primitives/Icon & Logo',
  component: Icon,
  tags: ['autodocs'],
  args: { icon: Calendar, size: 'm' },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const IconSizes: Story = {
  render: () => (
    <div className="flex items-end gap-6 text-[var(--mairie-text)]">
      {sizes.map((size) => <span key={size} className="flex flex-col items-center gap-2"><Icon icon={Users} size={size} /><span className="text-xs text-[var(--mairie-muted)]">{size}</span></span>)}
    </div>
  ),
};

export const LabelledIcon: Story = { args: { icon: Calendar, label: 'Calendrier', size: 'l' } };

export const LogoSizes: Story = {
  render: () => (
    <div className="flex items-end gap-8">
      {sizes.map((size) => <span key={size} className="flex flex-col items-center gap-2"><Logo size={size} /><span className="text-xs text-[var(--mairie-muted)]">{size}</span></span>)}
    </div>
  ),
};
