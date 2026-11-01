import { render, screen } from '@testing-library/react';
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
});
