import React from 'react';
import { Briefcase, CalendarDays, FileText, ListTodo } from 'lucide-react';

import { joinClasses } from './calendar/style';
import type {
  MessagingBusinessReference,
  MessagingMention,
  MessagingMessage,
} from './messaging/types';

export interface MessagingMessageBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  message: MessagingMessage;
  mentionOptions?: MessagingMention[];
  businessReferenceOptions?: MessagingBusinessReference[];
  onBusinessReferenceClick?: (reference: MessagingBusinessReference) => void;
}

type InlineMentionKind = 'user' | 'business';

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const renderMentionedContent = (
  content: React.ReactNode,
  mentions: MessagingMention[],
  businessReferences: MessagingBusinessReference[]
) => {
  if (typeof content !== 'string') return content;

  const mentionKinds = new Map<string, InlineMentionKind>();

  mentions.forEach((mention) => {
    const label = `@${mention.name}`;
    if (mention.name.trim() && content.includes(label)) mentionKinds.set(label, 'user');
  });
  businessReferences.forEach((reference) => {
    const label = `#${reference.title}`;
    if (reference.title.trim() && content.includes(label)) mentionKinds.set(label, 'business');
  });

  if (mentionKinds.size === 0) return content;

  const mentionPattern = Array.from(mentionKinds.keys())
    .sort((left, right) => right.length - left.length)
    .map(escapeRegExp)
    .join('|');
  const parts = content.split(new RegExp(`(${mentionPattern})(?![\\p{L}\\p{N}_])`, 'gu'));

  return parts.map((part, index) => {
    const mentionKind = mentionKinds.get(part);

    if (!mentionKind) return part;

    return (
      <strong
        key={`${part}-${index}`}
        className="font-bold underline underline-offset-2"
        data-mention-kind={mentionKind}
      >
        {part}
      </strong>
    );
  });
};

export const MessagingMessageBubble = ({
  message,
  mentionOptions = [],
  businessReferenceOptions = [],
  onBusinessReferenceClick,
  className = '',
  ...props
}: MessagingMessageBubbleProps) => {
  const outgoing = message.direction === 'outgoing';
  const hasAttachments = !!message.attachments?.length;
  const businessReferences = [message.context, ...(message.businessLinks ?? [])].filter(
    (reference, index, references): reference is MessagingBusinessReference =>
      !!reference && references.findIndex((currentReference) => currentReference?.id === reference.id) === index
  );
  const hasBusinessReferences = businessReferences.length > 0;
  const mentionedContent = renderMentionedContent(
    message.content,
    [...mentionOptions, ...(message.mentions ?? [])],
    [...businessReferenceOptions, ...businessReferences]
  );

  const getBusinessReferenceIcon = (reference: MessagingBusinessReference) => {
    if (reference.kind === 'event') return <CalendarDays className="size-3.5 shrink-0" strokeWidth={1.8} />;
    if (reference.kind === 'task') return <ListTodo className="size-3.5 shrink-0" strokeWidth={1.8} />;

    return <Briefcase className="size-3.5 shrink-0" strokeWidth={1.8} />;
  };

  const referenceClassName = joinClasses(
    'inline-flex max-w-full items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition',
    outgoing
      ? 'border-white/35 bg-white/10 text-white hover:bg-white/15'
      : 'border-[#b9d6d5] bg-[#eef7f6] text-[#245651] hover:bg-[#e4f2f1]'
  );

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
        <div>{mentionedContent}</div>
        {hasBusinessReferences && (
          <div className="mt-3 flex flex-wrap gap-2">
            {businessReferences.map((reference) =>
              reference.href ? (
                <a
                  key={reference.id}
                  href={reference.href}
                  className={referenceClassName}
                  onClick={() => onBusinessReferenceClick?.(reference)}
                >
                  {getBusinessReferenceIcon(reference)}
                  <span className="min-w-0 truncate">{reference.title}</span>
                </a>
              ) : (
                <button
                  key={reference.id}
                  type="button"
                  className={referenceClassName}
                  onClick={() => onBusinessReferenceClick?.(reference)}
                >
                  {getBusinessReferenceIcon(reference)}
                  <span className="min-w-0 truncate">{reference.title}</span>
                </button>
              )
            )}
          </div>
        )}
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
