import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

import { NotificationListItem, notificationLink } from './NotificationListItem';

const now = new Date('2026-11-19T18:00:00');

describe('MAIR-1096 NotificationListItem', () => {
  it('needs clickable and a safe href to be a link', () => {
    expect(notificationLink({ id: 'a', category: 'other', title: 'A', read: false, href: '/a' })).toBeUndefined();
    expect(notificationLink({ id: 'a', category: 'other', title: 'A', read: false, clickable: true, href: '/a' })).toBe('/a');
    expect(notificationLink({ id: 'a', category: 'other', title: 'A', read: false, clickable: true, href: '//evil.example' })).toBeUndefined();
  });

  it('tells an unread row, its module and its relative time', async () => {
    const { container } = render(<ul><NotificationListItem now={now} item={{ id: 'a', category: 'calendar', title: 'Réunion déplacée', message: 'Jeudi à 18 h 30.', read: false, date: '2026-11-19T17:00:00' }} /></ul>);
    const row = screen.getByRole('listitem');
    expect(row).toHaveTextContent('Non lue : Réunion déplacée');
    expect(row).toHaveTextContent('Calendrier');
    expect(row.querySelector('time')).toHaveTextContent('il y a 1 heure');
    // Without onMarkRead there is no button.
    expect(screen.queryByRole('button')).toBeNull();
    expect((await axe(container)).violations).toEqual([]);
  });

  it('keeps the browser navigation without onNavigate and still marks the row read', async () => {
    const user = userEvent.setup(); const markRead = jest.fn();
    render(<ul><NotificationListItem onMarkRead={markRead} item={{ id: 'a', category: 'projects', title: 'Tâche assignée', read: false, clickable: true, href: '/projets/42' }} /></ul>);
    const link = screen.getByRole('link', { name: /Tâche assignée/ });
    expect(link).toHaveAttribute('href', '/projets/42');
    // jsdom cannot navigate: the document stops the default action after the row handled the click.
    let navigated = true;
    const stop = (event: MouseEvent) => { navigated = !event.defaultPrevented; event.preventDefault(); };
    document.addEventListener('click', stop);
    await user.click(link);
    document.removeEventListener('click', stop);
    expect(navigated).toBe(true);
    expect(markRead).toHaveBeenCalledWith(['a']);
  });
});
