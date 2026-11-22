import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { RangeFooter } from './RangeFooter';

describe('MAIR-1099 RangeFooter', () => {
  it('announces the summary politely and runs Effacer / Appliquer', () => {
    const onClear = jest.fn();
    const onApply = jest.fn();
    const { container } = render(<RangeFooter summary="3 – 9 déc. 2026" detail="7 jours" canApply canClear onClear={onClear} onApply={onApply} />);
    const live = container.querySelector('[aria-live="polite"]');
    expect(live).toHaveTextContent('3 – 9 déc. 2026 · 7 jours');
    expect(live?.querySelector('strong')).toHaveTextContent('3 – 9 déc. 2026');
    fireEvent.click(screen.getByRole('button', { name: 'Effacer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Appliquer' }));
    expect(onClear).toHaveBeenCalled();
    expect(onApply).toHaveBeenCalled();
  });

  it('disables the actions until they make sense', () => {
    render(<RangeFooter summary="" detail="Choisissez la date de début" canApply={false} canClear={false} onClear={jest.fn()} onApply={jest.fn()} />);
    expect(screen.getByText('Choisissez la date de début')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Appliquer' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Effacer' })).toBeDisabled();
  });
});
