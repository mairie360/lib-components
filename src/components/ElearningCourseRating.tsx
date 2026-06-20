import React from 'react';
import { CircleCheck, Star } from 'lucide-react';

import { joinClasses } from './calendar/style';

export interface ElearningCourseRatingProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSubmit'> {
  initialValue?: number;
  max?: number;
  submitted?: boolean;
  disabled?: boolean;
  title?: string;
  helperText?: string;
  submitLabel?: string;
  submittedLabel?: string;
  onValueChange?: (rating: number) => void;
  onSubmit?: (rating: number) => void;
}

const clampRating = (value: number | undefined, max: number) => {
  if (value === undefined || Number.isNaN(value)) return undefined;

  return Math.min(max, Math.max(1, Math.round(value)));
};

export const ElearningCourseRating = ({
  initialValue,
  max = 5,
  submitted = false,
  disabled = false,
  title = 'Noter cette formation',
  helperText = 'Votre retour aide à améliorer les prochaines sessions.',
  submitLabel = 'Envoyer la note',
  submittedLabel = 'Merci, votre note a bien été enregistrée.',
  onValueChange,
  onSubmit,
  className = '',
  ...props
}: ElearningCourseRatingProps) => {
  const safeMax = Math.max(1, Math.floor(max));
  const [value, setValue] = React.useState(() => clampRating(initialValue, safeMax));
  const [hoveredValue, setHoveredValue] = React.useState<number | undefined>();
  const [hasSubmitted, setHasSubmitted] = React.useState(submitted);
  const displayValue = hoveredValue ?? value ?? 0;
  const isLocked = disabled || hasSubmitted;

  React.useEffect(() => {
    setValue(clampRating(initialValue, safeMax));
  }, [initialValue, safeMax]);

  React.useEffect(() => {
    setHasSubmitted(submitted);
  }, [submitted]);

  const handleSelect = (rating: number) => {
    if (isLocked) return;

    setValue(rating);
    onValueChange?.(rating);
  };

  const handleSubmit = () => {
    if (!value || isLocked) return;

    onSubmit?.(value);
    setHasSubmitted(true);
  };

  return (
    <section
      className={joinClasses('rounded-lg border border-[#d8d2ca] bg-white p-4 text-[#2f3747]', className)}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-bold leading-5 text-[#2f3747]">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-[#6f6f6f]">{hasSubmitted ? submittedLabel : helperText}</p>
        </div>
        {hasSubmitted && <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#00a651]" />}
      </div>

      <div
        className="mt-3 grid grid-cols-5 gap-1"
        onMouseLeave={() => setHoveredValue(undefined)}
        aria-label="Note de la formation"
      >
        {Array.from({ length: safeMax }, (_, index) => {
          const rating = index + 1;
          const selected = rating <= displayValue;

          return (
            <button
              key={rating}
              type="button"
              aria-label={`Donner la note ${rating} sur ${safeMax}`}
              aria-pressed={value === rating}
              disabled={isLocked}
              onClick={() => handleSelect(rating)}
              onMouseEnter={() => {
                if (!isLocked) setHoveredValue(rating);
              }}
              className="flex h-9 items-center justify-center rounded-md text-[#a5a199] transition hover:bg-[#fff7db] focus:outline-none focus:ring-2 focus:ring-[#f4b000]/40 disabled:cursor-default disabled:hover:bg-transparent"
            >
              <Star
                aria-hidden="true"
                className={joinClasses('size-5', selected ? 'fill-[#f4b000] text-[#f4b000]' : 'text-[#b7b2aa]')}
              />
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!value || isLocked}
        onClick={handleSubmit}
        className="mt-3 h-9 w-full rounded-md bg-[#1256a6] px-3 text-sm font-semibold text-white transition hover:bg-[#0f4b91] focus:outline-none focus:ring-2 focus:ring-[#1256a6]/30 disabled:cursor-not-allowed disabled:bg-[#b9c8d9]"
      >
        {hasSubmitted ? 'Note envoyée' : submitLabel}
      </button>
    </section>
  );
};
