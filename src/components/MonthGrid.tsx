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

const dayCellMinHeight = 112;
const dayHeaderHeight = 44;
const eventRowHeight = 28;

interface MonthEventSegment {
  event: CalendarEvent;
  startColumn: number;
  endColumn: number;
  startsInView: boolean;
  endsInView: boolean;
}

interface PositionedMonthEventSegment extends MonthEventSegment {
  lane: number;
}

const getWeeks = (cells: Array<Date | null>) =>
  Array.from({ length: Math.ceil(cells.length / 7) }, (_, index) => cells.slice(index * 7, index * 7 + 7));

const sortMonthSegments = (segments: MonthEventSegment[]) =>
  [...segments].sort((firstSegment, secondSegment) => {
    const firstTime = firstSegment.event.startTime || '00:00';
    const secondTime = secondSegment.event.startTime || '00:00';
    const timeDiff = firstTime.localeCompare(secondTime);

    if (timeDiff !== 0) return timeDiff;

    const startDiff = firstSegment.startColumn - secondSegment.startColumn;
    if (startDiff !== 0) return startDiff;

    const firstSpan = firstSegment.endColumn - firstSegment.startColumn;
    const secondSpan = secondSegment.endColumn - secondSegment.startColumn;
    const spanDiff = secondSpan - firstSpan;

    if (spanDiff !== 0) return spanDiff;

    return String(firstSegment.event.id).localeCompare(String(secondSegment.event.id));
  });

const positionMonthSegments = (segments: MonthEventSegment[]): PositionedMonthEventSegment[] => {
  const laneEndColumns: number[] = [];

  return sortMonthSegments(segments).map((segment) => {
    const lane = laneEndColumns.findIndex((endColumn) => endColumn <= segment.startColumn);
    const resolvedLane = lane === -1 ? laneEndColumns.length : lane;
    laneEndColumns[resolvedLane] = segment.endColumn;

    return {
      ...segment,
      lane: resolvedLane,
    };
  });
};

const getMonthEventSegment = (
  event: CalendarEvent,
  weekCells: Array<Date | null>,
  startColumn: number,
  endColumn: number
) => {
  const segmentStartDate = weekCells[startColumn];
  const segmentEndDate = weekCells[endColumn - 1];
  if (!segmentStartDate || !segmentEndDate) return null;

  const occurrenceStartDate = getEventOccurrenceStartDate(event, segmentStartDate);
  if (!occurrenceStartDate) return null;

  const spanInDays = Math.max(0, getDayDiff(event.endDate || event.date, event.date));
  const occurrenceEndDate = addDays(occurrenceStartDate, spanInDays);

  return {
    event,
    startColumn,
    endColumn,
    startsInView: isSameDay(segmentStartDate, occurrenceStartDate),
    endsInView: isSameDay(segmentEndDate, occurrenceEndDate),
  };
};

const getWeekEventSegments = (events: CalendarEvent[], weekCells: Array<Date | null>) => {
  const segments: MonthEventSegment[] = [];

  events.forEach((event) => {
    let startColumn: number | null = null;

    for (let column = 0; column <= weekCells.length; column += 1) {
      const date = weekCells[column];
      const occursOnDate = Boolean(date && eventOccursOnDate(event, date));

      if (occursOnDate && startColumn === null) {
        startColumn = column;
      }

      if ((!occursOnDate || column === weekCells.length) && startColumn !== null) {
        const segment = getMonthEventSegment(event, weekCells, startColumn, column);
        if (segment) {
          segments.push(segment);
        }

        startColumn = null;
      }
    }
  });

  return positionMonthSegments(segments);
};

const getSegmentClassName = (segment: PositionedMonthEventSegment) =>
  joinClasses(
    'pointer-events-auto mx-1 flex h-6 items-center py-0 shadow-sm',
    !segment.startsInView && 'rounded-l-sm border-l-4 border-l-[#2563eb]',
    !segment.endsInView && 'rounded-r-sm border-r-4 border-r-[#2563eb]'
  );

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
  const weeks = useMemo(() => getWeeks(cells), [cells]);
  const weekSegments = useMemo(() => weeks.map((week) => getWeekEventSegments(events, week)), [events, weeks]);

  return (
    <div className={joinClasses('space-y-3', className)} {...props}>
      <div className="grid grid-cols-7 gap-1.5">
        {dayLabels.map((label) => (
          <div key={label} className="px-2 text-center text-sm font-medium leading-6 text-[#5f6770]">
            {label}
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        {weeks.map((week, weekIndex) => {
          const segments = weekSegments[weekIndex] || [];
          const laneCount = Math.max(0, ...segments.map((segment) => segment.lane + 1));
          const weekHeight = Math.max(dayCellMinHeight, dayHeaderHeight + laneCount * eventRowHeight + 8);

          return (
            <div key={`week-${weekIndex}`} className="relative" style={{ height: weekHeight }}>
              <div className="absolute inset-0 z-0 grid grid-cols-7 gap-1.5">
                {week.map((date, index) =>
                  date ? (
                    <CalendarCell
                      key={dateKey(date)}
                      aria-label={`Sélectionner le ${formatFullDate(date)}`}
                      selected={isSameDay(date, selected)}
                      className="h-full min-h-0"
                      onClick={() => onSelectDate?.(date)}
                    />
                  ) : (
                    <div key={`empty-${weekIndex}-${index}`} aria-hidden="true" className="rounded-md border border-transparent" />
                  )
                )}
              </div>

              <div className="pointer-events-none absolute inset-x-0 top-0 z-30 grid grid-cols-7 gap-1.5">
                {week.map((date, index) => (
                  <div
                    key={date ? `label-${dateKey(date)}` : `empty-label-${weekIndex}-${index}`}
                    aria-hidden={!date}
                    className={joinClasses(
                      'h-10 px-2 pt-2 text-sm font-medium leading-5',
                      date && isSameDay(date, selected) ? 'text-[#0b4f99]' : 'text-[#172033]'
                    )}
                  >
                    {date?.getDate()}
                  </div>
                ))}
              </div>

              <div
                className="pointer-events-none absolute inset-x-0 z-20 grid grid-cols-7 gap-x-1.5 gap-y-1"
                style={{ top: dayHeaderHeight, gridAutoRows: `${eventRowHeight - 4}px` }}
              >
                {segments.map((segment) => (
                  <EventPill
                    key={`${segment.event.id}-${weekIndex}-${segment.startColumn}-${segment.endColumn}-${segment.lane}`}
                    event={segment.event}
                    onClick={onEventClick}
                    showTime={false}
                    className={getSegmentClassName(segment)}
                    style={{
                      gridColumn: `${segment.startColumn + 1} / span ${segment.endColumn - segment.startColumn}`,
                      gridRow: segment.lane + 1,
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
