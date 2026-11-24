import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';

import {
  Calendar, addDays, addMonths, clampIso, formatDateRange, formatDayCount, formatFullDate, formatMonthYear, formatShortDate, isDateDisabled,
  monthWeeks, parseIsoDate, rangeDayCount, startOfWeek, toIsoDate, weekdayIndex,
} from '.';

// MAIR-1099: Figma `Calendar`, `Calendar/Day`, `Calendar/Cell`. Today is fixed to Thursday 3 December 2026.
beforeEach(() => {
  jest.useFakeTimers({ advanceTimers: true });
  jest.setSystemTime(new Date(2026, 11, 3, 10, 0));
});
afterEach(() => jest.useRealTimers());

const day = (name: string) => screen.getByRole('button', { name: new RegExp(`^${name}`) });
const focused = () => document.activeElement as HTMLElement;
const key = (keyName: string, init: Partial<KeyboardEventInit> = {}) => act(() => { fireEvent.keyDown(focused(), { key: keyName, ...init }); });

describe('MAIR-1099 calendar dates', () => {
  it('parses and writes ISO days in local time, refusing impossible days', () => {
    expect(toIsoDate(parseIsoDate('2026-12-03')!)).toBe('2026-12-03');
    expect(parseIsoDate('2026-02-30')).toBeNull();
    expect(parseIsoDate('03/12/2026')).toBeNull();
    expect(parseIsoDate(null)).toBeNull();
    expect(toIsoDate(parseIsoDate('0042-01-05')!)).toBe('0042-01-05');
  });

  it('adds days and months, clamping to the end of the month', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonths('2028-01-31', 1)).toBe('2028-02-29');
    expect(addMonths('2026-12-15', -12)).toBe('2025-12-15');
  });

  it('starts the week on Monday and lays out six weeks', () => {
    expect(weekdayIndex('2026-11-30')).toBe(0);
    expect(weekdayIndex('2027-01-10')).toBe(6);
    expect(startOfWeek('2026-12-03')).toBe('2026-11-30');
    const weeks = monthWeeks('2026-12-03');
    expect(weeks).toHaveLength(6);
    expect(weeks[0][0]).toBe('2026-11-30');
    expect(weeks[5][6]).toBe('2027-01-10');
  });

  it('writes the dates in French', () => {
    expect(formatFullDate('2026-12-03')).toBe('jeudi 3 décembre 2026');
    expect(formatFullDate('2026-12-01')).toBe('mardi 1er décembre 2026');
    expect(formatShortDate('2026-12-03')).toBe('3 déc. 2026');
    expect(formatMonthYear('2026-08-10')).toBe('août 2026');
    expect(formatDateRange('2026-12-03', '2026-12-09')).toBe('3 – 9 déc. 2026');
    expect(formatDateRange('2026-11-28', '2026-12-03')).toBe('28 nov. – 3 déc. 2026');
    expect(formatDateRange('2026-12-28', '2027-01-03')).toBe('28 déc. 2026 – 3 janv. 2027');
    expect(formatDateRange('2026-12-03', '2026-12-03')).toBe('3 déc. 2026');
    expect(formatFullDate('nope')).toBe('');
  });

  it('counts the days of a period, both ends included, across a time change', () => {
    expect(rangeDayCount('2026-12-03', '2026-12-09')).toBe(7);
    expect(rangeDayCount('2026-03-28', '2026-03-30')).toBe(3);
    expect(formatDayCount(1)).toBe('1 jour');
    expect(formatDayCount(7)).toBe('7 jours');
  });

  it('refuses days outside the bounds or listed, and clamps into the bounds', () => {
    const bounds = { min: '2026-12-02', max: '2026-12-20', disabledDates: ['2026-12-10'] };
    expect(isDateDisabled('2026-12-01', bounds)).toBe(true);
    expect(isDateDisabled('2026-12-21', bounds)).toBe(true);
    expect(isDateDisabled('2026-12-10', bounds)).toBe(true);
    expect(isDateDisabled('2026-12-11', bounds)).toBe(false);
    expect(isDateDisabled('2026-12-12', { disabledDates: iso => weekdayIndex(iso) >= 5 })).toBe(true);
    expect(clampIso('2026-11-01', bounds)).toBe('2026-12-02');
    expect(clampIso('2027-01-01', bounds)).toBe('2026-12-20');
  });
});

