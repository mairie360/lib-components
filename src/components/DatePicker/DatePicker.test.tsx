import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';

import { DatePicker, datePickerShortcuts, useDatePopover } from '.';

// MAIR-1099: Figma `DatePicker`. Today is fixed to Thursday 3 December 2026.
beforeEach(() => {
  jest.useFakeTimers({ advanceTimers: true });
  jest.setSystemTime(new Date(2026, 11, 3, 10, 0));
});
afterEach(() => jest.useRealTimers());

const trigger = () => screen.getByRole('button', { name: /^Date de début,/ });
const dialog = () => screen.getByRole('dialog', { name: 'Date de début : choisir une date' });
const open = () => fireEvent.click(trigger());

describe('MAIR-1099 datePickerShortcuts', () => {
  it('computes today, tomorrow, next Monday and a week later', () => {
    expect(datePickerShortcuts('2026-12-03').map(({ label, value }) => [label, value])).toEqual([
      ['Aujourd’hui', '2026-12-03'], ['Demain', '2026-12-04'], ['Lundi prochain', '2026-12-07'], ['Dans une semaine', '2026-12-10'],
    ]);
    // On a Monday, « Lundi prochain » is the one after.
    expect(datePickerShortcuts('2026-12-07')[2].value).toBe('2026-12-14');
    expect(datePickerShortcuts()[0].value).toBe('2026-12-03');
  });
});

