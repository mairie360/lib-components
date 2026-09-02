import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';

import { DashboardModule } from '../components/DashboardModule';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

const meta: Meta<typeof DashboardModule> = {
  title: 'Components/Dashboard/DashboardModule',
  component: DashboardModule,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    onProjectSelect: fn(),
    onViewAllProjects: fn(),
    onTaskSelect: fn(),
    onViewAllTasks: fn(),
    onQuickAction: fn(),
    onEventSelect: fn(),
    onOpenCalendar: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="flex h-screen bg-[#f5f3f0] text-[#172033]">
      <Sidebar activeItem="dashboard" isAdmin brandLogoSrc={null} className="shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header user={{ name: 'Admin Système', email: 'admin@mairie360.fr', role: 'admin' }} isAdmin />
        <main className="min-h-0 flex-1 overflow-auto px-8 py-8"><DashboardModule {...args} /></main>
        <Footer version="2.1.0" />
      </div>
    </div>
  ),
};
