import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';

import { CalendarSidebar } from '../components/CalendarSidebar';
import { CalendarToolbar } from '../components/CalendarToolbar';
import { Card } from '../components/Card';
import { DaySchedule } from '../components/DaySchedule';
import { MonthGrid } from '../components/MonthGrid';
import { PageTitleBar } from '../components/PageTitleBar';
import { WeekGrid } from '../components/WeekGrid';
import {
  addDays,
  addMonths,
  formatFullDate,
  formatMonthYear,
  getDefaultStats,
  getUpcomingEvents,
  parseDateInput,
} from '../components/calendar/date';
import { joinClasses } from '../components/calendar/style';
import type { CalendarDateInput, CalendarEvent, CalendarStat, CalendarViewMode } from '../components/calendar/types';

interface CalendarCompositionProps {
  initialDate?: CalendarDateInput;
  defaultView?: CalendarViewMode;
  events?: CalendarEvent[];
  upcomingEvents?: CalendarEvent[];
  stats?: CalendarStat[];
  onCreateEvent?: () => void;
  onDateChange?: (date: Date) => void;
  onSelectDate?: (date: Date) => void;
  onSelectSlot?: (date: Date, time: string) => void;
  onViewChange?: (view: CalendarViewMode) => void;
}

const sampleEvents: CalendarEvent[] = [
  {
    id: 'council',
    title: 'Conseil municipal',
    date: '2026-06-15',
    startTime: '09:00',
    endTime: '10:30',
    description: 'Salle du conseil',
  },
  {
    id: 'culture',
    title: 'Réunion culture',
    date: '2026-06-17',
    startTime: '14:00',
    endTime: '15:00',
  },
  {
    id: 'market',
    title: 'Marché local',
    date: '2026-06-20',
    startTime: '08:00',
    endTime: '12:00',
    colorClassName: 'bg-[#eaf6ef] text-[#24734c]',
  },
];

const stats: CalendarStat[] = [
  { label: 'Ce mois', value: '12 événements' },
  { label: 'Cette semaine', value: '3 événements' },
  { label: "Aujourd'hui", value: '1 événement' },
];

const CalendarComposition = ({
  initialDate = '2026-06-15',
  defaultView = 'month',
  events = [],
  upcomingEvents,
  stats,
  onCreateEvent,
  onDateChange,
  onSelectDate,
  onSelectSlot,
  onViewChange,
}: CalendarCompositionProps) => {
  const [activeDate, setActiveDate] = useState(() => parseDateInput(initialDate));
  const [activeView, setActiveView] = useState(defaultView);
  const toolbarTitle = activeView === 'day' ? formatFullDate(activeDate) : formatMonthYear(activeDate);

  const handleDateChange = (date: Date) => {
    setActiveDate(date);
    onDateChange?.(date);
  };

  const handleSelectDate = (date: Date) => {
    handleDateChange(date);
    onSelectDate?.(date);
  };

  const handleViewChange = (view: CalendarViewMode) => {
    setActiveView(view);
    onViewChange?.(view);
  };

  const handlePrevious = () => {
    const nextDate =
      activeView === 'month' ? addMonths(activeDate, -1) : addDays(activeDate, activeView === 'week' ? -7 : -1);
    handleDateChange(nextDate);
  };

  const handleNext = () => {
    const nextDate =
      activeView === 'month' ? addMonths(activeDate, 1) : addDays(activeDate, activeView === 'week' ? 7 : 1);
    handleDateChange(nextDate);
  };

  return (
    <div className={joinClasses('bg-[#f5f3f0] p-6 text-[#172033] sm:p-8 lg:p-14')}>
      <PageTitleBar
        title="Calendrier & Événements"
        subtitle="Planifiez et organisez vos activités"
        actionLabel="Nouvel événement"
        onAction={onCreateEvent}
      />

      <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
        <Card className="overflow-hidden">
          <div className="p-6">
            <CalendarToolbar
              title={toolbarTitle}
              view={activeView}
              onViewChange={handleViewChange}
              onPrevious={handlePrevious}
              onNext={handleNext}
            />

            <div className="mt-8 overflow-x-auto">
              {activeView === 'month' && (
                <MonthGrid
                  currentDate={activeDate}
                  selectedDate={activeDate}
                  events={events}
                  onSelectDate={handleSelectDate}
                />
              )}
              {activeView === 'week' && (
                <WeekGrid
                  currentDate={activeDate}
                  selectedDate={activeDate}
                  events={events}
                  onSelectDate={handleSelectDate}
                  onSelectSlot={onSelectSlot}
                />
              )}
              {activeView === 'day' && (
                <DaySchedule currentDate={activeDate} events={events} onSelectSlot={onSelectSlot} />
              )}
            </div>
          </div>
        </Card>

        <CalendarSidebar
          upcomingEvents={upcomingEvents ?? getUpcomingEvents(events, activeDate)}
          stats={stats ?? getDefaultStats(events, activeDate)}
        />
      </div>
    </div>
  );
};

const meta = {
  title: 'Components/Calendar/Composition',
  component: CalendarComposition,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  args: {
    initialDate: '2026-06-15',
    events: sampleEvents,
    upcomingEvents: [],
    stats,
    onCreateEvent: fn(),
    onDateChange: fn(),
    onSelectDate: fn(),
    onSelectSlot: fn(),
    onViewChange: fn(),
  },
} satisfies Meta<typeof CalendarComposition>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Month: Story = {
  args: {
    defaultView: 'month',
  },
};

export const Week: Story = {
  args: {
    defaultView: 'week',
  },
};

export const Day: Story = {
  args: {
    defaultView: 'day',
  },
};
