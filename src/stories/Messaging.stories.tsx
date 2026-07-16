import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';

import { CreateGroupModal } from '../components/CreateGroupModal';
import { Messaging } from '../components/Messaging';
import { NewMessageModal } from '../components/NewMessageModal';
import { defaultMessagingConversations } from '../components/messaging/defaultData';

const meta: Meta<typeof Messaging> = {
  title: 'Components/Messaging/Messaging',
  component: Messaging,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onConversationSelect: fn(),
    onNewMessageClick: fn(),
    onCreateGroupClick: fn(),
    onSendMessage: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const ModuleComplet: Story = {
  render: (args) => (
    <div className="min-h-screen bg-[#f5f3f0] p-8">
      <Messaging {...args} />
    </div>
  ),
};

export const MentionsConnectees: Story = {
  args: {
    conversations: [
      {
        id: 'group-culture',
        name: 'Groupe Culture',
        kind: 'group',
      },
    ],
    contacts: [
      {
        id: 'user-alice',
        name: 'Alice Martin',
        department: 'Urbanisme',
        kind: 'direct',
      },
    ],
    messages: [],
    activeConversationId: 'group-culture',
    businessReferences: [
      { id: 'project:12', title: 'Rénovation mairie', kind: 'project', description: 'Projet' },
      { id: 'task:34', title: 'Valider le budget', kind: 'task', description: 'Tâche' },
      { id: 'event:56', title: 'Conseil municipal', kind: 'event', description: 'Calendrier' },
    ],
  },
  render: (args) => (
    <div className="min-h-screen bg-[#f5f3f0] p-8">
      <Messaging {...args} />
    </div>
  ),
};

export const NouveauMessage: Story = {
  render: () => (
    <div className="min-h-screen bg-[#f5f3f0] p-8">
      <Messaging className="opacity-60" />
      <NewMessageModal
        isOpen
        contacts={defaultMessagingConversations}
        onCancel={fn()}
        onSendMessage={fn()}
      />
    </div>
  ),
};

export const CreerGroupe: Story = {
  render: () => (
    <div className="min-h-screen bg-[#f5f3f0] p-8">
      <Messaging className="opacity-60" />
      <CreateGroupModal
        isOpen
        members={defaultMessagingConversations.filter((conversation) => conversation.kind !== 'group')}
        onCancel={fn()}
        onCreateGroup={fn()}
      />
    </div>
  ),
};
