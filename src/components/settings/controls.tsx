import React from 'react';

import type { SettingsOption } from './types';

export const settingsFieldClassName =
  'h-9 w-full rounded-md border border-[#d8d2ca] bg-white px-3 text-sm text-[#172033] outline-none transition focus:border-[#1256a6] focus:ring-2 focus:ring-[#1256a6]/20';

export const SettingsSection = ({
  title,
  children,
  className = '',
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <section className={`rounded-lg border border-[#d8d2ca] bg-white px-6 py-6 ${className}`}>
    <h2 className="text-base font-bold leading-6 text-[#172033]">{title}</h2>
    <div className="mt-6">{children}</div>
  </section>
);

export const SettingsToggle = ({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <div className="flex items-start justify-between gap-5 py-2">
    <div className="min-w-0">
      <div className="text-sm font-semibold leading-5 text-[#172033]">{label}</div>
      {description && <div className="text-sm leading-5 text-[#667085]">{description}</div>}
    </div>
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      className={`mt-0.5 inline-flex h-[18px] w-8 shrink-0 items-center rounded-full p-[2px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/35 ${
        checked ? 'bg-[#1256a6]' : 'bg-[#d8d4ce]'
      }`}
      onClick={() => onChange(!checked)}
    >
      <span
        className={`size-3.5 rounded-full bg-white shadow-sm transition ${
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
}: {
  id: string;
  label: string;
  value: string;
  options: SettingsOption[];
  onChange: (value: string) => void;
}) => (
  <label htmlFor={id} className="block text-sm font-semibold leading-5 text-[#172033]">
    {label}
    <select
      id={id}
      className={`${settingsFieldClassName} mt-1 font-normal`}
      value={value}
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

