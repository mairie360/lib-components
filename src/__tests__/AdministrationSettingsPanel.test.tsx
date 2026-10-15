import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Trash } from 'lucide-react';
import { AdministrationSettingsPanel } from '../components/AdministrationSettingsPanel';
import type { AdministrationSettingsState } from '../components/administration/types';
import { axe } from 'jest-axe';
const settings: AdministrationSettingsState = { twoFactorEnabled: false, sessionExpirationHours: 24, maxLoginAttempts: 5, maintenanceMode: false, publicRegistration: false, emailNotifications: false, backupFrequency: 'daily' };

it('distinguishes unavailable settings, an empty action list and a read-only configuration', async () => {
  const { container, rerender } = render(<AdministrationSettingsPanel />); expect(screen.getByText('Paramètres indisponibles.')).toBeVisible();
  rerender(<AdministrationSettingsPanel settings={settings} dangerActions={[]} />); expect(screen.getByText('Aucune action disponible.')).toBeVisible();
  expect(screen.getByRole('switch', { name: 'Mode maintenance' })).toBeDisabled(); expect((await axe(container)).violations).toEqual([]);
});
it('emits edited switches and bounded integer changes without silently changing another setting', async () => {
  const user = userEvent.setup(); const onSettingsChange = jest.fn(); render(<AdministrationSettingsPanel settings={settings} onSettingsChange={onSettingsChange} />);
  for (const [label, field] of [['Authentification à deux facteurs', 'twoFactorEnabled'], ['Mode maintenance', 'maintenanceMode'], ['Inscription publique', 'publicRegistration'], ['Notifications email', 'emailNotifications']]) {
    await user.click(screen.getByRole('switch', { name: label })); expect(onSettingsChange).toHaveBeenLastCalledWith({ ...settings, [field]: true });
  }
  onSettingsChange.mockClear(); const hours = screen.getByRole('spinbutton', { name: "Délai d'expiration de session (heures)" });
  for (const value of ['', '0', '721', '1.5', '-1']) fireEvent.change(hours, { target: { value } }); expect(onSettingsChange).not.toHaveBeenCalled();
  fireEvent.change(hours, { target: { value: '48' } }); expect(onSettingsChange).toHaveBeenLastCalledWith({ ...settings, sessionExpirationHours: 48 });
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Nombre max de tentatives de connexion' }), { target: { value: '10' } }); expect(onSettingsChange).toHaveBeenLastCalledWith({ ...settings, maxLoginAttempts: 10 });
});
it('delegates the selected dangerous action to its owner instead of performing it automatically', async () => {
  const user = userEvent.setup(); const onDangerAction = jest.fn(); const action = { id: 'delete', title: 'Supprimer les journaux', description: 'Action administrateur', buttonLabel: 'Vider les journaux', icon: Trash };
  render(<AdministrationSettingsPanel settings={settings} dangerActions={[action]} onDangerAction={onDangerAction} />); expect(onDangerAction).not.toHaveBeenCalled(); await user.click(screen.getByRole('button', { name: 'Vider les journaux' })); expect(onDangerAction).toHaveBeenCalledWith(action);
});
