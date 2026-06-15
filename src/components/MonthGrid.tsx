import React, { useMemo } from 'react';

import { CalendarCell } from './CalendarCell';
import { defaultDayLabels } from './calendar/constants';
import {
  addDays,
  dateKey,
  eventOccursOnDate,
  formatFullDate,
  getDayDiff,
  getEventOccurrenceStartDate,
  getMonthCells,
  isSameDay,
  parseDateInput,
} from './calendar/date';
import { EventPill } from './calendar/EventPill';
import { joinClasses } from './calendar/style';
import type { CalendarEvent, MonthGridProps } from './calendar/types';

export type { CalendarDateInput, CalendarEvent, MonthGridProps } from './calendar/types';

const getEventsForDate = (events: CalendarEvent[], date: Date) =>
  events
    .filter((event) => eventOccursOnDate(event, date))
    .sort((firstEvent, secondEvent) => {
      const firstTime = firstEvent.startTime || '00:00';
      const secondTime = secondEvent.startTime || '00:00';
      const timeDiff = firstTime.localeCompare(secondTime);

      if (timeDiff !== 0) return timeDiff;

      return String(firstEvent.id).localeCompare(String(secondEvent.id));
    });

const getEventSegmentClassName = (event: CalendarEvent, date: Date) => {
  const occurrenceStartDate = getEventOccurrenceStartDate(event, date);
  if (!occurrenceStartDate) return '';

  const spanInDays = Math.max(0, getDayDiff(event.endDate || event.date, event.date));
  const occurrenceEndDate = addDays(occurrenceStartDate, spanInDays);
  const isStart = isSameDay(date, occurrenceStartDate);
  const isEnd = isSameDay(date, occurrenceEndDate);

  if (isStart && isEnd) return '';

  return joinClasses(
    'shadow-sm',
    !isStart && 'rounded-l-sm border-l-4 border-l-[#2563eb]',
    !isEnd && 'rounded-r-sm border-r-4 border-r-[#2563eb]'
  );
};

export const MonthGrid = ({
  currentDate,
  selectedDate,
  events = [],
  weekStartsOn = 1,
  dayLabels = defaultDayLabels,
  onSelectDate,
  onEventClick,
  className = '',
  ...props
}: MonthGridProps) => {
  const parsedDate = parseDateInput(currentDate);
  const selected = selectedDate ? parseDateInput(selectedDate) : parsedDate;
  const cells = useMemo(() => getMonthCells(parsedDate, weekStartsOn), [parsedDate, weekStartsOn]);

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
              className="min-h-28 align-top"
              onClick={() => onSelectDate?.(date)}
            >
              <span className="font-medium">{date.getDate()}</span>
              <div className="mt-2 space-y-1">
                {getEventsForDate(events, date).map((event) => (
                  <EventPill
                    key={event.id}
                    event={event}
                    onClick={onEventClick}
                    className={getEventSegmentClassName(event, date)}
                  />
                ))}
              </div>
            </CalendarCell>
          ) : (
            <div key={`empty-${index}`} aria-hidden="true" className="min-h-28 rounded-md border border-transparent" />
          )
        )}
      </div>
    </div>
  );
};
