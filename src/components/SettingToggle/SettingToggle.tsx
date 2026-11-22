'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';

import { IconChip, type IconChipColor, type IconChipTone } from '../IconChip';
import { Switch } from '../Switch';
import { Overline } from '../Text';
import { componentMarker } from '../component-marker';

export interface SettingToggleProps {
  label: React.ReactNode;
  /** What the setting changes, linked to the switch by aria-describedby. */
  description?: React.ReactNode;
  /** Saved value. */
  checked: boolean;
  /**
   * Saves the new value at once. While the promise runs the switch is locked (aria-busy); when it
   * rejects the switch goes back to its previous value and `onError` receives the error.
   */
  onChange: (checked: boolean) => void | Promise<void>;
  /** The front reports the failure, usually with `useToast().error`. */
  onError?: (error: unknown) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
  /** MAIR-1116: icon chip (IconChip m) left of the label. */
  icon?: LucideIcon;
  /** `neutral` (default) or `module` (notification types take their module colour). */
  iconTone?: IconChipTone;
  /** Module colour of a `module` chip. */
  iconColor?: IconChipColor;
}

/**
 * A setting applied immediately: switch, label and description on one line (MAIR-941, Figma `Base/SettingToggle`).
 * MAIR-1116: the whole row toggles the switch (one toggle per click, the label stays bound to the switch),
 * with a hover background; the row adds no tab stop and has no hover while disabled or saving.
 */
export function SettingToggle({ label, description, checked, onChange, onError, disabled = false, id, className = '', icon, iconTone = 'neutral', iconColor }: SettingToggleProps) {
  const control = React.useRef<HTMLButtonElement>(null);
  const [optimistic, setOptimistic] = React.useState<boolean | null>(null);
  const [saving, setSaving] = React.useState(false);
  const shown = optimistic ?? checked;
  const change = async (next: boolean) => {
    setOptimistic(next); setSaving(true);
    try { await onChange(next); }
    catch (error) { onError?.(error); }
    finally { setOptimistic(null); setSaving(false); }
  };
  const interactive = !disabled && !saving;
  // The switch and its label toggle by themselves (the label activates the switch): only a click
  // elsewhere on the row is forwarded, so one click never toggles twice.
  const onRowClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const target = event.target as Element;
    if (target.closest('button, label, a, input')) return;
    control.current?.click();
  };
  return (
    // The row is a pointer shortcut only: keyboard users reach the switch itself (no extra tab stop).
    <div
      {...componentMarker('SettingToggle')}
      data-interactive={interactive || undefined}
      onClick={onRowClick}
      className={`-mx-3 flex items-center px-3 py-3 transition-colors ${interactive ? 'cursor-pointer hover:bg-[var(--mairie-accent-surface)] active:brightness-95' : ''} ${saving ? 'cursor-progress' : ''} ${className}`.replace(/\s+/g, ' ').trim()}
      style={{ gap: 12, borderRadius: 'var(--mairie-radius-m)', transitionDuration: 'var(--mairie-motion-fast)' }}
    >
      {icon ? <IconChip icon={icon} tone={iconTone} color={iconColor} /> : null}
      <Switch
        ref={control}
        id={id}
        layout="row"
        label={label}
        hint={description}
        checked={shown}
        disabled={disabled}
        aria-busy={saving || undefined}
        data-saving={saving || undefined}
        // Locked while saving, without `disabled`: the switch keeps the keyboard focus.
        onClick={event => { if (saving) event.preventDefault(); }}
        onChange={next => { void change(next); }}
        className="min-w-0 flex-1"
      />
    </div>
  );
}

export interface SettingToggleGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Optional Overline title (« Types de notifications »), the accessible name of the group. */
  title?: React.ReactNode;
  children: React.ReactNode;
}

/** Settings of one kind under an optional title, separated by a hairline (MAIR-941, Figma `SettingToggleGroup`). */
export function SettingToggleGroup({ title, children, className = '', ...props }: SettingToggleGroupProps) {
  const titleId = React.useId();
  return (
    <div {...props} {...componentMarker('SettingToggleGroup', props)} role="group" aria-labelledby={title ? titleId : undefined} className={`flex flex-col ${className}`.trim()}>
      {title ? <Overline id={titleId} as="div" className="mb-1">{title}</Overline> : null}
      <div className="flex flex-col divide-y divide-[var(--mairie-border)]">{children}</div>
    </div>
  );
}
