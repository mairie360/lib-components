import React from 'react';

import { defaultDayLabels, defaultHours } from './calendar/constants';
import {
  dateKey,
  formatFullDate,
  formatMonthYear,
  parseDateInput,
  timeToMinutes,
} from './calendar/date';
import { EventPill } from './calendar/EventPill';
import { calendarHourHeight, getPositionedEventsForDate } from './calendar/layout';
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
  const visibleStartMinutes = timeToMinutes(hours[0] || '00:00');
  const visibleEndMinutes = timeToMinutes(hours[hours.length - 1] || '23:00') + 60;
  const timelineHeight = hours.length * calendarHourHeight;
  const positionedEvents = getPositionedEventsForDate(events, parsedDate, visibleStartMinutes, visibleEndMinutes);

  return (
    <div className={joinClasses('space-y-4', className)} {...props}>
      <div className="rounded-md border border-[#d8d2ca] bg-white py-5 text-center text-[#172033]">
        <div className="text-sm leading-5 text-[#6c7278]">{weekDayLabel}</div>
        <div className="text-2xl font-bold leading-8">{parsedDate.getDate()}</div>
        <div className="text-sm leading-5 text-[#6c7278]">{formatMonthYear(parsedDate)}</div>
      </div>

      <div className="grid grid-cols-[4rem_minmax(0,1fr)] gap-2">
        <div className="relative" style={{ height: timelineHeight }}>
          {hours.map((hour, index) => (
            <div
              key={hour}
              className="absolute right-0 text-right text-sm leading-5 text-[#6c7278]"
              style={{ top: index * calendarHourHeight + 6 }}
            >
              {hour}
            </div>
          ))}
        </div>

        <div className="relative" style={{ height: timelineHeight }}>
          {hours.map((hour, index) => (
            <button
              key={`${dateKey(parsedDate)}-${hour}`}
              type="button"
              aria-label={`${formatFullDate(parsedDate)} à ${hour}`}
              className="absolute left-0 right-0 rounded-md border border-[#d8d2ca] bg-white transition-colors hover:border-[#b9d6d5] hover:bg-[#fbfaf9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/30"
              style={{ top: index * calendarHourHeight, height: calendarHourHeight - 4 }}
              onClick={() => onSelectSlot?.(parsedDate, hour)}
            />
          ))}

          {positionedEvents.map(({ event, range, lane, laneCount }) => {
            const width = 100 / laneCount;
            const top = (range.offsetMinutes / 60) * calendarHourHeight;
            const height = Math.max(36, (range.durationMinutes / 60) * calendarHourHeight - 4);

            return (
              <EventPill
                key={`${event.id}-${dateKey(parsedDate)}-${range.startMinutes}-${lane}`}
                event={event}
                onClick={onEventClick}
                className={joinClasses(
                  'absolute z-10 shadow-sm',
                  !range.isStart && 'rounded-l-sm border-l-4 border-l-[#2563eb]',
                  !range.isEnd && 'rounded-r-sm border-r-4 border-r-[#2563eb]'
                )}
                style={{
                  top,
                  height,
                  left: `calc(${lane * width}% + 2px)`,
                  width: `calc(${width}% - 4px)`,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
