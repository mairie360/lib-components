import React from 'react';

import { administrationBackupFrequencies } from './administration/options';
import type {
  AdministrationDangerAction,
  AdministrationSettingsState,
} from './administration/types';
import { AdministrationSelect } from './AdministrationSelect';
import { joinClasses } from './calendar/style';

export interface AdministrationSettingsPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  settings?: AdministrationSettingsState;
  dangerActions?: AdministrationDangerAction[];
  onSettingsChange?: (settings: AdministrationSettingsState) => void;
  onDangerAction?: (action: AdministrationDangerAction) => void;
}

interface ToggleFieldProps {
  checked: boolean;
  disabled?: boolean;
  label: string;
  description: string;
  onChange: (checked: boolean) => void;
}

const fieldClassName =
  'h-9 w-full rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-3 text-sm text-[var(--mairie-text)] outline-none transition focus:border-[var(--mairie-accent)] focus:ring-2 focus:ring-[var(--mairie-accent)]/20';

const updateBoundedInteger = (
  rawValue: string,
  minimum: number,
  maximum: number,
  update: (value: number) => void
) => {
  if (!/^\d+$/.test(rawValue)) return;

  const value = Number(rawValue);
  if (!Number.isInteger(value) || value < minimum || value > maximum) return;

  update(value);
};

const ToggleField = ({ checked, disabled, label, description, onChange }: ToggleFieldProps) => (
  <div className="flex items-start justify-between gap-4">
    <div className="min-w-0">
      <div className="text-sm font-semibold leading-5 text-[var(--mairie-text)]">{label}</div>
      <div className="text-sm leading-5 text-[var(--mairie-muted)]">{description}</div>
    </div>
    <button
      type="button"
      role="switch"
      disabled={disabled}
      aria-label={label}
      aria-checked={checked}
      className={joinClasses(
        'mt-1 inline-flex h-[18px] w-8 shrink-0 items-center rounded-full p-[2px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/35',
        checked ? 'bg-[var(--mairie-action-background)]' : 'bg-[var(--mairie-surface-raised)]'
      )}
      onClick={() => onChange(!checked)}
    >
      <span
        className={joinClasses(
          'size-3.5 rounded-full bg-[var(--mairie-surface)] shadow-sm transition',
          checked ? 'translate-x-3.5' : 'translate-x-0'
        )}
      />
    </button>
  </div>
);

