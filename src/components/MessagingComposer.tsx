import React from 'react';
import { FileText, Paperclip, Send, Smile, X } from 'lucide-react';

import { joinClasses } from './calendar/style';
import type { MessagingAttachment } from './messaging/types';

export interface MessagingComposerProps extends React.HTMLAttributes<HTMLFormElement> {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  sendLabel?: string;
  attachLabel?: string;
  emojiLabel?: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  onSendMessage?: (message: string, attachments?: MessagingAttachment[]) => void;
  onAttach?: (files: File[], attachments: MessagingAttachment[]) => void;
  onEmoji?: (emoji: string) => void;
}

const systemEmojiOptions = ['👍', '👏', '😊', '🎉', '✅', '🙏', '📎', '📌'];

export const MessagingComposer = ({
  value,
  defaultValue = '',
  placeholder = 'Tapez votre message...',
  sendLabel = 'Envoyer',
  attachLabel = 'Joindre un fichier',
  emojiLabel = 'Ajouter une réaction',
  disabled = false,
  onValueChange,
  onSendMessage,
  onAttach,
  onEmoji,
  className = '',
  ...props
}: MessagingComposerProps) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [attachments, setAttachments] = React.useState<MessagingAttachment[]>([]);
  const [emojiOpen, setEmojiOpen] = React.useState(false);
  const currentValue = value ?? internalValue;
  const canSend = (currentValue.trim().length > 0 || attachments.length > 0) && !disabled;

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

    onSendMessage?.(nextMessage, attachments);

    if (value === undefined) {
      setInternalValue('');
    }

    setAttachments([]);
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
    }));

    setAttachments((currentAttachments) => [...currentAttachments, ...nextAttachments]);
    onAttach?.(files, nextAttachments);
    event.target.value = '';
  };

  const removeAttachment = (attachmentId: MessagingAttachment['id']) => {
    setAttachments((currentAttachments) =>
      currentAttachments.filter((attachment) => attachment.id !== attachmentId)
    );
  };

  const appendEmoji = (emoji: string) => {
    updateValue(`${currentValue}${emoji}`);
    setEmojiOpen(false);
    onEmoji?.(emoji);
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
        <input
          type="text"
          value={currentValue}
          placeholder={placeholder}
          disabled={disabled}
          className="h-10 min-w-0 flex-1 rounded-md border border-[#d8d2ca] bg-white px-3 text-sm text-[#172033] outline-none transition placeholder:text-[#5f6770] focus:border-[#1256a6] focus:ring-2 focus:ring-[#1256a6]/20 disabled:cursor-not-allowed disabled:bg-[#f5f3f0]"
          onChange={handleChange}
        />
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
            <div className="absolute bottom-[calc(100%+8px)] left-0 z-20 grid grid-cols-4 gap-1 rounded-md border border-[#d8d2ca] bg-white p-2 shadow-lg">
              {systemEmojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  aria-label={`Ajouter ${emoji}`}
                  className="flex size-8 items-center justify-center rounded-md text-lg transition hover:bg-[#f5f3f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/30"
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
