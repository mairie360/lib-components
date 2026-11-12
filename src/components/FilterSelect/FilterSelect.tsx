'use client';

import React from 'react';
import { Check, ChevronDown, Filter } from 'lucide-react';

import type { Size } from '@mairie360/lib-components/theme';
import { Icon } from '../Icon';
import type { SelectOption } from '../SelectField';
import { componentMarker, withoutMarker } from '../component-marker';

export interface FilterSelectProps<T extends string = string> extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'value' | 'defaultValue' | 'onChange'> {
  /** Filter name shown before the value ("Statut"), also the accessible name. */
  label: string;
  options: readonly SelectOption<T>[];
  /** Empty string = no filter. */
  value: T | '';
  onChange: (value: T | '') => void;
  /** Label of the "no filter" entry. */
  allLabel?: string;
  size?: Extract<Size, 's' | 'm' | 'l'>;
  /**
   * MAIR-849: `native` (default) lays an invisible native select over the button (simple, best on
   * mobile); `menu` opens the Figma `Base/FilterSelect` State=Open menu: the filter name as group label
   * and one radio choice per option, the same on every browser.
   */
  mode?: 'native' | 'menu';
}

/** Compact filter of a list toolbar (MAIR-608, Figma `Base/FilterSelect`): active look while a value is chosen. */
export function FilterSelect<T extends string = string>({ mode = 'native', ...props }: FilterSelectProps<T>) {
  return mode === 'menu' ? <FilterMenu {...props} /> : <NativeFilter {...props} />;
}

const frameClass = (active: boolean, disabled: boolean | undefined, className: string) =>
  `relative inline-flex items-center rounded-[var(--mairie-radius-m)] border font-medium transition ${active ? 'border-[var(--mairie-accent)] bg-[var(--mairie-accent-surface)] text-[var(--mairie-accent)]' : 'border-[var(--mairie-control-border)] bg-[var(--mairie-surface)] text-[var(--mairie-text)]'} ${disabled ? 'opacity-60' : ''} ${className}`.replace(/\s+/g, ' ').trim();
const frameStyle = (size: Extract<Size, 's' | 'm' | 'l'>, style?: React.CSSProperties): React.CSSProperties => ({ height: `var(--mairie-control-${size})`, paddingInline: 'var(--mairie-space-s)', gap: 'var(--mairie-space-xs)', fontSize: `var(--mairie-text-${size})`, ...style });

