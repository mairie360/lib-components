import React from 'react';
import { CalendarDays, Clock, MapPin, Pencil, Repeat, Tag, Users, X } from 'lucide-react';

import { CreateEventModal } from './CreateEventModal';
import { defaultEventCategories } from './calendar/constants';
import { getEventDateLabel, getEventTimeLabel, getRecurrenceLabel, normalizeDateForServer } from './calendar/date';
import { joinClasses } from './calendar/style';
import type {
  CalendarAssignee,
  CalendarAssigneeId,
  CalendarEvent,
  CreateCalendarEventValues,
  EventDetailsModalProps,
} from './calendar/types';

export type { EventDetailsModalProps } from './calendar/types';

const stringifyNode = (node: React.ReactNode) => {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  return '';
};

const idsMatch = (firstId: CalendarAssigneeId, secondId: CalendarAssigneeId) =>
  String(firstId) === String(secondId);

const getEventAssigneeIds = (event: CalendarEvent) =>
  event.assigneeIds || event.assignees?.map((assignee) => assignee.id) || [];

const getEventValues = (event: CalendarEvent): CreateCalendarEventValues => ({
  title: stringifyNode(event.title),
  description: stringifyNode(event.description),
  date: normalizeDateForServer(event.date),
  endDate: event.endDate ? normalizeDateForServer(event.endDate) : normalizeDateForServer(event.date),
  category: event.category || '',
  startTime: event.startTime || '',
  endTime: event.endTime || '',
  location: event.location || '',
  assigneeIds: getEventAssigneeIds(event),
  recurrence: {
    frequency: event.recurrence?.frequency || 'none',
    interval: event.recurrence?.interval || 1,
    daysOfWeek: event.recurrence?.daysOfWeek || [],
    endsOn: normalizeDateForServer(event.recurrence?.endsOn),
  },
});

const getSelectedAssignees = (people: CalendarAssignee[], value: CalendarAssigneeId[]) =>
  value
    .map((id) => people.find((person) => idsMatch(person.id, id)))
    .filter((person): person is CalendarAssignee => Boolean(person));

const DetailRow = ({
  icon,
  label,
  value,
  className = '',
}: {
  icon: React.ReactNode;
  label: React.ReactNode;
  value?: React.ReactNode;
  className?: string;
}) => (
  <div className={joinClasses('flex gap-3 rounded-md bg-[#f8fafc] px-3 py-2 text-sm', className)}>
    <span className="mt-0.5 shrink-0 text-[#64748b]">{icon}</span>
    <div className="min-w-0">
      <div className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">{label}</div>
      <div className="mt-0.5 whitespace-normal break-words font-medium text-[#172033]">
        {value || 'Non renseigné'}
      </div>
    </div>
  </div>
);

