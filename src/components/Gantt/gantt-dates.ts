/** Dates of the planning (MAIR-891): a `YYYY-MM-DD` day or any ISO 8601 instant, or a Date. */
export type GanttDate = Date | string;

const dayOnly = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Epoch of a planning date; a calendar day is read at UTC midnight so it never shifts with the browser zone. */
export function ganttTime(value: GanttDate): number {
  if (value instanceof Date) return value.getTime();
  const day = dayOnly.exec(value);
  return day ? Date.UTC(Number(day[1]), Number(day[2]) - 1, Number(day[3])) : Date.parse(value);
}

/** Position of a date between `from` and `to`, as a percentage clamped to 0–100. */
export function ganttPercent(value: GanttDate, from: GanttDate, to: GanttDate): number {
  const start = ganttTime(from); const span = ganttTime(to) - start;
  if (!(span > 0)) return 0;
  return Math.min(100, Math.max(0, ((ganttTime(value) - start) / span) * 100));
}

/** « 12 nov. 2026 » in UTC, the zone the calendar days are read in. */
export function formatGanttDate(value: GanttDate): string {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(ganttTime(value)));
}

/** First day of each month that overlaps [from, to], with its label (« sept. », « janv. 2027 » on a new year). */
export function ganttMonths(from: GanttDate, to: GanttDate): Array<{ start: number; label: string }> {
  const begin = new Date(ganttTime(from)); const end = ganttTime(to);
  const months: Array<{ start: number; label: string }> = [];
  let cursor = Date.UTC(begin.getUTCFullYear(), begin.getUTCMonth(), 1);
  const firstYear = begin.getUTCFullYear();
  while (cursor < end && months.length < 120) {
    const date = new Date(cursor);
    const label = new Intl.DateTimeFormat('fr-FR', { month: 'short', timeZone: 'UTC', ...(date.getUTCFullYear() !== firstYear && date.getUTCMonth() === 0 ? { year: 'numeric' } : {}) }).format(date);
    months.push({ start: cursor, label });
    cursor = Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
  }
  return months;
}

export type GanttState = 'todo' | 'doing' | 'done' | 'late';
/** Colour and label of each state (Figma `Gantt/Bar`). */
export const ganttStates: Record<GanttState, { label: string; color: string }> = {
  todo: { label: 'À faire', color: 'var(--mairie-border)' },
  doing: { label: 'En cours', color: 'var(--mairie-accent)' },
  done: { label: 'Terminé', color: 'var(--mairie-action-background)' },
  late: { label: 'En retard', color: 'var(--mairie-error-text)' },
};
