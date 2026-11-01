import { render, screen } from '@testing-library/react';
import { LinkButton } from './LinkButton';

describe('LinkButton (MAIR-608)', () => {
  it('renders an anchor with an href and a button without', () => {
    const { rerender } = render(<LinkButton href="/projets" label="Voir les projets" />);
    expect(screen.getByRole('link', { name: 'Voir les projets' })).toHaveAttribute('href', '/projets');
    rerender(<LinkButton label="Voir les projets" />);
    expect(screen.getByRole('button', { name: 'Voir les projets' })).toBeInTheDocument();
  });
});