export const AdministrationSettingsPanel = ({
  settings,
  dangerActions,
  onSettingsChange,
  onDangerAction,
  className = '',
  ...props
}: AdministrationSettingsPanelProps) => {
  const updateSettings = <K extends keyof AdministrationSettingsState>(
    field: K,
    value: AdministrationSettingsState[K]
  ) => {
    if (!settings || !onSettingsChange) return;

    const nextSettings = {
      ...settings,
      [field]: value,
    };

    onSettingsChange(nextSettings);
  };

  return (
    <div className={joinClasses('space-y-6 text-[var(--mairie-text)]', className)} {...props}>
      {settings ? <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-6 py-6">
          <h2 className="text-base font-bold leading-6 text-[var(--mairie-text)]">Sécurité</h2>
          <p className="mt-1 text-base leading-6 text-[var(--mairie-muted)]">Paramètres de sécurité et authentification</p>

          <div className="mt-7 space-y-6">
            <ToggleField
              checked={settings.twoFactorEnabled}
              disabled={!onSettingsChange}
              label="Authentification à deux facteurs"
              description="Obligatoire pour tous les utilisateurs"
              onChange={(checked) => updateSettings('twoFactorEnabled', checked)}
            />

            <label className="block">
              <span className="mb-2 block text-sm font-semibold leading-5 text-[var(--mairie-text)]">
                Délai d’expiration de session (heures)
              </span>
              <input
                type="number"
                aria-label="Délai d'expiration de session (heures)"
                min={1}
                max={720}
                step={1}
                value={settings.sessionExpirationHours}
                disabled={!onSettingsChange}
                className={fieldClassName}
                aria-describedby="session-expiration-help"
                onChange={(event) =>
                  updateBoundedInteger(event.target.value, 1, 720, (value) =>
                    updateSettings('sessionExpirationHours', value)
                  )
                }
              />
              <span id="session-expiration-help" className="mt-1 block text-xs text-[var(--mairie-muted)]">
                Valeur entière comprise entre 1 et 720 heures.
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold leading-5 text-[var(--mairie-text)]">
                Nombre max de tentatives de connexion
              </span>
              <input
                type="number"
                aria-label="Nombre max de tentatives de connexion"
                min={1}
                max={20}
                step={1}
                value={settings.maxLoginAttempts}
                disabled={!onSettingsChange}
                className={fieldClassName}
                aria-describedby="login-attempts-help"
                onChange={(event) =>
                  updateBoundedInteger(event.target.value, 1, 20, (value) =>
                    updateSettings('maxLoginAttempts', value)
                  )
                }
              />
              <span id="login-attempts-help" className="mt-1 block text-xs text-[var(--mairie-muted)]">
                Valeur entière comprise entre 1 et 20 tentatives.
              </span>
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-6 py-6">
          <h2 className="text-base font-bold leading-6 text-[var(--mairie-text)]">Système</h2>
          <p className="mt-1 text-base leading-6 text-[var(--mairie-muted)]">Configuration générale de l’application</p>

          <div className="mt-7 space-y-6">
            <ToggleField
              checked={settings.maintenanceMode}
              disabled={!onSettingsChange}
              label="Mode maintenance"
              description="Désactiver l'accès pour maintenance"
              onChange={(checked) => updateSettings('maintenanceMode', checked)}
            />
            <ToggleField
              checked={settings.publicRegistration}
              disabled={!onSettingsChange}
              label="Inscription publique"
              description="Permettre l'auto-inscription"
              onChange={(checked) => updateSettings('publicRegistration', checked)}
            />
            <ToggleField
              checked={settings.emailNotifications}
              disabled={!onSettingsChange}
              label="Notifications email"
              description="Envoyer des emails automatiques"
              onChange={(checked) => updateSettings('emailNotifications', checked)}
            />

            <div>
              <div className="mb-2 text-sm font-semibold leading-5 text-[var(--mairie-text)]">
                Fréquence des sauvegardes
              </div>
              <AdministrationSelect
                ariaLabel="Fréquence des sauvegardes"
                value={settings.backupFrequency}
                options={administrationBackupFrequencies}
                disabled={!onSettingsChange}
                onValueChange={(value) => updateSettings('backupFrequency', value)}
              />
            </div>
          </div>
        </section>
      </div> : (
        <p className="rounded-lg border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-6 py-10 text-sm text-[var(--mairie-muted)]">
          Paramètres indisponibles.
        </p>
      )}

      <section className="rounded-lg border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-6 py-6">
        <h2 className="text-base font-bold leading-6 text-[var(--mairie-text)]">Actions dangereuses</h2>
        <p className="mt-1 text-base leading-6 text-[var(--mairie-muted)]">
          Ces actions sont irréversibles et doivent être effectuées avec prudence
        </p>

        <div className="mt-7 space-y-4">
          {(dangerActions ?? []).map((action) => {
            const Icon = action.icon;

            return (
              <article
                key={action.id}
                className="rounded-md border border-[var(--mairie-error-text)] bg-[var(--mairie-error-surface)] px-4 py-4 text-[var(--mairie-error-text)]"
              >
                <h3 className="text-base font-bold leading-6">{action.title}</h3>
                <p className="mt-3 text-sm leading-5 text-[var(--mairie-error-text)]">{action.description}</p>
                <button
                  type="button"
                  disabled={!onDangerAction}
                  className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[var(--mairie-error-action-background)] px-4 text-sm font-semibold text-[var(--mairie-on-action)] transition hover:bg-[var(--mairie-error-action-hover-background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/35"
                  onClick={() => onDangerAction?.(action)}
                >
                  <Icon className="size-4" strokeWidth={1.8} />
                  <span>{action.buttonLabel}</span>
                </button>
              </article>
            );
          })}
          {(dangerActions?.length ?? 0) === 0 && (
            <p className="text-sm text-[var(--mairie-muted)]">
              {dangerActions ? 'Aucune action disponible.' : 'Actions indisponibles.'}
            </p>
          )}
        </div>
      </section>
    </div>
  );
};
