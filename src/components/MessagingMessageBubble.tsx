import React from 'react';

import { joinClasses } from './calendar/style';
import type { MessagingMessage } from './messaging/types';

export interface MessagingMessageBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  message: MessagingMessage;
}

export const MessagingMessageBubble = ({
  message,
  className = '',
  ...props
}: MessagingMessageBubbleProps) => {
  const outgoing = message.direction === 'outgoing';

  return (
    <div
      className={joinClasses('flex w-full flex-col', outgoing ? 'items-end' : 'items-start', className)}
      {...props}
    >
      <div
        className={joinClasses(
          'max-w-[min(560px,82%)] rounded-md px-4 py-3 text-sm leading-5 shadow-[0_1px_2px_rgba(0,0,0,0.14)]',
          outgoing
            ? 'bg-[#1256a6] text-white'
            : 'border border-[#d8d2ca] bg-white text-[#172033]'
        )}
      >
        {message.content}
      </div>
      {message.sentAt && (
        <span className={joinClasses('mt-1 text-xs leading-5 text-[#5f6770]', outgoing ? 'mr-1' : 'ml-1')}>
          {message.sentAt}
        </span>
      )}
    </div>
  );
};
