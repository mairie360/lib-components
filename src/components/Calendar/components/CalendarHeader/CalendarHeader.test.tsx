import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { CalendarHeader } from './CalendarHeader';

describe('MAIR-1099 CalendarHeader', () => {
  it('names the title and the arrows in French and calls them back', () => {
    const onTitle = jest.fn();
    const onPrevious = jest.fn();
    const onNext = jest.fn();
    render(<CalendarHeader title="décembre 2026" titleLabel="décembre 2026 : choisir un autre mois" zoomOut previousLabel="Mois précédent" nextLabel="Mois suivant" previousDisabled={false} nextDisabled onTitle={onTitle} onPrevious={onPrevious} onNext={onNext} />);
    fireEvent.click(screen.getByRole('button', { name: 'décembre 2026 : choisir un autre mois' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mois précédent' }));
    expect(screen.getByRole('button', { name: 'Mois suivant' })).toBeDisabled();
    expect(onTitle).toHaveBeenCalledTimes(1);
    expect(onPrevious).toHaveBeenCalledTimes(1);
    expect(onNext).not.toHaveBeenCalled();
    expect(screen.getByText('décembre 2026')).toHaveClass('first-letter:uppercase');
  });

  it('turns the chevron over when the title goes back to the days', () => {
    const { container } = render(<CalendarHeader title="2016 – 2027" titleLabel="Années 2016 à 2027 : revenir aux jours" zoomOut={false} previousLabel="Années précédentes" nextLabel="Années suivantes" previousDisabled={false} nextDisabled={false} onTitle={jest.fn()} onPrevious={jest.fn()} onNext={jest.fn()} />);
    expect(container.querySelector('svg')).toHaveClass('rotate-180');
  });
});
