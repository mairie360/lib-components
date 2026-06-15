import React from 'react';

import { CalendarCell } from './CalendarCell';
import { defaultDayLabels, defaultHours } from './calendar/constants';
import { formatFullDate, formatMonthYear, getEventsForSlot, parseDateInput } from './calendar/date';
import { EventPill } from './calendar/EventPill';
import { joinClasses } from './calendar/style';
import type { DayScheduleProps } from './calendar/types';

export type { CalendarDateInput, CalendarEvent, DayScheduleProps } from './calendar/types';

export const DaySchedule = ({
  currentDate,
  events = [],
  hours = defaultHours,
  onSelectSlot,
  onEventClick,
  className = '',
  ...props
}: DayScheduleProps) => {
  const parsedDate = parseDateInput(currentDate);
  const weekDayLabel = defaultDayLabels[(parsedDate.getDay() + 6) % 7];

  return (
    <div className={joinClasses('space-y-4', className)} {...props}>
      <div className="rounded-md border border-[#d8d2ca] bg-white py-5 text-center text-[#172033]">
        <div className="text-sm leading-5 text-[#6c7278]">{weekDayLabel}</div>
        <div className="text-2xl font-bold leading-8">{parsedDate.getDate()}</div>
        <div className="text-sm leading-5 text-[#6c7278]">{formatMonthYear(parsedDate)}</div>
      </div>

      <div className="space-y-1">
        {hours.map((hour) => {
          const slotEvents = getEventsForSlot(events, parsedDate, hour);

          return (
            <div key={hour} className="grid grid-cols-[4rem_minmax(0,1fr)] gap-2">
              <div className="pt-2 text-right text-sm leading-5 text-[#6c7278]">{hour}</div>
              <CalendarCell
                aria-label={`${formatFullDate(parsedDate)} à ${hour}`}
                className="h-16 min-h-0"
                onClick={() => onSelectSlot?.(parsedDate, hour)}
              >
                <div className="space-y-1">
                  {slotEvents.map((event) => (
                    <EventPill key={event.id} event={event} onClick={onEventClick} />
                  ))}
                </div>
              </CalendarCell>
            </div>
          );
        })}
      </div>
    </div>
  );
};
