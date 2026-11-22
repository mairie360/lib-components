import { fireEvent, render, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Settings } from 'lucide-react';

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

  describe('MAIR-1114 icon chip, radius 16 and fill', () => {
    it.each(['default', 'loading', 'empty', 'unavailable'] as const)('has the 16 px radius in the %s state', state => {
      render(<Panel title="Sécurité" state={state}><p>x</p></Panel>);
      expect(screen.getByRole('region', { name: 'Sécurité' }).style.borderRadius).toBe('var(--mairie-radius-xl)');
    });
    it('shows a decorative neutral IconChip l left of the title, none without icon', async () => {
      const { container, rerender } = render(<Panel title="Sécurité" description="Mot de passe et double authentification." icon={Settings}><p>x</p></Panel>);
      const chip = container.querySelector('[data-m360-component="IconChip"]') as HTMLElement;
      expect(chip).toHaveAttribute('aria-hidden', 'true');
      expect(chip).toHaveAttribute('data-size', 'l');
      expect(chip).toHaveAttribute('data-tone', 'neutral');
      expect(chip.nextElementSibling).toHaveTextContent('Sécurité');
      expect((await axe(container)).violations).toEqual([]);
      rerender(<Panel title="Sécurité"><p>x</p></Panel>);
      expect(container.querySelector('[data-m360-component="IconChip"]')).toBeNull();
    });
    it('fills its grid row with fill, and stretches the content', () => {
      render(<Panel title="Sécurité" fill><p>x</p></Panel>);
      const panel = screen.getByRole('region', { name: 'Sécurité' });
      expect(panel).toHaveClass('h-full');
      expect(panel).toHaveAttribute('data-fill', 'true');
      expect(screen.getByText('x').parentElement).toHaveClass('flex-1');
    });
  });
});
