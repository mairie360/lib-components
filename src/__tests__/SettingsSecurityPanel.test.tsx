import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsSecurityPanel } from '../components/SettingsSecurityPanel';
import { defaultSettingsSecurity as security, defaultSettingsSessions as sessions } from '../stories/settingsFixtures';
import { axe } from 'jest-axe';
it('validates password confirmation, delegates the change and clears the input secrets', async () => {
  const user = userEvent.setup(); const onPasswordChange = jest.fn(); const { container } = render(<SettingsSecurityPanel security={security} sessions={sessions} onPasswordChange={onPasswordChange} />);
  fireEvent.change(screen.getByLabelText('Mot de passe actuel'), { target: { value: 'old' } }); fireEvent.change(screen.getByLabelText('Nouveau mot de passe'), { target: { value: 'new' } }); fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), { target: { value: 'different' } });
  fireEvent.submit(screen.getByRole('button', { name: /Changer le mot de passe/ }).closest('form')!); expect(onPasswordChange).not.toHaveBeenCalled(); expect(screen.getByText('Les nouveaux mots de passe ne correspondent pas.')).toBeVisible();
  fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), { target: { value: 'new' } }); await user.click(screen.getByRole('button', { name: /Changer le mot de passe/ })); expect(onPasswordChange).toHaveBeenCalledWith({ currentPassword: 'old', newPassword: 'new' }); expect(screen.getByLabelText('Mot de passe actuel')).toHaveValue(''); expect((await axe(container)).violations).toEqual([]);
});
