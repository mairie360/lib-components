import React from 'react';
import { X } from 'lucide-react';

import { EventAssigneeSelect } from './EventAssigneeSelect';
import { joinClasses } from './calendar/style';
import type { CreateCalendarEventValues, CreateEventModalProps } from './calendar/types';

export type {
  CalendarAssignee,
  CalendarAssigneeId,
  CalendarEventCategoryOption,
  CreateCalendarEventValues,
  CreateEventModalProps,
} from './calendar/types';

const defaultCategories = [
  { label: 'Réunion', value: 'meeting' },
  { label: 'Animation', value: 'activity' },
  { label: 'Cérémonie', value: 'ceremony' },
  { label: 'Autre', value: 'other' },
];

const getDefaultValues = (
  initialValues: Partial<CreateCalendarEventValues> | undefined,
  defaultCategory: string
): CreateCalendarEventValues => ({
  title: '',
  description: '',
  date: '',
  category: defaultCategory,
  startTime: '',
  endTime: '',
  location: '',
  ...initialValues,
  assigneeIds: initialValues?.assigneeIds || [],
});

const fieldClassName =
  'h-9 w-full rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 text-sm text-[#172033] shadow-sm outline-none transition-colors placeholder:text-[#64748b] focus:border-[#94a3b8] focus:ring-2 focus:ring-[#3b82f6]/20';

const labelClassName = 'mb-1 block text-sm font-semibold text-[#334155]';

export const CreateEventModal = ({
  isOpen,
  people = [],
  categories = defaultCategories,
  initialValues,
  title = 'Créer un événement',
  subtitle = 'Ajouter un nouvel événement au calendrier',
  cancelLabel = 'Annuler',
  submitLabel = "Créer l'événement",
  onCancel,
  onCreate,
}: CreateEventModalProps) => {
  const defaultCategory = categories[0]?.value || '';
  const [values, setValues] = React.useState<CreateCalendarEventValues>(() =>
    getDefaultValues(initialValues, defaultCategory)
  );
  const titleId = React.useId();
  const subtitleId = React.useId();

  React.useEffect(() => {
    if (isOpen) {
      setValues(getDefaultValues(initialValues, defaultCategory));
    }
  }, [defaultCategory, initialValues, isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const updateValue = <Key extends keyof CreateCalendarEventValues>(
    key: Key,
    value: CreateCalendarEventValues[Key]
  ) => {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onCreate(values);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={subtitleId}
    >
      <form
        className="w-full max-w-[510px] overflow-hidden rounded-md bg-[#f5f3f0] text-[#172033] shadow-xl"
        onSubmit={handleSubmit}
      >
        <div className="flex min-h-14 items-center justify-between gap-4 bg-[#2b2b2b] px-5 py-3 text-white">
          <div className="min-w-0">
            <h2 id={titleId} className="truncate text-base font-semibold leading-6">
              {title}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Fermer"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#cbd5e1] transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
            onClick={onCancel}
          >
            <X className="h-5 w-5" strokeWidth={1.8} />
          </button>
        </div>

        <div className="space-y-3 px-6 py-5">
          {subtitle && (
            <p id={subtitleId} className="text-sm leading-5 text-[#64748b]">
              {subtitle}
            </p>
          )}

          <div>
            <label htmlFor="event-title" className={labelClassName}>
              Titre
            </label>
            <input
              id="event-title"
              name="title"
              type="text"
              required
              value={values.title}
              placeholder="Titre de l'événement"
              className={fieldClassName}
              onChange={(event) => updateValue('title', event.target.value)}
            />
          </div>

          <div>
            <label htmlFor="event-description" className={labelClassName}>
              Description
            </label>
            <textarea
              id="event-description"
              name="description"
              value={values.description}
              placeholder="Description de l'événement"
              className={joinClasses(fieldClassName, 'h-20 resize-none py-2')}
              onChange={(event) => updateValue('description', event.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="event-date" className={labelClassName}>
                Date
              </label>
              <input
                id="event-date"
                name="date"
                type="date"
                required
                value={values.date}
                className={fieldClassName}
                onChange={(event) => updateValue('date', event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="event-category" className={labelClassName}>
                Catégorie
              </label>
              <select
                id="event-category"
                name="category"
                value={values.category}
                className={fieldClassName}
                onChange={(event) => updateValue('category', event.target.value)}
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
              <label htmlFor="event-start-time" className={labelClassName}>
                Heure de début
              </label>
              <input
                id="event-start-time"
                name="startTime"
                type="time"
                value={values.startTime}
                className={fieldClassName}
                onChange={(event) => updateValue('startTime', event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="event-end-time" className={labelClassName}>
                Heure de fin
              </label>
              <input
                id="event-end-time"
                name="endTime"
                type="time"
                value={values.endTime}
                className={fieldClassName}
                onChange={(event) => updateValue('endTime', event.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="event-location" className={labelClassName}>
              Lieu
            </label>
            <input
              id="event-location"
              name="location"
              type="text"
              value={values.location}
              placeholder="Lieu de l'événement"
              className={fieldClassName}
              onChange={(event) => updateValue('location', event.target.value)}
            />
          </div>

          <EventAssigneeSelect
            people={people}
            value={values.assigneeIds}
            onChange={(assigneeIds) => updateValue('assigneeIds', assigneeIds)}
          />
        </div>

        <div className="flex justify-end gap-3 bg-[#f5f3f0] px-6 py-3">
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-md border border-[#d8d2ca] bg-white px-4 text-sm font-semibold text-[#172033] shadow-sm transition-colors hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/25"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center rounded-md bg-[#2faa55] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#27984b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2faa55]/35"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};
