import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';

import { CalendarModule } from '../components/CalendarModule';
import type { CalendarModuleProps } from '../components/CalendarModule';

const meta = {
  title: 'Components/Calendar/CalendarModule',
  component: CalendarModule,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  args: {
    initialDate: '15-06-2026',
    currentUserRole: 'responsable',
    currentUserId: 'alice',
    currentUserService: 'communication',
    onViewChange: fn(),
    onDateChange: fn(),
    onSelectDate: fn(),
    onSelectSlot: fn(),
    onCreateEvent: fn(),
    onUpdateEvent: fn(),
    onDeleteEvent: fn(),
    onValidateEvent: fn(),
  },
} satisfies Meta<typeof CalendarModule>;

export default meta;

type Story = StoryObj<typeof meta>;

const renderModule = (args: CalendarModuleProps) => (
  <div className="min-h-screen bg-[#f5f3f0] p-6 sm:p-8 lg:p-14">
    <CalendarModule {...args} />
  </div>
);

export const Responsable: Story = {
  render: (args) => renderModule(args),
};

export const Maire: Story = {
  args: {
    currentUserRole: 'mayor',
  },
  render: (args) => renderModule(args),
};

export const Agent: Story = {
  args: {
    currentUserRole: 'user',
    currentUserId: 'lea',
    currentUserService: 'culture',
  },
  render: (args) => renderModule(args),
};
