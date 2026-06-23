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
