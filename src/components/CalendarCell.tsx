import React from 'react';

import { joinClasses } from './calendar/style';
import type { CalendarCellProps } from './calendar/types';

export type { CalendarCellProps } from './calendar/types';

export const CalendarCell = ({
  selected = false,
  muted = false,
  children,
  className = '',
  type = 'button',
  ...props
}: CalendarCellProps) => (
  <button
    type={type}
    className={joinClasses(
      'min-h-16 w-full rounded-md border bg-white p-2 text-left text-sm leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/30',
      selected
        ? 'border-[#0f6fdc] bg-[#e8f2ff] text-[#0b4f99]'
        : 'border-[#d8d2ca] text-[#172033] hover:border-[#b9d6d5] hover:bg-[#fbfaf9]',
      muted && 'text-[#808891]',
      className
    )}
    {...props}
  >
    {children}
  </button>
);
