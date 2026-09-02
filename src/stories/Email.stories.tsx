import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';

import { EmailModule } from '../components/EmailModule';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

const meta: Meta<typeof EmailModule> = { title: 'Components/Email/EmailModule', component: EmailModule, tags: ['autodocs'], parameters: { layout: 'fullscreen' }, args: { onSend: fn(), onSaveDraft: fn(), onMessageAction: fn(), onOpenAttachment: fn() } };
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: (args) => <div className="flex h-screen bg-[#f5f3f0] text-[#172033]"><Sidebar activeItem="emails" isAdmin brandLogoSrc={null} className="shrink-0" /><div className="flex min-w-0 flex-1 flex-col"><Header user={{ name: 'Admin Système', email: 'admin@mairie360.fr', role: 'admin' }} isAdmin /><main className="min-h-0 flex-1 overflow-auto px-8 py-8"><EmailModule {...args} /></main><Footer version="2.1.0" /></div></div> };
