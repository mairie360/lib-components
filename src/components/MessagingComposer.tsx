import React from 'react';
import { Paperclip, Send, Smile } from 'lucide-react';

import { joinClasses } from './calendar/style';

export interface MessagingComposerProps extends React.HTMLAttributes<HTMLFormElement> {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  sendLabel?: string;
  attachLabel?: string;
  emojiLabel?: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  onSendMessage?: (message: string) => void;
  onAttach?: () => void;
  onEmoji?: () => void;
}

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
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const currentValue = value ?? internalValue;
  const canSend = currentValue.trim().length > 0 && !disabled;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;

    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onValueChange?.(nextValue);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextMessage = currentValue.trim();
    if (!nextMessage || disabled) return;

    onSendMessage?.(nextMessage);

    if (value === undefined) {
      setInternalValue('');
    }

    onValueChange?.('');
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
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          aria-label={attachLabel}
          title={attachLabel}
          className="inline-flex size-8 items-center justify-center rounded-md text-[#2f3747] transition hover:bg-[#f5f3f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/30"
          onClick={onAttach}
        >
          <Paperclip className="size-4" strokeWidth={1.8} />
        </button>
        <button
          type="button"
          aria-label={emojiLabel}
          title={emojiLabel}
          className="inline-flex size-8 items-center justify-center rounded-md text-[#2f3747] transition hover:bg-[#f5f3f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/30"
          onClick={onEmoji}
        >
          <Smile className="size-4" strokeWidth={1.8} />
        </button>
      </div>
    </form>
  );
};
