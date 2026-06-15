import React from 'react';
import { CalendarDays, Clock, MapPin, Tag, Users, X } from 'lucide-react';

import { EventAssigneeSelect } from './EventAssigneeSelect';
import { defaultEventCategories } from './calendar/constants';
import { dateKey, formatFullDate, getEventTimeLabel } from './calendar/date';
import { joinClasses } from './calendar/style';
import type {
  CalendarAssignee,
  CalendarAssigneeId,
  CalendarEvent,
  CreateCalendarEventValues,
  EventDetailsModalProps,
} from './calendar/types';

export type { EventDetailsModalProps } from './calendar/types';

const fieldClassName =
  'h-9 w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 text-sm text-[#172033] shadow-sm outline-none transition-colors placeholder:text-[#64748b] focus:border-[#94a3b8] focus:ring-2 focus:ring-[#3b82f6]/20';

const labelClassName = 'mb-1 block text-sm font-semibold text-[#334155]';

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
  date: dateKey(event.date),
  category: event.category || '',
  startTime: event.startTime || '',
  endTime: event.endTime || '',
  location: event.location || '',
  assigneeIds: getEventAssigneeIds(event),
});

const getSelectedAssignees = (people: CalendarAssignee[], value: CalendarAssigneeId[]) =>
  value
    .map((id) => people.find((person) => idsMatch(person.id, id)))
    .filter((person): person is CalendarAssignee => Boolean(person));

const DetailRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: React.ReactNode;
  value?: React.ReactNode;
}) => (
  <div className="flex gap-3 rounded-md bg-[#f8fafc] px-3 py-2 text-sm">
    <span className="mt-0.5 shrink-0 text-[#64748b]">{icon}</span>
    <div className="min-w-0">
      <div className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">{label}</div>
      <div className="mt-0.5 truncate font-medium text-[#172033]">{value || 'Non renseigné'}</div>
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
        }
  );
  const titleId = React.useId();

  React.useEffect(() => {
    if (event) {
      setValues(getEventValues(event));
      setEditing(false);
    }
  }, [event]);

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

  const updateValue = <Key extends keyof CreateCalendarEventValues>(
    key: Key,
    value: CreateCalendarEventValues[Key]
  ) => {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  };

  const categoryLabel =
    categories.find((category) => category.value === values.category)?.label || values.category || undefined;
  const selectedAssignees = getSelectedAssignees(people, values.assigneeIds);

  const handleSave = (submitEvent: React.FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();

    onSave?.({
      ...event,
      title: values.title,
      description: values.description,
      date: values.date,
      category: values.category,
      startTime: values.startTime,
      endTime: values.endTime,
      location: values.location,
      assigneeIds: values.assigneeIds,
      assignees: selectedAssignees,
    });
    setEditing(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <form
        className="w-full max-w-[510px] overflow-hidden rounded-md bg-[#f5f3f0] text-[#172033] shadow-xl"
        onSubmit={handleSave}
      >
        <div className="flex min-h-14 items-center justify-between gap-4 bg-[#2b2b2b] px-5 py-3 text-white">
          <h2 id={titleId} className="min-w-0 truncate text-base font-semibold leading-6">
            {editing ? 'Modifier l’événement' : title}
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

        {!editing ? (
          <div className="space-y-4 px-6 py-5">
            <div>
              <div className="text-xl font-semibold leading-7 text-[#172033]">{event.title}</div>
              {event.description && (
                <p className="mt-2 text-sm leading-6 text-[#475569]">{event.description}</p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <DetailRow
                icon={<CalendarDays className="h-4 w-4" strokeWidth={1.8} />}
                label="Date"
                value={formatFullDate(event.date)}
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
        ) : (
          <div className="space-y-3 px-6 py-5">
            <div>
              <label htmlFor="edit-event-title" className={labelClassName}>
                Titre
              </label>
              <input
                id="edit-event-title"
                required
                value={values.title}
                className={fieldClassName}
                onChange={(inputEvent) => updateValue('title', inputEvent.target.value)}
              />
            </div>

            <div>
              <label htmlFor="edit-event-description" className={labelClassName}>
                Description
              </label>
              <textarea
                id="edit-event-description"
                value={values.description}
                className={joinClasses(fieldClassName, 'h-20 resize-none py-2')}
                onChange={(inputEvent) => updateValue('description', inputEvent.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="edit-event-date" className={labelClassName}>
                  Date
                </label>
                <input
                  id="edit-event-date"
                  type="date"
                  required
                  value={values.date}
                  className={fieldClassName}
                  onChange={(inputEvent) => updateValue('date', inputEvent.target.value)}
                />
              </div>
              <div>
                <label htmlFor="edit-event-category" className={labelClassName}>
                  Catégorie
                </label>
                <select
                  id="edit-event-category"
                  value={values.category}
                  className={fieldClassName}
                  onChange={(inputEvent) => updateValue('category', inputEvent.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="edit-event-start-time" className={labelClassName}>
                  Heure de début
                </label>
                <input
                  id="edit-event-start-time"
                  type="time"
                  value={values.startTime}
                  className={fieldClassName}
                  onChange={(inputEvent) => updateValue('startTime', inputEvent.target.value)}
                />
              </div>
              <div>
                <label htmlFor="edit-event-end-time" className={labelClassName}>
                  Heure de fin
                </label>
                <input
                  id="edit-event-end-time"
                  type="time"
                  value={values.endTime}
                  className={fieldClassName}
                  onChange={(inputEvent) => updateValue('endTime', inputEvent.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="edit-event-location" className={labelClassName}>
                Lieu
              </label>
              <input
                id="edit-event-location"
                value={values.location}
                className={fieldClassName}
                onChange={(inputEvent) => updateValue('location', inputEvent.target.value)}
              />
            </div>

            <EventAssigneeSelect
              people={people}
              value={values.assigneeIds}
              onChange={(assigneeIds) => updateValue('assigneeIds', assigneeIds)}
            />
          </div>
        )}

        <div className="flex justify-end gap-3 bg-[#f5f3f0] px-6 py-3">
          {editing ? (
            <>
              <button
                type="button"
                className="inline-flex h-9 items-center justify-center rounded-md border border-[#d8d2ca] bg-white px-4 text-sm font-semibold text-[#172033] shadow-sm transition-colors hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/25"
                onClick={() => {
                  setValues(getEventValues(event));
                  setEditing(false);
                }}
              >
                {cancelLabel}
              </button>
              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center rounded-md bg-[#2faa55] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#27984b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2faa55]/35"
              >
                {saveLabel}
              </button>
            </>
          ) : (
            <>
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
                  className="inline-flex h-9 items-center justify-center rounded-md bg-[#2563eb] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/35"
                  onClick={() => setEditing(true)}
                >
                  {editLabel}
                </button>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  );
};
