import React from 'react';

import { getEventTimeLabel } from './date';
import { joinClasses } from './style';
import type { CalendarEvent } from './types';

interface EventPillProps {
  event: CalendarEvent;
  onClick?: (event: CalendarEvent) => void;
}

export const EventPill = ({ event, onClick }: EventPillProps) => {
  const clickableProps = onClick
    ? {
        role: 'button',
        tabIndex: 0,
        onClick: (clickEvent: React.MouseEvent<HTMLDivElement>) => {
          clickEvent.stopPropagation();
          onClick(event);
        },
        onKeyDown: (keyEvent: React.KeyboardEvent<HTMLDivElement>) => {
          if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
            keyEvent.preventDefault();
            keyEvent.stopPropagation();
            onClick(event);
          }
        },
      }
    : {};

  return (
  <div
    className={joinClasses(
      'min-w-0 rounded-md px-2 py-1 text-xs font-medium leading-4',
      onClick && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/35',
      event.colorClassName || 'bg-[#e9f2ff] text-[#1256a6]',
      event.className
    )}
    {...clickableProps}
  >
    <div className="truncate">{event.title}</div>
    {getEventTimeLabel(event) && (
      <div className="truncate text-[11px] font-normal opacity-75">{getEventTimeLabel(event)}</div>
    )}
  </div>
  );
};
