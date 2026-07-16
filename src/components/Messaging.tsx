import React from 'react';
import { Bell, Briefcase, CalendarDays, ListTodo } from 'lucide-react';

import { joinClasses } from './calendar/style';
import { CreateGroupModal } from './CreateGroupModal';
import { MessagingChatHeader } from './MessagingChatHeader';
import { MessagingComposer } from './MessagingComposer';
import { MessagingMessageBubble } from './MessagingMessageBubble';
import { MessagingSidebar } from './MessagingSidebar';
import { NewMessageModal } from './NewMessageModal';
import {
  defaultMessagingBusinessReferences,
  defaultMessagingConversations,
  defaultMessagingMessages,
} from './messaging/defaultData';
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

const getMessagePreview = (message: MessagingMessage | React.ReactNode) => {
  const content = typeof message === 'object' && message !== null && 'content' in message ? message.content : message;

  return typeof content === 'string' ? content : 'Nouveau message';
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
  incomingMessages = [],
  mentionOptions,
  businessReferences = defaultMessagingBusinessReferences,
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
  const [internalConversations, setInternalConversations] = React.useState<MessagingConversation[]>(
    defaultMessagingConversations
  );
  const [newMessageOpen, setNewMessageOpen] = React.useState(false);
  const [createGroupOpen, setCreateGroupOpen] = React.useState(false);
  const displayedConversations = conversations ?? internalConversations;
  const displayedContacts =
    contacts ?? displayedConversations.filter((conversation) => conversation.kind !== 'group');
  const displayedMentionOptions =
    mentionOptions ?? buildMentionOptions(displayedContacts, displayedConversations);
  const firstConversationId = displayedConversations[0]?.id;
  const [internalActiveId, setInternalActiveId] = React.useState<MessagingContactId | undefined>(
    defaultActiveConversationId ?? firstConversationId
  );
  const [internalMessages, setInternalMessages] = React.useState<MessagingMessage[]>(defaultMessagingMessages);
  const seenIncomingMessageIdsRef = React.useRef<Set<string>>(
    new Set(defaultMessagingMessages.map((message) => String(message.id)))
  );
  const resolvedActiveId = activeConversationId ?? internalActiveId;
  const activeConversation =
    displayedConversations.find((conversation) => messagingIdsMatch(conversation.id, resolvedActiveId)) ?? null;
  const displayedMessages = mergeMessagesById(messages ?? internalMessages, incomingMessages);
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

  React.useEffect(() => {
    if (activeConversationId === undefined && internalActiveId === undefined && firstConversationId !== undefined) {
      setInternalActiveId(firstConversationId);
    }
  }, [activeConversationId, firstConversationId, internalActiveId]);

  const updateConversationPreview = (
    conversationId: MessagingContactId | undefined,
    lastMessage: React.ReactNode,
    lastMessageAt = formatMessageTime(),
    unreadDelta = 0
  ) => {
    if (conversationId === undefined || conversations !== undefined) return;

    setInternalConversations((currentConversations) =>
      currentConversations.map((conversation) =>
        messagingIdsMatch(conversation.id, conversationId)
          ? {
              ...conversation,
              lastMessage,
              lastMessageAt,
              unreadCount: unreadDelta > 0 ? (conversation.unreadCount ?? 0) + unreadDelta : 0,
            }
          : conversation
      )
    );
  };

  const markConversationAsRead = (conversationId: MessagingContactId | undefined) => {
    if (conversationId === undefined || conversations !== undefined) return;

    setInternalConversations((currentConversations) =>
      currentConversations.map((conversation) =>
        messagingIdsMatch(conversation.id, conversationId)
          ? { ...conversation, unreadCount: 0 }
          : conversation
      )
    );
  };

  React.useEffect(() => {
    if (messages !== undefined || incomingMessages.length === 0) return;

    const nextIncomingMessages = incomingMessages.filter(
      (message) => !seenIncomingMessageIdsRef.current.has(String(message.id))
    );
    if (nextIncomingMessages.length === 0) return;

    nextIncomingMessages.forEach((message) => {
      seenIncomingMessageIdsRef.current.add(String(message.id));
    });
    setInternalMessages((currentMessages) => mergeMessagesById(currentMessages, nextIncomingMessages));

    nextIncomingMessages.forEach((message) => {
      const conversationId = message.conversationId;
      const unreadDelta =
        conversationId !== undefined && !messagingIdsMatch(conversationId, resolvedActiveId) ? 1 : 0;

      updateConversationPreview(
        conversationId,
        getMessagePreview(message),
        message.sentAt ?? formatMessageTime(),
        unreadDelta
      );
    });
  }, [incomingMessages, messages, resolvedActiveId]);

  const handleConversationSelect = (conversation: MessagingConversation) => {
    if (activeConversationId === undefined) {
      setInternalActiveId(conversation.id);
    }

    markConversationAsRead(conversation.id);
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
          businessLinks,
          context: contextReference,
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
        memberIds: payload.memberIds,
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
        currentMessages.filter(
          (message) => !messagingIdsMatch(message.conversationId, conversationToDelete.id)
        )
      );
    }

    if (conversations === undefined) {
      const remainingConversations = internalConversations.filter(
        (conversation) => !messagingIdsMatch(conversation.id, conversationToDelete.id)
      );

      setInternalConversations(remainingConversations);

      if (
        activeConversationId === undefined &&
        messagingIdsMatch(resolvedActiveId, conversationToDelete.id)
      ) {
        setInternalActiveId(remainingConversations[0]?.id);
      }
    }
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
            <button
              type="button"
              className="shrink-0 rounded-md px-2.5 py-1.5 font-semibold text-[#1256a6] transition hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/30"
              onClick={() => onBusinessReferenceClick?.(contextReference)}
            >
              Ouvrir
            </button>
          </div>
        )}

        <MessagingComposer
          disabled={!activeConversation}
          mentionOptions={displayedMentionOptions}
          businessReferenceOptions={businessReferences}
          onSendMessage={handleSendMessage}
          onAttach={onAttach}
          onEmoji={onEmoji}
        />
      </div>

      <NewMessageModal
        isOpen={newMessageOpen}
        contacts={displayedContacts}
        onCancel={() => setNewMessageOpen(false)}
        onSendMessage={handleSendNewMessage}
      />
      <CreateGroupModal
        isOpen={createGroupOpen}
        members={displayedContacts}
        onCancel={() => setCreateGroupOpen(false)}
        onCreateGroup={handleCreateGroup}
      />
    </section>
  );
};
