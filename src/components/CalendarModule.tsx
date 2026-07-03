import React from 'react';
import { AlertCircle, X } from 'lucide-react';

import { CalendarSidebar } from './CalendarSidebar';
import { CalendarToolbar } from './CalendarToolbar';
import { Card } from './Card';
import { CreateEventModal } from './CreateEventModal';
import { DaySchedule } from './DaySchedule';
import { EventDetailsModal } from './EventDetailsModal';
import { MonthGrid } from './MonthGrid';
import { PageTitleBar } from './PageTitleBar';
import { WeekGrid } from './WeekGrid';
import { defaultEventCategories } from './calendar/constants';
import {
  addDays,
  addMonths,
  eventOccursOnDate,
  formatDateForServer,
  formatFullDate,
  formatMonthYear,
  getUpcomingEvents,
  parseDateInput,
} from './calendar/date';
import { joinClasses } from './calendar/style';
import type {
  CalendarAssignee,
  CalendarAssigneeId,
  CalendarDateInput,
  CalendarEvent,
  CalendarEventApprovalStatus,
  CalendarEventCategoryOption,
  CalendarServiceOption,
  CalendarUserRole,
  CalendarViewMode,
  CreateCalendarEventValues,
} from './calendar/types';

export type {
  CalendarAssignee,
  CalendarAssigneeId,
  CalendarDateInput,
  CalendarEvent,
  CalendarEventApprovalStatus,
  CalendarEventCategoryOption,
  CalendarServiceOption,
  CalendarUserRole,
  CalendarViewMode,
  CreateCalendarEventValues,
} from './calendar/types';

export interface CalendarModuleProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  events?: CalendarEvent[];
  people?: CalendarAssignee[];
  categories?: CalendarEventCategoryOption[];
  services?: CalendarServiceOption[];
  currentUserId?: CalendarAssigneeId;
  currentUserRole?: CalendarUserRole;
  currentUserService?: string;
  initialDate?: CalendarDateInput;
  view?: CalendarViewMode;
  defaultView?: CalendarViewMode;
  onViewChange?: (view: CalendarViewMode) => void;
  onDateChange?: (date: Date) => void;
  onSelectDate?: (date: Date) => void;
  onSelectSlot?: (date: Date, time: string) => void;
  onCreateEvent?: (event: CalendarEvent) => void;
  onUpdateEvent?: (event: CalendarEvent) => void;
  onDeleteEvent?: (event: CalendarEvent) => void;
  onValidateEvent?: (event: CalendarEvent, approvalStatus: CalendarEventApprovalStatus) => void;
}

const defaultCalendarPeople: CalendarAssignee[] = [
  { id: 'alice', name: 'Alice Dupont', role: 'Communication' },
  { id: 'karim', name: 'Karim Payet', role: 'Logistique' },
  { id: 'lea', name: 'Léa Martin', role: 'Culture' },
  { id: 'thomas', name: 'Thomas Robert', role: 'Sécurité' },
];

const defaultCalendarServices: CalendarServiceOption[] = [
  { label: 'Direction générale', value: 'direction' },
  { label: 'Communication', value: 'communication' },
  { label: 'Culture', value: 'culture' },
  { label: 'Logistique', value: 'logistique' },
  { label: 'Accueil', value: 'accueil' },
  { label: 'Sécurité', value: 'securite' },
];

