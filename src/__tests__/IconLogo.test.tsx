import React from 'react';
import { render, screen } from '@testing-library/react';
import { Calendar } from 'lucide-react';
import '@testing-library/jest-dom';

import { Icon } from '../components/Icon';
import { Logo } from '../components/Logo';
import { sizes } from '../kit/theme';

describe('Icon (MAIR-608)', () => {
  it.each(sizes)('binds the %s size to the shared icon token and stays decorative without a label', (size) => {
    const { container } = render(<Icon icon={Calendar} size={size} />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).not.toHaveAttribute('role');
    expect(svg).toHaveAttribute('data-size', size);
    expect(svg.style.width).toBe(`var(--mairie-icon-${size})`);
    expect(svg.style.height).toBe(`var(--mairie-icon-${size})`);
  });

  it('exposes an accessible name when labelled and defaults to size m', () => {
    render(<Icon icon={Calendar} label="Calendrier" className="text-[var(--mairie-accent)]" />);
    const icon = screen.getByRole('img', { name: 'Calendrier' });
    expect(icon).toHaveAttribute('data-size', 'm');
    expect(icon).toHaveClass('mairie-icon', 'text-[var(--mairie-accent)]');
  });
});

describe('Logo (MAIR-608)', () => {
  it.each(sizes)('renders the bundled asset at the %s charte height', (size) => {
    render(<Logo size={size} />);
    const logo = screen.getByRole('img', { name: 'Mairie 360' });
    expect(logo.getAttribute('src')).toBeTruthy(); // the bundled PNG (a data URL in dist, a stub under Jest)
    expect(logo.style.height).toBe(`var(--mairie-logo-${size})`);
  });

  it('accepts a front-served asset and a decorative repeat', () => {
    const { container } = render(<Logo src="/mairie360-logo.png" alt="" size="xl" />);
    const logo = container.querySelector('img')!;
    expect(logo).toHaveAttribute('src', '/mairie360-logo.png');
    expect(logo).toHaveAttribute('alt', '');
    expect(screen.queryByRole('img')).toBeNull();
  });
});
