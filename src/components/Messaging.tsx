import React from 'react';

import { joinClasses } from './calendar/style';
import { MessagingChatHeader } from './MessagingChatHeader';
import { MessagingComposer } from './MessagingComposer';
import { MessagingMessageBubble } from './MessagingMessageBubble';
import { MessagingSidebar } from './MessagingSidebar';
import { defaultMessagingConversations, defaultMessagingMessages } from './messaging/defaultData';
import type {
  MessagingContactId,
  MessagingConversation,
  MessagingMessage,
  MessagingSendMessagePayload,
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
  onAttach?: () => void;
  onEmoji?: () => void;
  onCall?: (conversation: MessagingConversation) => void;
  onVideoCall?: (conversation: MessagingConversation) => void;
  onMoreActions?: (conversation: MessagingConversation) => void;
}

const getMessageDirection = (message: MessagingMessage, currentUserId?: MessagingContactId) => {
  if (message.direction) return message.direction;
  if (currentUserId !== undefined && message.authorId === currentUserId) return 'outgoing';

  return 'incoming';
};

export const Messaging = ({
  conversations = defaultMessagingConversations,
  messages,
  activeConversationId,
  defaultActiveConversationId,
  currentUserId,
  emptyStateLabel = 'Sélectionnez une conversation pour commencer.',
  onConversationSelect,
  onNewMessageClick,
  onCreateGroupClick,
  onSendMessage,
  onAttach,
  onEmoji,
  onCall,
  onVideoCall,
  onMoreActions,
  className = '',
  ...props
}: MessagingProps) => {
  const firstConversationId = conversations[0]?.id;
  const [internalActiveId, setInternalActiveId] = React.useState<MessagingContactId | undefined>(
    defaultActiveConversationId ?? firstConversationId
  );
  const [internalMessages, setInternalMessages] = React.useState<MessagingMessage[]>(defaultMessagingMessages);
  const resolvedActiveId = activeConversationId ?? internalActiveId;
  const activeConversation = conversations.find((conversation) => conversation.id === resolvedActiveId) ?? null;
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

  const handleConversationSelect = (conversation: MessagingConversation) => {
    if (activeConversationId === undefined) {
      setInternalActiveId(conversation.id);
    }

    onConversationSelect?.(conversation);
  };

  const handleSendMessage = (content: string) => {
    const payload = {
      conversationId: activeConversation?.id,
      content,
    };

    onSendMessage?.(payload);

    if (messages === undefined) {
      setInternalMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `local-message-${Date.now()}`,
          conversationId: activeConversation?.id,
          content,
          sentAt: new Intl.DateTimeFormat('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          }).format(new Date()),
          direction: 'outgoing',
        },
      ]);
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
        conversations={conversations}
        activeConversationId={resolvedActiveId}
        onConversationSelect={handleConversationSelect}
        onNewMessageClick={onNewMessageClick}
        onCreateGroupClick={onCreateGroupClick}
      />

      <div className="flex min-h-0 flex-col bg-white">
        <MessagingChatHeader
          conversation={activeConversation}
          onCall={onCall}
          onVideoCall={onVideoCall}
          onMoreActions={onMoreActions}
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
          onSendMessage={handleSendMessage}
          onAttach={onAttach}
          onEmoji={onEmoji}
        />
      </div>
    </section>
  );
};
