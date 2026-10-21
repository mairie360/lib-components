import { render, screen } from '@testing-library/react';
import { Calendar } from 'lucide-react';
import { sizes } from '../../kit/theme';
import { Icon } from './Icon';

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
