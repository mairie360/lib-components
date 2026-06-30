import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn, userEvent, within } from 'storybook/test';

import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { ProjectModule } from '../components/ProjectModule';
import type { ProjectModuleProps } from '../components/ProjectModule';
import { Sidebar } from '../components/Sidebar';

const meta: Meta<typeof ProjectModule> = {
  title: 'Components/Projects/ProjectModule',
  component: ProjectModule,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onViewModeChange: fn(),
    onCreateProject: fn(),
    onUpdateProject: fn(),
    onProjectAction: fn(),
    onSettingsClick: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const adminUser = {
  name: 'Admin Système',
  email: 'admin@mairie360.fr',
  role: 'admin',
};

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="h-screen overflow-hidden bg-[#f5f3f0] font-sans text-[#172033]">
    <div className="flex h-screen">
      <Sidebar activeItem="projects" isAdmin brandLogoSrc={null} className="shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header user={adminUser} isAdmin />
        <main className="min-h-0 flex-1 overflow-auto px-8 py-8">{children}</main>
        <Footer version="2.1.0" />
      </div>
    </div>
  </div>
);

const renderModule = (args: ProjectModuleProps) => (
  <Shell>
    <ProjectModule {...args} />
  </Shell>
);

export const Kanban: Story = {
  render: (args) => renderModule(args),
};

export const Grille: Story = {
  args: {
    defaultViewMode: 'grid',
  },
  render: (args) => renderModule(args),
};

export const Table: Story = {
  args: {
    defaultViewMode: 'table',
  },
  render: (args) => renderModule(args),
};

export const NouveauProjet: Story = {
  render: (args) => (
    <Shell>
      <ProjectModule {...args} />
    </Shell>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Nouveau projet' }));
  },
};
