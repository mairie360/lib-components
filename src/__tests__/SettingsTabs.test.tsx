import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsTabs } from '../components/SettingsTabs';
import { axe } from 'jest-axe';
it('announces the selected account tab and requests the tab chosen with keyboard', async () => {
  const user = userEvent.setup(); const onValueChange = jest.fn(); const { container } = render(<SettingsTabs value="profile" onValueChange={onValueChange} />);
  expect(screen.getByRole('tab', { name: 'Profil' })).toHaveAttribute('aria-selected', 'true'); screen.getByRole('tab', { name: 'Sécurité' }).focus(); await user.keyboard('{Enter}'); expect(onValueChange).toHaveBeenCalledWith('security'); expect((await axe(container)).violations).toEqual([]);
});
