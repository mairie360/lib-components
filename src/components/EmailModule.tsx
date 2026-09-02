import React from 'react';

import { ConfirmModal } from './ConfirmModal';
import { EmailComposeModal } from './EmailComposeModal';
import { EmailDraftPrompt } from './EmailDraftPrompt';
import { EmailFolders } from './EmailFolders';
import { EmailMessageList } from './EmailMessageList';
import { EmailReader } from './EmailReader';
import { defaultEmailFolders, defaultEmailMessages } from './email/defaultData';
import { joinEmailClasses, messageMatchesSearch } from './email/utils';
import type { EmailAttachment, EmailComposeMode, EmailComposeRequest, EmailComposeValues, EmailFolder, EmailFolderId, EmailMessage, EmailMessageAction, EmailStoredFolder } from './email/types';

export interface EmailModuleProps extends React.HTMLAttributes<HTMLElement> {
  messages?: EmailMessage[];
  folders?: EmailFolder[];
  currentUserEmail?: string;
  onSend?: (request: EmailComposeRequest) => void;
  onSaveDraft?: (values: EmailComposeValues) => void;
  onMessageAction?: (message: EmailMessage, action: EmailMessageAction) => void;
  onOpenAttachment?: (message: EmailMessage, attachment: EmailAttachment) => void;
}

const getFolderMessages = (messages: EmailMessage[], folder: EmailFolderId) => {
  if (folder === 'favorites') return messages.filter((message) => message.isFavorite && message.folder !== 'trash');
  if (folder === 'important') return messages.filter((message) => message.isImportant && message.folder !== 'trash');
  return messages.filter((message) => message.folder === folder);
};

const hasDraftContent = (values: EmailComposeValues) => Boolean(values.to.trim() || values.subject.trim() || values.body.trim() || values.attachments.length);

