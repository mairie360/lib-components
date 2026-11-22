/**
 * Date maths of Calendar, DatePicker and DateRangePicker (MAIR-1099). Calendar days only, in local time:
 * values travel as ISO `YYYY-MM-DD` strings, never through `Date.toISOString()` (which shifts to UTC and
 * can move the day). No dependency: native `Date` built from year, month and day.
 */

/** Ways a day can be refused: a list of ISO days or a predicate. */
export type DisabledDates = readonly string[] | ((iso: string) => boolean);

export interface DateBounds {
  /** First selectable day (ISO), included. */
  min?: string | null;
  /** Last selectable day (ISO), included. */
  max?: string | null;
  disabledDates?: DisabledDates;
}

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

/** French month names, January first (« janvier »…). */
export const frenchMonths = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'] as const;
/** French weekday names, Monday first (the French week). */
export const frenchWeekdays = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] as const;
/** Abbreviations of the column headers, Monday first. */
export const frenchWeekdayInitials = ['L', 'M', 'M', 'J', 'V', 'S', 'D'] as const;
const shortMonths = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'] as const;

/** Parses `YYYY-MM-DD` as a local date at midnight; null for anything else or an impossible day (2026-02-30). */
export function parseIsoDate(value: string | null | undefined): Date | null {
  const match = value ? ISO.exec(value) : null;
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day);
  date.setFullYear(year); // years 0–99 would otherwise be read as 1900–1999
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

/** ISO `YYYY-MM-DD` of a local date. */
export function toIsoDate(date: Date): string {
  const pad = (value: number, length = 2) => String(value).padStart(length, '0');
  return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Today in local time, as ISO. */
export const todayIso = (now: Date = new Date()) => toIsoDate(now);

const fromParts = (year: number, month: number, day: number) => {
  const date = new Date(year, month, day);
  date.setFullYear(year, month, day);
  return date;
};

/** `days` days after (or before, when negative) an ISO day. */
export function addDays(iso: string, days: number): string {
  const date = parseIsoDate(iso)!;
  return toIsoDate(fromParts(date.getFullYear(), date.getMonth(), date.getDate() + days));
}

const daysInMonth = (year: number, month: number) => fromParts(year, month + 1, 0).getDate();

/** Same day `months` months later, clamped to the end of the target month (31 janvier + 1 mois = 28/29 février). */
export function addMonths(iso: string, months: number): string {
  const date = parseIsoDate(iso)!;
  const target = fromParts(date.getFullYear(), date.getMonth() + months, 1);
  return toIsoDate(fromParts(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), daysInMonth(target.getFullYear(), target.getMonth()))));
}

/** Monday of the week of an ISO day. */
export function startOfWeek(iso: string): string {
  return addDays(iso, -weekdayIndex(iso));
}

/** 0 for Monday … 6 for Sunday. */
export function weekdayIndex(iso: string): number {
  return (parseIsoDate(iso)!.getDay() + 6) % 7;
}

/** First day of the month of an ISO day. */
export const startOfMonth = (iso: string) => `${iso.slice(0, 8)}01`;
/** Last day of the month of an ISO day. */
export function endOfMonth(iso: string): string {
  const date = parseIsoDate(iso)!;
  return toIsoDate(fromParts(date.getFullYear(), date.getMonth(), daysInMonth(date.getFullYear(), date.getMonth())));
}

/** The 6 weeks × 7 days (Monday first) shown for the month of an ISO day: same height whatever the month. */
export function monthWeeks(iso: string): string[][] {
  const first = startOfWeek(startOfMonth(iso));
  return Array.from({ length: 6 }, (_, week) => Array.from({ length: 7 }, (_, day) => addDays(first, week * 7 + day)));
}

/** Number of calendar days from `start` to `end`, both included (3 → 9 déc. = 7). */
export function rangeDayCount(start: string, end: string): number {
  const [a, b] = [parseIsoDate(start)!, parseIsoDate(end)!];
  return Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86_400_000) + 1;
}

/** ISO strings compare as text; the smaller one first. */
export const minIso = (a: string, b: string) => (a <= b ? a : b);
export const maxIso = (a: string, b: string) => (a >= b ? a : b);

/** Day outside `min`/`max` or listed / matched by `disabledDates`. */
export function isDateDisabled(iso: string, { min, max, disabledDates }: DateBounds = {}): boolean {
  if (min && iso < min) return true;
  if (max && iso > max) return true;
  if (!disabledDates) return false;
  return typeof disabledDates === 'function' ? disabledDates(iso) : disabledDates.includes(iso);
}

/** Brings an ISO day back inside `min`/`max` (keyboard focus never leaves the bounds). */
export function clampIso(iso: string, { min, max }: DateBounds = {}): string {
  if (min && iso < min) return min;
  if (max && iso > max) return max;
  return iso;
}

/** Date written in full: « jeudi 3 décembre 2026 » (« 1er » on the first of the month). */
export function formatFullDate(iso: string): string {
  const date = parseIsoDate(iso);
  if (!date) return '';
  const day = date.getDate();
  return `${frenchWeekdays[weekdayIndex(iso)]} ${day === 1 ? '1er' : day} ${frenchMonths[date.getMonth()]} ${date.getFullYear()}`;
}

/** Short form for narrow fields: « 3 déc. 2026 ». */
export function formatShortDate(iso: string): string {
  const date = parseIsoDate(iso);
  return date ? `${date.getDate()} ${shortMonths[date.getMonth()]} ${date.getFullYear()}` : '';
}

/** Title of a month: « décembre 2026 ». */
export function formatMonthYear(iso: string): string {
  const date = parseIsoDate(iso);
  return date ? `${frenchMonths[date.getMonth()]} ${date.getFullYear()}` : '';
}

/** A period in short: « 3 – 9 déc. 2026 », « 28 nov. – 3 déc. 2026 », « 28 déc. 2026 – 3 janv. 2027 », or one day. */
export function formatDateRange(start: string, end: string): string {
  const [a, b] = [parseIsoDate(start), parseIsoDate(end)];
  if (!a || !b) return '';
  if (start === end) return formatShortDate(start);
  if (a.getFullYear() !== b.getFullYear()) return `${formatShortDate(start)} – ${formatShortDate(end)}`;
  if (a.getMonth() !== b.getMonth()) return `${a.getDate()} ${shortMonths[a.getMonth()]} – ${formatShortDate(end)}`;
  return `${a.getDate()} – ${formatShortDate(end)}`;
}

/** « 1 jour », « 7 jours ». */
export const formatDayCount = (count: number) => `${count} jour${count > 1 ? 's' : ''}`;
