import React from 'react';
import { Archive, CornerUpLeft, Forward, Paperclip, Reply, RotateCcw, Trash2 } from 'lucide-react';

import { joinEmailClasses } from './email/utils';
import type { EmailAttachment, EmailComposeMode, EmailMessage } from './email/types';

export interface EmailReaderProps extends React.HTMLAttributes<HTMLElement> {
  message?: EmailMessage;
  onComposeFromMessage: (mode: Exclude<EmailComposeMode, 'new' | 'draft'>, message: EmailMessage) => void;
  onArchive: (message: EmailMessage) => void;
  onTrash: (message: EmailMessage) => void;
  onRestore: (message: EmailMessage) => void;
  onDeletePermanently: (message: EmailMessage) => void;
  onResumeDraft: (message: EmailMessage) => void;
  onOpenAttachment?: (message: EmailMessage, attachment: EmailAttachment) => void;
}

const toolbarButton = 'inline-flex h-8 items-center justify-center gap-2 rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] px-3 text-xs font-medium text-[var(--mairie-text)] hover:bg-[var(--mairie-surface)]';

export const EmailReader = ({ message, onComposeFromMessage, onArchive, onTrash, onRestore, onDeletePermanently, onResumeDraft, onOpenAttachment, className = '', ...props }: EmailReaderProps) => {
  if (!message) return <section className={joinEmailClasses('flex min-h-80 items-center justify-center bg-[var(--mairie-surface)] text-sm text-[var(--mairie-muted)]', className)} {...props}>Sélectionnez un e-mail pour le lire.</section>;
  const isTrash = message.folder === 'trash';
  const isDraft = message.folder === 'drafts';

  return (
    <section className={joinEmailClasses('min-w-0 bg-[var(--mairie-surface)]', className)} {...props}>
      <header className="border-b border-[var(--mairie-border)] px-4 py-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0"><h2 className="truncate text-lg font-bold text-[var(--mairie-text)]">{message.subject}</h2><p className="mt-2 text-sm text-[var(--mairie-muted)]">De: <span className="font-semibold text-[var(--mairie-accent)]">{message.senderName}</span> · {message.timestamp}</p></div>
          <div className="flex flex-wrap gap-1.5">
            {isDraft ? <button type="button" className={toolbarButton} onClick={() => onResumeDraft(message)}><Reply className="size-4" />Reprendre le brouillon</button> : isTrash ? <><button type="button" className={toolbarButton} onClick={() => onRestore(message)}><RotateCcw className="size-4" />Restaurer</button><button type="button" aria-label="Supprimer définitivement" className={toolbarButton} onClick={() => onDeletePermanently(message)}><Trash2 className="size-4" /></button></> : <><button type="button" className={toolbarButton} onClick={() => onComposeFromMessage('reply', message)}><CornerUpLeft className="size-4" />Répondre</button><button type="button" aria-label="Répondre à tous" className={toolbarButton} onClick={() => onComposeFromMessage('reply-all', message)}><Reply className="size-4" />Tous</button><button type="button" className={toolbarButton} onClick={() => onComposeFromMessage('forward', message)}><Forward className="size-4" />Transférer</button><button type="button" aria-label="Archiver" className={toolbarButton} onClick={() => onArchive(message)}><Archive className="size-4" /></button><button type="button" aria-label="Mettre à la corbeille" className={toolbarButton} onClick={() => onTrash(message)}><Trash2 className="size-4" /></button></>}
          </div>
        </div>
        {message.attachments && message.attachments.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{message.attachments.map((attachment) => <button key={attachment.id} type="button" className="inline-flex items-center gap-2 rounded-md border border-[var(--mairie-accent)] bg-[var(--mairie-accent-surface)] px-3 py-1 text-xs text-[var(--mairie-teal-text)]" onClick={() => onOpenAttachment?.(message, attachment)}><Paperclip className="size-3.5" />{attachment.name} · {attachment.sizeLabel}</button>)}</div>}
      </header>
      <div className="p-6"><div className="min-h-28 rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] p-6 text-base leading-7 text-[var(--mairie-text)] shadow-sm whitespace-pre-wrap">{message.body}</div></div>
    </section>
  );
};
