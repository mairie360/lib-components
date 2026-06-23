import React from 'react';
import { FileText } from 'lucide-react';

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
  const hasAttachments = !!message.attachments?.length;

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
        <div>{message.content}</div>
        {hasAttachments && (
          <div className="mt-3 space-y-2">
            {message.attachments?.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.url}
                download={attachment.name}
                target={attachment.url ? '_blank' : undefined}
                rel={attachment.url ? 'noreferrer' : undefined}
                className={joinClasses(
                  'flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold transition',
                  outgoing
                    ? 'border-white/35 bg-white/10 text-white hover:bg-white/15'
                    : 'border-[#d8d2ca] bg-[#fbfaf9] text-[#2f3747] hover:bg-[#f5f3f0]'
                )}
                onClick={(event) => {
                  if (!attachment.url) {
                    event.preventDefault();
                  }
                }}
              >
                <FileText className="size-4 shrink-0" strokeWidth={1.8} />
                <span className="min-w-0 truncate">{attachment.name}</span>
              </a>
            ))}
          </div>
        )}
      </div>
      {message.sentAt && (
        <span className={joinClasses('mt-1 text-xs leading-5 text-[#5f6770]', outgoing ? 'mr-1' : 'ml-1')}>
          {message.sentAt}
        </span>
      )}
    </div>
  );
};