export const EventDetailsModal = ({
  isOpen,
  event,
  people = [],
  categories = defaultEventCategories,
  title = "Détail de l'événement",
  closeLabel = 'Fermer',
  editLabel = 'Modifier',
  cancelLabel = 'Annuler',
  saveLabel = 'Enregistrer',
  onClose,
  onSave,
}: EventDetailsModalProps) => {
  const [editing, setEditing] = React.useState(false);
  const [values, setValues] = React.useState<CreateCalendarEventValues>(() =>
    event
      ? getEventValues(event)
      : {
          title: '',
          description: '',
          date: '',
          category: categories[0]?.value || '',
          startTime: '',
          endTime: '',
          location: '',
          assigneeIds: [],
          endDate: '',
          recurrence: {
            frequency: 'none',
            interval: 1,
            daysOfWeek: [],
            endsOn: '',
          },
        }
  );
  const titleId = React.useId();
  const eventId = event ? String(event.id) : null;
  const previousEventIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!isOpen || !event || !eventId) {
      previousEventIdRef.current = null;
      setEditing(false);
      return;
    }

    if (previousEventIdRef.current !== eventId) {
      setValues(getEventValues(event));
      setEditing(false);
      previousEventIdRef.current = eventId;
    }
  }, [event, eventId, isOpen]);

  React.useEffect(() => {
    if (!isOpen || !event || editing) return;

    setValues(getEventValues(event));
  }, [editing, event, isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  const categoryLabel =
    categories.find((category) => category.value === values.category)?.label || values.category || undefined;
  const selectedAssignees = getSelectedAssignees(people, values.assigneeIds);

  const handleSave = (eventValues: CreateCalendarEventValues) => {
    const date = normalizeDateForServer(eventValues.date);
    const endDate = normalizeDateForServer(eventValues.endDate || eventValues.date);
    const assignees = getSelectedAssignees(people, eventValues.assigneeIds);

    onSave?.({
      ...event,
      id: event.id,
      title: eventValues.title,
      description: eventValues.description,
      date,
      endDate,
      category: eventValues.category,
      startTime: eventValues.startTime,
      endTime: eventValues.endTime,
      location: eventValues.location,
      assigneeIds: eventValues.assigneeIds,
      assignees,
      recurrence:
        eventValues.recurrence.frequency === 'none'
          ? { frequency: 'none', interval: 1, daysOfWeek: [], endsOn: '' }
          : {
              ...eventValues.recurrence,
              endsOn: normalizeDateForServer(eventValues.recurrence.endsOn),
            },
    });
    setEditing(false);
  };

  if (editing) {
    return (
      <CreateEventModal
        isOpen
        people={people}
        categories={categories}
        initialValues={values}
        title="Modifier l’événement"
        subtitle="Modifier les informations de l’événement sélectionné"
        cancelLabel={cancelLabel}
        submitLabel={saveLabel}
        onCancel={() => {
          setValues(getEventValues(event));
          setEditing(false);
        }}
        onCreate={handleSave}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <form
        className="flex max-h-[calc(100vh-2rem)] w-full max-w-[510px] flex-col overflow-hidden rounded-md bg-[#f5f3f0] text-[#172033] shadow-xl"
      >
        <div className="flex min-h-14 items-center justify-between gap-4 bg-[#2b2b2b] px-5 py-3 text-white">
          <h2 id={titleId} className="min-w-0 text-base font-semibold leading-6">
            {title}
          </h2>
          <button
            type="button"
            aria-label="Fermer"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#cbd5e1] transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
            onClick={onClose}
          >
            <X className="h-5 w-5" strokeWidth={1.8} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div>
            <div className="whitespace-normal break-words text-xl font-semibold leading-7 text-[#172033]">
              {event.title}
            </div>
            {event.description && (
              <p className="mt-2 whitespace-normal break-words text-sm leading-6 text-[#475569]">
                {event.description}
              </p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailRow
              icon={<CalendarDays className="h-4 w-4" strokeWidth={1.8} />}
              label="Date"
              value={getEventDateLabel(event)}
            />
            <DetailRow
              icon={<Clock className="h-4 w-4" strokeWidth={1.8} />}
              label="Horaire"
              value={getEventTimeLabel(event)}
            />
            <DetailRow
              icon={<Tag className="h-4 w-4" strokeWidth={1.8} />}
              label="Catégorie"
              value={categoryLabel}
            />
            <DetailRow
              icon={<MapPin className="h-4 w-4" strokeWidth={1.8} />}
              label="Lieu"
              value={event.location}
            />
            <DetailRow
              icon={<Repeat className="h-4 w-4" strokeWidth={1.8} />}
              label="Récurrence"
              value={getRecurrenceLabel(event.recurrence)}
              className="sm:col-span-2"
            />
          </div>

          <div className="rounded-md bg-[#f8fafc] px-3 py-2 text-sm">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#64748b]">
              <Users className="h-4 w-4" strokeWidth={1.8} />
              Assignés
            </div>
            {selectedAssignees.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedAssignees.map((assignee) => (
                  <span
                    key={assignee.id}
                    className="inline-flex items-center rounded-md bg-[#e9f2ff] px-2 py-1 text-xs font-semibold text-[#2563eb]"
                  >
                    {assignee.name}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-[#64748b]">Aucune personne assignée</div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 bg-[#f5f3f0] px-6 py-3">
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-md border border-[#d8d2ca] bg-white px-4 text-sm font-semibold text-[#172033] shadow-sm transition-colors hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/25"
            onClick={onClose}
          >
            {closeLabel}
          </button>
          {onSave && (
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#2563eb] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/35"
              onClick={() => {
                setValues(getEventValues(event));
                setEditing(true);
              }}
            >
              <Pencil className="h-4 w-4" strokeWidth={1.8} />
              {editLabel}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
