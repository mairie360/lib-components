import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';

import { FilesModule } from '../components/FilesModule';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

const meta: Meta<typeof FilesModule> = {
  title: 'Components/Files/FilesModule', component: FilesModule, tags: ['autodocs'], parameters: { layout: 'fullscreen' },
  args: { onOpenFile: fn(), onDownloadFile: fn(), onShareFile: fn(), onDeleteFile: fn(), onUploadFile: fn(), onFiltersChange: fn() },
};
export default meta;
type Story = StoryObj<typeof meta>;

const render = (args: React.ComponentProps<typeof FilesModule>) => (
  <div className="flex h-screen bg-[#f5f3f0] text-[#172033]">
    <Sidebar activeItem="files" isAdmin brandLogoSrc={null} className="shrink-0" />
    <div className="flex min-w-0 flex-1 flex-col"><Header user={{ name: 'Admin Système', email: 'admin@mairie360.fr', role: 'admin' }} isAdmin /><main className="min-h-0 flex-1 overflow-auto px-8 py-8"><FilesModule {...args} /></main><Footer version="2.1.0" /></div>
  </div>
);

export const Grille: Story = { render };
export const Liste: Story = { args: { defaultView: 'list' }, render };
