import { render, screen } from '@testing-library/react';
import { PendingFeatureNotice } from './PendingFeatureNotice';

it('words the pending feature the same way in every front', () => {
  render(<PendingFeatureNotice feature="Pièces jointes" />);
  expect(screen.getByRole('region', { name: 'Pièces jointes : bientôt disponible' })).toHaveTextContent('prochaine version');
});
