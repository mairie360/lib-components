import React from 'react';

import type { SettingsOption } from './types';

export const settingsFieldClassName =
  'h-9 w-full rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-3 text-sm text-[var(--mairie-text)] outline-none transition focus:border-[var(--mairie-accent)] focus:ring-2 focus:ring-[var(--mairie-accent)]/20';

export const SettingsSection = ({
  title,
  children,
  className = '',
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <section className={`rounded-lg border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-6 py-6 ${className}`}>
    <h2 className="text-base font-bold leading-6 text-[var(--mairie-text)]">{title}</h2>
    <div className="mt-6">{children}</div>
  </section>
);

export const SettingsToggle = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) => (
  <div className="flex items-start justify-between gap-5 py-2">
    <div className="min-w-0">
      <div className="text-sm font-semibold leading-5 text-[var(--mairie-text)]">{label}</div>
      {description && <div className="text-sm leading-5 text-[var(--mairie-muted)]">{description}</div>}
    </div>
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      disabled={disabled}
      className={`mt-0.5 inline-flex h-[18px] w-8 shrink-0 items-center rounded-full p-[2px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/35 disabled:cursor-default disabled:opacity-60 ${
        checked ? 'bg-[var(--mairie-action-background)]' : 'bg-[var(--mairie-surface-raised)]'
      }`}
      onClick={() => onChange(!checked)}
    >
      <span
        className={`size-3.5 rounded-full bg-[var(--mairie-surface)] shadow-sm transition ${
          checked ? 'translate-x-3.5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

export const SettingsSelect = ({
  id,
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  id: string;
  label: string;
  value: string;
  options: SettingsOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) => (
  <label htmlFor={id} className="block text-sm font-semibold leading-5 text-[var(--mairie-text)]">
    {label}
    <select
      id={id}
      className={`${settingsFieldClassName} mt-1 font-normal`}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);
