import { fireEvent, render, screen } from '@testing-library/react';
import { Avatar, initialsOf } from './Avatar';

it('shows the photo, falls back to initials on the avatar scale after a failed load', () => {
  expect(initialsOf('Marie Martin')).toBe('MM'); expect(initialsOf('marie.martin@mairie.fr')).toBe('MM'); expect(initialsOf('')).toBe('?');
  const { container } = render(<Avatar src="/marie.png" alt="Marie Martin" size="l" />);
  expect(screen.getByRole('img', { name: 'Marie Martin' })).toHaveAttribute('src', '/marie.png');
  fireEvent.error(screen.getByRole('img'));
  expect(screen.getByRole('img', { name: 'Marie Martin' })).toHaveTextContent('MM');
  expect((container.firstChild as HTMLElement).style.width).toBe('var(--mairie-avatar-l)');
});
