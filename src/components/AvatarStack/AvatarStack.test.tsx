import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { AvatarStack } from './AvatarStack';

it('stacks avatars with an accessible « +n »', async () => {
  const { container } = render(<AvatarStack label="Membres du projet" max={2} people={[{ name: 'Marie Martin' }, { name: 'Paul Durand' }, { name: 'Léa Petit' }, { name: 'Ali Ben' }]} />);
  expect(screen.getByRole('list', { name: 'Membres du projet' }).children).toHaveLength(3);
  expect(screen.getByText('+2').parentElement).toHaveAttribute('aria-label', '2 autres personnes : Léa Petit, Ali Ben');
  expect((await axe(container)).violations).toEqual([]);
});
