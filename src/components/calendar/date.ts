import type { CalendarDateInput, CalendarEvent, CalendarStat } from './types';

export const parseDateInput = (date: CalendarDateInput = new Date()) => {
  if (date instanceof Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  const dateOnlyMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsedDate = new Date(date);
  return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
};

export const addDays = (date: Date, amount: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
};

export const addMonths = (date: Date, amount: number) => {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + amount);
  return nextDate;
};

export const isSameDay = (dateA: CalendarDateInput, dateB: CalendarDateInput) => {
  const firstDate = parseDateInput(dateA);
  const secondDate = parseDateInput(dateB);

  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
};

export const dateKey = (date: CalendarDateInput) => {
  const parsedDate = parseDateInput(date);
  const year = parsedDate.getFullYear();
  const month = `${parsedDate.getMonth() + 1}`.padStart(2, '0');
  const day = `${parsedDate.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const startOfWeek = (date: Date, weekStartsOn: 0 | 1 = 1) => {
  const nextDate = parseDateInput(date);
  const day = nextDate.getDay();
  const diff = weekStartsOn === 1 ? (day === 0 ? -6 : 1 - day) : -day;
  return addDays(nextDate, diff);
};

export const getWeekDates = (date: Date, weekStartsOn: 0 | 1 = 1) => {
  const weekStart = startOfWeek(date, weekStartsOn);
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
};

export const formatMonthName = (date: CalendarDateInput, locale = 'fr-FR') => {
  const label = new Intl.DateTimeFormat(locale, { month: 'long' }).format(parseDateInput(date));
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export const formatMonthYear = (date: CalendarDateInput, locale = 'fr-FR') => {
  const parsedDate = parseDateInput(date);
  return `${formatMonthName(parsedDate, locale)} ${parsedDate.getFullYear()}`;
};

export const formatFullDate = (date: CalendarDateInput, locale = 'fr-FR') => {
  const parsedDate = parseDateInput(date);
  return `${parsedDate.getDate()} ${formatMonthName(parsedDate, locale)} ${parsedDate.getFullYear()}`;
};

export const eventsByDate = (events: CalendarEvent[] = []) =>
  events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    const key = dateKey(event.date);
    acc[key] = [...(acc[key] || []), event];
    return acc;
  }, {});

export const getMonthCells = (date: CalendarDateInput, weekStartsOn: 0 | 1 = 1) => {
  const parsedDate = parseDateInput(date);
  const firstDay = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1);
  const lastDay = new Date(parsedDate.getFullYear(), parsedDate.getMonth() + 1, 0);
  const leadingDays = weekStartsOn === 1 ? (firstDay.getDay() + 6) % 7 : firstDay.getDay();
  const totalDays = lastDay.getDate();
  const cellsCount = Math.ceil((leadingDays + totalDays) / 7) * 7;

  return Array.from({ length: cellsCount }, (_, index) => {
    const day = index - leadingDays + 1;
    return day >= 1 && day <= totalDays
      ? new Date(parsedDate.getFullYear(), parsedDate.getMonth(), day)
      : null;
  });
};

export const getEventTimeLabel = (event: CalendarEvent) => {
  if (event.startTime && event.endTime) return `${event.startTime} - ${event.endTime}`;
  return event.startTime || event.endTime || null;
};

export const getEventsForSlot = (events: CalendarEvent[], date: Date, time?: string) =>
  events.filter((event) => {
    if (!isSameDay(event.date, date)) return false;
    if (!time) return true;
    return event.startTime === time;
  });

export const getUpcomingEvents = (events: CalendarEvent[] = [], fromDate = new Date()) =>
  [...events]
    .filter((event) => parseDateInput(event.date).getTime() >= parseDateInput(fromDate).getTime())
    .sort((eventA, eventB) => {
      const dateDiff = parseDateInput(eventA.date).getTime() - parseDateInput(eventB.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return (eventA.startTime || '').localeCompare(eventB.startTime || '');
    });

export const getDefaultStats = (events: CalendarEvent[] = [], selectedDate: Date): CalendarStat[] => {
  const monthEvents = events.filter((event) => {
    const eventDate = parseDateInput(event.date);
    return (
      eventDate.getFullYear() === selectedDate.getFullYear() &&
      eventDate.getMonth() === selectedDate.getMonth()
    );
  });

  const weekStart = startOfWeek(selectedDate);
  const weekEnd = addDays(weekStart, 6);
  const weekEvents = events.filter((event) => {
    const eventDateTime = parseDateInput(event.date).getTime();
    return eventDateTime >= weekStart.getTime() && eventDateTime <= weekEnd.getTime();
  });

  const dayEvents = events.filter((event) => isSameDay(event.date, selectedDate));

  return [
    { label: 'Ce mois', value: `${monthEvents.length} événement${monthEvents.length > 1 ? 's' : ''}` },
    { label: 'Cette semaine', value: `${weekEvents.length} événement${weekEvents.length > 1 ? 's' : ''}` },
    { label: "Aujourd'hui", value: `${dayEvents.length} événement${dayEvents.length > 1 ? 's' : ''}` },
  ];
};
