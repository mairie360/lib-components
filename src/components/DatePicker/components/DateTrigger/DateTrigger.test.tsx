import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Calendar } from 'lucide-react';

import { DateTrigger, type DateTriggerProps } from './DateTrigger';

const props = (extra: Partial<DateTriggerProps> = {}): DateTriggerProps => ({
  id: 'debut', icon: Calendar, name: 'Début, jeudi 3 décembre 2026', longText: 'jeudi 3 décembre 2026', shortText: '3 déc. 2026', placeholder: 'Choisir une date',
  display: 'auto', open: false, controls: 'debut-popover', disabled: false, invalid: false, required: false, size: 'm', clearLabel: 'Effacer la date',
  onToggle: jest.fn(), onOpen: jest.fn(), onClear: jest.fn(), triggerRef: React.createRef(), ...extra,
});

describe('MAIR-1099 DateTrigger', () => {
  it('switches between the full and the short text with a container query', () => {
    const { container } = render(<DateTrigger {...props()} />);
    expect(container.firstElementChild).toHaveClass('@container');
    expect(container.querySelector('[data-format="long"]')).toHaveClass('hidden', '@[15rem]:inline');
    expect(container.querySelector('[data-format="short"]')).toHaveClass('inline', '@[15rem]:hidden');
  });

  it('toggles on click, opens on ↓ and clears with its button', () => {
    const p = props();
    render(<DateTrigger {...p} />);
    const button = screen.getByRole('button', { name: 'Début, jeudi 3 décembre 2026' });
    fireEvent.click(button);
    fireEvent.keyDown(button, { key: 'ArrowDown' });
    fireEvent.keyDown(button, { key: 'ArrowUp' });
    fireEvent.click(screen.getByRole('button', { name: 'Effacer la date' }));
    expect(p.onToggle).toHaveBeenCalledTimes(1);
    expect(p.onOpen).toHaveBeenCalledTimes(1);
    expect(p.onClear).toHaveBeenCalledTimes(1);
  });

  it('shows the placeholder and no clear button when empty, and the open look', () => {
    render(<DateTrigger {...props({ longText: '', shortText: '', open: true, size: 'l' })} />);
    expect(screen.getByRole('button')).toHaveTextContent('Choisir une date');
    expect(screen.getByRole('button')).toHaveAttribute('data-open', 'true');
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});
