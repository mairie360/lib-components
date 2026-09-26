import React from 'react';

import { SettingsSection, SettingsSelect, SettingsToggle } from './settings/controls';
import {
  settingsDateFormatOptions,
  settingsHomePageOptions,
  settingsLanguageOptions,
  settingsTimezoneOptions,
} from './settings/options';
import type { SettingsGeneralState, SettingsOption } from './settings/types';

export interface SettingsGeneralPanelProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  general: SettingsGeneralState;
  languageOptions?: SettingsOption[];
  timezoneOptions?: SettingsOption[];
  dateFormatOptions?: SettingsOption[];
  homePageOptions?: SettingsOption[];
  onChange?: (general: SettingsGeneralState) => void;
}

export const SettingsGeneralPanel = ({
  general,
  languageOptions = settingsLanguageOptions,
  timezoneOptions = settingsTimezoneOptions,
  dateFormatOptions = settingsDateFormatOptions,
  homePageOptions = settingsHomePageOptions,
  onChange,
  className = '',
  ...props
}: SettingsGeneralPanelProps) => {
  const update = <K extends keyof SettingsGeneralState>(field: K, value: SettingsGeneralState[K]) =>
    onChange?.({ ...general, [field]: value });

  return (
    <div className={`space-y-6 ${className}`} {...props}>
      <SettingsSection title="Langue et région">
        <div className="space-y-4">
          <SettingsSelect id="settings-language" label="Langue de l'interface" value={general.language} options={languageOptions} disabled={!onChange} onChange={(value) => update('language', value)} />
          <SettingsSelect id="settings-timezone" label="Fuseau horaire" value={general.timezone} options={timezoneOptions} disabled={!onChange} onChange={(value) => update('timezone', value)} />
          <SettingsSelect id="settings-date-format" label="Format de date" value={general.dateFormat} options={dateFormatOptions} disabled={!onChange} onChange={(value) => update('dateFormat', value)} />
        </div>
      </SettingsSection>

      <SettingsSection title="Démarrage">
        <div className="space-y-4">
          <SettingsSelect id="settings-home-page" label="Page d'accueil par défaut" value={general.homePage} options={homePageOptions} disabled={!onChange} onChange={(value) => update('homePage', value)} />
          <SettingsToggle
            label="Ouverture automatique des notifications"
            description="Ouvrir automatiquement le panneau de notifications au démarrage"
            checked={general.autoOpenNotifications}
            disabled={!onChange}
            onChange={(value) => update('autoOpenNotifications', value)}
          />
        </div>
      </SettingsSection>
    </div>
  );
};
