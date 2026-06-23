import React from 'react';

import { joinClasses } from './calendar/style';
import { CreateGroupModal } from './CreateGroupModal';
import { MessagingChatHeader } from './MessagingChatHeader';
import { MessagingComposer } from './MessagingComposer';
import { MessagingMessageBubble } from './MessagingMessageBubble';
import { MessagingSidebar } from './MessagingSidebar';
import { NewMessageModal } from './NewMessageModal';
import { defaultMessagingConversations, defaultMessagingMessages } from './messaging/defaultData';
import type {
  CreateGroupPayload,
  MessagingAttachment,
  MessagingContactId,
  MessagingConversation,
  MessagingMention,
  MessagingMessage,
  MessagingSendMessagePayload,
  NewMessagePayload,
} from './messaging/types';

export interface MessagingProps extends React.HTMLAttributes<HTMLElement> {
  conversations?: MessagingConversation[];
  messages?: MessagingMessage[];
  activeConversationId?: MessagingContactId;
  defaultActiveConversationId?: MessagingContactId;
  currentUserId?: MessagingContactId;
  emptyStateLabel?: React.ReactNode;
  onConversationSelect?: (conversation: MessagingConversation) => void;
  onNewMessageClick?: () => void;
  onCreateGroupClick?: () => void;
  onSendMessage?: (payload: MessagingSendMessagePayload) => void;
  onNewMessageSend?: (payload: NewMessagePayload) => void;
  onCreateGroup?: (payload: CreateGroupPayload) => void;
  onConversationDelete?: (conversation: MessagingConversation) => void;
  onAttach?: (files: File[], attachments: MessagingAttachment[]) => void;
  onEmoji?: (emoji: string) => void;
  onCall?: (conversation: MessagingConversation) => void;
  onVideoCall?: (conversation: MessagingConversation) => void;
  onMoreActions?: (conversation: MessagingConversation) => void;
}

const getMessageDirection = (message: MessagingMessage, currentUserId?: MessagingContactId) => {
  if (message.direction) return message.direction;
  if (currentUserId !== undefined && message.authorId === currentUserId) return 'outgoing';

  return 'incoming';
};

const formatMessageTime = () =>
  new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

const getConversationInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const Messaging = ({
  conversations,
  messages,
  activeConversationId,
  defaultActiveConversationId,
  currentUserId,
  emptyStateLabel = 'Sélectionnez une conversation pour commencer.',
  onConversationSelect,
  onNewMessageClick,
  onCreateGroupClick,
  onSendMessage,
  onNewMessageSend,
  onCreateGroup,
  onConversationDelete,
  onAttach,
  onEmoji,
  onCall,
  onVideoCall,
  onMoreActions,
  className = '',
  ...props
}: MessagingProps) => {
  const [internalConversations, setInternalConversations] = React.useState<MessagingConversation[]>(
    defaultMessagingConversations
  );
  const [newMessageOpen, setNewMessageOpen] = React.useState(false);
  const [createGroupOpen, setCreateGroupOpen] = React.useState(false);
  const displayedConversations = conversations ?? internalConversations;
  const firstConversationId = displayedConversations[0]?.id;
  const [internalActiveId, setInternalActiveId] = React.useState<MessagingContactId | undefined>(
    defaultActiveConversationId ?? firstConversationId
  );
  const [internalMessages, setInternalMessages] = React.useState<MessagingMessage[]>(defaultMessagingMessages);
  const resolvedActiveId = activeConversationId ?? internalActiveId;
  const activeConversation =
    displayedConversations.find((conversation) => conversation.id === resolvedActiveId) ?? null;
  const displayedMessages = messages ?? internalMessages;
  const visibleMessages = displayedMessages
    .filter((message) => message.conversationId === undefined || message.conversationId === resolvedActiveId)
    .map((message) => ({
      ...message,
      direction: getMessageDirection(message, currentUserId),
    }));

  React.useEffect(() => {
    if (activeConversationId === undefined && internalActiveId === undefined && firstConversationId !== undefined) {
      setInternalActiveId(firstConversationId);
    }
  }, [activeConversationId, firstConversationId, internalActiveId]);

  const updateConversationPreview = (
    conversationId: MessagingContactId | undefined,
    lastMessage: React.ReactNode,
    lastMessageAt = formatMessageTime()
  ) => {
    if (conversationId === undefined || conversations !== undefined) return;

    setInternalConversations((currentConversations) =>
      currentConversations.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              lastMessage,
              lastMessageAt,
              unreadCount: 0,
            }
          : conversation
      )
    );
  };

  const handleConversationSelect = (conversation: MessagingConversation) => {
    if (activeConversationId === undefined) {
      setInternalActiveId(conversation.id);
    }

    onConversationSelect?.(conversation);
  };

  const handleNewMessageClick = () => {
    setNewMessageOpen(true);
    onNewMessageClick?.();
  };

  const handleCreateGroupClick = () => {
    setCreateGroupOpen(true);
    onCreateGroupClick?.();
  };

  const handleSendMessage = (
    content: string,
    attachments?: MessagingAttachment[],
    mentions?: MessagingMention[]
  ) => {
    const payload: MessagingSendMessagePayload = {
      conversationId: activeConversation?.id,
      content,
    };

    if (attachments?.length) {
      payload.attachments = attachments;
    }

    if (mentions?.length) {
      payload.mentions = mentions;
    }

    onSendMessage?.(payload);

    if (messages === undefined) {
      const sentAt = formatMessageTime();

      setInternalMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `local-message-${Date.now()}`,
          conversationId: activeConversation?.id,
          content,
          attachments,
          mentions,
          sentAt,
          direction: 'outgoing',
        },
      ]);
      updateConversationPreview(activeConversation?.id, content, sentAt);
    }
  };

  const handleSendNewMessage = (payload: NewMessagePayload) => {
    onNewMessageSend?.(payload);
    setNewMessageOpen(false);

    if (activeConversationId === undefined) {
      setInternalActiveId(payload.recipientId);
    }

    if (messages === undefined) {
      const sentAt = formatMessageTime();

      setInternalMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `direct-message-${Date.now()}`,
          conversationId: payload.recipientId,
          content: payload.message,
          sentAt,
          direction: 'outgoing',
        },
      ]);
      updateConversationPreview(payload.recipientId, payload.message, sentAt);
    }
  };

  const handleCreateGroup = (payload: CreateGroupPayload) => {
    onCreateGroup?.(payload);
    setCreateGroupOpen(false);

    if (conversations === undefined) {
      const groupId = `group-${Date.now()}`;
      const newGroup: MessagingConversation = {
        id: groupId,
        name: payload.name,
        department: 'Groupe',
        kind: 'group',
        initials: getConversationInitials(payload.name),
        presence: 'online',
        lastMessage: payload.description || 'Groupe créé',
        lastMessageAt: formatMessageTime(),
      };

      setInternalConversations((currentConversations) => [newGroup, ...currentConversations]);

      if (activeConversationId === undefined) {
        setInternalActiveId(groupId);
      }
    }
  };

  const handleDeleteConversation = (conversationToDelete: MessagingConversation) => {
    onConversationDelete?.(conversationToDelete);

    if (messages === undefined) {
      setInternalMessages((currentMessages) =>
        currentMessages.filter((message) => message.conversationId !== conversationToDelete.id)
      );
    }

    if (conversations === undefined) {
      const remainingConversations = internalConversations.filter(
        (conversation) => conversation.id !== conversationToDelete.id
      );

      setInternalConversations(remainingConversations);

      if (activeConversationId === undefined && resolvedActiveId === conversationToDelete.id) {
        setInternalActiveId(remainingConversations[0]?.id);
      }
    }
  };

  return (
    <section
      className={joinClasses(
        'grid min-h-[560px] overflow-hidden rounded-md border border-[#d8d2ca] bg-white text-[#172033] shadow-[0_1px_3px_rgba(0,0,0,0.12)] lg:h-[692px] lg:grid-cols-[320px_minmax(0,1fr)]',
        className
      )}
      {...props}
    >
      <MessagingSidebar
        conversations={displayedConversations}
        activeConversationId={resolvedActiveId}
        onConversationSelect={handleConversationSelect}
        onNewMessageClick={handleNewMessageClick}
        onCreateGroupClick={handleCreateGroupClick}
      />

      <div className="flex min-h-0 flex-col bg-white">
        <MessagingChatHeader
          conversation={activeConversation}
          onCall={onCall}
          onVideoCall={onVideoCall}
          onMoreActions={onMoreActions}
          onDeleteConversation={handleDeleteConversation}
        />

        <div className="min-h-[340px] flex-1 space-y-5 overflow-y-auto bg-white px-4 py-5 sm:px-5">
          {activeConversation ? (
            visibleMessages.length > 0 ? (
              visibleMessages.map((message) => <MessagingMessageBubble key={message.id} message={message} />)
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[#5f6770]">
                Aucun message dans cette conversation.
              </div>
            )
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[#5f6770]">{emptyStateLabel}</div>
          )}
        </div>

        <MessagingComposer
          disabled={!activeConversation}
          mentionOptions={displayedConversations.map((conversation) => ({
            id: conversation.id,
            name: conversation.name,
            kind: conversation.kind ?? 'direct',
            description: conversation.department,
          }))}
          onSendMessage={handleSendMessage}
          onAttach={onAttach}
          onEmoji={onEmoji}
        />
      </div>

      <NewMessageModal
        isOpen={newMessageOpen}
        contacts={displayedConversations.filter((conversation) => conversation.kind !== 'group')}
        onCancel={() => setNewMessageOpen(false)}
        onSendMessage={handleSendNewMessage}
      />
      <CreateGroupModal
        isOpen={createGroupOpen}
        members={displayedConversations.filter((conversation) => conversation.kind !== 'group')}
        onCancel={() => setCreateGroupOpen(false)}
        onCreateGroup={handleCreateGroup}
      />
    </section>
  );
};
