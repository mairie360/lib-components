import React from 'react';
import { CalendarDays, Clock, MapPin, Pencil, Repeat, Tag, Users, X } from 'lucide-react';

import { EventAssigneeSelect } from './EventAssigneeSelect';
import { defaultEventCategories, weekDayOptions } from './calendar/constants';
import {
  getEventDateLabel,
  getEventTimeLabel,
  getRecurrenceLabel,
  normalizeDateForServer,
  serverDatePattern,
  serverDatePlaceholder,
} from './calendar/date';
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
    const date = normalizeDateForServer(values.date);
    const endDate = normalizeDateForServer(values.endDate || values.date);

    onSave?.({
      ...event,
      id: event.id,
      title: values.title,
      description: values.description,
      date,
      endDate,
      category: values.category,
      startTime: values.startTime,
      endTime: values.endTime,
      location: values.location,
      assigneeIds: values.assigneeIds,
      assignees: selectedAssignees,
      recurrence:
        values.recurrence.frequency === 'none'
          ? { frequency: 'none', interval: 1, daysOfWeek: [], endsOn: '' }
          : {
              ...values.recurrence,
              endsOn: normalizeDateForServer(values.recurrence.endsOn),
            },
    });
    setEditing(false);
  };

  const updateRecurrence = <Key extends keyof CreateCalendarEventValues['recurrence']>(
    key: Key,
    value: CreateCalendarEventValues['recurrence'][Key]
  ) => {
    setValues((currentValues) => ({
      ...currentValues,
      recurrence: {
        ...currentValues.recurrence,
        [key]: value,
      },
    }));
  };

  const toggleRecurrenceDay = (day: number) => {
    const selectedDays = values.recurrence.daysOfWeek || [];
    updateRecurrence(
      'daysOfWeek',
      selectedDays.includes(day)
        ? selectedDays.filter((selectedDay) => selectedDay !== day)
        : [...selectedDays, day].sort((firstDay, secondDay) => firstDay - secondDay)
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <form
        className="flex max-h-[calc(100vh-2rem)] w-full max-w-[510px] flex-col overflow-hidden rounded-md bg-[#f5f3f0] text-[#172033] shadow-xl"
        onSubmit={handleSave}
      >
        <div className="flex min-h-14 items-center justify-between gap-4 bg-[#2b2b2b] px-5 py-3 text-white">
          <h2 id={titleId} className="min-w-0 text-base font-semibold leading-6">
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
        ) : (
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-5">
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
                  Date de début
                </label>
                <input
                  id="edit-event-date"
                  type="text"
                  inputMode="numeric"
                  pattern={serverDatePattern}
                  required
                  value={values.date}
                  placeholder={serverDatePlaceholder}
                  title="Format attendu : JJ-MM-AAAA"
                  className={fieldClassName}
                  onChange={(inputEvent) => updateValue('date', inputEvent.target.value)}
                />
              </div>
              <div>
                <label htmlFor="edit-event-end-date" className={labelClassName}>
                  Date de fin
                </label>
                <input
                  id="edit-event-end-date"
                  type="text"
                  inputMode="numeric"
                  pattern={serverDatePattern}
                  value={values.endDate}
                  placeholder={serverDatePlaceholder}
                  title="Format attendu : JJ-MM-AAAA"
                  className={fieldClassName}
                  onChange={(inputEvent) => updateValue('endDate', inputEvent.target.value)}
                />
              </div>
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

            <div className="rounded-md border border-[#d8d2ca] bg-[#fbfaf9] p-3">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="edit-event-recurrence" className={labelClassName}>
                    Récurrence
                  </label>
                  <select
                    id="edit-event-recurrence"
                    value={values.recurrence.frequency}
                    className={fieldClassName}
                    onChange={(inputEvent) =>
                      updateRecurrence('frequency', inputEvent.target.value as CreateCalendarEventValues['recurrence']['frequency'])
                    }
                  >
                    <option value="none">Ne se répète pas</option>
                    <option value="daily">Tous les jours</option>
                    <option value="weekly">Chaque semaine</option>
                    <option value="monthly">Chaque mois</option>
                  </select>
                </div>
                {values.recurrence.frequency !== 'none' && (
                  <div>
                    <label htmlFor="edit-event-recurrence-interval" className={labelClassName}>
                      Intervalle
                    </label>
                    <input
                      id="edit-event-recurrence-interval"
                      type="number"
                      min={1}
                      value={values.recurrence.interval || 1}
                      className={fieldClassName}
                      onChange={(inputEvent) => updateRecurrence('interval', Number(inputEvent.target.value) || 1)}
                    />
                  </div>
                )}
              </div>

              {values.recurrence.frequency === 'weekly' && (
                <div className="mt-3">
                  <div className={labelClassName}>Jours</div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {weekDayOptions.map((day) => {
                      const selected = values.recurrence.daysOfWeek?.includes(day.value);

                      return (
                        <button
                          key={day.value}
                          type="button"
                          className={joinClasses(
                            'h-8 rounded-md border text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/25',
                            selected
                              ? 'border-[#2563eb] bg-[#e9f2ff] text-[#2563eb]'
                              : 'border-[#cbd5e1] bg-[#f8fafc] text-[#334155] hover:bg-white'
                          )}
                          onClick={() => toggleRecurrenceDay(day.value)}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {values.recurrence.frequency !== 'none' && (
                <div className="mt-3">
                  <label htmlFor="edit-event-recurrence-end" className={labelClassName}>
                    Fin de récurrence
                  </label>
                  <input
                    id="edit-event-recurrence-end"
                    type="text"
                    inputMode="numeric"
                    pattern={serverDatePattern}
                    value={String(values.recurrence.endsOn || '')}
                    placeholder={serverDatePlaceholder}
                    title="Format attendu : JJ-MM-AAAA"
                    className={fieldClassName}
                    onChange={(inputEvent) => updateRecurrence('endsOn', inputEvent.target.value)}
                  />
                </div>
              )}
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
            </>
          )}
        </div>
      </form>
    </div>
  );
};
