import { render, screen } from '@testing-library/react';
import { sizes } from '../../kit/theme';
import { Logo } from './Logo';

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
