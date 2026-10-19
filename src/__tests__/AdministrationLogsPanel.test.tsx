import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { AdministrationLogsPanel } from '../components/AdministrationLogsPanel';
import { defaultAdministrationLogs as logs } from '../stories/administrationFixtures';
it('renders authoritative records and delegates explicit actions without manufacturing data', async () => { const onRefresh = jest.fn(); const onExportCsv = jest.fn(); const onClear = jest.fn(); const { container, rerender } = render(<AdministrationLogsPanel logs={logs} onRefresh={onRefresh} onExportCsv={onExportCsv} onClear={onClear} />); const user = userEvent.setup(); await user.click(screen.getByRole('button', { name: 'Actualiser' })); await user.click(screen.getByRole('button', { name: /Exporter/ })); await user.click(screen.getByRole('button', { name: 'Effacer' })); expect(onRefresh).toHaveBeenCalledTimes(1); expect(onExportCsv).toHaveBeenCalledTimes(1); expect(onClear).toHaveBeenCalledTimes(1); expect((await axe(container)).violations).toEqual([]); rerender(<AdministrationLogsPanel logs={[]} />); expect(screen.getByText('Aucun log pour ce niveau.')).toBeVisible(); });
