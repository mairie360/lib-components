// The published `shared` entry holds the instance time zone set by the front's InstanceProvider.
import { getInstanceTimeZone } from '@mairie360/lib-components/shared';

const isoDateTime = /^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):([0-5]\d):([0-5]\d)(?:\.\d+)?(?:Z|[+-](?:0\d|1[0-4]):[0-5]\d)$/;

/**
 * Strict ISO 8601 parse shared by the state, the timer and the date column, so the
 * three never disagree: `NaN` when missing, non-ISO, or an impossible calendar day
 * (Date would roll "2026-02-30" over to March).
 */
export function parseSessionTimestamp(value: string | null | undefined): number {
  if (!value) return NaN;
  const match = isoDateTime.exec(value);
  if (!match) return NaN;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
  if (!daysInMonth || day < 1 || day > daysInMonth) return NaN;
  return Date.parse(value);
}

/**
 * Format a BFF timestamp in the instance time zone; an invalid or missing value is
 * reported, never guessed (same strict parser as the state badge).
 */
export function formatSessionDate(value: string | null | undefined, timeZone = getInstanceTimeZone()): string | null {
  const epoch = parseSessionTimestamp(value);
  if (!Number.isFinite(epoch)) return null;
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short', timeZone }).format(new Date(epoch));
}
