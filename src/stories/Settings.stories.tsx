import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';

import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { SettingsModule } from '../components/SettingsModule';
import { Sidebar } from '../components/Sidebar';

const meta: Meta<typeof SettingsModule> = {
  title: 'Components/Settings/SettingsModule',
  component: SettingsModule,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    onTabChange: fn(),
    onProfileSave: fn(),
    onPhotoChange: fn(),
    onPasswordChange: fn(),
    onSecurityChange: fn(),
    onDisconnectSession: fn(),
    onNotificationsChange: fn(),
    onAppearanceChange: fn(),
    onGeneralChange: fn(),
    onClearCache: fn(),
    onAssistanceAction: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const renderStory = (args: React.ComponentProps<typeof SettingsModule>) => (
  <div className="flex h-screen bg-[#f5f3f0] text-[#172033]">
    <Sidebar activeItem="settings" isAdmin brandLogoSrc={null} className="shrink-0" />
    <div className="flex min-w-0 flex-1 flex-col">
      <Header user={{ name: 'Admin Système', email: 'admin@mairie360.fr', role: 'admin' }} isAdmin />
      <main className="min-h-0 flex-1 overflow-auto px-8 py-8"><SettingsModule {...args} /></main>
      <Footer version="2.1.0" />
    </div>
  </div>
);

export const Profil: Story = { render: (args) => renderStory(args) };
export const Securite: Story = { args: { defaultActiveTab: 'security' }, render: (args) => renderStory(args) };
export const Notifications: Story = { args: { defaultActiveTab: 'notifications' }, render: (args) => renderStory(args) };
export const Apparence: Story = { args: { defaultActiveTab: 'appearance' }, render: (args) => renderStory(args) };
export const General: Story = { args: { defaultActiveTab: 'general' }, render: (args) => renderStory(args) };
export const Systeme: Story = { args: { defaultActiveTab: 'system' }, render: (args) => renderStory(args) };
