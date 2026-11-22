'use client';

import React from 'react';
import { X, type LucideIcon } from 'lucide-react';

import type { Size } from '@mairie360/lib-components/theme';
import { controlClass, controlStyle } from '../../../Field';
import { Icon } from '../../../Icon';
import { IconButton } from '../../../IconButton';

export type DateDisplay = 'auto' | 'long' | 'short';

export interface DateTriggerProps {
  id: string;
  icon: LucideIcon;
  /** Accessible name: the label and the value (« Date de début, jeudi 3 décembre 2026 »). */
  name: string;
  /** Full text of the value; empty shows the placeholder. */
  longText: string;
  /** Short text for a narrow field. */
  shortText: string;
  placeholder: string;
  /** `auto`: full text, short form when the field is narrower than 15rem (container query). */
  display: DateDisplay;
  open: boolean;
  /** Id of the popover the trigger opens. */
  controls: string;
  disabled: boolean;
  invalid: boolean;
  required: boolean;
  describedBy?: string;
  size: Size;
  /** Name of the clear button; no button without a value. */
  clearLabel: string;
  onToggle: () => void;
  onOpen: () => void;
  onClear: () => void;
  triggerRef: React.Ref<HTMLButtonElement>;
}

/**
 * Field-like button of DatePicker and DateRangePicker (MAIR-1099): calendar icon, the value in words and a
 * clear button. ↓ (or Alt+↓) opens the popover like a native date input.
 */
export function DateTrigger({ id, icon, name, longText, shortText, placeholder, display, open, controls, disabled, invalid, required, describedBy, size, clearLabel, onToggle, onOpen, onClear, triggerRef }: DateTriggerProps) {
  const empty = !longText;
  const longClass = display === 'auto' ? 'hidden @[15rem]:inline' : display === 'long' ? 'inline' : 'hidden';
  const shortClass = display === 'auto' ? 'inline @[15rem]:hidden' : display === 'short' ? 'inline' : 'hidden';
  return (
    <div className="@container relative">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-label={name}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? controls : undefined}
        data-invalid={invalid ? 'true' : undefined}
        data-required={required ? 'true' : undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        onClick={onToggle}
        onKeyDown={event => { if (event.key === 'ArrowDown' && !open) { event.preventDefault(); onOpen(); } }}
        data-open={open ? 'true' : undefined}
        className={`${controlClass(invalid)} flex cursor-pointer items-center gap-2 text-left disabled:cursor-not-allowed ${open ? 'border-[var(--mairie-accent)] ring-2 ring-[var(--mairie-accent)]/20' : ''}`.trim()}
        style={{ ...controlStyle(size), paddingRight: empty || disabled ? undefined : `calc(var(--mairie-control-${size}) - 4px)` }}
      >
        <Icon icon={icon} size={size === 'xs' ? 'xs' : 's'} className="text-[var(--mairie-muted)]" />
        {empty ? (
          <span className="min-w-0 flex-1 truncate text-[var(--mairie-muted)]">{placeholder}</span>
        ) : (
          <span className="min-w-0 flex-1 truncate" data-value-text="true">
            <span className={longClass} data-format="long">{longText}</span>
            <span className={shortClass} data-format="short">{shortText}</span>
          </span>
        )}
      </button>
      {!empty && !disabled ? (
        <IconButton icon={X} label={clearLabel} size={size === 'xl' || size === 'l' ? 'm' : 's'} onClick={onClear} className="absolute right-1 top-1/2 -translate-y-1/2" />
      ) : null}
    </div>
  );
}
