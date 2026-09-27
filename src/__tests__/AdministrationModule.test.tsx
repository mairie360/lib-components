import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';

import { AdministrationModule } from '../components/AdministrationModule';
import {
  defaultAdministrationAuditEntries,
  defaultAdministrationDangerActions,
  defaultAdministrationDatabaseMetrics,
  defaultAdministrationLogs,
  defaultAdministrationResources,
  defaultAdministrationServerStatuses,
  defaultAdministrationSettings,
  defaultAdministrationUsers,
} from '../stories/administrationFixtures';

describe('AdministrationModule', () => {
  it('shows unavailable states and disables actions without business data or callbacks', () => {
    render(<AdministrationModule />);
    expect(screen.getByText('Indicateurs indisponibles.')).toBeInTheDocument();
    expect(screen.getByText('Utilisateurs indisponibles.')).toBeInTheDocument();
    expect(screen.queryByText('Admin Système')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nouveau/ })).toBeDisabled();

    fireEvent.click(screen.getByRole('tab', { name: /Logs/ }));
    expect(screen.getByText('Journaux indisponibles.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Actualiser/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Exporter CSV/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Effacer/ })).toBeDisabled();

    fireEvent.click(screen.getByRole('tab', { name: /Système/ }));
    expect(screen.getByText('Ressources indisponibles.')).toBeInTheDocument();
    expect(screen.getByText('Métriques indisponibles.')).toBeInTheDocument();
    expect(screen.getByText('État du serveur indisponible.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Créer une sauvegarde/ })).toBeDisabled();

    fireEvent.click(screen.getByRole('tab', { name: /Audit/ }));
    expect(screen.getByText('Journal d’audit indisponible.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /Paramètres/ }));
    expect(screen.getByText('Paramètres indisponibles.')).toBeInTheDocument();
    expect(screen.getByText('Actions indisponibles.')).toBeInTheDocument();
  });

  it('filters only explicitly supplied users', () => {
    render(<AdministrationModule users={defaultAdministrationUsers} />);
    fireEvent.change(screen.getByPlaceholderText('Rechercher un utilisateur...'), { target: { value: 'marie' } });
    expect(screen.getByText('Marie Martin')).toBeInTheDocument();
    expect(screen.queryByText('Jean Dupont')).not.toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Rechercher un utilisateur...'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Filtrer par rôle' }));
    fireEvent.click(screen.getByRole('option', { name: 'Manager' }));
    expect(screen.getByText('Marie Martin')).toBeInTheDocument();
    expect(screen.queryByText('Admin Système')).not.toBeInTheDocument();
  });

  it('submits user changes without inventing persisted data or success', () => {
    const onCreateUser = jest.fn();
    const onUpdateUser = jest.fn();
    const onUserAction = jest.fn();
    render(<AdministrationModule users={defaultAdministrationUsers} onCreateUser={onCreateUser} onUpdateUser={onUpdateUser} onUserAction={onUserAction} />);

    fireEvent.click(screen.getByRole('button', { name: /Nouveau/ }));
    let dialog = screen.getByRole('dialog', { name: 'Nouvel utilisateur' });
    fireEvent.change(within(dialog).getByLabelText('Nom complet'), { target: { value: 'Alice Durand' } });
    fireEvent.change(within(dialog).getByLabelText('Email'), { target: { value: 'alice@example.test' } });
    fireEvent.change(within(dialog).getByLabelText('Service'), { target: { value: 'Communication' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Créer' }));
    expect(onCreateUser).toHaveBeenCalledWith(expect.objectContaining({ name: 'Alice Durand' }));
    expect(screen.queryByText('Alice Durand')).not.toBeInTheDocument();

    const row = screen.getByText('Jean Dupont').closest('tr') as HTMLElement;
    fireEvent.click(within(row).getByRole('button', { name: 'Actions pour Jean Dupont' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Modifier' }));
    dialog = screen.getByRole('dialog', { name: 'Modifier utilisateur' });
    fireEvent.change(within(dialog).getByLabelText('Nom complet'), { target: { value: 'Jean Morel' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Enregistrer' }));
    expect(onUpdateUser).toHaveBeenCalledWith(expect.objectContaining({ id: 'jean-dupont', name: 'Jean Morel' }));
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    expect(screen.queryByText('Jean Morel')).not.toBeInTheDocument();

    fireEvent.click(within(row).getByRole('button', { name: 'Actions pour Jean Dupont' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Désactiver' }));
    expect(onUserAction).toHaveBeenCalledWith(expect.objectContaining({ id: 'jean-dupont' }), 'toggle-status');
    fireEvent.click(within(row).getByRole('button', { name: 'Actions pour Jean Dupont' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Supprimer' }));
    expect(onUserAction).toHaveBeenCalledWith(expect.objectContaining({ id: 'jean-dupont' }), 'delete');
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('delegates log actions without synthetic records or success notices', () => {
    const onRefreshLogs = jest.fn();
    const onExportLogsCsv = jest.fn();
    const onClearLogs = jest.fn();
    render(<AdministrationModule defaultActiveTab="logs" logs={defaultAdministrationLogs} onRefreshLogs={onRefreshLogs} onExportLogsCsv={onExportLogsCsv} onClearLogs={onClearLogs} />);
    fireEvent.click(screen.getByRole('button', { name: /Actualiser/ }));
    expect(onRefreshLogs).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Actualisation effectuée')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Exporter CSV/ }));
    expect(onExportLogsCsv).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: /Effacer/ }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Effacer les logs' }));
    expect(onClearLogs).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Connexion réussie')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('delegates backup without fabricating a result', () => {
    const onCreateBackup = jest.fn();
    render(<AdministrationModule defaultActiveTab="system" resources={defaultAdministrationResources} databaseMetrics={defaultAdministrationDatabaseMetrics} serverStatuses={defaultAdministrationServerStatuses} onCreateBackup={onCreateBackup} />);
    expect(screen.getByText('CPU')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Créer une sauvegarde/ }));
    expect(onCreateBackup).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Il y a 2h')).toBeInTheDocument();
    expect(screen.queryByText("À l'instant")).not.toBeInTheDocument();
  });

  it('delegates settings and dangerous actions without claiming success or adding audit entries', () => {
    const onSettingsChange = jest.fn();
    const onDangerAction = jest.fn();
    render(<AdministrationModule defaultActiveTab="settings" settings={defaultAdministrationSettings} dangerActions={defaultAdministrationDangerActions} auditEntries={defaultAdministrationAuditEntries} onSettingsChange={onSettingsChange} onDangerAction={onDangerAction} />);
    fireEvent.click(screen.getByRole('switch', { name: 'Inscription publique' }));
    expect(onSettingsChange).toHaveBeenCalledWith(expect.objectContaining({ publicRegistration: false }));
    expect(screen.getByRole('switch', { name: 'Inscription publique' })).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(screen.getByRole('button', { name: /Réinitialiser/ }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Annuler' }));
    expect(onDangerAction).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Réinitialiser/ }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Réinitialiser' }));
    expect(onDangerAction).toHaveBeenCalledWith(expect.objectContaining({ id: 'reset-passwords' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /Audit/ }));
    expect(screen.queryByText('Réinitialiser tous les mots de passe')).not.toBeInTheDocument();
    expect(screen.getByText('Utilisateur: Marie Martin')).toBeInTheDocument();
  });
});
