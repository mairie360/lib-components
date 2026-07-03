import React from 'react';
import { AtSign, Briefcase, CalendarDays, FileText, Hash, ListTodo, Paperclip, Send, Smile, X } from 'lucide-react';

import { joinClasses } from './calendar/style';
import type { MessagingAttachment, MessagingBusinessReference, MessagingMention } from './messaging/types';

export interface MessagingComposerProps extends React.HTMLAttributes<HTMLFormElement> {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  sendLabel?: string;
  attachLabel?: string;
  emojiLabel?: string;
  disabled?: boolean;
  mentionOptions?: MessagingMention[];
  businessReferenceOptions?: MessagingBusinessReference[];
  onValueChange?: (value: string) => void;
  onSendMessage?: (
    message: string,
    attachments?: MessagingAttachment[],
    mentions?: MessagingMention[],
    businessLinks?: MessagingBusinessReference[]
  ) => void;
  onAttach?: (files: File[], attachments: MessagingAttachment[]) => void;
  onEmoji?: (emoji: string) => void;
}

const systemEmojiOptions = ['👍', '👏', '😊', '🎉', '✅', '🙏', '📎', '📌'];

const normalizeMentionValue = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const getTriggerMatch = (value: string, trigger: '@' | '#') => {
  const match = value.match(new RegExp(`(^|\\s)\\${trigger}([^\\s@#]*)$`));

  if (!match || match.index === undefined) return null;

  return {
    start: match.index + match[1].length,
    query: match[2],
  };
};

