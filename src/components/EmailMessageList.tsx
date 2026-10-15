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
  <section className={joinEmailClasses('min-w-0 border-r border-[var(--mairie-border)] bg-[var(--mairie-surface)]', className)} {...props}>
    <h2 className="border-b border-[var(--mairie-border)] px-4 py-5 text-base font-bold text-[var(--mairie-text)]">{title}</h2>
    <div>
      {messages.map((message) => (
        <article key={message.id} className={joinEmailClasses('relative border-b border-[var(--mairie-border)]', selectedId === message.id ? 'bg-[var(--mairie-accent-surface)]' : message.unread ? 'bg-[var(--mairie-surface-raised)]' : 'bg-[var(--mairie-surface)]')}>
          <button type="button" aria-label={`Lire ${message.subject}`} className="block w-full px-4 py-4 pr-12 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--mairie-accent)]/30" onClick={() => onSelect(message)}>
            <span className="flex items-center justify-between gap-3"><span className={joinEmailClasses('truncate text-base text-[var(--mairie-accent)]', message.unread && 'font-bold')}>{message.senderName}</span><span className="shrink-0 text-xs text-[var(--mairie-muted)]">{message.timestamp}</span></span>
            <span className={joinEmailClasses('mt-2 block truncate text-sm text-[var(--mairie-text)]', message.unread && 'font-semibold')}>{message.subject}</span>
            <span className="mt-1 block truncate text-sm text-[var(--mairie-muted)]">{message.preview}</span>
          </button>
          <div className="absolute right-3 top-10 flex items-center gap-1">
            <button type="button" aria-label={message.isFavorite ? `Retirer ${message.subject} des favoris` : `Ajouter ${message.subject} aux favoris`} aria-pressed={Boolean(message.isFavorite)} className="rounded p-1 text-[var(--mairie-teal-text)] hover:bg-[var(--mairie-surface)]" onClick={() => onToggleFavorite(message)}><Star className="size-4" fill={message.isFavorite ? 'currentColor' : 'none'} /></button>
            {message.attachments && message.attachments.length > 0 && <Paperclip className="size-4 text-[var(--mairie-muted)]" aria-label="Pièce jointe" />}
          </div>
        </article>
      ))}
      {messages.length === 0 && <p className="px-4 py-12 text-center text-sm text-[var(--mairie-muted)]">Aucun e-mail dans ce dossier.</p>}
    </div>
  </section>
);
