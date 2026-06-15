import React from 'react';

import { joinClasses } from './calendar/style';
import type { ViewSwitcherProps } from './calendar/types';

export type { ViewSwitcherOption, ViewSwitcherProps } from './calendar/types';

export const ViewSwitcher = <T extends string>({
  options,
  value,
  onChange,
  className = '',
  'aria-label': ariaLabel = 'Changer de vue',
}: ViewSwitcherProps<T>) => (
  <div
    role="tablist"
    aria-label={ariaLabel}
    className={joinClasses('inline-flex rounded-lg bg-[#e4e0dc] p-1 text-sm font-medium text-[#172033]', className)}
  >
    {options.map((option) => {
      const selected = option.value === value;

      return (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={selected}
          className={joinClasses(
            'h-7 rounded-md px-4 leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/30',
            selected ? 'bg-white shadow-sm' : 'hover:bg-white/55'
          )}
          onClick={() => onChange?.(option.value)}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);
