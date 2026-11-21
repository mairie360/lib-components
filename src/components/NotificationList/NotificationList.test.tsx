import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

import type { NotificationItem } from '../NotificationCenter';
import { NotificationList } from './NotificationList';
import { groupNotifications, notificationGroup } from './notification-groups';

const now = new Date('2026-11-19T18:00:00');
const items: NotificationItem[] = [
  { id: 'n1', category: 'messages', title: 'Nouveau message de Léa Roux', message: 'Le devis est arrivé.', read: false, clickable: true, href: '/messagerie/lea-roux', date: '2026-11-19T17:46:00' },
  { id: 'n2', category: 'other', title: 'Maintenance ce soir', message: 'Messagerie indisponible de 22 h à 22 h 15.', read: false, date: '2026-11-19T15:40:00' },
  { id: 'n3', category: 'projects', title: 'Devis validé', read: true, clickable: true, href: '/projets/jules-ferry', date: '2026-11-18T09:30:00' },
  { id: 'n4', category: 'calendar', title: 'Invitation acceptée', read: true, href: '/calendrier/commission', date: '2026-10-27T14:20:00' },
];

// MAIR-1096: Figma `NotificationList` and `NotificationList/Item`.
describe('MAIR-1096 NotificationList', () => {
  it('groups by day: Aujourd’hui, Hier, Plus tôt', async () => {
    expect(notificationGroup('2026-11-19T00:10:00', now)).toBe('today');
    expect(notificationGroup('2026-11-18T23:59:00', now)).toBe('yesterday');
    expect(notificationGroup(undefined, now)).toBe('earlier');
    expect(groupNotifications(items, now).map(group => [group.label, group.items.length])).toEqual([['Aujourd’hui', 2], ['Hier', 1], ['Plus tôt', 1]]);
    const { container } = render(<NotificationList items={items} now={now} variant="page" onMarkRead={jest.fn()} />);
    const today = screen.getByRole('group', { name: 'Aujourd’hui' });
    expect(within(today).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('group', { name: 'Hier' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Plus tôt' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Notifications' })).toHaveAttribute('data-variant', 'page');
    expect(screen.getByRole('status', { name: '2 notifications non lues' })).toHaveTextContent('2');
    expect((await axe(container)).violations).toEqual([]);
  });

  it('makes a row a link only when it is clickable with a safe href; a click navigates and marks it read', async () => {
    const user = userEvent.setup(); const navigate = jest.fn(); const markRead = jest.fn();
    render(<NotificationList items={items} now={now} onNavigate={navigate} onMarkRead={markRead} />);
    const links = screen.getAllByRole('link');
    // n4 has an href but is not clickable: plain row.
    expect(links).toHaveLength(2);
    await user.click(screen.getByRole('link', { name: /Nouveau message de Léa Roux/ }));
    expect(navigate).toHaveBeenCalledWith('/messagerie/lea-roux', items[0]);
    expect(markRead).toHaveBeenCalledWith(['n1']);
    markRead.mockClear();
    await user.click(screen.getByRole('link', { name: /Devis validé/ }));
    expect(markRead).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Marquer comme lu : Maintenance ce soir' }));
    expect(markRead).toHaveBeenCalledWith(['n2']);
  });

  it('refuses an unsafe href', () => {
    render(<NotificationList items={[{ id: 'x', category: 'other', title: 'Piège', read: false, clickable: true, href: 'javascript:alert(1)' }]} />);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('marks everything read, through onMarkAllRead or onMarkRead', async () => {
    const user = userEvent.setup(); const markAll = jest.fn(); const markRead = jest.fn();
    const { rerender } = render(<NotificationList items={items} now={now} onMarkAllRead={markAll} onMarkRead={markRead} />);
    await user.click(screen.getByRole('button', { name: 'Tout marquer comme lu' }));
    expect(markAll).toHaveBeenCalledTimes(1);
    rerender(<NotificationList items={items} now={now} onMarkRead={markRead} />);
    await user.click(screen.getByRole('button', { name: 'Tout marquer comme lu' }));
    expect(markRead).toHaveBeenCalledWith(['n1', 'n2']);
    rerender(<NotificationList items={items.map(item => ({ ...item, read: true }))} now={now} onMarkRead={markRead} />);
    expect(screen.getByRole('button', { name: 'Tout marquer comme lu' })).toBeDisabled();
  });

  it('filters the unread rows and says when everything is read', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<NotificationList items={items} now={now} />);
    await user.click(screen.getByRole('radio', { name: 'Non lues (2)' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    rerender(<NotificationList items={items.map(item => ({ ...item, read: true }))} now={now} />);
    expect(screen.getByRole('region', { name: 'Tout est lu' })).toBeInTheDocument();
  });

  it('shows a limited number of rows, then more on demand', async () => {
    const user = userEvent.setup();
    render(<NotificationList items={items} now={now} limit={2} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: 'Afficher plus (2)' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(screen.queryByRole('button', { name: /Afficher plus/ })).toBeNull();
  });

  it('delegates loading, empty, error and unavailable to DataState', async () => {
    const user = userEvent.setup(); const retry = jest.fn();
    const { rerender } = render(<NotificationList items={[]} state="loading" />);
    expect(screen.getByRole('status', { name: '' })).toHaveTextContent('Chargement des notifications…');
    expect(screen.queryByRole('radiogroup')).toBeNull();
    rerender(<NotificationList items={[]} />);
    expect(screen.getByRole('region', { name: 'Aucune notification' })).toBeInTheDocument();
    rerender(<NotificationList items={items} state="error" onRetry={retry} />);
    expect(screen.getByRole('region', { name: 'Les notifications n’ont pas pu être chargées.' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Réessayer' }));
    expect(retry).toHaveBeenCalledTimes(1);
    rerender(<NotificationList items={items} state="unavailable" />);
    expect(screen.getByRole('region', { name: 'Notifications indisponibles.' })).toBeInTheDocument();
  });

  it('closes the panel, and renders the drawer variant as a dialog', async () => {
    const user = userEvent.setup(); const close = jest.fn();
    const { rerender } = render(<NotificationList items={items} now={now} onClose={close} />);
    await user.click(screen.getByRole('button', { name: 'Fermer les notifications' }));
    expect(close).toHaveBeenCalledTimes(1);
    rerender(<NotificationList items={items} now={now} variant="drawer" onClose={close} />);
    const dialog = screen.getByRole('dialog', { name: 'Notifications' });
    expect(within(dialog).getAllByRole('listitem')).toHaveLength(4);
    expect(dialog.closest('[data-m360-component]')).toHaveAttribute('data-m360-component', 'NotificationList Drawer');
    await user.keyboard('{Escape}');
    expect(close).toHaveBeenCalledTimes(2);
  });
});
