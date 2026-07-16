import React from 'react';
import { ChevronDown, Send } from 'lucide-react';

import { joinClasses } from './calendar/style';
import { MessagingModalFrame } from './messaging/MessagingModalFrame';
import type { MessagingContactId, MessagingConversation, NewMessagePayload } from './messaging/types';

export interface NewMessageModalProps {
  isOpen: boolean;
  contacts: MessagingConversation[];
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  recipientLabel?: string;
  recipientPlaceholder?: string;
  messageLabel?: string;
  messagePlaceholder?: string;
  cancelLabel?: string;
  submitLabel?: string;
  initialRecipientId?: MessagingContactId;
  initialMessage?: string;
  onCancel: () => void;
  onSendMessage: (payload: NewMessagePayload) => void;
}

const fieldClassName =
  'h-9 w-full rounded-md border border-[#d8d2ca] bg-white px-3 text-sm text-[#172033] outline-none transition placeholder:text-[#6b7280] focus:border-[#1256a6] focus:ring-2 focus:ring-[#1256a6]/20';

const buttonSecondaryClassName =
  'inline-flex h-9 items-center justify-center rounded-md border border-[#d8d2ca] bg-white px-4 text-sm font-semibold text-[#172033] shadow-sm transition hover:bg-[#fbfaf9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/25';

const buttonPrimaryClassName =
  'inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#1256a6] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4b91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/35 disabled:cursor-not-allowed disabled:bg-[#b7cce3]';

export const NewMessageModal = ({
  isOpen,
  contacts,
  title = 'Nouveau message',
  subtitle = 'Envoyer un message direct à un contact',
  recipientLabel = 'Destinataire',
  recipientPlaceholder = 'Choisir un contact',
  messageLabel = 'Message',
  messagePlaceholder = 'Tapez votre message...',
  cancelLabel = 'Annuler',
  submitLabel = 'Envoyer',
  initialRecipientId,
  initialMessage = '',
  onCancel,
  onSendMessage,
}: NewMessageModalProps) => {
  const initialRecipientValue = initialRecipientId === undefined ? '' : String(initialRecipientId);
  const [recipientValue, setRecipientValue] = React.useState(initialRecipientValue);
  const [message, setMessage] = React.useState(initialMessage);
  const titleId = React.useId();
  const subtitleId = React.useId();
  const recipientId = React.useId();
  const messageId = React.useId();

  React.useEffect(() => {
    if (!isOpen) return;

    setRecipientValue(initialRecipientValue);
    setMessage(initialMessage);
  }, [initialMessage, initialRecipientValue, isOpen]);

  if (!isOpen) return null;

  const selectedContact = contacts.find((contact) => String(contact.id) === recipientValue);
  const canSubmit = !!selectedContact && message.trim().length > 0;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedContact || !message.trim()) return;

    onSendMessage({
      recipientId: selectedContact.id,
      message: message.trim(),
    });
  };

  return (
    <MessagingModalFrame
      title={title}
      subtitle={subtitle}
      titleId={titleId}
      subtitleId={subtitleId}
      onClose={onCancel}
      onSubmit={handleSubmit}
      footer={
        <>
          <button type="button" className={buttonSecondaryClassName} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="submit" className={buttonPrimaryClassName} disabled={!canSubmit}>
            <Send className="size-4" strokeWidth={1.8} />
            <span>{submitLabel}</span>
          </button>
        </>
      }
    >
      <div>
        <label htmlFor={recipientId} className="mb-1 block text-sm font-semibold leading-5 text-[#2f3747]">
          {recipientLabel}
        </label>
        <div className="relative">
          <select
            id={recipientId}
            value={recipientValue}
            className={joinClasses(fieldClassName, 'appearance-none pr-10')}
            onChange={(event) => setRecipientValue(event.target.value)}
          >
            <option value="">{recipientPlaceholder}</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={String(contact.id)}>
                {contact.name}
                {contact.department ? ` - ${contact.department}` : ''}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#7a8087]" />
        </div>
      </div>

      <div>
        <label htmlFor={messageId} className="mb-1 block text-sm font-semibold leading-5 text-[#2f3747]">
          {messageLabel}
        </label>
        <textarea
          id={messageId}
          value={message}
          placeholder={messagePlaceholder}
          className={joinClasses(fieldClassName, 'h-[100px] resize-none py-2')}
          onChange={(event) => setMessage(event.target.value)}
        />
      </div>
    </MessagingModalFrame>
  );
};
