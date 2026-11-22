'use client';

import React from 'react';
import { CalendarRange } from 'lucide-react';

import type { Size } from '@mairie360/lib-components/theme';
import {
  Calendar, addDays, addMonths, endOfMonth, formatDateRange, formatDayCount, formatShortDate, isDateDisabled, parseIsoDate, rangeDayCount,
  startOfMonth, toIsoDate, type DateBounds,
} from '../Calendar';
import { DateTrigger, useDatePopover, type DateDisplay } from '../DatePicker';
import { Field, fieldDescriptionIds } from '../Field';
import { componentMarker } from '../component-marker';
import { RangeFooter } from './components/RangeFooter';
import { RangePresets, type DateRangePreset } from './components/RangePresets';

/** A period, both days ISO `YYYY-MM-DD` and included. */
export interface DateRange {
  start: string;
  end: string;
}

export interface DateRangePickerProps extends DateBounds, Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  label: string;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  size?: Size;
  id?: string;
  /** Names of the hidden inputs carrying the two ISO days in a native form. */
  startName?: string;
  endName?: string;
  /** Chosen period (controlled); null for none. */
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  /** Called on Appliquer with the period, and on Effacer with null. */
  onChange?: (value: DateRange | null) => void;
  placeholder?: string;
  /** Ready-made periods; `dateRangePresets()` by default, `false` for none. */
  presets?: readonly DateRangePreset[] | false;
  events?: readonly string[];
  display?: DateDisplay;
}

/**
 * The default periods from `today` (ISO): Aujourd’hui, 7 derniers jours, 30 derniers jours, Ce mois-ci,
 * Mois dernier, Mois prochain, Cette année.
 */
export function dateRangePresets(today: string = toIsoDate(new Date())): DateRangePreset[] {
  const month = startOfMonth(today);
  const previous = addMonths(month, -1);
  const next = addMonths(month, 1);
  return [
    { id: 'today', label: 'Aujourd’hui', start: today, end: today },
    { id: 'last-7-days', label: '7 derniers jours', start: addDays(today, -6), end: today },
    { id: 'last-30-days', label: '30 derniers jours', start: addDays(today, -29), end: today },
    { id: 'this-month', label: 'Ce mois-ci', start: month, end: endOfMonth(month) },
    { id: 'last-month', label: 'Mois dernier', start: previous, end: endOfMonth(previous) },
    { id: 'next-month', label: 'Mois prochain', start: next, end: endOfMonth(next) },
    { id: 'this-year', label: 'Cette année', start: `${today.slice(0, 4)}-01-01`, end: `${today.slice(0, 4)}-12-31` },
  ];
}

const validRange = (range: DateRange | null | undefined): DateRange | null =>
  range && parseIsoDate(range.start) && parseIsoDate(range.end) && range.start <= range.end ? range : null;

/**
 * Period field with a calendar (MAIR-1099, Figma `DateRangePicker`): a first click chooses the start, the
 * hovered days preview the period, a second click chooses the end; presets, the number of days, Effacer /
 * Appliquer. Nothing changes until Appliquer; Échap closes without applying. Days ISO `YYYY-MM-DD`.
 */
