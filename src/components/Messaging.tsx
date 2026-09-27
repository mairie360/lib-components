import React from 'react';
import { Bell, Briefcase, CalendarDays, ListTodo } from 'lucide-react';

import { joinClasses } from './calendar/style';
import { CreateGroupModal } from './CreateGroupModal';
import { MessagingChatHeader } from './MessagingChatHeader';
import { MessagingComposer } from './MessagingComposer';
import { MessagingMessageBubble } from './MessagingMessageBubble';
import { MessagingSidebar } from './MessagingSidebar';
import { NewMessageModal } from './NewMessageModal';
import type {
  CreateGroupPayload,
  MessagingAttachment,
  MessagingBusinessReference,
  MessagingContactId,
  MessagingConversation,
  MessagingMention,
  MessagingMessage,
  MessagingSendMessagePayload,
  NewMessagePayload,
} from './messaging/types';

export interface MessagingProps extends React.HTMLAttributes<HTMLElement> {
  conversations?: MessagingConversation[];
  contacts?: MessagingConversation[];
  messages?: MessagingMessage[];
  incomingMessages?: MessagingMessage[];
  mentionOptions?: MessagingMention[];
  businessReferences?: MessagingBusinessReference[];
  contextReference?: MessagingBusinessReference;
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
  onBusinessReferenceClick?: (reference: MessagingBusinessReference) => void;
  onCall?: (conversation: MessagingConversation) => void;
  onVideoCall?: (conversation: MessagingConversation) => void;
  onMoreActions?: (conversation: MessagingConversation) => void;
}

const emptyConversations: MessagingConversation[] = [];
const emptyMessages: MessagingMessage[] = [];
const emptyBusinessReferences: MessagingBusinessReference[] = [];

const messagingIdsMatch = (
  left: MessagingContactId | undefined,
  right: MessagingContactId | undefined
) => left !== undefined && right !== undefined && String(left) === String(right);

const getMessageDirection = (message: MessagingMessage, currentUserId?: MessagingContactId) => {
  if (currentUserId !== undefined && message.authorId !== undefined) {
    return messagingIdsMatch(message.authorId, currentUserId) ? 'outgoing' : 'incoming';
  }
  if (message.direction) return message.direction;

  return 'incoming';
};

const mergeMessagesById = (baseMessages: MessagingMessage[], nextMessages: MessagingMessage[] = []) => {
  const messageIds = new Set(baseMessages.map((message) => String(message.id)));
  const mergedMessages = [...baseMessages];

  nextMessages.forEach((message) => {
    if (messageIds.has(String(message.id))) return;

    mergedMessages.push(message);
    messageIds.add(String(message.id));
  });

  return mergedMessages;
};

const getBusinessReferenceLabel = (reference: MessagingBusinessReference) => {
  if (reference.kind === 'event') return 'Événement';
  if (reference.kind === 'task') return 'Tâche';

  return 'Projet';
};

const buildMentionOptions = (
  contacts: MessagingConversation[],
  conversations: MessagingConversation[]
): MessagingMention[] => {
  const seenMentions = new Set<string>();

  return [
    ...contacts.map((contact) => ({
      id: contact.id,
      name: contact.name,
      kind: 'direct' as const,
      description: contact.department,
    })),
    ...conversations
      .filter((conversation) => conversation.kind === 'group')
      .map((conversation) => ({
        id: conversation.id,
        name: conversation.name,
        kind: 'group' as const,
        description: conversation.department,
      })),
  ].filter((mention) => {
    const mentionKey = `${mention.kind}:${String(mention.id)}`;

    if (seenMentions.has(mentionKey)) return false;

    seenMentions.add(mentionKey);
    return true;
  });
};

