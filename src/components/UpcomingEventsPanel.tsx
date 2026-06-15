import React from 'react';

import { Card } from './Card';
import { formatFullDate, getEventTimeLabel } from './calendar/date';
import { joinClasses } from './calendar/style';
import type { UpcomingEventsPanelProps } from './calendar/types';

export type { CalendarEvent, UpcomingEventsPanelProps } from './calendar/types';

export const UpcomingEventsPanel = ({
  events = [],
  title = 'Événements à venir',
  emptyLabel = 'Aucun événement à venir',
  showEmptyState = false,
  className = '',
  ...props
}: UpcomingEventsPanelProps) => (
  <Card title={title} className={joinClasses('min-h-[22rem]', className)} {...props}>
    <div className="px-6 pb-5 pt-4">
      {events.length > 0 ? (
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="rounded-md border border-[#ece7e0] bg-[#fbfaf9] p-3">
              <div className="text-sm font-semibold leading-5 text-[#172033]">{event.title}</div>
              <div className="mt-1 text-xs leading-5 text-[#6c7278]">
                {formatFullDate(event.date)}
                {getEventTimeLabel(event) && ` · ${getEventTimeLabel(event)}`}
              </div>
              {event.description && (
                <div className="mt-2 text-sm leading-5 text-[#5f6770]">{event.description}</div>
              )}
            </div>
          ))}
        </div>
      ) : (
        showEmptyState && <p className="text-sm leading-6 text-[#6c7278]">{emptyLabel}</p>
      )}
    </div>
  </Card>
);
