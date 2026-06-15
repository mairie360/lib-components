import React from 'react';

import { StatsPanel } from './StatsPanel';
import { UpcomingEventsPanel } from './UpcomingEventsPanel';
import { joinClasses } from './calendar/style';
import type { CalendarSidebarProps } from './calendar/types';

export type { CalendarEvent, CalendarSidebarProps, CalendarStat } from './calendar/types';

export const CalendarSidebar = ({
  upcomingEvents = [],
  stats = [],
  showEmptyState = false,
  className = '',
  ...props
}: CalendarSidebarProps) => (
  <aside className={joinClasses('flex flex-col gap-6', className)} {...props}>
    <UpcomingEventsPanel events={upcomingEvents} showEmptyState={showEmptyState} />
    <StatsPanel stats={stats} />
  </aside>
);