export const Messaging = ({
  conversations,
  contacts,
  messages,
  incomingMessages = emptyMessages,
  mentionOptions,
  businessReferences = emptyBusinessReferences,
  contextReference,
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
  onBusinessReferenceClick,
  onCall,
  onVideoCall,
  onMoreActions,
  className = '',
  ...props
}: MessagingProps) => {
  const [newMessageOpen, setNewMessageOpen] = React.useState(false);
  const [createGroupOpen, setCreateGroupOpen] = React.useState(false);
  const displayedConversations = conversations ?? emptyConversations;
  const displayedContacts =
    contacts ?? displayedConversations.filter((conversation) => conversation.kind !== 'group');
  const displayedMentionOptions =
    mentionOptions ?? buildMentionOptions(displayedContacts, displayedConversations);
  const firstConversationId = displayedConversations[0]?.id;
  const [internalActiveId, setInternalActiveId] = React.useState<MessagingContactId | undefined>();
  const preferredActiveId = internalActiveId ?? defaultActiveConversationId;
  const resolvedActiveId =
    activeConversationId ??
    (displayedConversations.some((conversation) => messagingIdsMatch(conversation.id, preferredActiveId))
      ? preferredActiveId
      : firstConversationId);
  const activeConversation =
    displayedConversations.find((conversation) => messagingIdsMatch(conversation.id, resolvedActiveId)) ?? null;
  const displayedMessages = mergeMessagesById(messages ?? emptyMessages, incomingMessages);
  const visibleMessages = displayedMessages
    .filter(
      (message) =>
        message.conversationId === undefined || messagingIdsMatch(message.conversationId, resolvedActiveId)
    )
    .map((message) => ({
      ...message,
      direction: getMessageDirection(message, currentUserId),
    }));
  const unreadNotificationCount = displayedConversations.reduce(
    (total, conversation) => total + (conversation.unreadCount ?? 0),
    0
  );
  const firstUnreadConversation = displayedConversations.find((conversation) => (conversation.unreadCount ?? 0) > 0);

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
    mentions?: MessagingMention[],
    businessLinks?: MessagingBusinessReference[]
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

    if (businessLinks?.length) {
      payload.businessLinks = businessLinks;
    }

    if (contextReference) {
      payload.context = contextReference;
    }

    onSendMessage?.(payload);
  };

  const handleSendNewMessage = (payload: NewMessagePayload) => {
    onNewMessageSend?.(payload);
    setNewMessageOpen(false);
  };

  const handleCreateGroup = (payload: CreateGroupPayload) => {
    onCreateGroup?.(payload);
    setCreateGroupOpen(false);
  };

  const handleDeleteConversation = (conversationToDelete: MessagingConversation) => {
    onConversationDelete?.(conversationToDelete);
  };

  const getBusinessReferenceIcon = (reference: MessagingBusinessReference) => {
    if (reference.kind === 'event') return <CalendarDays className="size-4 shrink-0" strokeWidth={1.8} />;
    if (reference.kind === 'task') return <ListTodo className="size-4 shrink-0" strokeWidth={1.8} />;

    return <Briefcase className="size-4 shrink-0" strokeWidth={1.8} />;
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
        onNewMessageClick={onNewMessageSend ? handleNewMessageClick : undefined}
        onCreateGroupClick={onCreateGroup ? handleCreateGroupClick : undefined}
      />

      <div className="flex min-h-0 flex-col bg-white">
        <MessagingChatHeader
          conversation={activeConversation}
          onCall={onCall}
          onVideoCall={onVideoCall}
          onMoreActions={onMoreActions}
          onDeleteConversation={onConversationDelete ? handleDeleteConversation : undefined}
        />

        {unreadNotificationCount > 0 && (
          <div
            role="status"
            aria-label="Notifications de messagerie"
            className="flex flex-wrap items-center gap-3 border-b border-[#d8d2ca] bg-[#fff8e8] px-4 py-2.5 text-sm text-[#5a3b00] sm:px-5"
          >
            <Bell className="size-4 shrink-0" strokeWidth={1.8} />
            <span className="font-semibold">
              {unreadNotificationCount} notification{unreadNotificationCount > 1 ? 's' : ''} non lue
              {unreadNotificationCount > 1 ? 's' : ''}
            </span>
            {firstUnreadConversation && (
              <button
                type="button"
                className="rounded-md px-2 py-1 font-semibold text-[#1256a6] transition hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/30"
                onClick={() => handleConversationSelect(firstUnreadConversation)}
              >
                Voir {firstUnreadConversation.name}
              </button>
            )}
          </div>
        )}

        <div className="min-h-[340px] flex-1 space-y-5 overflow-y-auto bg-white px-4 py-5 sm:px-5">
          {activeConversation ? (
            visibleMessages.length > 0 ? (
              visibleMessages.map((message) => (
                <MessagingMessageBubble
                  key={message.id}
                  message={message}
                  mentionOptions={displayedMentionOptions}
                  businessReferenceOptions={businessReferences}
                  onBusinessReferenceClick={onBusinessReferenceClick}
                />
              ))
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[#5f6770]">
                Aucun message dans cette conversation.
              </div>
            )
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[#5f6770]">{emptyStateLabel}</div>
          )}
        </div>

        {contextReference && (
          <div
            aria-label="Message contextuel"
            className="flex items-center gap-3 border-t border-[#d8d2ca] bg-[#eef7f6] px-4 py-3 text-sm text-[#245651] sm:px-5"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white text-[#1d7a63]">
              {getBusinessReferenceIcon(contextReference)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold leading-5">Message contextuel</span>
              <span className="block truncate leading-5">
                {getBusinessReferenceLabel(contextReference)} : {contextReference.title}
              </span>
            </span>
            {onBusinessReferenceClick && (
              <button
                type="button"
                className="shrink-0 rounded-md px-2.5 py-1.5 font-semibold text-[#1256a6] transition hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/30"
                onClick={() => onBusinessReferenceClick(contextReference)}
              >
                Ouvrir
              </button>
            )}
          </div>
        )}

        <MessagingComposer
          disabled={!activeConversation || !onSendMessage}
          mentionOptions={displayedMentionOptions}
          businessReferenceOptions={businessReferences}
          onSendMessage={onSendMessage ? handleSendMessage : undefined}
          onAttach={onAttach}
          onEmoji={onEmoji}
        />
      </div>

      {onNewMessageSend && (
        <NewMessageModal
          isOpen={newMessageOpen}
          contacts={displayedContacts}
          onCancel={() => setNewMessageOpen(false)}
          onSendMessage={handleSendNewMessage}
        />
      )}
      {onCreateGroup && (
        <CreateGroupModal
          isOpen={createGroupOpen}
          members={displayedContacts}
          onCancel={() => setCreateGroupOpen(false)}
          onCreateGroup={handleCreateGroup}
        />
      )}
    </section>
  );
};
