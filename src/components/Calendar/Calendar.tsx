'use client';

import React from 'react';

import { componentMarker } from '../component-marker';
import { CalendarHeader } from './components/CalendarHeader';
import { CellGrid, type GridCell } from './components/CellGrid';
import { DayGrid, type DayCell } from './components/DayGrid';
import {
  addDays, addMonths, clampIso, endOfMonth, formatFullDate, formatMonthYear, frenchMonths, frenchWeekdayInitials, frenchWeekdays,
  isDateDisabled, maxIso, minIso, monthWeeks, parseIsoDate, startOfMonth, startOfWeek, toIsoDate, type DateBounds,
} from './calendar-dates';

export type CalendarView = 'days' | 'months' | 'years';

export interface CalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'>, DateBounds {
  /** Chosen day (ISO `YYYY-MM-DD`). */
  value?: string | null;
  /** Called with the ISO day picked (click or Entrée); disabled days are never sent. */
  onChange?: (iso: string) => void;
  /** First day of a period (DateRangePicker). */
  rangeStart?: string | null;
  /** Last day of a period; with `rangePreview` it is the hovered day, not a choice yet. */
  rangeEnd?: string | null;
  rangePreview?: boolean;
  /** Hovered or focused day (null when the pointer leaves the grid), for the period preview. */
  onDayHover?: (iso: string | null) => void;
  /** Days that carry events: a dot under the number. */
  events?: readonly string[];
  /** View shown first: `years` for a birth date. */
  defaultView?: CalendarView;
  /** A day of the month shown first; the chosen day, else today, by default. */
  defaultMonth?: string | null;
  /** Moves the focus to the active day when mounted (inside a popover). */
  autoFocus?: boolean;
  /** Accessible name of the whole calendar. */
  label?: string;
}

const weekdays = frenchWeekdays.map((name, index) => ({ name, initial: frenchWeekdayInitials[index] }));
const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const yearOf = (iso: string) => Number(iso.slice(0, 4));
const withYear = (iso: string, year: number) => addMonths(iso, (year - yearOf(iso)) * 12);
const blockStart = (year: number) => year - (((year % 12) + 12) % 12);

/** Arrow / page / home-end moves of each view; null for any other key. */
function moveFor(view: CalendarView, key: string, shift: boolean, focus: string): string | null {
  if (view === 'days') {
    switch (key) {
      case 'ArrowLeft': return addDays(focus, -1);
      case 'ArrowRight': return addDays(focus, 1);
      case 'ArrowUp': return addDays(focus, -7);
      case 'ArrowDown': return addDays(focus, 7);
      case 'PageUp': return addMonths(focus, shift ? -12 : -1);
      case 'PageDown': return addMonths(focus, shift ? 12 : 1);
      case 'Home': return startOfWeek(focus);
      case 'End': return addDays(startOfWeek(focus), 6);
      default: return null;
    }
  }
  const unit = view === 'months' ? 1 : 12; // a cell is a month, or a year (12 months)
  const first = view === 'months' ? 0 : blockStart(yearOf(focus));
  const index = view === 'months' ? Number(focus.slice(5, 7)) - 1 : yearOf(focus) - first;
  switch (key) {
    case 'ArrowLeft': return addMonths(focus, -unit);
    case 'ArrowRight': return addMonths(focus, unit);
    case 'ArrowUp': return addMonths(focus, -3 * unit);
    case 'ArrowDown': return addMonths(focus, 3 * unit);
    case 'PageUp': return addMonths(focus, -12 * unit);
    case 'PageDown': return addMonths(focus, 12 * unit);
    case 'Home': return addMonths(focus, -index * unit);
    case 'End': return addMonths(focus, (11 - index) * unit);
    default: return null;
  }
}

/**
 * Month calendar (MAIR-1099, Figma `Calendar`): weeks from Monday, days / months / years views, event dots,
 * `min` / `max` / `disabledDates` (struck through), full keyboard on a roving tab stop — arrows, Page
 * préc./suiv. (month, Maj = year), Début / Fin (week), Entrée to choose, Échap back to the days. Used alone or
 * inside DatePicker and DateRangePicker. Values are ISO `YYYY-MM-DD` in local time.
 */
