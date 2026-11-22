import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';

import { DayGrid } from './DayGrid';

const weekdays = [{ initial: 'L', name: 'lundi' }, { initial: 'M', name: 'mardi' }];
const day = (iso: string, extra = {}) => ({ iso, dayNumber: Number(iso.slice(8)), label: iso, inMonth: true, today: false, selected: false, disabled: false, hasEvent: false, focused: false, ...extra });

describe('MAIR-1099 DayGrid', () => {
  it('renders a named grid with its column headers and reports picks and hovers', () => {
    const onSelect = jest.fn();
    const onHover = jest.fn();
    render(<DayGrid label="décembre 2026" weekdays={weekdays} weeks={[[day('2026-11-30'), day('2026-12-01', { focused: true })]]} onSelect={onSelect} onHover={onHover} />);
    const grid = screen.getByRole('grid', { name: 'décembre 2026' });
    expect(within(grid).getAllByRole('columnheader').map(header => header.textContent)).toEqual(['Llundi', 'Mmardi']);
    expect(within(grid).getAllByRole('gridcell')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: '2026-12-01' }));
    expect(onSelect).toHaveBeenCalledWith('2026-12-01');
    fireEvent.mouseEnter(screen.getByRole('button', { name: '2026-11-30' }));
    expect(onHover).toHaveBeenLastCalledWith('2026-11-30');
    fireEvent.mouseLeave(grid);
    expect(onHover).toHaveBeenLastCalledWith(null);
  });
});