describe('MAIR-1099 DatePicker', () => {
  it('writes the chosen date in full and in short, labelled through Field', async () => {
    const { container } = render(<DatePicker label="Date de début" hint="Premier jour du chantier" defaultValue="2026-12-08" />);
    expect(trigger()).toHaveAccessibleName('Date de début, mardi 8 décembre 2026');
    expect(screen.getByLabelText('Date de début, mardi 8 décembre 2026')).toBe(trigger());
    expect(container.querySelector('[data-format="long"]')).toHaveTextContent('mardi 8 décembre 2026');
    expect(container.querySelector('[data-format="short"]')).toHaveTextContent('8 déc. 2026');
    expect(trigger()).toHaveAccessibleDescription('Premier jour du chantier');
    expect(trigger()).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(container.firstElementChild).toHaveAttribute('data-m360-component', 'DatePicker Field');
    expect((await axe(container)).violations).toEqual([]);
  });

  it('shows the placeholder without a value and can force one format', () => {
    const { container, rerender } = render(<DatePicker label="Date de début" />);
    expect(trigger()).toHaveAccessibleName('Date de début, aucune date choisie');
    expect(trigger()).toHaveTextContent('Choisir une date');
    expect(screen.queryByRole('button', { name: /Effacer/ })).toBeNull();
    rerender(<DatePicker label="Date de début" value="2026-12-08" display="short" />);
    expect(container.querySelector('[data-format="long"]')).toHaveClass('hidden');
    expect(container.querySelector('[data-format="short"]')).toHaveClass('inline');
  });

  it('opens a dialog with the shortcuts and the calendar, focus on the chosen day', async () => {
    const { container } = render(<DatePicker label="Date de début" defaultValue="2026-12-08" />);
    open();
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(trigger()).toHaveAttribute('aria-controls', dialog().id);
    const shortcuts = within(dialog()).getByRole('group', { name: 'Raccourcis' });
    expect(within(shortcuts).getAllByRole('button').map(button => button.textContent)).toEqual(['Aujourd’hui', 'Demain', 'Lundi prochain', 'Dans une semaine']);
    expect(within(dialog()).getByRole('grid', { name: 'décembre 2026' })).toBeInTheDocument();
    expect(document.activeElement).toHaveAccessibleName(/^mardi 8 décembre 2026/);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('chooses a day, closes and gives the focus back to the field', () => {
    const onChange = jest.fn();
    render(<DatePicker label="Date de début" onChange={onChange} />);
    open();
    fireEvent.click(within(dialog()).getByRole('button', { name: /^mardi 15 décembre 2026/ }));
    expect(onChange).toHaveBeenCalledWith('2026-12-15');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger());
    expect(trigger()).toHaveAccessibleName('Date de début, mardi 15 décembre 2026');
  });

  it('applies a shortcut and marks it pressed', () => {
    const onChange = jest.fn();
    render(<DatePicker label="Date de début" onChange={onChange} />);
    open();
    fireEvent.click(screen.getByRole('button', { name: 'Lundi prochain' }));
    expect(onChange).toHaveBeenCalledWith('2026-12-07');
    open();
    expect(screen.getByRole('button', { name: 'Lundi prochain' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('disables the shortcuts and days outside min / max and the disabled dates', () => {
    render(<DatePicker label="Date de début" min="2026-12-05" max="2026-12-20" disabledDates={['2026-12-10']} />);
    open();
    expect(screen.getByRole('button', { name: 'Aujourd’hui' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Demain' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Lundi prochain' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Dans une semaine' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /^lundi 21 décembre/ })).toHaveAttribute('aria-disabled', 'true');
    // The focus starts inside the bounds.
    expect(document.activeElement).toHaveAccessibleName(/^samedi 5 décembre/);
  });

  it('closes on Échap back to the trigger, without choosing', () => {
    const onChange = jest.fn();
    render(<DatePicker label="Date de début" onChange={onChange} />);
    open();
    act(() => { fireEvent.keyDown(document.activeElement!, { key: 'Escape' }); });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger());
    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps the popover open when Échap only leaves the months view', () => {
    render(<DatePicker label="Date de début" />);
    open();
    const title = screen.getByRole('button', { name: 'décembre 2026 : choisir un autre mois' });
    fireEvent.click(title);
    act(() => title.focus());
    act(() => { fireEvent.keyDown(title, { key: 'Escape' }); });
    expect(dialog()).toBeInTheDocument();
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('opens with ↓, closes on a click outside or when the focus leaves', () => {
    render(<><DatePicker label="Date de début" /><button type="button">Ailleurs</button></>);
    fireEvent.keyDown(trigger(), { key: 'ArrowDown' });
    expect(dialog()).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('dialog')).toBeNull();
    open();
    fireEvent.blur(document.activeElement!, { relatedTarget: screen.getByRole('button', { name: 'Ailleurs' }) });
    expect(screen.queryByRole('dialog')).toBeNull();
    open();
    fireEvent.click(trigger());
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('clears the value with its button and refocuses the field', () => {
    const onChange = jest.fn();
    const { container } = render(<DatePicker label="Date de début" name="start" defaultValue="2026-12-08" onChange={onChange} />);
    expect(container.querySelector('input[type="hidden"]')).toHaveValue('2026-12-08');
    fireEvent.click(screen.getByRole('button', { name: 'Effacer la date « Date de début »' }));
    expect(onChange).toHaveBeenCalledWith(null);
    expect(document.activeElement).toBe(trigger());
    expect(container.querySelector('input[type="hidden"]')).toHaveValue('');
    expect(trigger()).toHaveAccessibleName('Date de début, aucune date choisie');
  });

  it('stays controlled', () => {
    const onChange = jest.fn();
    render(<DatePicker label="Date de début" value="2026-12-08" onChange={onChange} />);
    open();
    fireEvent.click(screen.getByRole('button', { name: /^mercredi 9 décembre/ }));
    expect(onChange).toHaveBeenCalledWith('2026-12-09');
    expect(trigger()).toHaveAccessibleName('Date de début, mardi 8 décembre 2026');
  });

  it('opens on the years for a birth date, without shortcuts', () => {
    render(<DatePicker label="Date de naissance" startView="years" shortcuts={false} max="2026-12-03" />);
    fireEvent.click(screen.getByRole('button', { name: /^Date de naissance,/ }));
    expect(screen.queryByRole('group', { name: 'Raccourcis' })).toBeNull();
    expect(screen.getByRole('group', { name: 'Années 2016 à 2027' })).toBeInTheDocument();
  });

  it('shows the error, the required marker and stays shut when disabled', () => {
    const { rerender } = render(<DatePicker label="Date de début" error="Choisissez une date." required />);
    const required = screen.getByRole('button', { name: 'Date de début (obligatoire), aucune date choisie' });
    expect(required).toHaveAttribute('data-invalid', 'true');
    expect(required).toHaveAttribute('data-required', 'true');
    expect(required).toHaveAccessibleDescription('Choisissez une date.');
    expect(screen.getByRole('alert')).toHaveTextContent('Choisissez une date.');
    rerender(<DatePicker label="Date de début" disabled defaultValue="2026-12-08" />);
    expect(trigger()).toBeDisabled();
    expect(screen.queryByRole('button', { name: /Effacer/ })).toBeNull();
  });

  it('ignores a value that is not an ISO day', () => {
    render(<DatePicker label="Date de début" value="08/12/2026" />);
    expect(trigger()).toHaveAccessibleName('Date de début, aucune date choisie');
  });
});

describe('MAIR-1099 useDatePopover', () => {
  function Probe({ disabled }: { disabled: boolean }) {
    const popover = useDatePopover(disabled);
    return <button type="button" ref={popover.trigger} onClick={popover.toggle}>{popover.open ? 'ouvert' : 'fermé'}</button>;
  }
  it('never opens while disabled and closes when disabled', () => {
    const { rerender } = render(<Probe disabled={false} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('ouvert');
    rerender(<Probe disabled />);
    expect(screen.getByRole('button')).toHaveTextContent('fermé');
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('fermé');
  });
});
