import { fireEvent, render, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Users } from 'lucide-react';
import { MetricCard } from './MetricCard';

describe('MetricCard (MAIR-608)', () => {
  it('names a metric card, shows its trend and a skeleton while loading', () => {
    const { rerender } = render(<MetricCard label="Utilisateurs actifs" value="1 284" icon={Users} trend="up" trendLabel="+12 % ce mois" />);
    const card = screen.getByRole('group', { name: 'Utilisateurs actifs' });
    expect(card).toHaveAttribute('data-trend', 'up'); expect(within(card).getByText('1 284')).toBeInTheDocument(); expect(within(card).getByText('+12 % ce mois')).toBeInTheDocument();
    rerender(<MetricCard label="Utilisateurs actifs" value="1 284" loading />);
    expect(screen.getByRole('group', { name: 'Utilisateurs actifs' })).toHaveAttribute('aria-busy', 'true'); expect(screen.queryByText('1 284')).not.toBeInTheDocument();
  });

  it('MAIR-1117 lays an inline card out as chip, value then label, without trend', async () => {
    const { container } = render(<MetricCard layout="inline" label="Autres appareils connectés" value="2" icon={Users} iconTone="module" iconColor="var(--mairie-warning-text)" trend="up" trendLabel="+1" />);
    const card = screen.getByRole('group', { name: 'Autres appareils connectés' });
    expect(card).toHaveAttribute('data-layout', 'inline');
    expect(card.style.padding).toBe('20px');
    const chip = card.querySelector('[data-m360-component="IconChip"]') as HTMLElement;
    expect(chip).toHaveAttribute('data-size', 'l');
    expect(chip.style.background).toBe('var(--mairie-warning-text)');
    expect(within(card).getByText('2').compareDocumentPosition(within(card).getByText('Autres appareils connectés')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(card).queryByText('+1')).not.toBeInTheDocument();
    expect((await axe(container)).violations).toEqual([]);
  });

  describe('MAIR-1140 clickable card', () => {
    it('is a link named by its visible text, with a decorative chevron', async () => {
      const { container } = render(<MetricCard label="Sessions actives" value={3} href="/sessions" layout="inline" icon={Users} />);
      const link = screen.getByRole('link', { name: '3 Sessions actives' });
      expect(link).toHaveAttribute('href', '/sessions');
      expect(link).toHaveClass('min-h-11', 'hover:shadow-md');
      expect(link.querySelector('[aria-hidden="true"] svg')).not.toBeNull();
      expect((await axe(container)).violations).toEqual([]);
    });

    it('is a toggle button when active is given, with the accent border and surface', async () => {
      const onClick = jest.fn();
      const { container, rerender } = render(<MetricCard label="En retard" value="4" onClick={onClick} active={false} />);
      const button = screen.getByRole('button', { name: 'En retard 4' });
      expect(button).toHaveAttribute('aria-pressed', 'false');
      fireEvent.click(button);
      expect(onClick).toHaveBeenCalledTimes(1);
      rerender(<MetricCard label="En retard" value="4" onClick={onClick} active />);
      expect(button).toHaveAttribute('aria-pressed', 'true');
      expect(button).toHaveClass('border-[var(--mairie-accent)]', 'bg-[var(--mairie-accent-surface)]');
      expect((await axe(container)).violations).toEqual([]);
      rerender(<MetricCard label="En retard" value="4" onClick={onClick} aria-label="Filtrer les tâches en retard" />);
      expect(screen.getByRole('button', { name: 'Filtrer les tâches en retard' })).not.toHaveAttribute('aria-pressed');
    });
  });

  describe('MAIR-1221 RGAA', () => {
    it('a metric card is a named group, not a landmark: a page of counters holds no duplicated landmark (9.2)', async () => {
      const { container } = render(<><MetricCard label="Utilisateurs" value="31" /><MetricCard label="Utilisateurs" value="31" /></>);
      expect(screen.queryByRole('region')).not.toBeInTheDocument();
      expect(screen.getAllByRole('group', { name: 'Utilisateurs' })).toHaveLength(2);
      expect((await axe(container)).violations).toEqual([]);
    });

    it('a clickable card is named by its visible text, so the name contains the visible label (11.9)', async () => {
      const { container } = render(<MetricCard label="Utilisateurs" value="31" trendLabel="dont 2 suspendus" onClick={() => undefined} active />);
      const button = screen.getByRole('button', { name: 'Utilisateurs 31 dont 2 suspendus' });
      expect(button).not.toHaveAttribute('aria-label');
      expect((await axe(container, { rules: { 'label-content-name-mismatch': { enabled: true } } })).violations).toEqual([]);
    });
  });
});

