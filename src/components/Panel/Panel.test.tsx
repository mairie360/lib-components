import { fireEvent, render, screen, within } from '@testing-library/react';
import { Panel } from './Panel';

describe('Panel (MAIR-608)', () => {
  it('names the panel by its title, shows the action and swaps the content for a DataState', () => {
    const retry = jest.fn();
    const { rerender } = render(<Panel title="Projets récents" description="Les cinq derniers." action={<button>Voir tout</button>}><p>Contenu</p></Panel>);
    const panel = screen.getByRole('region', { name: 'Projets récents' });
    expect(within(panel).getByRole('heading', { level: 2 })).toHaveTextContent('Projets récents');
    expect(within(panel).getByRole('button', { name: 'Voir tout' })).toBeInTheDocument(); expect(within(panel).getByText('Contenu')).toBeInTheDocument();
    rerender(<Panel title="Projets récents" state="loading"><p>Contenu</p></Panel>);
    expect(screen.getByRole('region', { name: 'Projets récents' })).toHaveAttribute('aria-busy', 'true'); expect(screen.queryByText('Contenu')).not.toBeInTheDocument();
    rerender(<Panel title="Projets récents" state="unavailable" stateProps={{ onRetry: retry }}><p>Contenu</p></Panel>);
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' })); expect(retry).toHaveBeenCalled();
    rerender(<Panel title="Projets récents" state="empty"><p>Contenu</p></Panel>);
    expect(screen.getByText('Aucun élément à afficher.')).toBeInTheDocument();
  });
  it('merges consumer styles (CodeRabbit on #467)', () => {
    render(<Panel title="P" style={{ marginTop: 3 }}><p>x</p></Panel>);
    expect(screen.getByRole('region', { name: 'P' }).style.marginTop).toBe('3px');
  });
});
