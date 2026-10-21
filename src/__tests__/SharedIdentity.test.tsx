import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';

import { Avatar, initialsOf } from '../components/Avatar';
import { Spinner } from '../components/Spinner';
import { UserIdentity } from '../components/UserIdentity';
import { AvatarStack } from '../components/AvatarStack';
import { SessionExpiredNotice } from '../components/SessionExpiredNotice';
import { PendingFeatureNotice } from '../components/PendingFeatureNotice';

it('shows the photo, falls back to initials on the avatar scale after a failed load', () => {
  expect(initialsOf('Marie Martin')).toBe('MM'); expect(initialsOf('marie.martin@mairie.fr')).toBe('MM'); expect(initialsOf('')).toBe('?');
  const { container } = render(<Avatar src="/marie.png" alt="Marie Martin" size="l" />);
  expect(screen.getByRole('img', { name: 'Marie Martin' })).toHaveAttribute('src', '/marie.png');
  fireEvent.error(screen.getByRole('img'));
  expect(screen.getByRole('img', { name: 'Marie Martin' })).toHaveTextContent('MM');
  expect((container.firstChild as HTMLElement).style.width).toBe('var(--mairie-avatar-l)');
});

it('keeps the spinner decorative unless a label is announced', () => {
  const { rerender } = render(<Spinner size="s" />);
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  rerender(<Spinner label="Enregistrement en cours" />);
  expect(screen.getByRole('status')).toHaveTextContent('Enregistrement en cours');
});

it('renders a person one way everywhere and stacks avatars with an accessible « +n »', async () => {
  const { container, rerender } = render(<UserIdentity name="Marie Martin" email="marie.martin@mairie.fr" size="l" />);
  expect(screen.getByText('Marie Martin')).toBeInTheDocument(); expect(screen.getByText('marie.martin@mairie.fr')).toBeInTheDocument();
  rerender(<UserIdentity name="Marie Martin" email="marie.martin@mairie.fr" variant="photo" />);
  expect(screen.queryByText('marie.martin@mairie.fr')).not.toBeInTheDocument(); expect(screen.getByRole('img', { name: 'Marie Martin' })).toBeInTheDocument();
  rerender(<AvatarStack label="Membres du projet" max={2} people={[{ name: 'Marie Martin' }, { name: 'Paul Durand' }, { name: 'Léa Petit' }, { name: 'Ali Ben' }]} />);
  expect(screen.getByRole('list', { name: 'Membres du projet' }).children).toHaveLength(3);
  expect(screen.getByText('+2').parentElement).toHaveAttribute('aria-label', '2 autres personnes : Léa Petit, Ali Ben');
  expect((await axe(container)).violations).toEqual([]);
});

it('words the expired session and the pending feature the same way in every front', () => {
  const reconnect = jest.fn();
  const { rerender } = render(<SessionExpiredNotice loginHref="https://login.example/?next=%2Fprojets" />);
  expect(screen.getByRole('alert')).toHaveTextContent('Votre session a expiré');
  expect(screen.getByRole('link', { name: 'Se reconnecter' })).toHaveAttribute('href', 'https://login.example/?next=%2Fprojets');
  rerender(<SessionExpiredNotice onReconnect={reconnect} />);
  fireEvent.click(screen.getByRole('button', { name: 'Se reconnecter' })); expect(reconnect).toHaveBeenCalled();
  rerender(<PendingFeatureNotice feature="Pièces jointes" />);
  expect(screen.getByRole('region', { name: 'Pièces jointes : bientôt disponible' })).toHaveTextContent('prochaine version');
});