export function DateRangePicker({
  label, hint, error, required = false, disabled = false, size = 'm', id, startName, endName, value, defaultValue = null, onChange,
  placeholder = 'Choisir une période', presets, events, display = 'auto', min, max, disabledDates, className = '', ...props
}: DateRangePickerProps) {
  const generated = React.useId();
  const fieldId = id ?? `date-range-picker-${generated.replace(/:/g, '')}`;
  const popoverId = `${fieldId}-popover`;
  const [inner, setInner] = React.useState<DateRange | null>(defaultValue);
  const chosen = validRange(value !== undefined ? value : inner);
  const popover = useDatePopover(disabled);
  const [draft, setDraft] = React.useState<{ start: string | null; end: string | null }>({ start: null, end: null });
  const [hover, setHover] = React.useState<string | null>(null);
  // A preset moves the calendar to its first month: the calendar is mounted again on it.
  const [calendarKey, setCalendarKey] = React.useState(0);
  const list = presets === false ? [] : presets ?? dateRangePresets();

  const commit = (next: DateRange | null) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };
  const openWith = (open: boolean) => {
    if (open) {
      setDraft({ start: chosen?.start ?? null, end: chosen?.end ?? null });
      setHover(null);
      setCalendarKey(0);
    }
    popover.setOpen(open);
  };
  const pickDay = (iso: string) => {
    setDraft(({ start, end }) => (!start || end || iso < start ? { start: iso, end: null } : { start, end: iso }));
  };
  const pickPreset = (preset: DateRangePreset) => {
    setDraft({ start: preset.start, end: preset.end });
    setCalendarKey(key => key + 1);
  };

  const previewing = Boolean(draft.start && !draft.end && hover && hover >= draft.start);
  const rangeEnd = draft.end ?? (previewing ? hover : null);
  const summary = draft.start && draft.end ? formatDateRange(draft.start, draft.end) : draft.start ? formatShortDate(draft.start) : '';
  const detail = draft.start && draft.end ? formatDayCount(rangeDayCount(draft.start, draft.end)) : draft.start ? 'choisissez la date de fin' : 'Choisissez la date de début';
  const text = chosen ? formatDateRange(chosen.start, chosen.end) : '';
  const days = chosen ? formatDayCount(rangeDayCount(chosen.start, chosen.end)) : '';

  return (
    <Field {...props} {...componentMarker('DateRangePicker', props)} htmlFor={fieldId} label={label} hint={hint} error={error} required={required} size={size} disabled={disabled} className={className}>
      <div {...popover.wrapperProps} className="relative">
        <DateTrigger
          id={fieldId}
          triggerRef={popover.trigger}
          icon={CalendarRange}
          name={`${label}${required ? ' (obligatoire)' : ''}, ${chosen ? `${text}, ${days}` : 'aucune période choisie'}`}
          longText={chosen ? `${text} · ${days}` : ''}
          shortText={text}
          placeholder={placeholder}
          display={display}
          open={popover.open}
          controls={popoverId}
          disabled={disabled}
          invalid={Boolean(error)}
          required={required}
          describedBy={fieldDescriptionIds(fieldId, hint, error)}
          size={size}
          clearLabel={`Effacer la période « ${label} »`}
          onToggle={() => openWith(!popover.open)}
          onOpen={() => openWith(true)}
          onClear={() => { commit(null); popover.trigger.current?.focus(); }}
        />
        {startName ? <input type="hidden" name={startName} value={chosen?.start ?? ''} /> : null}
        {endName ? <input type="hidden" name={endName} value={chosen?.end ?? ''} /> : null}
        {popover.open ? (
          <div
            {...popover.popoverProps}
            id={popoverId}
            role="dialog"
            aria-label={`${label} : choisir une période`}
            className="mairie-popover-in absolute left-0 z-[45] rounded-[var(--mairie-radius-l)] border border-[var(--mairie-border)] bg-[var(--mairie-surface)]"
            style={{ top: 'calc(100% + 6px)', padding: 12, boxShadow: 'var(--mairie-shadow-pop)', maxWidth: 'calc(100vw - 32px)' }}
          >
            <div className="flex flex-col sm:flex-row" style={{ gap: 12 }}>
              {list.length ? (
                <RangePresets
                  presets={list}
                  start={draft.start}
                  end={draft.end}
                  isDisabled={preset => isDateDisabled(preset.start, { min, max }) || isDateDisabled(preset.end, { min, max })}
                  onPick={pickPreset}
                />
              ) : null}
              <Calendar
                key={calendarKey}
                defaultMonth={draft.start}
                rangeStart={draft.start}
                rangeEnd={rangeEnd}
                rangePreview={previewing}
                onDayHover={setHover}
                onChange={pickDay}
                autoFocus={calendarKey === 0}
                events={events}
                min={min}
                max={max}
                disabledDates={disabledDates}
                label={`Calendrier : ${label}`}
              />
            </div>
            <RangeFooter
              summary={summary}
              detail={detail}
              canApply={Boolean(draft.start && draft.end)}
              canClear={Boolean(draft.start || chosen)}
              onClear={() => { setDraft({ start: null, end: null }); setHover(null); commit(null); }}
              onApply={() => { commit({ start: draft.start!, end: draft.end! }); popover.close(); }}
            />
          </div>
        ) : null}
      </div>
    </Field>
  );
}
