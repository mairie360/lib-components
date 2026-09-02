import React from 'react';

import { defaultDashboardEvents } from './dashboard/defaultData';
import { joinDashboardClasses } from './dashboard/styles';
import type { DashboardEvent } from './dashboard/types';

export interface DashboardUpcomingEventsProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onSelect'> {
  events?: DashboardEvent[];
  locale?: string;
  onSelect?: (event: DashboardEvent) => void;
  onOpenCalendar?: () => void;
}

const getDateParts = (startsAt: string, locale: string) => {
  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) return { day: '--', month: '---', time: '--:--' };
  return {
    day: new Intl.DateTimeFormat(locale, { day: '2-digit' }).format(date),
    month: new Intl.DateTimeFormat(locale, { month: 'short' }).format(date).replace('.', ''),
    time: new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false }).format(date),
  };
};

export const DashboardUpcomingEvents = ({
  events = defaultDashboardEvents,
  locale = 'fr-FR',
  onSelect,
  onOpenCalendar,
  className = '',
  ...props
}: DashboardUpcomingEventsProps) => {
  const sortedEvents = [...events].sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime());

  return (
    <section className={joinDashboardClasses('rounded-lg border border-[#dfd9d1] bg-white p-6', className)} {...props}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-[#243041]">Événements à venir</h2>
        <button type="button" className="rounded-md border border-[#d8d2ca] bg-[#fbfaf9] px-3 py-2 text-sm font-medium text-[#243041]" onClick={onOpenCalendar}>Calendrier</button>
      </div>
      <div className="mt-6 space-y-3">
        {sortedEvents.map((event) => {
          const date = getDateParts(event.startsAt, locale);
          return (
            <button key={event.id} type="button" className="flex w-full items-center gap-3 rounded-md border border-[#e5e0da] bg-[#fbfaf9] p-3 text-left transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155bb5]/30" onClick={() => onSelect?.(event)}>
              <span className="flex min-w-16 shrink-0 flex-col items-center rounded-lg bg-[#155bb5] px-2 py-2 text-white">
                <span className="text-xs font-semibold uppercase">{date.day} {date.month}</span>
                <span className="text-sm font-bold">{date.time}</span>
              </span>
              <span className="min-w-0">
                <span className="block truncate font-semibold text-[#243041]">{event.title}</span>
                <span className="block truncate text-sm text-[#687385]">{event.location}</span>
              </span>
            </button>
          );
        })}
        {sortedEvents.length === 0 && <p className="py-8 text-center text-sm text-[#687385]">Aucun événement à venir.</p>}
      </div>
    </section>
  );
};
