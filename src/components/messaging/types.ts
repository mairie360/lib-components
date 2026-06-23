import type React from 'react';

export type MessagingContactId = string | number;
export type MessagingConversationKind = 'direct' | 'group';
export type MessagingPresence = 'online' | 'offline' | 'away';
export type MessagingMessageDirection = 'incoming' | 'outgoing';

export interface MessagingConversation {
  id: MessagingContactId;
  name: string;
  department?: string;
  kind?: MessagingConversationKind;
  avatarUrl?: string;
  initials?: string;
  presence?: MessagingPresence;
  lastMessage?: React.ReactNode;
  lastMessageAt?: string;
  unreadCount?: number;
}

export interface MessagingMessage {
  id: MessagingContactId;
  conversationId?: MessagingContactId;
  content: React.ReactNode;
  sentAt?: string;
  direction?: MessagingMessageDirection;
  authorId?: MessagingContactId;
  authorName?: string;
}

export interface MessagingSendMessagePayload {
  conversationId?: MessagingContactId;
  content: string;
}

export interface NewMessagePayload {
  recipientId: MessagingContactId;
  message: string;
}

export interface CreateGroupPayload {
  name: string;
  description?: string;
  memberIds: MessagingContactId[];
}
