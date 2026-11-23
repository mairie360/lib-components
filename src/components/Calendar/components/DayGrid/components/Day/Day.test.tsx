import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { Day, type DayProps } from './Day';

const props = (extra: Partial<DayProps> = {}): DayProps => ({ iso: '2026-12-03', dayNumber: 3, label: 'jeudi 3 décembre 2026', inMonth: true, today: false, selected: false, disabled: false, hasEvent: false, focused: false, onSelect: jest.fn(), ...extra });
const button = () => screen.getByRole('button');

describe('MAIR-1099 Day', () => {
  it('rings today and fills the chosen day', () => {
    const { rerender } = render(<Day {...props({ today: true })} />);
    expect(button()).toHaveAttribute('aria-current', 'date');
    expect(button().className).toContain('shadow-[inset_0_0_0_1.5px_var(--mairie-accent)]');
    rerender(<Day {...props({ selected: true })} />);
    expect(button()).toHaveClass('mairie-calendar-pick');
    expect(screen.getByRole('gridcell')).toHaveAttribute('aria-selected', 'true');
  });

  it('strikes a disabled day through and refuses it', () => {
    const onSelect = jest.fn();
    render(<Day {...props({ disabled: true, onSelect })} />);
    expect(button()).toHaveClass('line-through');
    fireEvent.click(button());
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('paints the period band and a dot for events', () => {
    const { rerender } = render(<Day {...props({ rangePosition: 'start', hasEvent: true })} />);
    expect(screen.getByRole('gridcell').style.background).toContain('linear-gradient');
    expect(button().querySelector('[data-event-dot]')).toHaveClass('bg-[var(--mairie-on-action)]');
    rerender(<Day {...props({ rangePosition: 'middle', hasEvent: true })} />);
    expect(screen.getByRole('gridcell').style.background).toBe('var(--mairie-accent-surface)');
    expect(button().querySelector('[data-event-dot]')).toHaveClass('bg-[var(--mairie-accent)]');
    rerender(<Day {...props({ rangePosition: 'end', preview: true })} />);
    expect(button()).toHaveClass('outline-dashed');
  });

  it('reports hover and focus, and muted days of the other months', () => {
    const onHover = jest.fn();
    render(<Day {...props({ inMonth: false, onHover })} />);
    fireEvent.focus(button());
    expect(onHover).toHaveBeenCalledWith('2026-12-03');
    expect(button()).toHaveAttribute('data-outside', 'true');
    expect(button()).toHaveClass('text-[var(--mairie-muted)]');
  });
});