const defaultCalendarEvents: CalendarEvent[] = [
  {
    id: 'council',
    title: 'Conseil municipal',
    date: '15-06-2026',
    category: 'meeting',
    service: 'direction',
    startTime: '09:00',
    endTime: '10:30',
    location: 'Salle du conseil',
    description: 'Séance mensuelle du conseil municipal',
    assigneeIds: ['alice', 'karim'],
    approvalStatus: 'approved',
    createdById: 'alice',
  },
  {
    id: 'culture-review',
    title: 'Atelier culture proposé',
    date: '17-06-2026',
    category: 'activity',
    service: 'culture',
    startTime: '14:00',
    endTime: '15:30',
    location: 'Médiathèque',
    description: 'Proposition à valider pour les habitants du quartier centre',
    assigneeIds: ['lea'],
    approvalStatus: 'pending',
    createdById: 'lea',
  },
  {
    id: 'market',
    title: 'Marché local',
    date: '20-06-2026',
    endDate: '21-06-2026',
    category: 'activity',
    service: 'logistique',
    startTime: '08:00',
    endTime: '12:00',
    location: 'Place centrale',
    assigneeIds: ['karim', 'thomas'],
    approvalStatus: 'approved',
    colorClassName: 'bg-[#eaf6ef] text-[#24734c]',
  },
  {
    id: 'weekly-duty',
    title: 'Permanence d’accueil',
    date: '15-06-2026',
    category: 'meeting',
    service: 'accueil',
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
    approvalStatus: 'approved',
    colorClassName: 'bg-[#e9f2ff] text-[#2563eb]',
  },
];

const fieldClassName =
  'h-9 w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 text-sm text-[#172033] shadow-sm outline-none transition placeholder:text-[#64748b] focus:border-[#1256a6] focus:ring-2 focus:ring-[#1256a6]/20';

const idsMatch = (firstId: CalendarAssigneeId, secondId: CalendarAssigneeId) =>
  String(firstId) === String(secondId);

const noRecurrence: CreateCalendarEventValues['recurrence'] = {
  frequency: 'none',
  interval: 1,
  daysOfWeek: [],
  endsOn: '',
};

const getEventAssigneeIds = (event: CalendarEvent) =>
  event.assigneeIds || event.assignees?.map((assignee) => assignee.id) || [];

const getSelectedAssignees = (people: CalendarAssignee[], value: CalendarAssigneeId[]) =>
  value
    .map((id) => people.find((person) => idsMatch(person.id, id)))
    .filter((person): person is CalendarAssignee => Boolean(person));

const getEventTitle = (event: CalendarEvent) =>
  typeof event.title === 'string' || typeof event.title === 'number' ? String(event.title) : 'Événement';

const getDefaultEventColorClassName = (event: CalendarEvent) => {
  if (event.colorClassName) return event.colorClassName;
  if (event.approvalStatus === 'pending') return 'bg-[#fff7ed] text-[#9a3412]';
  if (event.approvalStatus === 'rejected') return 'bg-[#fee2e2] text-[#dc2626]';
  return undefined;
};

const buildServiceOptions = (services: CalendarServiceOption[] | undefined, events: CalendarEvent[]) => {
  const optionsByValue = new Map<string, CalendarServiceOption>();

  [...defaultCalendarServices, ...(services || [])].forEach((service) => {
    optionsByValue.set(service.value, service);
  });

  events.forEach((event) => {
    if (event.service && !optionsByValue.has(event.service)) {
      optionsByValue.set(event.service, { label: event.service, value: event.service });
    }
  });

  return Array.from(optionsByValue.values());
};

const canSeeEvent = (
  event: CalendarEvent,
  currentUserRole: CalendarUserRole,
  currentUserId?: CalendarAssigneeId
) => {
  if (event.visibleToRoles?.length && !event.visibleToRoles.includes(currentUserRole)) {
    return false;
  }

  if (currentUserRole === 'mayor' || currentUserRole === 'responsable') {
    return true;
  }

  if (!event.approvalStatus || event.approvalStatus === 'approved') {
    return true;
  }

  if (!currentUserId) {
    return false;
  }

  return (
    Boolean(event.createdById && idsMatch(event.createdById, currentUserId)) ||
    getEventAssigneeIds(event).some((assigneeId) => idsMatch(assigneeId, currentUserId))
  );
};

const matchesDateFilter = (event: CalendarEvent, dateFilter: string) => {
  const trimmedDateFilter = dateFilter.trim();
  return !trimmedDateFilter || eventOccursOnDate(event, trimmedDateFilter);
};

