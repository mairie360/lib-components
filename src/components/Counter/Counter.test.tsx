import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';

import { Counter, counterText } from './Counter';

// MAIR-1094: Figma `Base/Counter`, a round counter 0–9 and « 9+ » above.
describe('MAIR-1094 Counter', () => {
  it.each([[1, '1'], [9, '9'], [10, '9+'], [120, '9+']])('shows %s as %s', (value, text) => {
    expect(counterText(value)).toBe(text);
    const { container } = render(<Counter value={value} />);
    expect(container.firstElementChild).toHaveTextContent(text);
  });

  it('renders nothing at zero or below', () => {
    const { container } = render(<><Counter value={0} /><Counter value={-2} /><Counter value={Number.NaN} /></>);
    expect(container).toBeEmptyDOMElement();
  });

  it('is decorative without a label and a named status with one, on the counter tokens', async () => {
    const { container } = render(<><Counter value={3} /><Counter value={12} max={99} label="12 notifications non lues" /></>);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    const named = screen.getByRole('status', { name: '12 notifications non lues' });
    expect(named).toHaveTextContent('12');
    expect(named.style.background).toBe('var(--mairie-counter-background)');
    expect(named.style.color).toBe('var(--mairie-on-counter)');
    expect(named).toHaveClass('mairie-counter-pop');
    expect((await axe(container)).violations).toEqual([]);
  });

  it('can skip the pop animation', () => {
    const { container } = render(<Counter value={2} animate={false} />);
    expect(container.firstElementChild).not.toHaveClass('mairie-counter-pop');
  });
});
