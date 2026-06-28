import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';

import { AdministrationModule } from '../components/AdministrationModule';
import { AdministrationUserModal } from '../components/AdministrationUserModal';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import type { AdministrationModuleProps } from '../components/AdministrationModule';

const meta: Meta<typeof AdministrationModule> = {
  title: 'Components/Administration/AdministrationModule',
  component: AdministrationModule,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onTabChange: fn(),
    onCreateUser: fn(),
    onUserAction: fn(),
    onRefreshLogs: fn(),
    onExportLogsCsv: fn(),
    onClearLogs: fn(),
    onCreateBackup: fn(),
    onSettingsChange: fn(),
    onDangerAction: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const adminUser = {
  name: 'Admin Système',
  email: 'admin@mairie360.fr',
  role: 'admin',
};

const Shell = ({
  children,
  contentClassName = '',
}: {
  children: React.ReactNode;
  contentClassName?: string;
}) => (
  <div className="h-screen overflow-hidden bg-[#f5f3f0] font-sans text-[#172033]">
    <div className="flex h-screen">
      <Sidebar activeItem="admin" isAdmin className="shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header user={adminUser} isAdmin />
        <main className={`min-h-0 flex-1 overflow-auto px-8 py-8 ${contentClassName}`}>{children}</main>
        <Footer version="2.1.0" />
      </div>
    </div>
  </div>
);

const renderModule = (args: AdministrationModuleProps) => (
  <Shell>
    <AdministrationModule {...args} />
  </Shell>
);

export const Utilisateurs: Story = {
  render: (args) => renderModule(args),
};

export const Logs: Story = {
  args: {
    defaultActiveTab: 'logs',
  },
  render: (args) => renderModule(args),
};

export const Systeme: Story = {
  args: {
    defaultActiveTab: 'system',
  },
  render: (args) => renderModule(args),
};

export const Audit: Story = {
  args: {
    defaultActiveTab: 'audit',
  },
  render: (args) => renderModule(args),
};

export const Parametres: Story = {
  args: {
    defaultActiveTab: 'settings',
  },
  render: (args) => renderModule(args),
};

export const NouvelUtilisateur: Story = {
  render: (args) => (
    <Shell>
      <AdministrationModule {...args} />
      <AdministrationUserModal
        isOpen
        initialValues={{
          name: 'Jean Dupont',
          email: 'jean.dupont@mairie360.fr',
          service: 'Urbanisme',
          phone: '+33 1 23 45 67 89',
          role: 'user',
        }}
        onCancel={fn()}
        onCreateUser={fn()}
      />
    </Shell>
  ),
};
