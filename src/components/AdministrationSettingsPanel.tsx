import React from 'react';

import {
  administrationBackupFrequencies,
  defaultAdministrationDangerActions,
  defaultAdministrationSettings,
} from './administration/defaultData';
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
  label: string;
  description: string;
  onChange: (checked: boolean) => void;
}

const fieldClassName =
  'h-9 w-full rounded-md border border-[#d8d2ca] bg-white px-3 text-sm text-[#172033] outline-none transition focus:border-[#1256a6] focus:ring-2 focus:ring-[#1256a6]/20';

const ToggleField = ({ checked, label, description, onChange }: ToggleFieldProps) => (
  <div className="flex items-start justify-between gap-4">
    <div className="min-w-0">
      <div className="text-sm font-semibold leading-5 text-[#172033]">{label}</div>
      <div className="text-sm leading-5 text-[#667085]">{description}</div>
    </div>
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      className={joinClasses(
        'mt-1 inline-flex h-[18px] w-8 shrink-0 items-center rounded-full p-[2px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/35',
        checked ? 'bg-[#1256a6]' : 'bg-[#d8d4ce]'
      )}
      onClick={() => onChange(!checked)}
    >
      <span
        className={joinClasses(
          'size-3.5 rounded-full bg-white shadow-sm transition',
          checked ? 'translate-x-3.5' : 'translate-x-0'
        )}
      />
    </button>
  </div>
);

export const AdministrationSettingsPanel = ({
  settings = defaultAdministrationSettings,
  dangerActions = defaultAdministrationDangerActions,
  onSettingsChange,
  onDangerAction,
  className = '',
  ...props
}: AdministrationSettingsPanelProps) => {
  const [internalSettings, setInternalSettings] = React.useState(settings);

  React.useEffect(() => {
    setInternalSettings(settings);
  }, [settings]);

  const updateSettings = <K extends keyof AdministrationSettingsState>(
    field: K,
    value: AdministrationSettingsState[K]
  ) => {
    const nextSettings = {
      ...internalSettings,
      [field]: value,
    };

    setInternalSettings(nextSettings);
    onSettingsChange?.(nextSettings);
  };

  return (
    <div className={joinClasses('space-y-6 text-[#172033]', className)} {...props}>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-[#d8d2ca] bg-white px-6 py-6">
          <h2 className="text-base font-bold leading-6 text-[#172033]">Sécurité</h2>
          <p className="mt-1 text-base leading-6 text-[#667085]">Paramètres de sécurité et authentification</p>

          <div className="mt-7 space-y-6">
            <ToggleField
              checked={internalSettings.twoFactorEnabled}
              label="Authentification à deux facteurs"
              description="Obligatoire pour tous les utilisateurs"
              onChange={(checked) => updateSettings('twoFactorEnabled', checked)}
            />

            <label className="block">
              <span className="mb-2 block text-sm font-semibold leading-5 text-[#172033]">
                Délai d'expiration de session (heures)
              </span>
              <input
                type="number"
                min={1}
                value={internalSettings.sessionExpirationHours}
                className={fieldClassName}
                onChange={(event) => updateSettings('sessionExpirationHours', Number(event.target.value))}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold leading-5 text-[#172033]">
                Nombre max de tentatives de connexion
              </span>
              <input
                type="number"
                min={1}
                value={internalSettings.maxLoginAttempts}
                className={fieldClassName}
                onChange={(event) => updateSettings('maxLoginAttempts', Number(event.target.value))}
              />
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-[#d8d2ca] bg-white px-6 py-6">
          <h2 className="text-base font-bold leading-6 text-[#172033]">Système</h2>
          <p className="mt-1 text-base leading-6 text-[#667085]">Configuration générale de l'application</p>

          <div className="mt-7 space-y-6">
            <ToggleField
              checked={internalSettings.maintenanceMode}
              label="Mode maintenance"
              description="Désactiver l'accès pour maintenance"
              onChange={(checked) => updateSettings('maintenanceMode', checked)}
            />
            <ToggleField
              checked={internalSettings.publicRegistration}
              label="Inscription publique"
              description="Permettre l'auto-inscription"
              onChange={(checked) => updateSettings('publicRegistration', checked)}
            />
            <ToggleField
              checked={internalSettings.emailNotifications}
              label="Notifications email"
              description="Envoyer des emails automatiques"
              onChange={(checked) => updateSettings('emailNotifications', checked)}
            />

            <div>
              <div className="mb-2 text-sm font-semibold leading-5 text-[#172033]">
                Fréquence des sauvegardes
              </div>
              <AdministrationSelect
                ariaLabel="Fréquence des sauvegardes"
                value={internalSettings.backupFrequency}
                options={administrationBackupFrequencies}
                onValueChange={(value) => updateSettings('backupFrequency', value)}
              />
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-[#d8d2ca] bg-white px-6 py-6">
        <h2 className="text-base font-bold leading-6 text-[#172033]">Actions dangereuses</h2>
        <p className="mt-1 text-base leading-6 text-[#667085]">
          Ces actions sont irréversibles et doivent être effectuées avec prudence
        </p>

        <div className="mt-7 space-y-4">
          {dangerActions.map((action) => {
            const Icon = action.icon;

            return (
              <article
                key={action.id}
                className="rounded-md border border-[#ffb3b3] bg-[#fff1f2] px-4 py-4 text-[#b91c1c]"
              >
                <h3 className="text-base font-bold leading-6">{action.title}</h3>
                <p className="mt-3 text-sm leading-5 text-[#e60012]">{action.description}</p>
                <button
                  type="button"
                  className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#c92f2f] px-4 text-sm font-semibold text-white transition hover:bg-[#b62626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c92f2f]/35"
                  onClick={() => onDangerAction?.(action)}
                >
                  <Icon className="size-4" strokeWidth={1.8} />
                  <span>{action.buttonLabel}</span>
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};
