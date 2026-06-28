import React from 'react';
import { Check, ChevronDown } from 'lucide-react';

import { joinClasses } from './calendar/style';

export interface AdministrationSelectOption {
  value: string;
  label: string;
}

export interface AdministrationSelectProps {
  options: AdministrationSelectOption[];
  value: string;
  onValueChange?: (value: string) => void;
  ariaLabel?: string;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
}

export const AdministrationSelect = ({
  options,
  value,
  onValueChange,
  ariaLabel = 'Sélectionner une option',
  className = '',
  triggerClassName = '',
  menuClassName = '',
  disabled = false,
}: AdministrationSelectProps) => {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  React.useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleOptionClick = (optionValue: string) => {
    onValueChange?.(optionValue);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={joinClasses('relative inline-block w-full min-w-0', className)}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        className={joinClasses(
          'flex h-9 w-full items-center justify-between gap-3 rounded-md border border-[#d8d2ca] bg-white px-3 text-sm font-normal leading-5 text-[#172033] outline-none transition hover:bg-[#fbfaf9] focus-visible:border-[#1256a6] focus-visible:ring-2 focus-visible:ring-[#1256a6]/25 disabled:cursor-not-allowed disabled:opacity-60',
          triggerClassName
        )}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
      >
        <span className="min-w-0 truncate">{selectedOption?.label}</span>
        <ChevronDown className="size-4 shrink-0 text-[#8b8d91]" strokeWidth={1.8} />
      </button>

      {open && (
        <div
          role="listbox"
          className={joinClasses(
            'absolute left-0 z-50 mt-1 w-full min-w-[180px] overflow-hidden rounded-md border border-[#d8d2ca] bg-white p-1 text-[#172033] shadow-[0_4px_12px_rgba(0,0,0,0.16)]',
            menuClassName
          )}
        >
          {options.map((option) => {
            const isSelected = option.value === selectedOption?.value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={joinClasses(
                  'flex h-8 w-full items-center justify-between gap-3 rounded-sm px-2 text-left text-sm leading-5 transition hover:bg-[#eef3f2]',
                  isSelected && 'bg-[#d8eeee] text-[#2d6d69]'
                )}
                onClick={() => handleOptionClick(option.value)}
              >
                <span className="min-w-0 truncate">{option.label}</span>
                {isSelected && <Check className="size-4 shrink-0" strokeWidth={1.8} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
