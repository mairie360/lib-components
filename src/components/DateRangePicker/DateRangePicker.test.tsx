import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';

import { DateRangePicker, dateRangePresets } from '.';

// MAIR-1099: Figma `DateRangePicker`. Today is fixed to Thursday 3 December 2026.
beforeEach(() => {
  jest.useFakeTimers({ advanceTimers: true });
  jest.setSystemTime(new Date(2026, 11, 3, 10, 0));
});
afterEach(() => jest.useRealTimers());

const trigger = () => screen.getByRole('button', { name: /^Période,/ });
const dialog = () => screen.getByRole('dialog', { name: 'Période : choisir une période' });
const day = (name: string) => within(dialog()).getByRole('button', { name: new RegExp(`^${name}`) });
const summary = () => dialog().querySelector('[data-range-summary]');
const apply = () => screen.getByRole('button', { name: 'Appliquer' });

describe('MAIR-1099 dateRangePresets', () => {
  it('computes the default periods from today', () => {
    expect(dateRangePresets('2026-12-03').map(({ label, start, end }) => [label, start, end])).toEqual([
      ['Aujourd’hui', '2026-12-03', '2026-12-03'],
      ['7 derniers jours', '2026-11-27', '2026-12-03'],
      ['30 derniers jours', '2026-11-04', '2026-12-03'],
      ['Ce mois-ci', '2026-12-01', '2026-12-31'],
      ['Mois dernier', '2026-11-01', '2026-11-30'],
      ['Mois prochain', '2027-01-01', '2027-01-31'],
      ['Cette année', '2026-01-01', '2026-12-31'],
    ]);
    expect(dateRangePresets()[0].start).toBe('2026-12-03');
  });
});