export const EmailModule = ({ messages, folders = defaultEmailFolders, currentUserEmail = 'admin@mairie360.fr', onSend, onSaveDraft, onMessageAction, onOpenAttachment, className = '', ...props }: EmailModuleProps) => {
  const [internalMessages, setInternalMessages] = React.useState(defaultEmailMessages);
  const [internalFolders, setInternalFolders] = React.useState(folders);
  const [activeFolder, setActiveFolder] = React.useState<EmailFolderId>('inbox');
  const [search, setSearch] = React.useState('');
  const [selectedId, setSelectedId] = React.useState<string | undefined>('accessibility-regulation');
  const [composeMode, setComposeMode] = React.useState<EmailComposeMode>('new');
  const [composeValues, setComposeValues] = React.useState<Partial<EmailComposeValues>>({});
  const [composeSource, setComposeSource] = React.useState<EmailMessage | undefined>();
  const [composeOpen, setComposeOpen] = React.useState(false);
  const [pendingDraft, setPendingDraft] = React.useState<{
    values: EmailComposeValues;
    source?: EmailMessage;
  } | null>(null);
  const [pendingPermanentDelete, setPendingPermanentDelete] = React.useState<EmailMessage | null>(null);
  const [status, setStatus] = React.useState('');
  const resolvedMessages = messages ?? internalMessages;
  const resolvedFolders = folders === defaultEmailFolders ? internalFolders : folders;
  const folderMessages = getFolderMessages(resolvedMessages, activeFolder).filter((message) => messageMatchesSearch(message, search));
  const selectedMessage = resolvedMessages.find((message) => message.id === selectedId && folderMessages.some((item) => item.id === message.id)) ?? folderMessages[0];
  const folderTitle = resolvedFolders.find((folder) => folder.id === activeFolder)?.label ?? 'E-mails';

  React.useEffect(() => setInternalFolders(folders), [folders]);

  const updateLocalMessage = (id: string, updater: (message: EmailMessage) => EmailMessage) => {
    if (messages === undefined) setInternalMessages((current) => current.map((message) => message.id === id ? updater(message) : message));
  };
  const adjustCount = (folder: EmailFolderId, delta: number) => setInternalFolders((current) => current.map((item) => item.id === folder && item.count !== undefined ? { ...item, count: Math.max(0, item.count + delta) } : item));

  const selectMessage = (message: EmailMessage) => {
    setSelectedId(message.id);
    if (message.unread) {
      updateLocalMessage(message.id, (current) => ({ ...current, unread: false }));
      onMessageAction?.(message, 'read');
    }
  };

  const toggleFavorite = (message: EmailMessage) => {
    updateLocalMessage(message.id, (current) => ({ ...current, isFavorite: !current.isFavorite }));
    adjustCount('favorites', message.isFavorite ? -1 : 1);
    onMessageAction?.(message, 'favorite');
  };

  const openCompose = (mode: EmailComposeMode, initialValues: Partial<EmailComposeValues> = {}, source?: EmailMessage) => {
    setComposeMode(mode); setComposeValues(initialValues); setComposeSource(source); setComposeOpen(true);
  };

  const composeFromMessage = (mode: Exclude<EmailComposeMode, 'new' | 'draft'>, message: EmailMessage) => {
    const replySubject = message.subject.startsWith('Re:') ? message.subject : `Re: ${message.subject}`;
    if (mode === 'reply') return openCompose(mode, { to: message.senderEmail, subject: replySubject, body: `\n\n--- Message original ---\n${message.body}` }, message);
    if (mode === 'reply-all') {
      const recipients = Array.from(new Set([message.senderEmail, ...message.recipients, ...(message.cc ?? [])].filter((email) => email !== currentUserEmail)));
      return openCompose(mode, { to: recipients.join('; '), subject: replySubject, body: `\n\n--- Message original ---\n${message.body}` }, message);
    }
    openCompose(mode, { to: '', subject: message.subject.startsWith('Tr:') ? message.subject : `Tr: ${message.subject}`, body: `\n\n--- Message transféré ---\n${message.body}`, attachments: message.attachments ?? [] }, message);
  };

  const sendMessage = (values: EmailComposeValues) => {
    const request: EmailComposeRequest = { mode: composeMode, values, sourceMessage: composeSource };
    onSend?.(request);
    if (messages === undefined) {
      setInternalMessages((current) => {
        const withoutSourceDraft = composeMode === 'draft' && composeSource ? current.filter((message) => message.id !== composeSource.id) : current;
        return [{ id: `sent-${Date.now()}`, senderName: 'Utilisateur actuel', senderEmail: currentUserEmail, recipients: values.to.split(/[;,]/).map((item) => item.trim()).filter(Boolean), subject: values.subject, preview: values.body.slice(0, 80), body: values.body, timestamp: "À l'instant", folder: 'sent', attachments: values.attachments }, ...withoutSourceDraft];
      });
    }
    if (composeMode === 'draft') adjustCount('drafts', -1);
    adjustCount('sent', 1);
    setComposeOpen(false); setComposeSource(undefined); setStatus('E-mail envoyé.');
  };

  const cancelCompose = (values: EmailComposeValues) => {
    setComposeOpen(false);
    if (hasDraftContent(values)) {
      setPendingDraft({
        values,
        source: composeMode === 'draft' ? composeSource : undefined,
      });
    }
    setComposeSource(undefined);
  };

  const saveDraft = () => {
    if (!pendingDraft) return;
    const { values, source } = pendingDraft;
    onSaveDraft?.(values);
    if (messages === undefined) {
      setInternalMessages((current) => {
        const draft: EmailMessage = {
          id: source?.id ?? `draft-${Date.now()}`,
          senderName: 'Utilisateur actuel',
          senderEmail: currentUserEmail,
          recipients: values.to ? values.to.split(/[;,]/).map((item) => item.trim()).filter(Boolean) : [''],
          subject: values.subject || '(Sans objet)',
          preview: values.body.slice(0, 80),
          body: values.body,
          timestamp: "À l'instant",
          folder: 'drafts',
          attachments: values.attachments,
        };

        return source
          ? current.map((message) => message.id === source.id ? draft : message)
          : [draft, ...current];
      });
    }
    if (!source) adjustCount('drafts', 1);
    setPendingDraft(null);
    setStatus('Brouillon enregistré.');
  };

  const moveMessage = (message: EmailMessage, target: EmailStoredFolder, action: EmailMessageAction) => {
    updateLocalMessage(message.id, (current) => ({ ...current, folder: target, originalFolder: action === 'trash' ? current.folder : current.originalFolder }));
    adjustCount(message.folder, -1); adjustCount(target, 1); onMessageAction?.(message, action); setSelectedId(undefined);
    setStatus(action === 'archive' ? 'E-mail archivé.' : action === 'restore' ? 'E-mail restauré.' : 'E-mail placé dans la corbeille.');
  };

  const confirmPermanentDelete = () => {
    if (!pendingPermanentDelete) return;
    onMessageAction?.(pendingPermanentDelete, 'delete-permanently');
    if (messages === undefined) setInternalMessages((current) => current.filter((message) => message.id !== pendingPermanentDelete.id));
    adjustCount('trash', -1); setPendingPermanentDelete(null); setSelectedId(undefined); setStatus('E-mail supprimé définitivement.');
  };

  const resumeDraft = (message: EmailMessage) => openCompose('draft', { to: message.recipients.filter(Boolean).join('; '), subject: message.subject === '(Sans objet)' ? '' : message.subject, body: message.body, attachments: message.attachments ?? [] }, message);

  return (
    <section className={joinEmailClasses('bg-[#f5f3f0] text-[#172033]', className)} {...props}>
      {status && <p role="status" className="border border-[#b9d6d5] bg-white px-4 py-2 text-sm text-[#285c59]">{status}</p>}
      <div className="grid min-h-[472px] overflow-hidden rounded-lg border border-[#e0dbd4] lg:grid-cols-[255px_385px_minmax(0,1fr)]">
        <EmailFolders folders={resolvedFolders} activeFolder={activeFolder} search={search} onSearchChange={setSearch} onSelect={(folder) => { setActiveFolder(folder); setSelectedId(undefined); }} onCompose={() => openCompose('new')} />
        <EmailMessageList title={folderTitle} messages={folderMessages} selectedId={selectedMessage?.id} onSelect={selectMessage} onToggleFavorite={toggleFavorite} />
        <EmailReader message={selectedMessage} onComposeFromMessage={composeFromMessage} onArchive={(message) => moveMessage(message, 'archived', 'archive')} onTrash={(message) => moveMessage(message, 'trash', 'trash')} onRestore={(message) => moveMessage(message, message.originalFolder ?? 'inbox', 'restore')} onDeletePermanently={setPendingPermanentDelete} onResumeDraft={resumeDraft} onOpenAttachment={onOpenAttachment} />
      </div>
      <EmailComposeModal isOpen={composeOpen} mode={composeMode} initialValues={composeValues} onCancel={cancelCompose} onSend={sendMessage} />
      <EmailDraftPrompt isOpen={pendingDraft !== null} onDiscard={() => setPendingDraft(null)} onSave={saveDraft} />
      <ConfirmModal isOpen={pendingPermanentDelete !== null} title="Supprimer définitivement cet e-mail ?" message="Cette action est irréversible." onCancel={() => setPendingPermanentDelete(null)} onConfirm={confirmPermanentDelete} />
    </section>
  );
};
