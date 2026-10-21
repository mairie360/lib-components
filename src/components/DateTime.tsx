'use client';

import React from 'react';

import { getInstanceTimeZone } from '@mairie360/lib-components/shared';
import { Caption, Text, type TextProps } from './Text';

export type DateTimeFormat = 'short' | 'medium' | 'long' | 'relative' | 'dateOnly';
export interface DateTimeProps extends Omit<TextProps, 'as' | 'children' | 'dateTime'> {
  /** ISO 8601 string, Date or epoch ms; an invalid value renders « Indisponible ». */
  value: string | number | Date | null | undefined;
  format?: DateTimeFormat;
  /** Reference time for `relative`; defaults to now. */
  now?: Date;
  timeZone?: string;
  unavailableText?: string;
}
const options: Record<Exclude<DateTimeFormat, 'relative'>, Intl.DateTimeFormatOptions> = {
  short: { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' },
  medium: { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' },
  long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' },
  dateOnly: { day: 'numeric', month: 'long', year: 'numeric' },
};
export function parseDateValue(value: DateTimeProps['value']): Date | null {
  if (value === null || value === undefined || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
/** French relative wording (« il y a 5 min », « dans 2 jours »), capped at days. */
export function formatRelative(date: Date, now = new Date()): string {
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000); const abs = Math.abs(seconds);
  const relative = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });
  if (abs < 45) return relative.format(0, 'second').replace(/^maintenant$/, 'à l’instant');
  if (abs < 3600) return relative.format(Math.round(seconds / 60), 'minute');
  if (abs < 86400) return relative.format(Math.round(seconds / 3600), 'hour');
  return relative.format(Math.round(seconds / 86400), 'day');
}
export function formatDateTime(value: DateTimeProps['value'], format: DateTimeFormat = 'medium', timeZone = getInstanceTimeZone(), now?: Date): string | null {
  const date = parseDateValue(value); if (!date) return null;
  if (format === 'relative') return formatRelative(date, now);
  return new Intl.DateTimeFormat('fr-FR', { ...options[format], timeZone }).format(date);
}

/** A date or time in the instance time zone (MAIR-608, Figma `Base/DateTime`); machine-readable `<time>`. */
export const DateTime = ({ value, format = 'medium', now, timeZone, unavailableText = 'Indisponible', size = 's', tone = 'default', ...props }: DateTimeProps) => {
  const date = parseDateValue(value);
  if (!date) return <Caption {...props} data-format="unavailable" size={size}>{unavailableText}</Caption>;
  const text = formatDateTime(date, format, timeZone, now)!;
  const title = format === 'relative' ? formatDateTime(date, 'long', timeZone)! : undefined;
  return <Text {...props} as="time" size={size} tone={tone} dateTime={date.toISOString()} title={title} data-format={format}>{text}</Text>;
};
