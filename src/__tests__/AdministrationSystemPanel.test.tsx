import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { AdministrationSystemPanel } from '../components/AdministrationSystemPanel';
import { defaultAdministrationResources as resources, defaultAdministrationDatabaseMetrics as databaseMetrics, defaultAdministrationServerStatuses as serverStatuses } from '../stories/administrationFixtures';
it('renders authoritative records and delegates explicit actions without manufacturing data', async () => { const onCreateBackup = jest.fn(); const { container, rerender } = render(<AdministrationSystemPanel resources={resources} databaseMetrics={databaseMetrics} serverStatuses={serverStatuses} onCreateBackup={onCreateBackup} />); await userEvent.click(screen.getByRole('button', { name: 'Créer une sauvegarde' })); expect(onCreateBackup).toHaveBeenCalledTimes(1); expect((await axe(container)).violations).toEqual([]); rerender(<AdministrationSystemPanel />); expect(screen.getByText('Ressources indisponibles.')).toBeVisible(); expect(screen.getByRole('button', { name: 'Créer une sauvegarde' })).toBeDisabled(); });
