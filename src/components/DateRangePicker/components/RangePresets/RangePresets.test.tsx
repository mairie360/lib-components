import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { RangePresets } from './RangePresets';

const presets = [{ id: 'a', label: 'Ce mois-ci', start: '2026-12-01', end: '2026-12-31' }, { id: 'b', label: 'Mois prochain', start: '2027-01-01', end: '2027-01-31' }];

describe('MAIR-1099 RangePresets', () => {
  it('presses the preset of the period and refuses a disabled one', () => {
    const onPick = jest.fn();
    render(<RangePresets presets={presets} start="2026-12-01" end="2026-12-31" isDisabled={preset => preset.id === 'b'} onPick={onPick} />);
    expect(screen.getByRole('group', { name: 'Périodes prédéfinies' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ce mois-ci' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Mois prochain' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Ce mois-ci' }));
    expect(onPick).toHaveBeenCalledWith(presets[0]);
  });
});