/** Menu mode: a button (aria-haspopup) opening a menu of radio choices; arrows, Home / End, Escape. */
function FilterMenu<T extends string = string>({ label, options, value, onChange, allLabel = 'Tous', size = 'm', disabled, className = '', style, id, ...props }: Omit<FilterSelectProps<T>, 'mode'>) {
  const generated = React.useId();
  const base = id ?? `filter-${generated}`;
  const [open, setOpen] = React.useState(false);
  const button = React.useRef<HTMLButtonElement>(null);
  const menu = React.useRef<HTMLDivElement>(null);
  const choices: Array<{ value: T | ''; label: string; disabled?: boolean }> = [{ value: '', label: allLabel }, ...options];
  const active = value !== '';
  const current = options.find(option => option.value === value);
  const items = () => Array.from(menu.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]:not([aria-disabled="true"])') ?? []);
  const close = (restore = true) => { setOpen(false); if (restore) button.current?.focus(); };
  React.useEffect(() => {
    if (!open) return;
    (items().find(item => item.getAttribute('aria-checked') === 'true') ?? items()[0])?.focus();
    const outside = (event: MouseEvent) => { if (!menu.current?.contains(event.target as Node) && !button.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, [open]);
  const choose = (next: T | '') => { onChange(next); close(); };
  const onMenuKey = (event: React.KeyboardEvent) => {
    const list = items(); const index = list.indexOf(document.activeElement as HTMLElement);
    const go = (target: number) => { event.preventDefault(); list[(target + list.length) % list.length]?.focus(); };
    if (event.key === 'ArrowDown') go(index + 1);
    else if (event.key === 'ArrowUp') go(index - 1);
    else if (event.key === 'Home') go(0);
    else if (event.key === 'End') go(list.length - 1);
    else if (event.key === 'Escape') { event.preventDefault(); close(); }
    else if (event.key === 'Tab') close(false);
  };
  return (
    <span {...componentMarker('FilterSelect', props)} className="relative inline-flex" data-mode="menu">
      <button {...(withoutMarker(props) as React.ButtonHTMLAttributes<HTMLButtonElement>)} ref={button} id={base} type="button" disabled={disabled}
        aria-haspopup="menu" aria-expanded={open} aria-controls={open ? `${base}-menu` : undefined}
        aria-label={`${label}${current ? ` : ${current.label}` : ''}`}
        onClick={() => setOpen(value => !value)}
        onKeyDown={event => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setOpen(true); } }}
        className={`${frameClass(active, disabled, className)} cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-accent)] disabled:cursor-not-allowed`}
        style={frameStyle(size, style)} data-active={active || undefined} data-size={size}>
        <Icon icon={Filter} size={size === 'l' ? 'm' : 's'} />
        <span className="whitespace-nowrap">{label}{current ? ` : ${current.label}` : ''}</span>
        <Icon icon={ChevronDown} size={size === 'l' ? 'm' : 's'} />
      </button>
      {open && (
        <div ref={menu} id={`${base}-menu`} role="menu" aria-labelledby={`${base}-label`} onKeyDown={onMenuKey}
          className="absolute left-0 top-[calc(100%+4px)] z-50 min-w-[12rem] overflow-hidden rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] p-1 text-[var(--mairie-text)] shadow-md" style={{ fontSize: 'var(--mairie-text-s)' }}>
          <div id={`${base}-label`} role="presentation" className="px-2 py-1.5 font-semibold text-[var(--mairie-muted)]" style={{ fontSize: 'var(--mairie-text-xs)' }}>{label}</div>
          <div role="group" aria-labelledby={`${base}-label`}>
            {choices.map(choice => {
              const checked = choice.value === value;
              return (
                <div key={choice.value || '__all'} role="menuitemradio" aria-checked={checked} aria-disabled={choice.disabled || undefined} tabIndex={-1}
                  onClick={() => { if (!choice.disabled) choose(choice.value); }}
                  onKeyDown={event => { if ((event.key === 'Enter' || event.key === ' ') && !choice.disabled) { event.preventDefault(); choose(choice.value); } }}
                  className={`relative flex cursor-pointer items-center gap-2 rounded-sm py-1.5 pl-8 pr-2 outline-none focus-visible:bg-[var(--mairie-surface-raised)] focus-visible:outline-2 focus-visible:outline-[var(--mairie-accent)] ${checked ? 'bg-[var(--mairie-accent-surface)] font-medium text-[var(--mairie-accent)]' : 'hover:bg-[var(--mairie-surface-raised)]'} ${choice.disabled ? 'pointer-events-none opacity-50' : ''}`}>
                  {checked ? <Icon icon={Check} size="s" className="absolute left-2" /> : null}
                  {choice.label}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </span>
  );
}

/** Native mode: an invisible native select laid over the button. */
function NativeFilter<T extends string = string>({ label, options, value, onChange, allLabel = 'Tous', size = 'm', disabled, className = '', style, ...props }: Omit<FilterSelectProps<T>, 'mode'>) {
  const active = value !== '';
  const current = options.find((option) => option.value === value);
  return (
    <span {...componentMarker('FilterSelect', props)} className={`relative inline-flex items-center rounded-[var(--mairie-radius-m)] border font-medium transition focus-within:ring-2 focus-within:ring-[var(--mairie-accent)]/20 ${active ? 'border-[var(--mairie-accent)] bg-[var(--mairie-accent-surface)] text-[var(--mairie-accent)]' : 'border-[var(--mairie-control-border)] bg-[var(--mairie-surface)] text-[var(--mairie-text)]'} ${disabled ? 'opacity-60' : ''} ${className}`.replace(/\s+/g, ' ').trim()} style={{ height: `var(--mairie-control-${size})`, paddingInline: 'var(--mairie-space-s)', gap: 'var(--mairie-space-xs)', fontSize: `var(--mairie-text-${size})`, ...style }} data-active={active || undefined} data-size={size}>
      <Icon icon={Filter} size={size === 'l' ? 'm' : 's'} />
      <span aria-hidden="true" className="whitespace-nowrap">{label}{current ? ` : ${current.label}` : ''}</span>
      <Icon icon={ChevronDown} size={size === 'l' ? 'm' : 's'} />
      <select {...withoutMarker(props)} aria-label={label} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value as T | '')} className="absolute inset-0 h-full w-full cursor-pointer opacity-0">
        <option value="">{allLabel}</option>
        {options.map((option) => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}
      </select>
    </span>
  );
}
