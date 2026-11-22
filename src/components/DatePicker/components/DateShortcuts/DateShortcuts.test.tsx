import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { DateShortcuts } from './DateShortcuts';

describe('MAIR-1099 DateShortcuts', () => {
  it('presses the shortcut of the value, disables refused days and sends the picked day', () => {
    const onPick = jest.fn();
    render(<DateShortcuts shortcuts={[{ id: 'a', label: 'Aujourd’hui', value: '2026-12-03' }, { id: 'b', label: 'Demain', value: '2026-12-04' }, { id: 'c', label: 'Dans une semaine', value: '2026-12-10' }]} value="2026-12-03" isDisabled={iso => iso === '2026-12-10'} onPick={onPick} />);
    expect(screen.getByRole('group', { name: 'Raccourcis' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aujourd’hui' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Demain' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Dans une semaine' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Demain' }));
    expect(onPick).toHaveBeenCalledWith('2026-12-04');
  });
});
