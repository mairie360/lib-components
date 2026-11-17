import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';

import { Divider } from './Divider';

// MAIR-1072: Figma `Base/Divider`: plain line, line with a label, vertical line.
describe('MAIR-1072 Divider', () => {
  it('is a plain <hr> without a label', () => {
    const { container } = render(<Divider />);
    const line = container.firstElementChild as HTMLElement;
    expect(line.tagName).toBe('HR');
    expect(line).toHaveAttribute('data-orientation', 'horizontal');
    expect(line).toHaveClass('bg-[var(--mairie-border)]');
  });

  it('shows the label between two lines and names the separator after it', () => {
    render(<Divider label="ou" />);
    const separator = screen.getByRole('separator', { name: 'ou' });
    expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
    expect(separator).toHaveTextContent('ou');
    expect(separator.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(3);
  });

  it('draws a vertical line that stretches in a row', () => {
    render(<Divider orientation="vertical" />);
    const separator = screen.getByRole('separator');
    expect(separator).toHaveAttribute('aria-orientation', 'vertical');
    expect(separator).toHaveClass('w-px', 'self-stretch');
  });

  it('marks its root and keeps the consumer class and style', () => {
    const { container } = render(<Divider label="ou" className="my-4" style={{ maxWidth: 240 }} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute('data-m360-component', 'Divider');
    expect(root).toHaveClass('my-4');
    expect(root).toHaveStyle({ maxWidth: '240px' });
  });

  it('has no accessibility violation with and without a label', async () => {
    const { container } = render(<><Divider /><Divider label="ou" /></>);
    expect((await axe(container)).violations).toEqual([]);
  });
});