export const MessagingComposer = ({
  value,
  defaultValue = '',
  placeholder = 'Tapez votre message...',
  sendLabel = 'Envoyer',
  attachLabel = 'Joindre un fichier',
  emojiLabel = 'Ajouter une réaction',
  disabled = false,
  mentionOptions = [],
  businessReferenceOptions = [],
  onValueChange,
  onSendMessage,
  onAttach,
  onEmoji,
  className = '',
  ...props
}: MessagingComposerProps) => {
  const textInputRef = React.useRef<HTMLInputElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [attachments, setAttachments] = React.useState<MessagingAttachment[]>([]);
  const [mentions, setMentions] = React.useState<MessagingMention[]>([]);
  const [businessLinks, setBusinessLinks] = React.useState<MessagingBusinessReference[]>([]);
  const [emojiOpen, setEmojiOpen] = React.useState(false);
  const currentValue = value ?? internalValue;
  const canSend = (currentValue.trim().length > 0 || attachments.length > 0) && !disabled;
  const mentionMatch = getTriggerMatch(currentValue, '@');
  const businessReferenceMatch = getTriggerMatch(currentValue, '#');
  const mentionSuggestions = mentionMatch
    ? mentionOptions
        .filter((mention) => normalizeMentionValue(mention.name).includes(normalizeMentionValue(mentionMatch.query)))
        .slice(0, 6)
    : [];
  const businessReferenceSuggestions =
    !mentionMatch && businessReferenceMatch
      ? businessReferenceOptions
          .filter((reference) =>
            normalizeMentionValue(reference.title).includes(normalizeMentionValue(businessReferenceMatch.query))
          )
          .slice(0, 6)
      : [];
  const mentionSuggestionsOpen = mentionSuggestions.length > 0;
  const businessReferenceSuggestionsOpen = businessReferenceSuggestions.length > 0;

  const updateValue = (nextValue: string) => {
    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onValueChange?.(nextValue);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateValue(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextMessage = currentValue.trim() || 'Pièce jointe';
    if ((!currentValue.trim() && attachments.length === 0) || disabled) return;

    const messageMentions = mentions.filter((mention) => currentValue.includes(`@${mention.name}`));
    const messageBusinessLinks = businessLinks.filter((reference) => currentValue.includes(`#${reference.title}`));

    onSendMessage?.(nextMessage, attachments, messageMentions, messageBusinessLinks);

    if (value === undefined) {
      setInternalValue('');
    }

    setAttachments([]);
    setMentions([]);
    setBusinessLinks([]);
    setEmojiOpen(false);
    onValueChange?.('');
  };

  const handleAttachClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const nextAttachments = files.map((file, index) => ({
      id: `${file.name}-${file.lastModified}-${index}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url:
        typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
          ? URL.createObjectURL(file)
          : undefined,
    }));

    setAttachments((currentAttachments) => [...currentAttachments, ...nextAttachments]);
    onAttach?.(files, nextAttachments);
    event.target.value = '';
  };

  const removeAttachment = (attachmentId: MessagingAttachment['id']) => {
    setAttachments((currentAttachments) => {
      const removedAttachment = currentAttachments.find((attachment) => attachment.id === attachmentId);

      if (removedAttachment?.url?.startsWith('blob:') && typeof URL !== 'undefined') {
        URL.revokeObjectURL?.(removedAttachment.url);
      }

      return currentAttachments.filter((attachment) => attachment.id !== attachmentId);
    });
  };

  const appendEmoji = (emoji: string) => {
    updateValue(`${currentValue}${emoji}`);
    setEmojiOpen(false);
    onEmoji?.(emoji);
  };

  const selectMention = (mention: MessagingMention) => {
    if (!mentionMatch) return;

    const nextValue = `${currentValue.slice(0, mentionMatch.start)}@${mention.name} `;
    updateValue(nextValue);
    setMentions((currentMentions) =>
      currentMentions.some((currentMention) => currentMention.id === mention.id)
        ? currentMentions
        : [...currentMentions, mention]
    );

    window.setTimeout(() => textInputRef.current?.focus(), 0);
  };

  const selectBusinessReference = (reference: MessagingBusinessReference) => {
    if (!businessReferenceMatch) return;

    const nextValue = `${currentValue.slice(0, businessReferenceMatch.start)}#${reference.title} `;
    updateValue(nextValue);
    setBusinessLinks((currentLinks) =>
      currentLinks.some((currentLink) => currentLink.id === reference.id)
        ? currentLinks
        : [...currentLinks, reference]
    );

    window.setTimeout(() => textInputRef.current?.focus(), 0);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if ((event.key === 'Enter' || event.key === 'Tab') && mentionSuggestionsOpen) {
      event.preventDefault();
      selectMention(mentionSuggestions[0]);
    }

    if ((event.key === 'Enter' || event.key === 'Tab') && businessReferenceSuggestionsOpen) {
      event.preventDefault();
      selectBusinessReference(businessReferenceSuggestions[0]);
    }
  };

  const getBusinessReferenceIcon = (reference: MessagingBusinessReference) => {
    if (reference.kind === 'event') return <CalendarDays className="size-4" strokeWidth={1.8} />;
    if (reference.kind === 'task') return <ListTodo className="size-4" strokeWidth={1.8} />;

    return <Briefcase className="size-4" strokeWidth={1.8} />;
  };

  return (
    <form
      className={joinClasses(
        'border-t border-[#d8d2ca] bg-white px-4 py-4 text-[#172033] sm:px-5',
        className
      )}
      onSubmit={handleSubmit}
      {...props}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        tabIndex={-1}
        onChange={handleFilesChange}
      />
      <div className="flex items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <input
            ref={textInputRef}
            type="text"
            value={currentValue}
            placeholder={placeholder}
            disabled={disabled}
            className="h-10 w-full rounded-md border border-[#d8d2ca] bg-white px-3 text-sm text-[#172033] outline-none transition placeholder:text-[#5f6770] focus:border-[#1256a6] focus:ring-2 focus:ring-[#1256a6]/20 disabled:cursor-not-allowed disabled:bg-[#f5f3f0]"
            onChange={handleChange}
            onKeyDown={handleInputKeyDown}
          />
          {(mentionSuggestionsOpen || businessReferenceSuggestionsOpen) && (
            <div className="absolute bottom-[calc(100%+8px)] left-0 z-30 w-full max-w-[320px] overflow-hidden rounded-md border border-[#d8d2ca] bg-white p-1 text-sm text-[#172033] shadow-lg">
              {mentionSuggestionsOpen
                ? mentionSuggestions.map((mention) => (
                    <button
                      key={mention.id}
                      type="button"
                      className="flex min-h-11 w-full items-center gap-3 rounded px-3 py-2 text-left transition hover:bg-[#f5f3f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/30"
                      onClick={() => selectMention(mention)}
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#1256a6] text-white">
                        <AtSign className="size-4" strokeWidth={1.8} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">@{mention.name}</span>
                        <span className="block truncate text-xs text-[#5f6770]">
                          {mention.kind === 'group' ? 'Groupe' : mention.description || 'Contact'}
                        </span>
                      </span>
                    </button>
                  ))
                : businessReferenceSuggestions.map((reference) => (
                    <button
                      key={reference.id}
                      type="button"
                      className="flex min-h-11 w-full items-center gap-3 rounded px-3 py-2 text-left transition hover:bg-[#f5f3f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/30"
                      onClick={() => selectBusinessReference(reference)}
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#1d7a63] text-white">
                        {getBusinessReferenceIcon(reference)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">#{reference.title}</span>
                        <span className="block truncate text-xs text-[#5f6770]">
                          {reference.description || 'Élément métier'}
                        </span>
                      </span>
                    </button>
                  ))}
            </div>
          )}
        </div>
        <button
          type="submit"
          aria-label={sendLabel}
          title={sendLabel}
          disabled={!canSend}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-[#1256a6] text-white shadow-sm transition hover:bg-[#0f4b91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/35 disabled:cursor-not-allowed disabled:bg-[#b7cce3]"
        >
          <Send className="size-4" strokeWidth={1.8} />
        </button>
      </div>
      {attachments.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <span
              key={attachment.id}
              className="inline-flex max-w-full items-center gap-2 rounded-md border border-[#d8d2ca] bg-[#fbfaf9] px-2.5 py-1.5 text-xs font-semibold text-[#2f3747]"
            >
              <FileText className="size-3.5 shrink-0" strokeWidth={1.8} />
              <span className="max-w-[180px] truncate">{attachment.name}</span>
              <button
                type="button"
                aria-label={`Retirer ${attachment.name}`}
                className="inline-flex size-5 items-center justify-center rounded text-[#5f6770] transition hover:bg-[#ece8e2] hover:text-[#172033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/30"
                onClick={() => removeAttachment(attachment.id)}
              >
                <X className="size-3.5" strokeWidth={1.8} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          aria-label={attachLabel}
          title={attachLabel}
          className="inline-flex size-8 items-center justify-center rounded-md text-[#2f3747] transition hover:bg-[#f5f3f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/30"
          onClick={handleAttachClick}
        >
          <Paperclip className="size-4" strokeWidth={1.8} />
        </button>
        <button
          type="button"
          aria-label="Mentionner un élément métier"
          title="Mentionner un élément métier"
          className="inline-flex size-8 items-center justify-center rounded-md text-[#2f3747] transition hover:bg-[#f5f3f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/30"
          onClick={() => {
            if (disabled) return;
            updateValue(`${currentValue}${currentValue.trim() && !currentValue.endsWith(' ') ? ' #' : '#'}`);
            window.setTimeout(() => textInputRef.current?.focus(), 0);
          }}
        >
          <Hash className="size-4" strokeWidth={1.8} />
        </button>
        <div className="relative">
          <button
            type="button"
            aria-label={emojiLabel}
            title={emojiLabel}
            className="inline-flex size-8 items-center justify-center rounded-md text-[#2f3747] transition hover:bg-[#f5f3f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/30"
            onClick={() => setEmojiOpen((open) => !open)}
          >
            <Smile className="size-4" strokeWidth={1.8} />
          </button>
          {emojiOpen && (
            <div
              className="absolute bottom-[calc(100%+8px)] left-0 z-20 grid gap-1 rounded-md border border-[#d8d2ca] bg-white p-2 shadow-lg"
              style={{
                gridTemplateColumns: 'repeat(4, 2rem)',
                width: '9.25rem',
              }}
            >
              {systemEmojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  aria-label={`Ajouter ${emoji}`}
                  className="flex size-8 items-center justify-center rounded-md transition hover:bg-[#f5f3f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/30"
                  style={{
                    fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
                    fontSize: '1.25rem',
                    lineHeight: 1,
                  }}
                  onClick={() => appendEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </form>
  );
};
