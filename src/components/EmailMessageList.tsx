import React from 'react';
import { Paperclip, Star } from 'lucide-react';

import { joinEmailClasses } from './email/utils';
import type { EmailMessage } from './email/types';

export interface EmailMessageListProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onSelect'> {
  title: string;
  messages: EmailMessage[];
  selectedId?: string;
  onSelect: (message: EmailMessage) => void;
  onToggleFavorite: (message: EmailMessage) => void;
}

export const EmailMessageList = ({ title, messages, selectedId, onSelect, onToggleFavorite, className = '', ...props }: EmailMessageListProps) => (
  <section className={joinEmailClasses('min-w-0 border-r border-[#d7d2cc] bg-white', className)} {...props}>
    <h2 className="border-b border-[#d7d2cc] px-4 py-5 text-base font-bold text-[#172033]">{title}</h2>
    <div>
      {messages.map((message) => (
        <article key={message.id} className={joinEmailClasses('relative border-b border-[#e5e0da]', selectedId === message.id ? 'bg-[#d9eeee]' : message.unread ? 'bg-[#f7fbff]' : 'bg-white')}>
          <button type="button" aria-label={`Lire ${message.subject}`} className="block w-full px-4 py-4 pr-12 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#155bb5]/30" onClick={() => onSelect(message)}>
            <span className="flex items-center justify-between gap-3"><span className={joinEmailClasses('truncate text-base text-[#155bb5]', message.unread && 'font-bold')}>{message.senderName}</span><span className="shrink-0 text-xs text-[#687385]">{message.timestamp}</span></span>
            <span className={joinEmailClasses('mt-2 block truncate text-sm text-[#172033]', message.unread && 'font-semibold')}>{message.subject}</span>
            <span className="mt-1 block truncate text-sm text-[#687385]">{message.preview}</span>
          </button>
          <div className="absolute right-3 top-10 flex items-center gap-1">
            <button type="button" aria-label={message.isFavorite ? `Retirer ${message.subject} des favoris` : `Ajouter ${message.subject} aux favoris`} aria-pressed={Boolean(message.isFavorite)} className="rounded p-1 text-[#4a918d] hover:bg-white" onClick={() => onToggleFavorite(message)}><Star className="size-4" fill={message.isFavorite ? 'currentColor' : 'none'} /></button>
            {message.attachments && message.attachments.length > 0 && <Paperclip className="size-4 text-[#64748b]" aria-label="Pièce jointe" />}
          </div>
        </article>
      ))}
      {messages.length === 0 && <p className="px-4 py-12 text-center text-sm text-[#687385]">Aucun e-mail dans ce dossier.</p>}
    </div>
  </section>
);
