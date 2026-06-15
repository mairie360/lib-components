import React, { useMemo } from 'react';

import { CalendarCell } from './CalendarCell';
import { defaultDayLabels, defaultHours } from './calendar/constants';
import {
  dateKey,
  formatFullDate,
  getEventsForSlot,
  getWeekDates,
  isSameDay,
  parseDateInput,
} from './calendar/date';
import { EventPill } from './calendar/EventPill';
import { joinClasses } from './calendar/style';
import type { WeekGridProps } from './calendar/types';

export type { CalendarDateInput, CalendarEvent, WeekGridProps } from './calendar/types';

export const WeekGrid = ({
  currentDate,
  selectedDate,
  events = [],
  hours = defaultHours,
  weekStartsOn = 1,
  dayLabels = defaultDayLabels,
  onSelectDate,
  onSelectSlot,
  className = '',
  ...props
}: WeekGridProps) => {
  const parsedDate = parseDateInput(currentDate);
  const selected = selectedDate ? parseDateInput(selectedDate) : parsedDate;
  const weekDates = useMemo(() => getWeekDates(parsedDate, weekStartsOn), [parsedDate, weekStartsOn]);

  return (
    <div className={joinClasses('min-w-[780px] space-y-2', className)} {...props}>
      <div className="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] gap-1">
        <div aria-hidden="true" />
        {weekDates.map((date, index) => (
          <CalendarCell
            key={dateKey(date)}
            aria-label={`Sélectionner le ${formatFullDate(date)}`}
            selected={isSameDay(date, selected)}
            className="flex h-14 min-h-0 flex-col items-center justify-center text-center"
            onClick={() => onSelectDate?.(date)}
          >
            <span className="text-xs font-medium text-[#6c7278]">{dayLabels[index]}</span>
            <span className="text-sm font-bold">{date.getDate()}</span>
          </CalendarCell>
        ))}
      </div>

      <div className="space-y-1">
        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] gap-1">
            <div className="pt-2 text-right text-xs leading-5 text-[#6c7278]">{hour}</div>
            {weekDates.map((date) => {
              const slotEvents = getEventsForSlot(events, date, hour);

              return (
                <CalendarCell
                  key={`${dateKey(date)}-${hour}`}
                  aria-label={`${formatFullDate(date)} à ${hour}`}
                  className="h-[3.75rem] min-h-0"
                  onClick={() => onSelectSlot?.(date, hour)}
                >
                  <div className="space-y-1">
                    {slotEvents.slice(0, 1).map((event) => (
                      <EventPill key={event.id} event={event} />
                    ))}
                  </div>
                </CalendarCell>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
