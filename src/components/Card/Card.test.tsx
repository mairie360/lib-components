import { render, screen } from '@testing-library/react';
import { Card } from './Card';
it('presents caller content under its supplied section heading without an empty heading', () => {
  const { rerender } = render(<Card title="Compte"><p>Profil confirmé</p></Card>); expect(screen.getByRole('heading', { name: 'Compte' })).toBeVisible(); expect(screen.getByText('Profil confirmé')).toBeVisible(); rerender(<Card><p>Contenu</p></Card>); expect(screen.queryByRole('heading')).not.toBeInTheDocument();
});
