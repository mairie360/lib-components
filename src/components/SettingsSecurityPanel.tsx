import React from 'react';

import { SettingsSection, SettingsToggle, settingsFieldClassName } from './settings/controls';
import type { SettingsSecurityState, SettingsSession } from './settings/types';

export interface SettingsPasswordChange {
  currentPassword: string;
  newPassword: string;
}

export interface SettingsSecurityPanelProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'security'> {
  security: SettingsSecurityState;
  sessions?: SettingsSession[];
  onSecurityChange?: (security: SettingsSecurityState) => void;
  onPasswordChange?: (change: SettingsPasswordChange) => void;
  onDisconnectSession?: (session: SettingsSession) => void;
}

export const SettingsSecurityPanel = ({
  security,
  sessions,
  onSecurityChange,
  onPasswordChange,
  onDisconnectSession,
  className = '',
  ...props
}: SettingsSecurityPanelProps) => {
  const [passwords, setPasswords] = React.useState({ current: '', next: '', confirmation: '' });
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const submitPassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!passwords.current || !passwords.next) {
      setFeedback('Tous les champs de mot de passe sont obligatoires.');
      return;
    }
    if (passwords.next !== passwords.confirmation) {
      setFeedback('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    onPasswordChange?.({ currentPassword: passwords.current, newPassword: passwords.next });
    setPasswords({ current: '', next: '', confirmation: '' });
    setFeedback('Demande de changement de mot de passe envoyée.');
  };

  const updateSecurity = (field: keyof SettingsSecurityState, value: boolean) =>
    onSecurityChange?.({ ...security, [field]: value });

  return (
    <div className={`space-y-6 ${className}`} {...props}>
      {onPasswordChange && <SettingsSection title="Mot de passe">
        <form className="space-y-4" onSubmit={submitPassword}>
          {[
            ['Mot de passe actuel', 'current'],
            ['Nouveau mot de passe', 'next'],
            ['Confirmer le mot de passe', 'confirmation'],
          ].map(([label, field]) => (
            <label key={field} className="block text-sm font-semibold text-[var(--mairie-text)]">
              {label}
              <input
                type="password"
                autoComplete={field === 'current' ? 'current-password' : 'new-password'}
                className={`${settingsFieldClassName} mt-1 font-normal`}
                value={passwords[field as keyof typeof passwords]}
                onChange={(event) => setPasswords((current) => ({ ...current, [field]: event.target.value }))}
              />
            </label>
          ))}
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="h-9 rounded-md bg-[var(--mairie-action-background)] px-4 text-sm font-semibold text-[var(--mairie-on-action)] hover:bg-[var(--mairie-action-hover-background)]">
              Changer le mot de passe
            </button>
            {feedback && <span role={feedback.includes('correspondent') || feedback.includes('obligatoires') ? 'alert' : 'status'} className="text-sm text-[var(--mairie-muted)]">{feedback}</span>}
          </div>
        </form>
      </SettingsSection>}

      <SettingsSection title="Authentification à deux facteurs">
        <div className="space-y-2">
          <SettingsToggle
            label="Authentification par SMS"
            description="Recevez un code par SMS pour sécuriser votre compte"
            checked={security.smsTwoFactor}
            disabled={!onSecurityChange}
            onChange={(value) => updateSecurity('smsTwoFactor', value)}
          />
          <SettingsToggle
            label="Application d'authentification"
            description="Utilisez Google Authenticator ou une app similaire"
            checked={security.authenticatorTwoFactor}
            disabled={!onSecurityChange}
            onChange={(value) => updateSecurity('authenticatorTwoFactor', value)}
          />
        </div>
      </SettingsSection>

      <SettingsSection title="Sessions actives">
        <div className="space-y-3">
          {sessions?.map((session) => (
            <article key={session.id} className="flex items-center justify-between gap-4 rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--mairie-text)]">
                  <span className={`size-2 rounded-full ${session.current ? 'bg-[var(--mairie-success-action-background)]' : 'bg-[var(--mairie-border)]'}`} />
                  {session.label}
                </div>
                <p className="ml-4 text-sm text-[var(--mairie-muted)]">{session.description}</p>
              </div>
              {session.current ? (
                <span className="rounded-md bg-[var(--mairie-success-action-background)] px-2.5 py-1 text-xs font-semibold text-[var(--mairie-on-action)]">Actuelle</span>
              ) : onDisconnectSession ? (
                <button type="button" className="h-8 rounded-md border border-[var(--mairie-border)] px-3 text-sm font-semibold text-[var(--mairie-error-text)]" onClick={() => onDisconnectSession?.(session)}>
                  Déconnecter
                </button>
              ) : null}
            </article>
          ))}
          {sessions === undefined && <p className="text-sm text-[var(--mairie-muted)]">Données de session indisponibles.</p>}
          {sessions?.length === 0 && <p className="text-sm text-[var(--mairie-muted)]">Aucune session à afficher.</p>}
        </div>
      </SettingsSection>
    </div>
  );
};