describe('MAIR-1099 Calendar', () => {
  it('shows the month as a French grid from Monday, today and the chosen day marked', async () => {
    const { container } = render(<Calendar value="2026-12-08" />);
    const grid = screen.getByRole('grid', { name: 'décembre 2026' });
    const headers = within(grid).getAllByRole('columnheader');
    expect(headers.map(header => header.querySelector('.sr-only')?.textContent)).toEqual(['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']);
    expect(within(grid).getAllByRole('row')).toHaveLength(7);
    const today = day('jeudi 3 décembre 2026, aujourd’hui');
    expect(today).toHaveAttribute('aria-current', 'date');
    const chosen = day('mardi 8 décembre 2026');
    expect(chosen.closest('[role="gridcell"]')).toHaveAttribute('aria-selected', 'true');
    expect(chosen).toHaveClass('mairie-calendar-pick');
    // Roving tab stop on the chosen day.
    expect(chosen).toHaveAttribute('tabindex', '0');
    expect(today).toHaveAttribute('tabindex', '-1');
    expect(day('lundi 30 novembre 2026')).toHaveAttribute('data-outside', 'true');
    expect(screen.getByRole('group', { name: 'Calendrier' })).toHaveAttribute('data-m360-component', 'Calendar');
    expect((await axe(container)).violations).toEqual([]);
  });

  it('chooses a day on click and with Entrée, never a disabled one', () => {
    const onChange = jest.fn();
    render(<Calendar onChange={onChange} min="2026-12-02" disabledDates={['2026-12-10']} />);
    fireEvent.click(day('vendredi 4 décembre 2026'));
    expect(onChange).toHaveBeenLastCalledWith('2026-12-04');
    const struck = day('jeudi 10 décembre 2026');
    expect(struck).toHaveAttribute('aria-disabled', 'true');
    expect(struck).toHaveClass('line-through');
    fireEvent.click(struck);
    fireEvent.click(day('mardi 1er décembre 2026'));
    expect(onChange).toHaveBeenCalledTimes(1);
    act(() => day('vendredi 11 décembre 2026').focus());
    key('Enter');
    expect(onChange).toHaveBeenLastCalledWith('2026-12-11');
  });

  it('moves with the arrows, Page préc./suiv. (Maj = year) and Début / Fin', () => {
    render(<Calendar value="2026-12-03" autoFocus />);
    expect(focused()).toHaveAccessibleName(/^jeudi 3 décembre 2026/);
    key('ArrowRight');
    expect(focused()).toHaveAccessibleName(/^vendredi 4 décembre/);
    key('ArrowDown');
    expect(focused()).toHaveAccessibleName(/^vendredi 11 décembre/);
    key('ArrowUp');
    key('ArrowLeft');
    expect(focused()).toHaveAccessibleName(/^jeudi 3 décembre/);
    key('Home');
    expect(focused()).toHaveAccessibleName(/^lundi 30 novembre/);
    key('End');
    expect(focused()).toHaveAccessibleName(/^dimanche 6 décembre/);
    key('PageDown');
    expect(focused()).toHaveAccessibleName(/^mercredi 6 janvier 2027/);
    expect(screen.getByRole('grid', { name: 'janvier 2027' })).toBeInTheDocument();
    key('PageUp', { shiftKey: true });
    expect(focused()).toHaveAccessibleName(/^mardi 6 janvier 2026/);
    key('PageUp');
    expect(focused()).toHaveAccessibleName(/^samedi 6 décembre 2025/);
  });

  it('keeps the focus inside min / max and disables the arrows beyond them', () => {
    render(<Calendar value="2026-12-30" min="2026-12-01" max="2026-12-31" autoFocus />);
    key('ArrowDown');
    expect(focused()).toHaveAccessibleName(/^jeudi 31 décembre/);
    key('PageDown');
    expect(focused()).toHaveAccessibleName(/^jeudi 31 décembre/);
    expect(screen.getByRole('button', { name: 'Mois suivant' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Mois précédent' })).toBeDisabled();
    expect(day('lundi 30 novembre 2026')).toHaveAttribute('aria-disabled', 'true');
  });

  it('changes month with the arrows of the header', () => {
    render(<Calendar value="2026-12-03" />);
    fireEvent.click(screen.getByRole('button', { name: 'Mois suivant' }));
    expect(screen.getByRole('grid', { name: 'janvier 2027' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mois précédent' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mois précédent' }));
    expect(screen.getByRole('grid', { name: 'novembre 2026' })).toBeInTheDocument();
  });

  it('zooms out to the months and the years, and Échap comes back to the days', () => {
    render(<Calendar value="2026-12-03" />);
    fireEvent.click(screen.getByRole('button', { name: 'décembre 2026 : choisir un autre mois' }));
    const months = screen.getByRole('group', { name: 'Mois de 2026' });
    expect(within(months).getAllByRole('button')).toHaveLength(12);
    expect(within(months).getByRole('button', { name: 'décembre 2026' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(months).getByRole('button', { name: 'décembre 2026' })).toHaveAttribute('aria-current', 'date');
    fireEvent.click(screen.getByRole('button', { name: 'Année 2026 : choisir une autre année' }));
    const years = screen.getByRole('group', { name: 'Années 2016 à 2027' });
    fireEvent.click(within(years).getByRole('button', { name: '2020' }));
    expect(screen.getByRole('group', { name: 'Mois de 2020' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'mars 2020' }));
    expect(screen.getByRole('grid', { name: 'mars 2020' })).toBeInTheDocument();
    expect(focused()).toHaveAccessibleName(/^mardi 3 mars 2020/);
    const title = screen.getByRole('button', { name: 'mars 2020 : choisir un autre mois' });
    fireEvent.click(title);
    act(() => title.focus());
    key('Escape');
    expect(focused()).toHaveAccessibleName(/^mardi 3 mars 2020/);
    expect(screen.getByRole('grid', { name: 'mars 2020' })).toBeInTheDocument();
  });

  it('opens on the years for a birth date and moves in the cells with the keyboard', () => {
    const onChange = jest.fn();
    render(<Calendar defaultView="years" defaultMonth="1990-06-15" max="2026-12-03" onChange={onChange} autoFocus />);
    expect(screen.getByRole('group', { name: 'Années 1980 à 1991' })).toBeInTheDocument();
    expect(focused()).toHaveAccessibleName('1990');
    key('ArrowLeft');
    expect(focused()).toHaveAccessibleName('1989');
    key('ArrowUp');
    expect(focused()).toHaveAccessibleName('1986');
    key('Home');
    expect(focused()).toHaveAccessibleName('1980');
    key('End');
    expect(focused()).toHaveAccessibleName('1991');
    key('PageUp');
    expect(screen.getByRole('group', { name: 'Années 1968 à 1979' })).toBeInTheDocument();
    key('Enter');
    expect(screen.getByRole('group', { name: 'Mois de 1979' })).toBeInTheDocument();
    expect(focused()).toHaveAccessibleName('juin 1979');
    key('ArrowRight');
    key('ArrowDown');
    expect(focused()).toHaveAccessibleName('octobre 1979');
    key('End');
    expect(focused()).toHaveAccessibleName('décembre 1979');
    key('PageDown');
    expect(focused()).toHaveAccessibleName('décembre 1980');
    key('Enter');
    key('Enter');
    expect(onChange).toHaveBeenCalledWith('1980-12-15');
  });

  it('disables the months and years outside the bounds', () => {
    render(<Calendar defaultView="months" value="2026-12-03" min="2026-03-10" max="2027-02-01" />);
    expect(screen.getByRole('button', { name: 'février 2026' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: 'mars 2026' })).not.toHaveAttribute('aria-disabled');
    expect(screen.getByRole('button', { name: 'Année précédente' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Année 2026 : choisir une autre année' }));
    expect(screen.getByRole('button', { name: '2025' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: '2027' })).not.toHaveAttribute('aria-disabled');
    expect(screen.getByRole('button', { name: 'Années suivantes' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Années précédentes' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Années 2016 à 2027 : revenir aux jours' }));
    expect(screen.getByRole('grid', { name: 'décembre 2026' })).toBeInTheDocument();
  });

  it('puts a dot under the days with events', () => {
    render(<Calendar events={['2026-12-15', '2026-12-03']} />);
    expect(day('mardi 15 décembre 2026, événement prévu').querySelector('[data-event-dot]')).not.toBeNull();
    expect(day('jeudi 3 décembre 2026, aujourd’hui, événement prévu')).toBeInTheDocument();
    expect(day('mercredi 16 décembre 2026').querySelector('[data-event-dot]')).toBeNull();
  });

  it('paints a period and its preview, and reports the hovered day', () => {
    const onDayHover = jest.fn();
    const { rerender } = render(<Calendar rangeStart="2026-12-03" rangeEnd="2026-12-09" onDayHover={onDayHover} />);
    expect(day('jeudi 3 décembre 2026, aujourd’hui, début de la période').closest('[role="gridcell"]')).toHaveAttribute('data-range', 'start');
    expect(day('lundi 7 décembre').closest('[role="gridcell"]')).toHaveAttribute('data-range', 'middle');
    expect(day('mercredi 9 décembre 2026, fin de la période').closest('[role="gridcell"]')).toHaveAttribute('aria-selected', 'true');
    expect(day('jeudi 10 décembre').closest('[role="gridcell"]')).toHaveAttribute('aria-selected', 'false');
    fireEvent.mouseEnter(day('vendredi 11 décembre'));
    expect(onDayHover).toHaveBeenLastCalledWith('2026-12-11');
    fireEvent.mouseLeave(screen.getByRole('grid'));
    expect(onDayHover).toHaveBeenLastCalledWith(null);
    rerender(<Calendar rangeStart="2026-12-09" rangeEnd="2026-12-03" rangePreview />);
    const end = day('mercredi 9 décembre 2026, fin envisagée');
    expect(end).toHaveClass('outline-dashed');
    expect(end).not.toHaveClass('mairie-calendar-pick');
    rerender(<Calendar rangeStart="2026-12-05" rangeEnd="2026-12-05" />);
    expect(day('samedi 5 décembre').closest('[role="gridcell"]')).toHaveAttribute('data-range', 'single');
  });

  it('moves twelve years at a time in the years view', () => {
    render(<Calendar defaultView="years" value="2026-12-03" />);
    fireEvent.click(screen.getByRole('button', { name: 'Années suivantes' }));
    expect(screen.getByRole('group', { name: 'Années 2028 à 2039' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Années précédentes' }));
    fireEvent.click(screen.getByRole('button', { name: 'Années précédentes' }));
    expect(screen.getByRole('group', { name: 'Années 2004 à 2015' })).toBeInTheDocument();
  });

  it('follows a value set from outside', () => {
    const { rerender } = render(<Calendar value="2026-12-03" />);
    rerender(<Calendar value="2027-03-01" />);
    expect(screen.getByRole('grid', { name: 'mars 2027' })).toBeInTheDocument();
  });
});
