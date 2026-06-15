import React, { useMemo } from 'react';

import { CalendarCell } from './CalendarCell';
import { defaultDayLabels } from './calendar/constants';
import { dateKey, eventsByDate, formatFullDate, getMonthCells, isSameDay, parseDateInput } from './calendar/date';
import { EventPill } from './calendar/EventPill';
import { joinClasses } from './calendar/style';
import type { MonthGridProps } from './calendar/types';

export type { CalendarDateInput, CalendarEvent, MonthGridProps } from './calendar/types';

export const MonthGrid = ({
  currentDate,
  selectedDate,
  events = [],
  weekStartsOn = 1,
  dayLabels = defaultDayLabels,
  onSelectDate,
  className = '',
  ...props
}: MonthGridProps) => {
  const parsedDate = parseDateInput(currentDate);
  const selected = selectedDate ? parseDateInput(selectedDate) : parsedDate;
  const cells = useMemo(() => getMonthCells(parsedDate, weekStartsOn), [parsedDate, weekStartsOn]);
  const groupedEvents = useMemo(() => eventsByDate(events), [events]);

  return (
    <div className={joinClasses('space-y-3', className)} {...props}>
      <div className="grid grid-cols-7 gap-1.5">
        {dayLabels.map((label) => (
          <div key={label} className="px-2 text-center text-sm font-medium leading-6 text-[#5f6770]">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((date, index) =>
          date ? (
            <CalendarCell
              key={dateKey(date)}
              aria-label={`Sélectionner le ${formatFullDate(date)}`}
              selected={isSameDay(date, selected)}
              className="h-24 align-top"
              onClick={() => onSelectDate?.(date)}
            >
              <span className="font-medium">{date.getDate()}</span>
              <div className="mt-2 space-y-1">
                {(groupedEvents[dateKey(date)] || []).slice(0, 2).map((event) => (
                  <EventPill key={event.id} event={event} />
                ))}
              </div>
            </CalendarCell>
          ) : (
            <div key={`empty-${index}`} aria-hidden="true" className="h-24 rounded-md border border-transparent" />
          )
        )}
      </div>
    </div>
  );
};
