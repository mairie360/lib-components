'use client';

import React from 'react';

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
}

/** A setting applied immediately: switch, label and description on one line (MAIR-941, Figma `Base/SettingToggle`). */
export function SettingToggle({ label, description, checked, onChange, onError, disabled = false, id, className = '' }: SettingToggleProps) {
  const [optimistic, setOptimistic] = React.useState<boolean | null>(null);
  const [saving, setSaving] = React.useState(false);
  const shown = optimistic ?? checked;
  const change = async (next: boolean) => {
    setOptimistic(next); setSaving(true);
    try { await onChange(next); }
    catch (error) { onError?.(error); }
    finally { setOptimistic(null); setSaving(false); }
  };
  return (
    <Switch
      {...componentMarker('SettingToggle')}
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
      className={`py-3 ${saving ? 'cursor-progress' : ''} ${className}`.trim()}
    />
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
