import { fireEvent, render, screen } from '@testing-library/react';
import { Avatar, avatarColourOf, avatarColours, initialsOf } from './Avatar';

it('shows the photo, falls back to initials on the avatar scale after a failed load', () => {
  expect(initialsOf('Marie Martin')).toBe('MM'); expect(initialsOf('marie.martin@mairie.fr')).toBe('MM'); expect(initialsOf('')).toBe('?');
  const { container } = render(<Avatar src="/marie.png" alt="Marie Martin" size="l" />);
  expect(screen.getByRole('img', { name: 'Marie Martin' })).toHaveAttribute('src', '/marie.png');
  fireEvent.error(screen.getByRole('img'));
  expect(screen.getByRole('img', { name: 'Marie Martin' })).toHaveTextContent('MM');
  expect((container.firstChild as HTMLElement).style.width).toBe('var(--mairie-avatar-l)');
});

it('gives initials a stable module colour derived from the name', () => {
  expect(avatarColourOf('Marie Martin')).toBe(avatarColourOf('  marie martin '));
  expect(avatarColours).toContain(avatarColourOf('Marie Martin'));
  const colours = new Set(['Marie Martin', 'Jean Dupont', 'Sophie Bernard', 'Luc Moreau', 'Anne Petit', 'Paul Roux', 'Claire Fournier', 'Hugo Girard'].map(avatarColourOf));
  expect(colours.size).toBeGreaterThan(2);
  render(<Avatar alt="Marie Martin" />);
  const fallback = screen.getByRole('img', { name: 'Marie Martin' });
  expect(fallback).toHaveAttribute('data-colour', avatarColourOf('Marie Martin'));
  expect(fallback.style.backgroundColor).toBe(`var(--mairie-module-${avatarColourOf('Marie Martin')})`);
  expect(fallback.style.color).toBe(`var(--mairie-on-avatar-${avatarColourOf('Marie Martin')})`);
});
