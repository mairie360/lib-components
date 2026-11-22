import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';

import { CellGrid } from './CellGrid';

const cell = (value: string, extra = {}) => ({ value, text: value, label: value, selected: false, current: false, disabled: false, focused: false, ...extra });

describe('MAIR-1099 CellGrid', () => {
  it('lays the cells out in a named group and sends the picked value', () => {
    const onPick = jest.fn();
    render(<CellGrid label="Années 2016 à 2027" cells={[cell('2016'), cell('2017', { focused: true }), cell('2018', { disabled: true })]} onPick={onPick} />);
    const group = screen.getByRole('group', { name: 'Années 2016 à 2027' });
    expect(group).toHaveClass('grid-cols-3');
    fireEvent.click(within(group).getByRole('button', { name: '2017' }));
    fireEvent.click(within(group).getByRole('button', { name: '2018' }));
    expect(onPick).toHaveBeenCalledTimes(1);
    expect(onPick).toHaveBeenCalledWith('2017');
  });
});