describe('MAIR-1099 DateRangePicker', () => {
  it('writes the chosen period and its number of days', async () => {
    const { container } = render(<DateRangePicker label="Période" defaultValue={{ start: '2026-12-03', end: '2026-12-09' }} startName="du" endName="au" />);
    expect(trigger()).toHaveAccessibleName('Période, 3 – 9 déc. 2026, 7 jours');
    expect(container.querySelector('[data-format="long"]')).toHaveTextContent('3 – 9 déc. 2026 · 7 jours');
    expect(container.querySelector('[data-format="short"]')).toHaveTextContent('3 – 9 déc. 2026');
    expect(container.querySelector('input[name="du"]')).toHaveValue('2026-12-03');
    expect(container.querySelector('input[name="au"]')).toHaveValue('2026-12-09');
    expect(container.firstElementChild).toHaveAttribute('data-m360-component', 'DateRangePicker Field');
    expect((await axe(container)).violations).toEqual([]);
  });

  it('chooses the start, previews on hover, then the end, and applies', async () => {
    const onChange = jest.fn();
    const { container } = render(<DateRangePicker label="Période" onChange={onChange} />);
    expect(trigger()).toHaveAccessibleName('Période, aucune période choisie');
    fireEvent.click(trigger());
    expect(summary()).toHaveTextContent('Choisissez la date de début');
    expect(apply()).toBeDisabled();
    fireEvent.click(day('lundi 7 décembre'));
    expect(summary()).toHaveTextContent('7 déc. 2026 · choisissez la date de fin');
    fireEvent.mouseEnter(day('jeudi 10 décembre'));
    expect(day('jeudi 10 décembre 2026, fin envisagée')).toHaveClass('outline-dashed');
    expect(day('mardi 8 décembre').closest('[role="gridcell"]')).toHaveAttribute('data-range', 'middle');
    fireEvent.mouseEnter(day('vendredi 4 décembre'));
    expect(day('mardi 8 décembre').closest('[role="gridcell"]')).not.toHaveAttribute('data-range');
    fireEvent.click(day('dimanche 13 décembre'));
    expect(summary()).toHaveTextContent('7 – 13 déc. 2026 · 7 jours');
    expect(onChange).not.toHaveBeenCalled();
    expect((await axe(container)).violations).toEqual([]);
    fireEvent.click(apply());
    expect(onChange).toHaveBeenCalledWith({ start: '2026-12-07', end: '2026-12-13' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger());
    expect(trigger()).toHaveAccessibleName('Période, 7 – 13 déc. 2026, 7 jours');
  });

  it('starts again when the second day is before the first, or after a complete period', () => {
    render(<DateRangePicker label="Période" />);
    fireEvent.click(trigger());
    fireEvent.click(day('jeudi 10 décembre'));
    fireEvent.click(day('lundi 7 décembre'));
    expect(summary()).toHaveTextContent('7 déc. 2026 · choisissez la date de fin');
    fireEvent.click(day('mardi 8 décembre'));
    fireEvent.click(day('mardi 15 décembre'));
    expect(summary()).toHaveTextContent('15 déc. 2026 · choisissez la date de fin');
    fireEvent.click(day('mardi 15 décembre'));
    expect(summary()).toHaveTextContent('15 déc. 2026 · 1 jour');
  });

  it('applies a preset, moves the calendar to it and presses it', () => {
    const onChange = jest.fn();
    render(<DateRangePicker label="Période" onChange={onChange} />);
    fireEvent.click(trigger());
    const presets = within(dialog()).getByRole('group', { name: 'Périodes prédéfinies' });
    expect(within(presets).getAllByRole('button').map(button => button.textContent)).toEqual(['Aujourd’hui', '7 derniers jours', '30 derniers jours', 'Ce mois-ci', 'Mois dernier', 'Mois prochain', 'Cette année']);
    fireEvent.click(within(presets).getByRole('button', { name: 'Mois prochain' }));
    expect(within(presets).getByRole('button', { name: 'Mois prochain' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(dialog()).getByRole('grid', { name: 'janvier 2027' })).toBeInTheDocument();
    expect(summary()).toHaveTextContent('1 – 31 janv. 2027 · 31 jours');
    fireEvent.click(apply());
    expect(onChange).toHaveBeenCalledWith({ start: '2027-01-01', end: '2027-01-31' });
  });

  it('disables the presets and days outside min / max', () => {
    render(<DateRangePicker label="Période" min="2026-12-01" max="2026-12-31" disabledDates={iso => iso === '2026-12-25'} />);
    fireEvent.click(trigger());
    expect(screen.getByRole('button', { name: 'Ce mois-ci' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '7 derniers jours' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Mois prochain' })).toBeDisabled();
    expect(day('vendredi 25 décembre')).toHaveAttribute('aria-disabled', 'true');
  });

  it('clears with Effacer and stays open', () => {
    const onChange = jest.fn();
    render(<DateRangePicker label="Période" defaultValue={{ start: '2026-12-03', end: '2026-12-09' }} onChange={onChange} />);
    fireEvent.click(trigger());
    expect(summary()).toHaveTextContent('3 – 9 déc. 2026 · 7 jours');
    fireEvent.click(screen.getByRole('button', { name: 'Effacer' }));
    expect(onChange).toHaveBeenCalledWith(null);
    expect(dialog()).toBeInTheDocument();
    expect(summary()).toHaveTextContent('Choisissez la date de début');
    expect(screen.getByRole('button', { name: 'Effacer' })).toBeDisabled();
    expect(trigger()).toHaveAccessibleName('Période, aucune période choisie');
  });

  it('closes on Échap without applying, and reopens on the applied period', () => {
    const onChange = jest.fn();
    render(<DateRangePicker label="Période" defaultValue={{ start: '2026-12-03', end: '2026-12-09' }} onChange={onChange} />);
    fireEvent.click(trigger());
    expect(document.activeElement).toHaveAccessibleName(/^jeudi 3 décembre/);
    fireEvent.click(day('lundi 14 décembre'));
    act(() => { fireEvent.keyDown(document.activeElement!, { key: 'Escape' }); });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger());
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(trigger());
    expect(summary()).toHaveTextContent('3 – 9 déc. 2026 · 7 jours');
  });

  it('clears from the field, hides the presets on demand and ignores an inverted value', () => {
    const onChange = jest.fn();
    const { rerender } = render(<DateRangePicker label="Période" defaultValue={{ start: '2026-12-03', end: '2026-12-09' }} presets={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Effacer la période « Période »' }));
    expect(onChange).toHaveBeenCalledWith(null);
    expect(document.activeElement).toBe(trigger());
    fireEvent.keyDown(trigger(), { key: 'ArrowDown' });
    expect(within(dialog()).queryByRole('group', { name: 'Périodes prédéfinies' })).toBeNull();
    rerender(<DateRangePicker label="Période" value={{ start: '2026-12-09', end: '2026-12-03' }} />);
    expect(trigger()).toHaveAccessibleName('Période, aucune période choisie');
  });
});
