import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { UserIdentity } from './UserIdentity';

it('renders a person one way everywhere', async () => {
  const { container, rerender } = render(<UserIdentity name="Marie Martin" email="marie.martin@mairie.fr" size="l" />);
  expect(screen.getByText('Marie Martin')).toBeInTheDocument(); expect(screen.getByText('marie.martin@mairie.fr')).toBeInTheDocument();
  rerender(<UserIdentity name="Marie Martin" email="marie.martin@mairie.fr" variant="photo" />);
  expect(screen.queryByText('marie.martin@mairie.fr')).not.toBeInTheDocument(); expect(screen.getByRole('img', { name: 'Marie Martin' })).toBeInTheDocument();
  expect((await axe(container)).violations).toEqual([]);
});
