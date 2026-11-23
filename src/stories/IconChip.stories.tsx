import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bell, CalendarDays, FolderKanban, GraduationCap, LayoutDashboard, MessageSquare, ShieldCheck } from 'lucide-react';

import { IconChip } from '../components/IconChip';
import { icons } from '../components/Icon';

const meta = { title: 'Components/Display/IconChip', component: IconChip, tags: ['autodocs'], args: { icon: ShieldCheck, tone: 'neutral', size: 'm' }, parameters: { layout: 'padded' } } satisfies Meta<typeof IconChip>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Neutral: accent icon on the accent surface. Decorative (aria-hidden): the text beside it carries the meaning. */
export const Neutral: Story = {};
export const Sizes: Story = { render: () => <div className="flex items-center gap-3"><IconChip icon={icons.camera} size="m" /><IconChip icon={icons['monitor-smartphone']} size="l" /></div> };
/** Module tone: the module colour behind an `--mairie-on-module` icon (notification types, module lists). */
export const Modules: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <IconChip tone="module" color="dashboard" icon={LayoutDashboard} />
      <IconChip tone="module" color="projects" icon={FolderKanban} />
      <IconChip tone="module" color="calendar" icon={CalendarDays} />
      <IconChip tone="module" color="messaging" icon={MessageSquare} />
      <IconChip tone="module" color="workflows" icon={Bell} />
      <IconChip tone="module" color="training" icon={GraduationCap} size="l" />
    </div>
  ),
};
