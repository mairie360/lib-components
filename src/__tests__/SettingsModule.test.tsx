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
  it('renders the profile and delegates changes without claiming persistence', () => {
    const onProfileSave = jest.fn();
    render(<SettingsModule {...fixtureProps} onProfileSave={onProfileSave} />);

    expect(screen.getByRole('heading', { name: 'Paramètres' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Profil' })).toHaveAttribute('aria-selected', 'true');

    fireEvent.change(screen.getByLabelText('Nom complet'), { target: { value: 'Jeanne Dupont' } });
    fireEvent.change(screen.getByLabelText('Service'), { target: { value: 'urbanisme' } });
    fireEvent.change(screen.getByLabelText('Biographie'), { target: { value: 'Responsable du service' } });
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer les modifications/ }));

    expect(onProfileSave).toHaveBeenCalledWith(expect.objectContaining({
      fullName: 'Jeanne Dupont',
      service: 'urbanisme',
      biography: 'Responsable du service',
    }));
    expect(screen.queryByText('Modifications enregistrées.')).not.toBeInTheDocument();
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
    fireEvent.click(screen.getByRole('switch', { name: "Application d'authentification" }));
    expect(onSecurityChange).toHaveBeenCalledWith(expect.objectContaining({ authenticatorTwoFactor: true }));
    fireEvent.click(screen.getByRole('button', { name: 'Déconnecter' }));
    expect(onDisconnectSession).toHaveBeenCalledWith(expect.objectContaining({ id: 'mobile-session' }));
  });

  it('updates notification, appearance and general preferences', () => {
    const onNotificationsChange = jest.fn();
    const onAppearanceChange = jest.fn();
    const onGeneralChange = jest.fn();
    render(<SettingsModule {...fixtureProps} onNotificationsChange={onNotificationsChange} onAppearanceChange={onAppearanceChange} onGeneralChange={onGeneralChange} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Notifications' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Notifications par e-mail' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Notifications push' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Notifications desktop' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Messages' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Projets' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Calendrier' }));
    expect(onNotificationsChange).toHaveBeenCalledWith(expect.objectContaining({ email: false }));
    expect(onNotificationsChange).toHaveBeenCalledWith(expect.objectContaining({ push: false }));
    expect(onNotificationsChange).toHaveBeenCalledWith(expect.objectContaining({ desktop: true }));
    expect(onNotificationsChange).toHaveBeenCalledWith(expect.objectContaining({ messages: false }));
    expect(onNotificationsChange).toHaveBeenCalledWith(expect.objectContaining({ projects: false }));
    expect(onNotificationsChange).toHaveBeenCalledWith(expect.objectContaining({ calendar: false }));

    fireEvent.click(screen.getByRole('tab', { name: 'Apparence' }));
    fireEvent.click(screen.getByRole('radio', { name: /Sombre/ }));
    expect(onAppearanceChange).toHaveBeenCalledWith(expect.objectContaining({ theme: 'dark' }));
    fireEvent.change(screen.getByLabelText('Police de caractères'), { target: { value: 'serif' } });
    fireEvent.change(screen.getByLabelText(/Taille de police/), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText("Compacité de l'interface"), { target: { value: 'compact' } });
    expect(onAppearanceChange).toHaveBeenCalledWith(expect.objectContaining({ fontFamily: 'serif' }));
    expect(onAppearanceChange).toHaveBeenCalledWith(expect.objectContaining({ fontSize: 50 }));
    expect(onAppearanceChange).toHaveBeenCalledWith(expect.objectContaining({ density: 'compact' }));

    fireEvent.click(screen.getByRole('tab', { name: 'Général' }));
    fireEvent.change(screen.getByLabelText("Langue de l'interface"), { target: { value: 'en' } });
    fireEvent.change(screen.getByLabelText('Fuseau horaire'), { target: { value: 'Indian/Reunion' } });
    fireEvent.change(screen.getByLabelText('Format de date'), { target: { value: 'YYYY-MM-DD' } });
    fireEvent.change(screen.getByLabelText("Page d'accueil par défaut"), { target: { value: 'projects' } });
    fireEvent.click(screen.getByRole('switch', { name: 'Ouverture automatique des notifications' }));
    expect(onGeneralChange).toHaveBeenCalledWith(expect.objectContaining({ language: 'en' }));
    expect(onGeneralChange).toHaveBeenCalledWith(expect.objectContaining({ timezone: 'Indian/Reunion' }));
    expect(onGeneralChange).toHaveBeenCalledWith(expect.objectContaining({ dateFormat: 'YYYY-MM-DD' }));
    expect(onGeneralChange).toHaveBeenCalledWith(expect.objectContaining({ homePage: 'projects' }));
    expect(onGeneralChange).toHaveBeenCalledWith(expect.objectContaining({ autoOpenNotifications: true }));
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

  it('says who sees the phone number (MAIR-292)', () => {
    render(<SettingsModule {...fixtureProps} />);

    expect(screen.getByLabelText('Téléphone')).toHaveAccessibleDescription('Visible par tous les agents de la mairie (usage professionnel).');
  });
});
