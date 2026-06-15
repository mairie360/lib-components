import React, { useMemo } from 'react';

import { CalendarCell } from './CalendarCell';
import { defaultDayLabels, defaultHours } from './calendar/constants';
import {
  dateKey,
  formatFullDate,
  getWeekDates,
  isSameDay,
  parseDateInput,
  timeToMinutes,
} from './calendar/date';
import { EventPill } from './calendar/EventPill';
import { calendarHourHeight, getPositionedEventsForDate } from './calendar/layout';
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
  onEventClick,
  className = '',
  ...props
}: WeekGridProps) => {
  const parsedDate = parseDateInput(currentDate);
  const selected = selectedDate ? parseDateInput(selectedDate) : parsedDate;
  const weekDates = useMemo(() => getWeekDates(parsedDate, weekStartsOn), [parsedDate, weekStartsOn]);
  const visibleStartMinutes = timeToMinutes(hours[0] || '00:00');
  const visibleEndMinutes = timeToMinutes(hours[hours.length - 1] || '23:00') + 60;
  const timelineHeight = hours.length * calendarHourHeight;

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

      <div className="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] gap-1">
        <div className="relative" style={{ height: timelineHeight }}>
          {hours.map((hour, index) => (
            <div
              key={hour}
              className="absolute right-1 text-right text-xs leading-5 text-[#6c7278]"
              style={{ top: index * calendarHourHeight + 6 }}
            >
              {hour}
            </div>
          ))}
        </div>

        {weekDates.map((date) => {
          const positionedEvents = getPositionedEventsForDate(events, date, visibleStartMinutes, visibleEndMinutes);

          return (
            <div key={dateKey(date)} className="relative" style={{ height: timelineHeight }}>
              {hours.map((hour, index) => (
                <button
                  key={`${dateKey(date)}-${hour}`}
                  type="button"
                  aria-label={`${formatFullDate(date)} à ${hour}`}
                  className="absolute left-0 right-0 rounded-md border border-[#d8d2ca] bg-white transition-colors hover:border-[#b9d6d5] hover:bg-[#fbfaf9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/30"
                  style={{ top: index * calendarHourHeight, height: calendarHourHeight - 4 }}
                  onClick={() => onSelectSlot?.(date, hour)}
                />
              ))}

              {positionedEvents.map(({ event, range, lane, laneCount }) => {
                const width = 100 / laneCount;
                const top = (range.offsetMinutes / 60) * calendarHourHeight;
                const height = Math.max(32, (range.durationMinutes / 60) * calendarHourHeight - 4);

                return (
                  <EventPill
                    key={`${event.id}-${dateKey(date)}-${range.startMinutes}-${lane}`}
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
          );
        })}
      </div>
    </div>
  );
};
