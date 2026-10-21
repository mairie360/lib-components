'use client';

import React from 'react';

import type { Size } from '@mairie360/lib-components/theme';

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'type'> {
  label: React.ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  hint?: React.ReactNode;
  size?: Size;
  /** Native form name: a hidden input carries the value for plain form posts and react-hook-form. */
  name?: string;
}

const trackHeight: Record<Size, number> = { xs: 16, s: 20, m: 24, l: 28, xl: 32 };

/** Toggle applied immediately (MAIR-608, Figma `Base/Switch`): a `role=switch` button, keyboard and form friendly. */
export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { label, checked, defaultChecked = false, onChange, hint, size = 'm', name, disabled, id, className = '', style, onClick, ...props },
  ref,
) {
  const generated = React.useId();
  const switchId = id ?? `switch-${generated}`;
  const [internal, setInternal] = React.useState(defaultChecked);
  const on = checked ?? internal;
  const height = trackHeight[size];
  const toggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || disabled) return;
    if (checked === undefined) setInternal(!on);
    onChange?.(!on);
  };
  return (
    <div className={`flex flex-col ${disabled ? 'opacity-60' : ''} ${className}`.trim()} style={{ gap: 'var(--mairie-space-xs)', ...style }} data-size={size}>
      <div className="inline-flex items-center" style={{ gap: 'var(--mairie-space-s)' }}>
        <button
          {...props}
          ref={ref}
          id={switchId}
          type="button"
          role="switch"
          aria-checked={on}
          aria-describedby={hint ? `${switchId}-hint` : undefined}
          disabled={disabled}
          onClick={toggle}
          className={`relative inline-flex shrink-0 items-center rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-accent)] disabled:cursor-not-allowed ${on ? 'bg-[var(--mairie-action-background)]' : 'bg-[var(--mairie-control-border)]'}`}
          style={{ width: height * 1.8, height, padding: 2 }}
        >
          <span aria-hidden="true" className="block rounded-full bg-[var(--mairie-surface)] shadow transition-transform" style={{ width: height - 4, height: height - 4, transform: on ? `translateX(${height * 0.8}px)` : 'translateX(0)' }} />
        </button>
        {name ? <input type="hidden" name={name} value={on ? 'true' : 'false'} /> : null}
        <label htmlFor={switchId} className="cursor-pointer text-[var(--mairie-text)]" style={{ fontSize: `var(--mairie-text-${size})` }}>{label}</label>
      </div>
      {hint ? <p id={`${switchId}-hint`} className="text-[var(--mairie-muted)]" style={{ fontSize: 'var(--mairie-text-s)' }}>{hint}</p> : null}
    </div>
  );
});
