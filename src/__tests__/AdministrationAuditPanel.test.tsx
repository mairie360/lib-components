import React from 'react';
import { render, screen } from '@testing-library/react';
import { AdministrationAuditPanel } from '../components/AdministrationAuditPanel';
import { defaultAdministrationAuditEntries as entries } from '../stories/administrationFixtures';
it('renders authoritative records and delegates explicit actions without manufacturing data', async () => { const { rerender } = render(<AdministrationAuditPanel entries={entries} />); expect(screen.getAllByRole('article')).toHaveLength(entries.length); rerender(<AdministrationAuditPanel entries={[]} />); expect(screen.getByText('Aucune action à afficher.')).toBeVisible(); rerender(<AdministrationAuditPanel />); expect(screen.getByText('Journal d’audit indisponible.')).toBeVisible(); });
