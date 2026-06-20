import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';

import { CalendarSidebar } from '../components/CalendarSidebar';
import { CalendarToolbar } from '../components/CalendarToolbar';
import { Card } from '../components/Card';
import { CreateEventModal } from '../components/CreateEventModal';
import { DaySchedule } from '../components/DaySchedule';
import { EventDetailsModal } from '../components/EventDetailsModal';
import { MonthGrid } from '../components/MonthGrid';
import { PageTitleBar } from '../components/PageTitleBar';
import { WeekGrid } from '../components/WeekGrid';
import {
  addDays,
  addMonths,
  formatFullDate,
  formatMonthYear,
  getUpcomingEvents,
  parseDateInput,
} from '../components/calendar/date';
import { joinClasses } from '../components/calendar/style';
import type { CalendarAssignee, CalendarDateInput, CalendarEvent, CalendarViewMode } from '../components/calendar/types';

interface CalendarCompositionProps {
  initialDate?: CalendarDateInput;
  defaultView?: CalendarViewMode;
  events?: CalendarEvent[];
  upcomingEvents?: CalendarEvent[];
  people?: CalendarAssignee[];
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
    date: '15-06-2026',
    category: 'meeting',
    startTime: '09:00',
    endTime: '10:30',
    location: 'Salle du conseil',
    description: 'Salle du conseil',
    assigneeIds: ['alice', 'karim'],
  },
  {
    id: 'culture',
    title: 'Réunion culture',
    date: '17-06-2026',
    category: 'meeting',
    startTime: '14:00',
    endTime: '15:00',
    location: 'Médiathèque',
    assigneeIds: ['lea'],
  },
  {
    id: 'market',
    title: 'Marché local',
    date: '20-06-2026',
    endDate: '21-06-2026',
    category: 'activity',
    startTime: '08:00',
    endTime: '12:00',
    location: 'Place centrale',
    assigneeIds: ['karim', 'thomas'],
    colorClassName: 'bg-[#eaf6ef] text-[#24734c]',
  },
  {
    id: 'weekly-duty',
    title: 'Permanence d’accueil',
    date: '15-06-2026',
    category: 'meeting',
    startTime: '10:00',
    endTime: '11:00',
    location: 'Accueil de la mairie',
    assigneeIds: ['alice'],
    recurrence: {
      frequency: 'weekly',
      interval: 1,
      daysOfWeek: [1, 3],
      endsOn: '30-06-2026',
    },
    colorClassName: 'bg-[#e9f2ff] text-[#2563eb]',
  },
];

const people: CalendarAssignee[] = [
  { id: 'alice', name: 'Alice Dupont', role: 'Communication' },
  { id: 'karim', name: 'Karim Payet', role: 'Logistique' },
  { id: 'lea', name: 'Léa Martin', role: 'Culture' },
  { id: 'thomas', name: 'Thomas Robert', role: 'Sécurité' },
];

const CalendarComposition = ({
  initialDate = '15-06-2026',
  defaultView = 'month',
  events = [],
  upcomingEvents,
  people = [],
  onCreateEvent,
  onDateChange,
  onSelectDate,
  onSelectSlot,
  onViewChange,
}: CalendarCompositionProps) => {
  const [activeDate, setActiveDate] = useState(() => parseDateInput(initialDate));
  const [activeView, setActiveView] = useState(defaultView);
  const [calendarEvents, setCalendarEvents] = useState(events);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
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
        title="Calendrier et événements"
        subtitle="Planifiez et organisez vos activités"
        actionLabel="Nouvel événement"
        onAction={() => {
          setCreateModalOpen(true);
          onCreateEvent?.();
        }}
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
                  events={calendarEvents}
                  onSelectDate={handleSelectDate}
                  onEventClick={setSelectedEvent}
                />
              )}
              {activeView === 'week' && (
                <WeekGrid
                  currentDate={activeDate}
                  selectedDate={activeDate}
                  events={calendarEvents}
                  onSelectDate={handleSelectDate}
                  onSelectSlot={onSelectSlot}
                  onEventClick={setSelectedEvent}
                />
              )}
              {activeView === 'day' && (
                <DaySchedule
                  currentDate={activeDate}
                  events={calendarEvents}
                  onSelectSlot={onSelectSlot}
                  onEventClick={setSelectedEvent}
                />
              )}
            </div>
          </div>
        </Card>

        <CalendarSidebar
          events={calendarEvents}
          currentDate={activeDate}
          upcomingEvents={upcomingEvents ?? getUpcomingEvents(calendarEvents, activeDate)}
          onEventClick={setSelectedEvent}
        />
      </div>

      <CreateEventModal
        isOpen={createModalOpen}
        people={people}
        initialValues={{ date: '15-06-2026' }}
        onCancel={() => setCreateModalOpen(false)}
        onCreate={(eventValues) => {
          setCalendarEvents((currentEvents) => [
            ...currentEvents,
            {
              ...eventValues,
              id: `event-${currentEvents.length + 1}`,
              assignees: people.filter((person) =>
                eventValues.assigneeIds.some((assigneeId) => String(assigneeId) === String(person.id))
              ),
            },
          ]);
          setCreateModalOpen(false);
        }}
      />

      <EventDetailsModal
        isOpen={Boolean(selectedEvent)}
        event={selectedEvent}
        people={people}
        onClose={() => setSelectedEvent(null)}
        onSave={(updatedEvent) => {
          setCalendarEvents((currentEvents) =>
            currentEvents.map((calendarEvent) =>
              String(calendarEvent.id) === String(updatedEvent.id) ? updatedEvent : calendarEvent
            )
          );
          setSelectedEvent(updatedEvent);
        }}
      />
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
    initialDate: '15-06-2026',
    events: sampleEvents,
    people,
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
