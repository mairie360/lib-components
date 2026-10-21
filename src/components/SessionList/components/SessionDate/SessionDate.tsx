import { formatSessionDate } from '../../session-dates';

// The date column: the reported timestamp or « Date indisponible », never a guessed value.
export function SessionDate({ value, timeZone }: { value: string | null | undefined; timeZone?: string }) {
  const label = formatSessionDate(value, timeZone);
  return label && value ? <time dateTime={value}>{label}</time> : <span>Date indisponible</span>;
}
