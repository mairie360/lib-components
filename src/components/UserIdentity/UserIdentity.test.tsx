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

describe('MAIR-1260 e-mail icon', () => {
  it('adds a mail icon before the e-mail only when asked', () => {
    const { container, rerender } = render(<UserIdentity name="Marie Dubois" email="marie@example.test" />);
    expect(container.querySelectorAll('svg')).toHaveLength(0);
    rerender(<UserIdentity name="Marie Dubois" email="marie@example.test" emailIcon />);
    expect(screen.getByText('marie@example.test')).toBeInTheDocument();
    expect(container.querySelectorAll('svg')).toHaveLength(1);
  });
  it('shows no icon without an e-mail', () => {
    const { container } = render(<UserIdentity name="Marie Dubois" emailIcon />);
    expect(container.querySelectorAll('svg')).toHaveLength(0);
  });
});
