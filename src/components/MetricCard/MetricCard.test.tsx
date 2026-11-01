import { render, screen, within } from '@testing-library/react';
import { Users } from 'lucide-react';
import { MetricCard } from './MetricCard';

describe('MetricCard (MAIR-608)', () => {
  it('names a metric card, shows its trend and a skeleton while loading', () => {
    const { rerender } = render(<MetricCard label="Utilisateurs actifs" value="1 284" icon={Users} trend="up" trendLabel="+12 % ce mois" />);
    const card = screen.getByRole('region', { name: 'Utilisateurs actifs' });
    expect(card).toHaveAttribute('data-trend', 'up'); expect(within(card).getByText('1 284')).toBeInTheDocument(); expect(within(card).getByText('+12 % ce mois')).toBeInTheDocument();
    rerender(<MetricCard label="Utilisateurs actifs" value="1 284" loading />);
    expect(screen.getByRole('region', { name: 'Utilisateurs actifs' })).toHaveAttribute('aria-busy', 'true'); expect(screen.queryByText('1 284')).not.toBeInTheDocument();
  });
});
