import React from 'react';
import { MoreVertical, Phone, Video } from 'lucide-react';

import { joinClasses } from './calendar/style';
import { MessagingContactAvatar } from './MessagingContactAvatar';
import type { MessagingConversation } from './messaging/types';

export interface MessagingChatHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  conversation?: MessagingConversation | null;
  callLabel?: string;
  videoCallLabel?: string;
  moreActionsLabel?: string;
  onCall?: (conversation: MessagingConversation) => void;
  onVideoCall?: (conversation: MessagingConversation) => void;
  onMoreActions?: (conversation: MessagingConversation) => void;
}

const presenceLabel = {
  online: 'En ligne',
  away: 'Absent',
  offline: 'Hors ligne',
};

export const MessagingChatHeader = ({
  conversation,
  callLabel = 'Appeler',
  videoCallLabel = 'Appel vidéo',
  moreActionsLabel = "Plus d'actions",
  onCall,
  onVideoCall,
  onMoreActions,
  className = '',
  ...props
}: MessagingChatHeaderProps) => {
  if (!conversation) {
    return (
      <div
        className={joinClasses('flex min-h-[78px] items-center border-b border-[#d8d2ca] bg-white px-4', className)}
        {...props}
      >
        <p className="text-sm text-[#5f6770]">Sélectionnez une conversation</p>
      </div>
    );
  }

  const meta = [conversation.department, conversation.presence ? presenceLabel[conversation.presence] : undefined]
    .filter(Boolean)
    .join(' • ');

  return (
    <div
      className={joinClasses(
        'flex min-h-[78px] items-center justify-between gap-4 border-b border-[#d8d2ca] bg-white px-4 text-[#172033] shadow-[0_1px_3px_rgba(0,0,0,0.12)] sm:px-5',
        className
      )}
      {...props}
    >
      <div className="flex min-w-0 items-center gap-3">
        <MessagingContactAvatar
          name={conversation.name}
          src={conversation.avatarUrl}
          initials={conversation.initials}
          presence={conversation.presence}
          size="lg"
        />
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold leading-6">{conversation.name}</h3>
          {meta && <p className="truncate text-sm leading-5 text-[#5f6770]">{meta}</p>}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          aria-label={callLabel}
          title={callLabel}
          className="inline-flex size-9 items-center justify-center rounded-md text-[#2f3747] transition hover:bg-[#f5f3f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/30"
          onClick={() => onCall?.(conversation)}
        >
          <Phone className="size-4" strokeWidth={1.8} />
        </button>
        <button
          type="button"
          aria-label={videoCallLabel}
          title={videoCallLabel}
          className="inline-flex size-9 items-center justify-center rounded-md text-[#2f3747] transition hover:bg-[#f5f3f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/30"
          onClick={() => onVideoCall?.(conversation)}
        >
          <Video className="size-4" strokeWidth={1.8} />
        </button>
        <button
          type="button"
          aria-label={moreActionsLabel}
          title={moreActionsLabel}
          className="inline-flex size-9 items-center justify-center rounded-md text-[#2f3747] transition hover:bg-[#f5f3f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/30"
          onClick={() => onMoreActions?.(conversation)}
        >
          <MoreVertical className="size-4" strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
};
