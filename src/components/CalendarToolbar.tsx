import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { ViewSwitcher } from './ViewSwitcher';
import { defaultViewOptions } from './calendar/constants';
import { joinClasses } from './calendar/style';
import type { CalendarToolbarProps } from './calendar/types';

export type { CalendarToolbarProps } from './calendar/types';

export const CalendarToolbar = ({
  title,
  view,
  viewOptions = defaultViewOptions,
  onViewChange,
  onPrevious,
  onNext,
  previousLabel = 'Période précédente',
  nextLabel = 'Période suivante',
  className = '',
  ...props
}: CalendarToolbarProps) => (
  <div
    className={joinClasses('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}
    {...props}
  >
    <div className="flex min-w-0 items-center gap-4">
      <button
        type="button"
        aria-label={previousLabel}
        className="inline-flex h-8 w-9 items-center justify-center rounded-md border border-[#d8d2ca] bg-[#fbfaf9] text-[#172033] transition-colors hover:bg-[#f3f0ec] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/30"
        onClick={onPrevious}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <h2 className="min-w-0 text-xl font-bold leading-7 text-[#172033]">{title}</h2>
      <button
        type="button"
        aria-label={nextLabel}
        className="inline-flex h-8 w-9 items-center justify-center rounded-md border border-[#d8d2ca] bg-[#fbfaf9] text-[#172033] transition-colors hover:bg-[#f3f0ec] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/30"
        onClick={onNext}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>

    <ViewSwitcher options={viewOptions} value={view} onChange={onViewChange} />
  </div>
);