export const CalendarModule = ({
  title = 'Calendrier',
  subtitle = 'Planifiez les événements municipaux et gérez leur validation',
  events,
  people = defaultCalendarPeople,
  categories = defaultEventCategories,
  services,
  currentUserId,
  currentUserRole = 'responsable',
  currentUserService,
  initialDate = '15-06-2026',
  view,
  defaultView = 'month',
  onViewChange,
  onDateChange,
  onSelectDate,
  onSelectSlot,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
  onValidateEvent,
  className = '',
  ...props
}: CalendarModuleProps) => {
  const [internalEvents, setInternalEvents] = React.useState(defaultCalendarEvents);
  const [activeDate, setActiveDate] = React.useState(() => parseDateInput(initialDate));
  const [internalView, setInternalView] = React.useState<CalendarViewMode>(defaultView);
  const [dateFilter, setDateFilter] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [serviceFilter, setServiceFilter] = React.useState('all');
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [createInitialValues, setCreateInitialValues] = React.useState<Partial<CreateCalendarEventValues>>();
  const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const resolvedEvents = events ?? internalEvents;
  const resolvedView = view ?? internalView;
  const canEditEvents = currentUserRole === 'responsable';
  const canDeleteEvents = currentUserRole === 'responsable';
  const canValidateEvents = currentUserRole === 'responsable' || currentUserRole === 'mayor';
  const canCreateRecurringEvents = currentUserRole === 'responsable';
  const serviceOptions = React.useMemo(() => buildServiceOptions(services, resolvedEvents), [events, resolvedEvents, services]);
  const toolbarTitle = resolvedView === 'day' ? formatFullDate(activeDate) : formatMonthYear(activeDate);
  const visibleEvents = resolvedEvents
    .map((event) => ({
      ...event,
      assignees: event.assignees ?? getSelectedAssignees(people, getEventAssigneeIds(event)),
      colorClassName: getDefaultEventColorClassName(event),
    }))
    .filter((event) => canSeeEvent(event, currentUserRole, currentUserId))
    .filter((event) => matchesDateFilter(event, dateFilter))
    .filter((event) => categoryFilter === 'all' || event.category === categoryFilter)
    .filter((event) => serviceFilter === 'all' || event.service === serviceFilter);
  const hasActiveFilters = Boolean(dateFilter || categoryFilter !== 'all' || serviceFilter !== 'all');

  const handleDateChange = (date: Date) => {
    setActiveDate(date);
    onDateChange?.(date);
  };

  const handleSelectDate = (date: Date) => {
    handleDateChange(date);
    onSelectDate?.(date);
  };

  const handleSelectSlot = (date: Date, time: string) => {
    handleDateChange(date);
    setCreateInitialValues({
      date: formatDateForServer(date),
      startTime: time,
      service: currentUserService,
    });
    setCreateModalOpen(true);
    onSelectSlot?.(date, time);
  };

  const handleViewChange = (nextView: CalendarViewMode) => {
    if (view === undefined) {
      setInternalView(nextView);
    }

    onViewChange?.(nextView);
  };

  const handlePrevious = () => {
    const nextDate =
      resolvedView === 'month' ? addMonths(activeDate, -1) : addDays(activeDate, resolvedView === 'week' ? -7 : -1);
    handleDateChange(nextDate);
  };

  const handleNext = () => {
    const nextDate =
      resolvedView === 'month' ? addMonths(activeDate, 1) : addDays(activeDate, resolvedView === 'week' ? 7 : 1);
    handleDateChange(nextDate);
  };

  const updateInternalEvent = (updatedEvent: CalendarEvent) => {
    if (events !== undefined) return;

    setInternalEvents((currentEvents) =>
      currentEvents.map((currentEvent) => (idsMatch(currentEvent.id, updatedEvent.id) ? updatedEvent : currentEvent))
    );
  };

  const handleNewEventClick = () => {
    setCreateInitialValues({
      date: formatDateForServer(activeDate),
      service: currentUserService,
    });
    setCreateModalOpen(true);
  };

  const handleCreateEvent = (values: CreateCalendarEventValues) => {
    const createdEvent: CalendarEvent = {
      ...values,
      id: `event-${Date.now()}`,
      title: values.title,
      description: values.description,
      endDate: values.endDate || values.date,
      service: values.service || currentUserService,
      assignees: getSelectedAssignees(people, values.assigneeIds),
      recurrence: canCreateRecurringEvents ? values.recurrence : noRecurrence,
      approvalStatus: 'pending',
      createdById: currentUserId,
    };

    onCreateEvent?.(createdEvent);

    if (events === undefined) {
      setInternalEvents((currentEvents) => [...currentEvents, createdEvent]);
    }

    setStatusMessage(`Événement "${getEventTitle(createdEvent)}" soumis à validation.`);
    setCreateModalOpen(false);
  };

  const handleUpdateEvent = (updatedEvent: CalendarEvent) => {
    onUpdateEvent?.(updatedEvent);
    updateInternalEvent(updatedEvent);
    setSelectedEvent(updatedEvent);
    setStatusMessage(`Événement "${getEventTitle(updatedEvent)}" enregistré.`);
  };

  const handleDeleteEvent = (event: CalendarEvent) => {
    onDeleteEvent?.(event);

    if (events === undefined) {
      setInternalEvents((currentEvents) => currentEvents.filter((currentEvent) => !idsMatch(currentEvent.id, event.id)));
    }

    setSelectedEvent(null);
    setStatusMessage(`Événement "${getEventTitle(event)}" supprimé.`);
  };

  const handleValidateEvent = (event: CalendarEvent, approvalStatus: CalendarEventApprovalStatus) => {
    const updatedEvent: CalendarEvent = {
      ...event,
      approvalStatus,
    };

    onValidateEvent?.(updatedEvent, approvalStatus);
    updateInternalEvent(updatedEvent);
    setSelectedEvent(updatedEvent);
    setStatusMessage(`Événement "${getEventTitle(event)}" ${approvalStatus === 'approved' ? 'validé' : 'refusé'}.`);
  };

  const resetFilters = () => {
    setDateFilter('');
    setCategoryFilter('all');
    setServiceFilter('all');
  };

  return (
    <section className={joinClasses('space-y-7 bg-[#f5f3f0] text-[#172033]', className)} {...props}>
      {statusMessage && (
        <div
          role="status"
          className="flex items-center justify-between gap-4 rounded-md border border-[#bfdbfe] bg-[#dbeafe] px-5 py-4 text-sm font-medium text-[#0046d5] shadow-sm"
        >
          <span className="inline-flex min-w-0 items-center gap-3">
            <AlertCircle className="size-5 shrink-0" strokeWidth={1.8} />
            <span className="truncate">{statusMessage}</span>
          </span>
          <button
            type="button"
            aria-label="Fermer le message"
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-[#475569] transition hover:bg-white/55 hover:text-[#0f172a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/25"
            onClick={() => setStatusMessage(null)}
          >
            <X className="size-4" strokeWidth={1.8} />
          </button>
        </div>
      )}

      <PageTitleBar
        title={title}
        subtitle={subtitle}
        actionLabel="Nouvel événement"
        onAction={handleNewEventClick}
      />

      <div className="border-t border-[#d8d2ca]" />

      <div className="grid gap-3 rounded-md border border-[#d8d2ca] bg-white p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
        <div>
          <label htmlFor="calendar-date-filter" className="mb-1 block text-sm font-semibold text-[#334155]">
            Filtrer par date
          </label>
          <input
            id="calendar-date-filter"
            type="text"
            inputMode="numeric"
            value={dateFilter}
            placeholder="JJ-MM-AAAA"
            className={fieldClassName}
            onChange={(event) => setDateFilter(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="calendar-category-filter" className="mb-1 block text-sm font-semibold text-[#334155]">
            Filtrer par type
          </label>
          <select
            id="calendar-category-filter"
            value={categoryFilter}
            className={fieldClassName}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="all">Tous les types</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="calendar-service-filter" className="mb-1 block text-sm font-semibold text-[#334155]">
            Filtrer par service
          </label>
          <select
            id="calendar-service-filter"
            value={serviceFilter}
            className={fieldClassName}
            onChange={(event) => setServiceFilter(event.target.value)}
          >
            <option value="all">Tous les services</option>
            {serviceOptions.map((service) => (
              <option key={service.value} value={service.value}>
                {service.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          disabled={!hasActiveFilters}
          className="inline-flex h-9 items-center justify-center rounded-md border border-[#d8d2ca] bg-[#fbfaf9] px-4 text-sm font-semibold text-[#172033] transition hover:bg-[#f3f0ec] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/25 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={resetFilters}
        >
          Réinitialiser
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
        <Card className="overflow-hidden">
          <div className="p-6">
            <CalendarToolbar
              title={toolbarTitle}
              view={resolvedView}
              onViewChange={handleViewChange}
              onPrevious={handlePrevious}
              onNext={handleNext}
            />

            {visibleEvents.length === 0 && (
              <div className="mt-6 rounded-md border border-[#d8d2ca] bg-[#fbfaf9] px-4 py-3 text-sm text-[#64748b]">
                Aucun événement ne correspond aux filtres.
              </div>
            )}

            <div className="mt-8 overflow-x-auto">
              {resolvedView === 'month' && (
                <MonthGrid
                  currentDate={activeDate}
                  selectedDate={activeDate}
                  events={visibleEvents}
                  onSelectDate={handleSelectDate}
                  onEventClick={setSelectedEvent}
                />
              )}
              {resolvedView === 'week' && (
                <WeekGrid
                  currentDate={activeDate}
                  selectedDate={activeDate}
                  events={visibleEvents}
                  onSelectDate={handleSelectDate}
                  onSelectSlot={handleSelectSlot}
                  onEventClick={setSelectedEvent}
                />
              )}
              {resolvedView === 'day' && (
                <DaySchedule
                  currentDate={activeDate}
                  events={visibleEvents}
                  onSelectSlot={handleSelectSlot}
                  onEventClick={setSelectedEvent}
                />
              )}
            </div>
          </div>
        </Card>

        <CalendarSidebar
          events={visibleEvents}
          currentDate={activeDate}
          upcomingEvents={getUpcomingEvents(visibleEvents, activeDate)}
          onEventClick={setSelectedEvent}
        />
      </div>

      <CreateEventModal
        isOpen={createModalOpen}
        people={people}
        categories={categories}
        initialValues={createInitialValues}
        canCreateRecurringEvents={canCreateRecurringEvents}
        title="Créer un événement"
        subtitle="Création d’un événement soumis à validation"
        submitLabel="Soumettre"
        onCancel={() => setCreateModalOpen(false)}
        onCreate={handleCreateEvent}
      />

      <EventDetailsModal
        isOpen={Boolean(selectedEvent)}
        event={selectedEvent}
        people={people}
        categories={categories}
        canEdit={canEditEvents}
        canDelete={canDeleteEvents}
        canValidate={canValidateEvents}
        canCreateRecurringEvents={canCreateRecurringEvents}
        onClose={() => setSelectedEvent(null)}
        onSave={canEditEvents ? handleUpdateEvent : undefined}
        onDelete={canDeleteEvents ? handleDeleteEvent : undefined}
        onApprove={canValidateEvents ? (event) => handleValidateEvent(event, 'approved') : undefined}
        onReject={canValidateEvents ? (event) => handleValidateEvent(event, 'rejected') : undefined}
      />
    </section>
  );
};
