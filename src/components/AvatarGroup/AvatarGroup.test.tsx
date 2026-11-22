import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';

import { AvatarGroup } from './AvatarGroup';

const people = [{ name: 'Marie Martin' }, { name: 'Paul Durand' }, { name: 'Léa Petit' }, { name: 'Ali Ben' }];

// MAIR-1153: Figma `AvatarGroup`, with or without the total, static or a button / link.
describe('MAIR-1153 AvatarGroup', () => {
  it('lists three avatars and « +n » by default, through AvatarStack', async () => {
    const { container } = render(<AvatarGroup people={people} />);
    const list = screen.getByRole('list', { name: '4 membres' });
    expect(list).toHaveAttribute('data-m360-component', 'AvatarStack');
    expect(list.children).toHaveLength(4);
    expect(within(list).getByText('+1')).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute('data-m360-component', 'AvatarGroup');
    expect(list.children[1]).toHaveClass('-ml-2');
    expect(list.querySelector('[data-slot="avatar"]')).toHaveClass('ring-2', 'ring-[var(--mairie-surface)]');
    expect((await axe(container)).violations).toEqual([]);
  });

  it('is one button « 6 membres, gérer les membres » with the total, avatars decorative', async () => {
    const onClick = jest.fn();
    const { container } = render(<AvatarGroup people={people} count={6} size="s" onClick={onClick} />);
    const button = screen.getByRole('button', { name: '6 membres, gérer les membres' });
    expect(within(button).getByText('6')).toHaveAttribute('aria-hidden', 'true');
    expect(button.querySelector('ul')).toHaveAttribute('aria-hidden', 'true');
    expect(button.querySelectorAll('li')).toHaveLength(3);
    expect(button).toHaveAttribute('data-size', 's');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('is a link with href, and takes a custom name', () => {
    render(<AvatarGroup people={people.slice(0, 1)} href="/groupes/3/membres" label="Membres du service urbanisme" />);
    expect(screen.getByRole('link', { name: 'Membres du service urbanisme' })).toHaveAttribute('href', '/groupes/3/membres');
  });

  it('says « 1 membre » in the singular', () => {
    render(<AvatarGroup people={people.slice(0, 1)} />);
    expect(screen.getByRole('list', { name: '1 membre' })).toBeInTheDocument();
  });
});
