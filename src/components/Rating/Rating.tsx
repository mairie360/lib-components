'use client';

import React from 'react';
import { Star } from 'lucide-react';

import { componentMarker } from '../component-marker';

export type RatingSize = 's' | 'm' | 'l';
export interface RatingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Accessible name of the rating (e.g. « Note de la formation »). */
  label: string;
  /** Current mark, 0 to `max`; decimals are shown in the display variant (« 4,8 »). */
  value?: number;
  max?: number;
  /** Makes the rating an input: five stars in a radiogroup. Without it the rating is read only. */
  onChange?: (value: number) => void;
  readOnly?: boolean;
  disabled?: boolean;
  size?: RatingSize;
  /** Display variant: shows the value next to the star (default true). */
  showValue?: boolean;
  /** Form name of the radios (input variant). */
  name?: string;
}

const formatMark = (value: number) => value.toLocaleString('fr-FR', { maximumFractionDigits: 1 });
const starName = (value: number, max: number) => `${value} étoile${value > 1 ? 's' : ''} sur ${max}`;
const textSize: Record<RatingSize, string> = { s: 's', m: 'm', l: 'l' };

/** A star of the rating: filled with --mairie-rating-active, or --mairie-rating-inactive. */
const StarGlyph = ({ on, size }: { on: boolean; size: RatingSize }) => (
  <Star aria-hidden="true" focusable="false" className="shrink-0" strokeWidth={1.5}
    style={{ width: `var(--mairie-icon-${size})`, height: `var(--mairie-icon-${size})`, color: on ? 'var(--mairie-rating-active)' : 'var(--mairie-rating-inactive)', fill: 'currentColor' }} />
);

/**
 * Star rating (MAIR-841, Figma `Base/Rating`). Display: one star and the mark, for tiles and sheets.
 * Input (with `onChange`): a labelled radiogroup of `max` stars, arrow keys, visible focus.
 */
export const Rating = React.forwardRef<HTMLDivElement, RatingProps>(function Rating(
  { label, value = 0, max = 5, onChange, readOnly, disabled = false, size = 'm', showValue = true, name, className = '', style, ...props },
  ref,
) {
  const generated = React.useId();
  const groupName = name ?? `rating-${generated}`;
  const [hovered, setHovered] = React.useState<number | null>(null);
  const interactive = Boolean(onChange) && !readOnly;

  if (!interactive) {
    return (
      <div {...props} {...componentMarker('Rating', props)} ref={ref} role="img" aria-label={`${label} : ${formatMark(value)} sur ${max}`} data-variant="display" data-size={size}
        className={`inline-flex items-center font-semibold text-[var(--mairie-text)] ${className}`.trim()} style={{ gap: 'var(--mairie-space-xs)', fontSize: `var(--mairie-text-${textSize[size]})`, ...style }}>
        <StarGlyph on={value > 0} size={size} />
        {showValue ? <span aria-hidden="true">{formatMark(value)}</span> : null}
      </div>
    );
  }

  const shown = hovered ?? Math.round(value);
  return (
    <div {...props} {...componentMarker('Rating', props)} ref={ref} role="radiogroup" aria-label={label} aria-disabled={disabled || undefined} data-variant="input" data-size={size}
      className={`inline-flex items-center ${disabled ? 'opacity-50' : ''} ${className}`.trim()} style={{ gap: 2, ...style }} onMouseLeave={() => setHovered(null)}>
      {Array.from({ length: max }, (_, index) => {
        const mark = index + 1;
        const id = `${groupName}-${mark}`;
        return (
          <span key={mark} className="relative inline-flex">
            <input id={id} type="radio" name={groupName} value={mark} checked={Math.round(value) === mark} disabled={disabled}
              onChange={() => onChange?.(mark)} aria-label={starName(mark, max)} className="peer absolute inset-0 m-0 cursor-pointer opacity-0 disabled:cursor-not-allowed" />
            <label htmlFor={id} onMouseEnter={() => !disabled && setHovered(mark)}
              className="inline-flex cursor-pointer rounded-[var(--mairie-radius-s)] p-0.5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-1 peer-focus-visible:outline-[var(--mairie-accent)] peer-disabled:cursor-not-allowed">
              <StarGlyph on={mark <= shown} size={size} />
            </label>
          </span>
        );
      })}
    </div>
  );
});
