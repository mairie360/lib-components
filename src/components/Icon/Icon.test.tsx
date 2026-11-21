import { render, screen } from '@testing-library/react';
import { Calendar } from 'lucide-react';
import { sizes } from '../../kit/theme';
import { Icon, passkeyIcon } from './Icon';
import { icons } from './icons';

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

// MAIR-1071: the passkey glyph is a lucide icon, rendered through Icon.
describe('MAIR-1071 passkeyIcon', () => {
  it('renders as a decorative icon of the shared scale', () => {
    const { container } = render(<Icon icon={passkeyIcon} size="l" />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('data-size', 'l');
  });
});

// MAIR-1108, MAIR-1151: the glyphs published in Figma as Icon/<lucide name>.
describe('MAIR-1151 icons', () => {
  it.each(['camera', 'monitor-smartphone', 'message-square-plus', 'loader-circle', 'users-round', 'building-2', 'at-sign', 'hash'] as const)('renders %s through Icon', name => {
    const { container } = render(<Icon icon={icons[name]} />);
    expect(container.querySelector('svg')).toHaveAttribute('data-size', 'm');
  });

  it('spins the loader only when asked and only without reduced motion', () => {
    const { container } = render(<><Icon icon={icons['loader-circle']} spin label="Envoi en cours" /><Icon icon={icons.ban} /></>);
    const [loader, ban] = container.querySelectorAll('svg');
    expect(loader).toHaveClass('motion-safe:animate-spin');
    expect(loader).toHaveAttribute('data-spin', 'true');
    expect(ban).not.toHaveClass('motion-safe:animate-spin');
  });
});
