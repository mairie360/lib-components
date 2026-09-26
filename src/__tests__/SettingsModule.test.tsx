import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { SettingsModule } from '../components/SettingsModule';
import {
  defaultSettingsAppearance,
  defaultSettingsGeneral,
  defaultSettingsNotifications,
  defaultSettingsProfile,
  defaultSettingsSecurity,
  defaultSettingsSessions,
  defaultSettingsSystemInfo,
  settingsServiceOptions,
} from '../stories/settingsFixtures';

const fixtureProps = {
  profile: defaultSettingsProfile,
  serviceOptions: settingsServiceOptions,
  security: defaultSettingsSecurity,
  sessions: defaultSettingsSessions,
  notifications: defaultSettingsNotifications,
  appearance: defaultSettingsAppearance,
  general: defaultSettingsGeneral,
  systemInfo: defaultSettingsSystemInfo,
};

describe('SettingsModule', () => {
  it('renders the profile inside the settings module and saves changes', () => {
    const onProfileSave = jest.fn();
    render(<SettingsModule {...fixtureProps} onProfileSave={onProfileSave} />);

    expect(screen.getByRole('heading', { name: 'Paramètres' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Profil' })).toHaveAttribute('aria-selected', 'true');

    fireEvent.change(screen.getByLabelText('Nom complet'), { target: { value: 'Jeanne Dupont' } });
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer les modifications/ }));

    expect(onProfileSave).toHaveBeenCalledWith(expect.objectContaining({ fullName: 'Jeanne Dupont' }));
    expect(screen.getByRole('status')).toHaveTextContent('Modifications enregistrées.');
  });

  it('validates profile photos before notifying the consumer', () => {
    const onPhotoChange = jest.fn();
    render(<SettingsModule {...fixtureProps} onPhotoChange={onPhotoChange} />);
    const input = screen.getByLabelText('Changer la photo');

    fireEvent.change(input, { target: { files: [new File(['x'], 'avatar.gif', { type: 'image/gif' })] } });
    expect(screen.getByRole('alert')).toHaveTextContent('Format non pris en charge');
    expect(onPhotoChange).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { files: [new File(['photo'], 'avatar.png', { type: 'image/png' })] } });
    expect(onPhotoChange).toHaveBeenCalledWith(expect.objectContaining({ name: 'avatar.png' }));
  });

  it('changes password, two-factor settings and disconnects a remote session', () => {
    const onPasswordChange = jest.fn();
    const onSecurityChange = jest.fn();
    const onDisconnectSession = jest.fn();
    render(<SettingsModule {...fixtureProps} onPasswordChange={onPasswordChange} onSecurityChange={onSecurityChange} onDisconnectSession={onDisconnectSession} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Sécurité' }));
    fireEvent.change(screen.getByLabelText('Mot de passe actuel'), { target: { value: 'old-pass' } });
    fireEvent.change(screen.getByLabelText('Nouveau mot de passe'), { target: { value: 'new-pass' } });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), { target: { value: 'new-pass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Changer le mot de passe' }));

    expect(onPasswordChange).toHaveBeenCalledWith({ currentPassword: 'old-pass', newPassword: 'new-pass' });
    fireEvent.click(screen.getByRole('switch', { name: 'Authentification par SMS' }));
    expect(onSecurityChange).toHaveBeenCalledWith(expect.objectContaining({ smsTwoFactor: true }));
    fireEvent.click(screen.getByRole('button', { name: 'Déconnecter' }));
    expect(onDisconnectSession).toHaveBeenCalledWith(expect.objectContaining({ id: 'mobile-session' }));
  });

  it('updates notification, appearance and general preferences', () => {
    const onNotificationsChange = jest.fn();
    const onAppearanceChange = jest.fn();
    const onGeneralChange = jest.fn();
    render(<SettingsModule {...fixtureProps} onNotificationsChange={onNotificationsChange} onAppearanceChange={onAppearanceChange} onGeneralChange={onGeneralChange} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Notifications' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Notifications desktop' }));
    expect(onNotificationsChange).toHaveBeenCalledWith(expect.objectContaining({ desktop: true }));

    fireEvent.click(screen.getByRole('tab', { name: 'Apparence' }));
    fireEvent.click(screen.getByRole('radio', { name: /Sombre/ }));
    expect(onAppearanceChange).toHaveBeenCalledWith(expect.objectContaining({ theme: 'dark' }));

    fireEvent.click(screen.getByRole('tab', { name: 'Général' }));
    fireEvent.change(screen.getByLabelText("Langue de l'interface"), { target: { value: 'en' } });
    expect(onGeneralChange).toHaveBeenCalledWith(expect.objectContaining({ language: 'en' }));
  });

  it('exposes system cache and assistance actions', () => {
    const onClearCache = jest.fn();
    const onAssistanceAction = jest.fn();
    render(<SettingsModule {...fixtureProps} onClearCache={onClearCache} onAssistanceAction={onAssistanceAction} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Système' }));
    fireEvent.click(screen.getByRole('button', { name: /Vider le cache/ }));
    fireEvent.click(screen.getByRole('button', { name: /Télécharger les logs/ }));

    expect(onClearCache).toHaveBeenCalledTimes(1);
    expect(onAssistanceAction).toHaveBeenCalledWith('download-logs');
    expect(screen.getByRole('progressbar', { name: 'Utilisation du stockage' })).toHaveAttribute('aria-valuenow', '2.4');
  });

  it('shows unavailable states instead of fabricated profile, session, or system data', () => {
    render(<SettingsModule />);

    expect(screen.getByRole('status')).toHaveTextContent('Données indisponibles');
    expect(screen.queryByDisplayValue('Jean Dupont')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Sécurité' }));
    expect(screen.getByRole('status')).toHaveTextContent('Données indisponibles');
    expect(screen.queryByText('Session actuelle')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Système' }));
    expect(screen.getByRole('status')).toHaveTextContent('Données indisponibles');
    expect(screen.queryByText('Mairie360 v2.1.0')).not.toBeInTheDocument();
  });

  it('does not offer unsupported settings actions without consumer callbacks', () => {
    render(<SettingsModule {...fixtureProps} serviceOptions={undefined} />);

    expect(screen.queryByRole('button', { name: /Enregistrer les modifications/ })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Changer la photo')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Service')).toHaveAttribute('readonly');

    fireEvent.click(screen.getByRole('tab', { name: 'Sécurité' }));
    expect(screen.queryByRole('button', { name: 'Changer le mot de passe' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Déconnecter' })).not.toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Authentification par SMS' })).toBeDisabled();

    fireEvent.click(screen.getByRole('tab', { name: 'Système' }));
    expect(screen.queryByRole('button', { name: 'Vider le cache' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Télécharger les logs' })).not.toBeInTheDocument();
  });
});
