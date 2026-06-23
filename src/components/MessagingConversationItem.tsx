import React from 'react';

import { joinClasses } from './calendar/style';
import { MessagingContactAvatar } from './MessagingContactAvatar';
import type { MessagingConversation } from './messaging/types';

export interface MessagingConversationItemProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  conversation: MessagingConversation;
  active?: boolean;
}

export const MessagingConversationItem = ({
  conversation,
  active = false,
  className = '',
  ...props
}: MessagingConversationItemProps) => (
  <button
    type="button"
    className={joinClasses(
      'flex min-h-[102px] w-full items-start gap-3 rounded-lg border bg-white p-3 text-left text-[#172033] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/30',
      active
        ? 'border-[#1256a6] bg-[#e4f2f1] shadow-[0_1px_2px_rgba(18,86,166,0.16)]'
        : 'border-[#d8d2ca] hover:border-[#b9d6d5] hover:bg-[#fbfaf9]',
      className
    )}
    {...props}
  >
    <MessagingContactAvatar
      name={conversation.name}
      src={conversation.avatarUrl}
      initials={conversation.initials}
      presence={conversation.presence}
      size="md"
      className="mt-1"
    />
    <span className="min-w-0 flex-1">
      <span className="flex items-start justify-between gap-2">
        <span className="min-w-0">
          <span className="block truncate text-base font-semibold leading-6">{conversation.name}</span>
          {conversation.department && (
            <span className="block truncate text-xs leading-5 text-[#5f6770]">{conversation.department}</span>
          )}
        </span>
        {conversation.lastMessageAt && (
          <span className="shrink-0 text-xs leading-5 text-[#5f6770]">{conversation.lastMessageAt}</span>
        )}
      </span>
      <span className="mt-0.5 flex items-center gap-2">
        {conversation.lastMessage && (
          <span className="min-w-0 flex-1 truncate text-sm leading-5 text-[#5f6770]">{conversation.lastMessage}</span>
        )}
        {!!conversation.unreadCount && (
          <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-[#1256a6] text-xs font-semibold leading-none text-white">
            {conversation.unreadCount}
          </span>
        )}
      </span>
    </span>
  </button>
);
