import React from 'react';

import { getEventTimeLabel } from './date';
import { joinClasses } from './style';
import type { CalendarEvent } from './types';

interface EventPillProps {
  event: CalendarEvent;
}

export const EventPill = ({ event }: EventPillProps) => (
  <div
    className={joinClasses(
      'min-w-0 rounded-md px-2 py-1 text-xs font-medium leading-4',
      event.colorClassName || 'bg-[#e9f2ff] text-[#1256a6]',
      event.className
    )}
  >
    <div className="truncate">{event.title}</div>
    {getEventTimeLabel(event) && (
      <div className="truncate text-[11px] font-normal opacity-75">{getEventTimeLabel(event)}</div>
    )}
  </div>
);
