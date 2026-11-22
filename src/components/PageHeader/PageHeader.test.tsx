import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';

import { PageHeader } from './PageHeader';

describe('PageHeader (MAIR-608)', () => {
  it('renders the h1, the subtitle or today’s date, and the actions', () => {
    const { rerender } = render(<PageHeader title="Projets" subtitle="Suivi des dossiers" actions={<button>Nouveau projet</button>} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Projets' })).toBeInTheDocument(); expect(screen.getByText('Suivi des dossiers')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nouveau projet' })).toBeInTheDocument();
    rerender(<PageHeader title="Tableau de bord" subtitle="Bienvenue Marie" showDate />);
    expect(document.querySelector('.page-current-date')).toBeInTheDocument(); expect(screen.getByText('Bienvenue Marie')).toBeInTheDocument();
    expect(screen.getByRole('heading').parentElement!.parentElement).toHaveAttribute('data-variant', 'with-date');
  });

  it('MAIR-1113 welcome variant: a single 34 px bold h1 at -2 % and a 14 px muted subtitle', async () => {
    const { container } = render(<PageHeader variant="welcome" title="Bonjour Marie" subtitle="Voici ce qui vous attend aujourd’hui." showDate />);
    const headings = screen.getAllByRole('heading');
    expect(headings).toHaveLength(1);
    const title = screen.getByRole('heading', { level: 1, name: 'Bonjour Marie' });
    expect(title.style.fontSize).toBe('34px');
    expect(title.style.letterSpacing).toBe('-0.02em');
    expect(title).toHaveClass('font-bold');
    const subtitle = screen.getByText('Voici ce qui vous attend aujourd’hui.');
    expect(subtitle).toHaveAttribute('data-size', 's');
    expect(subtitle).toHaveAttribute('data-tone', 'muted');
    expect(subtitle.style.marginTop).toBe('2px');
    expect(container.firstElementChild).toHaveAttribute('data-variant', 'welcome');
    expect((await axe(container)).violations).toEqual([]);
  });
});
