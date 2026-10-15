import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsNotificationsPanel } from '../components/SettingsNotificationsPanel';
import { defaultSettingsNotifications as notifications } from '../stories/settingsFixtures';
import { axe } from 'jest-axe';
it('emits each notification toggle independently and supports a read-only view', async () => {
  const user = userEvent.setup(); const onChange = jest.fn(); const { container, rerender } = render(<SettingsNotificationsPanel notifications={notifications} onChange={onChange} />);
  await ([['Notifications par e-mail', 'email'], ['Notifications push', 'push'], ['Notifications desktop', 'desktop'], ['Messages', 'messages'], ['Projets', 'projects'], ['Calendrier', 'calendar']] as const).reduce(async (previous, [name, field]) => {
    await previous;
    await user.click(screen.getByRole('switch', { name })); expect(onChange).toHaveBeenLastCalledWith({ ...notifications, [field]: !notifications[field] });
  }, Promise.resolve());
  expect((await axe(container)).violations).toEqual([]); rerender(<SettingsNotificationsPanel notifications={notifications} />); expect(screen.getByRole('switch', { name: 'Messages' })).toBeDisabled();
});