export function Calendar({
  value, onChange, rangeStart, rangeEnd, rangePreview = false, onDayHover, events, defaultView = 'days', defaultMonth,
  autoFocus = false, label = 'Calendrier', min, max, disabledDates, className = '', style, onKeyDown, ...props
}: CalendarProps) {
  const bounds: DateBounds = { min, max, disabledDates };
  const today = toIsoDate(new Date());
  const initial = parseIsoDate(defaultMonth) ? defaultMonth! : parseIsoDate(value) ? value! : parseIsoDate(rangeStart) ? rangeStart! : today;
  const [focus, setFocus] = React.useState(() => clampIso(initial, bounds));
  const [view, setView] = React.useState<CalendarView>(defaultView);
  const root = React.useRef<HTMLDivElement>(null);
  const moveFocus = React.useRef(autoFocus);

  // A value set from outside (a shortcut, a preset) brings its month into view (state adjusted while rendering).
  const [shownValue, setShownValue] = React.useState(value);
  if (value !== shownValue) {
    setShownValue(value);
    if (parseIsoDate(value)) setFocus(value!);
  }

  React.useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    root.current?.querySelector<HTMLElement>('[data-calendar-cell][data-focused="true"]')?.focus();
  }, [focus, view]);

  const go = (next: string, keyboard = true) => {
    moveFocus.current = keyboard;
    setFocus(clampIso(next, bounds));
  };
  const pickDay = (iso: string) => {
    if (isDateDisabled(iso, bounds)) return;
    setFocus(iso);
    onChange?.(iso);
  };

  const year = yearOf(focus);
  const monthStart = startOfMonth(focus);
  const outOfBounds = (from: string, to: string) => Boolean((max && from > max) || (min && to < min));
  const eventDays = React.useMemo(() => new Set(events ?? []), [events]);
  const [low, high] = rangeStart && rangeEnd ? [minIso(rangeStart, rangeEnd), maxIso(rangeStart, rangeEnd)] : [rangeStart ?? null, rangeStart ?? null];

  let header: React.ComponentProps<typeof CalendarHeader>;
  let body: React.ReactNode;
  if (view === 'days') {
    const weeks: DayCell[][] = monthWeeks(focus).map(week => week.map(iso => {
      const rangePosition = !low || !high || iso < low || iso > high ? undefined : low === high ? 'single' : iso === low ? 'start' : iso === high ? 'end' : 'middle';
      const isToday = iso === today;
      const hasEvent = eventDays.has(iso);
      const suffix = [isToday ? 'aujourd’hui' : '', hasEvent ? 'événement prévu' : '', rangePosition === 'start' && low !== high ? 'début de la période' : '', rangePosition === 'end' ? (rangePreview ? 'fin envisagée' : 'fin de la période') : ''].filter(Boolean);
      return {
        iso, dayNumber: Number(iso.slice(8)), label: [formatFullDate(iso), ...suffix].join(', '), inMonth: iso.slice(0, 7) === focus.slice(0, 7),
        today: isToday, selected: iso === value, disabled: isDateDisabled(iso, bounds), rangePosition, preview: rangePreview, hasEvent, focused: iso === focus,
      };
    }));
    const month = formatMonthYear(focus);
    header = {
      title: month, titleLabel: `${month} : choisir un autre mois`, zoomOut: true,
      previousLabel: 'Mois précédent', nextLabel: 'Mois suivant',
      previousDisabled: outOfBounds(addMonths(monthStart, -1), endOfMonth(addMonths(monthStart, -1))),
      nextDisabled: outOfBounds(addMonths(monthStart, 1), endOfMonth(addMonths(monthStart, 1))),
      onTitle: () => setView('months'), onPrevious: () => go(addMonths(focus, -1), false), onNext: () => go(addMonths(focus, 1), false),
    };
    body = <DayGrid label={month} weekdays={weekdays} weeks={weeks} onSelect={pickDay} onHover={onDayHover} />;
  } else if (view === 'months') {
    const cells: GridCell[] = frenchMonths.map((name, index) => {
      const first = `${focus.slice(0, 4)}-${String(index + 1).padStart(2, '0')}-01`;
      return {
        value: first.slice(0, 7), text: capitalise(name), label: `${name} ${year}`, selected: Boolean(value && value.slice(0, 7) === first.slice(0, 7)),
        current: today.slice(0, 7) === first.slice(0, 7), disabled: outOfBounds(first, endOfMonth(first)), focused: index === Number(focus.slice(5, 7)) - 1,
      };
    });
    header = {
      title: String(year), titleLabel: `Année ${year} : choisir une autre année`, zoomOut: true,
      previousLabel: 'Année précédente', nextLabel: 'Année suivante',
      previousDisabled: outOfBounds(`${year - 1}-01-01`, `${year - 1}-12-31`), nextDisabled: outOfBounds(`${year + 1}-01-01`, `${year + 1}-12-31`),
      onTitle: () => setView('years'), onPrevious: () => go(addMonths(focus, -12), false), onNext: () => go(addMonths(focus, 12), false),
    };
    body = (
      <CellGrid
        label={`Mois de ${year}`}
        cells={cells}
        onPick={month => { moveFocus.current = true; setFocus(clampIso(addMonths(focus, Number(month.slice(5, 7)) - Number(focus.slice(5, 7))), bounds)); setView('days'); }}
      />
    );
  } else {
    const first = blockStart(year);
    const cells: GridCell[] = Array.from({ length: 12 }, (_, index) => {
      const cellYear = first + index;
      return {
        value: String(cellYear), text: String(cellYear), label: String(cellYear), selected: Boolean(value && yearOf(value) === cellYear),
        current: yearOf(today) === cellYear, disabled: outOfBounds(`${cellYear}-01-01`, `${cellYear}-12-31`), focused: cellYear === year,
      };
    });
    header = {
      title: `${first} – ${first + 11}`, titleLabel: `Années ${first} à ${first + 11} : revenir aux jours`, zoomOut: false,
      previousLabel: 'Années précédentes', nextLabel: 'Années suivantes',
      previousDisabled: outOfBounds(`${first - 12}-01-01`, `${first - 1}-12-31`), nextDisabled: outOfBounds(`${first + 12}-01-01`, `${first + 23}-12-31`),
      onTitle: () => setView('days'), onPrevious: () => go(addMonths(focus, -144), false), onNext: () => go(addMonths(focus, 144), false),
    };
    body = (
      <CellGrid
        label={`Années ${first} à ${first + 11}`}
        cells={cells}
        onPick={picked => { moveFocus.current = true; setFocus(clampIso(withYear(focus, Number(picked)), bounds)); setView('months'); }}
      />
    );
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const cell = (event.target as HTMLElement).closest('[data-calendar-cell]');
    if (event.key === 'Escape' && view !== 'days') {
      // Échap climbs back to the days; in the days view it is left to the popover around (closing it).
      event.preventDefault();
      event.stopPropagation();
      moveFocus.current = true;
      setView('days');
      return;
    }
    if (!cell) return;
    if (event.key === 'Enter') {
      // Handled here so the native click of Entrée does not run as well.
      event.preventDefault();
      (cell as HTMLButtonElement).click();
      return;
    }
    const next = moveFor(view, event.key, event.shiftKey, focus);
    if (!next) return;
    event.preventDefault();
    go(next);
  };

  return (
    <div
      {...props}
      {...componentMarker('Calendar', props)}
      ref={root}
      role="group"
      aria-label={label}
      data-view={view}
      onKeyDown={handleKeyDown}
      className={`mairie-calendar inline-flex flex-col text-[var(--mairie-text)] ${className}`.trim()}
      style={{ width: 280, maxWidth: '100%', ...style }}
    >
      <CalendarHeader {...header} />
      {body}
    </div>
  );
}
