import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsSystemPanel } from '../components/SettingsSystemPanel';
import { defaultSettingsSystemInfo as systemInfo } from '../stories/settingsFixtures';
import { axe } from 'jest-axe';
it('shows received system information and delegates explicit assistance/cache actions', async () => {
  const user = userEvent.setup(); const onAssistanceAction = jest.fn(); const onClearCache = jest.fn(); const { container } = render(<SettingsSystemPanel systemInfo={systemInfo} onAssistanceAction={onAssistanceAction} onClearCache={onClearCache} />);
  expect(screen.getByText(systemInfo.appVersion)).toBeVisible(); expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', String(systemInfo.storageUsedMb));
  for (const [name, action] of [["Centre d'aide", 'help'], ['Contacter le support', 'support'], ['Signaler un problème', 'report'], ['Télécharger les logs', 'download-logs']]) { await user.click(screen.getByRole('button', { name })); expect(onAssistanceAction).toHaveBeenLastCalledWith(action); }
  await user.click(screen.getByRole('button', { name: 'Vider le cache' })); expect(onClearCache).toHaveBeenCalledTimes(1); expect((await axe(container)).violations).toEqual([]);
});
