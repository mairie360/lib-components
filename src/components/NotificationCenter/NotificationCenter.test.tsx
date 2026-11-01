import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NotificationCenter, notificationHref } from './NotificationCenter';
import { AppShell } from '../AppShell';

const items = [{ id: 'm1', title: 'Message reçu', category: 'messages' as const, read: false, href: '/messages' },{ id: 'p1', title: 'Projet modifié', category: 'projects' as const, read: true }];
it('opens the shared notification drawer without pretending an empty feed or a count is confirmed', () => {
  render(<AppShell hrefs={{ projects: '/projects' }}><p>Projets</p></AppShell>);
  fireEvent.click(screen.getByRole('button', { name: /Notifications/i }));
  expect(screen.getByRole('dialog', { name: 'Notifications' })).toBeInTheDocument();
  expect(screen.getByText(/ne sont pas encore disponibles/)).toBeInTheDocument();
  expect(screen.queryByText('Aucune notification à afficher.')).not.toBeInTheDocument();
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
it('filters received items and waits for an exact read receipt; a refusal preserves the unread item', async () => {
  const markRead = jest.fn().mockRejectedValueOnce(new Error('Lecture refusée')).mockResolvedValueOnce(['m1']);
  const counts = jest.fn();
  render(<NotificationCenter source={{ list: jest.fn().mockResolvedValue(items), markRead }} onClose={jest.fn()} onUnreadCount={counts} />);
  await screen.findByText('Message reçu');
  fireEvent.change(screen.getByLabelText('Filtrer les notifications'), { target: { value: 'projects' } });
  expect(screen.queryByText('Message reçu')).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Filtrer les notifications'), { target: { value: 'all' } });
  fireEvent.click(screen.getByLabelText('Non lues uniquement'));
  expect(screen.queryByText('Projet modifié')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Marquer comme lu' }));
  await screen.findByText('Lecture refusée'); expect(screen.getByText('Non lue')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Tout marquer comme lu' }));
  await waitFor(() => expect(screen.queryByText('Message reçu')).not.toBeInTheDocument());
  expect(markRead).toHaveBeenNthCalledWith(1,['m1']); expect(counts).toHaveBeenLastCalledWith(0);
});
it('rejects a mismatched acknowledgement without updating the badge', async () => {
  const counts = jest.fn();
  render(<NotificationCenter source={{ list: jest.fn().mockResolvedValue(items), markRead: jest.fn().mockResolvedValue(['foreign']) }} onClose={jest.fn()} onUnreadCount={counts} />);
  await screen.findByText('Message reçu'); fireEvent.click(screen.getByRole('button', { name: 'Marquer comme lu' }));
  await screen.findByText('La lecture des notifications n’a pas été confirmée.'); expect(screen.getByText('Non lue')).toBeInTheDocument(); expect(counts).toHaveBeenCalledTimes(1);
});
it.each(['javascript:alert(1)','//foreign.invalid','https://name:password@example.invalid','/path\\escape','/path\n'])('does not expose an unsafe notification link %s', value => { expect(notificationHref(value)).toBeUndefined(); });
it('keeps configured, encoded web and same-origin relative destinations', () => { expect(notificationHref('/projects?id=p%2F1')).toBe('/projects?id=p%2F1'); expect(notificationHref('https://projects.example/')).toBe('https://projects.example/'); });
