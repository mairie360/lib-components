import React from 'react';

import { SettingsAppearancePanel } from './SettingsAppearancePanel';
import { SettingsGeneralPanel } from './SettingsGeneralPanel';
import { SettingsNotificationsPanel } from './SettingsNotificationsPanel';
import { SettingsProfilePanel } from './SettingsProfilePanel';
import { SettingsSecurityPanel, type SettingsPasswordChange } from './SettingsSecurityPanel';
import { SettingsSystemPanel } from './SettingsSystemPanel';
import { SettingsTabs } from './SettingsTabs';
import type {
  SettingsAppearanceState,
  SettingsAssistanceAction,
  SettingsGeneralState,
  SettingsNotificationState,
  SettingsOption,
  SettingsProfile,
  SettingsSecurityState,
  SettingsSession,
  SettingsSystemInfo,
  SettingsTabId,
} from './settings/types';

export interface SettingsModuleProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange' | 'security'> {
  activeTab?: SettingsTabId;
  defaultActiveTab?: SettingsTabId;
  profile?: SettingsProfile;
  serviceOptions?: SettingsOption[];
  security?: SettingsSecurityState;
  sessions?: SettingsSession[];
  notifications?: SettingsNotificationState;
  appearance?: SettingsAppearanceState;
  general?: SettingsGeneralState;
  systemInfo?: SettingsSystemInfo;
  onTabChange?: (tab: SettingsTabId) => void;
  onProfileSave?: (profile: SettingsProfile) => void;
  onPhotoChange?: (file: File) => void;
  onPasswordChange?: (change: SettingsPasswordChange) => void;
  onSecurityChange?: (security: SettingsSecurityState) => void;
  onDisconnectSession?: (session: SettingsSession) => void;
  onNotificationsChange?: (notifications: SettingsNotificationState) => void;
  onAppearanceChange?: (appearance: SettingsAppearanceState) => void;
  onGeneralChange?: (general: SettingsGeneralState) => void;
  onClearCache?: () => void;
  onAssistanceAction?: (action: SettingsAssistanceAction) => void;
}

export const SettingsModule = ({
  activeTab,
  defaultActiveTab = 'profile',
  profile,
  serviceOptions,
  security,
  sessions,
  notifications,
  appearance,
  general,
  systemInfo,
  onTabChange,
  onProfileSave,
  onPhotoChange,
  onPasswordChange,
  onSecurityChange,
  onDisconnectSession,
  onNotificationsChange,
  onAppearanceChange,
  onGeneralChange,
  onClearCache,
  onAssistanceAction,
  className = '',
  ...props
}: SettingsModuleProps) => {
  const [internalTab, setInternalTab] = React.useState<SettingsTabId>(defaultActiveTab);
  const resolvedTab = activeTab ?? internalTab;
  const unavailable = <p role="status" className="rounded-lg border border-[#d8d2ca] bg-white px-6 py-6 text-sm text-[#667085]">Données indisponibles pour cette rubrique.</p>;

  const changeTab = (tab: SettingsTabId) => {
    if (activeTab === undefined) setInternalTab(tab);
    onTabChange?.(tab);
  };

  return (
    <section className={`space-y-6 bg-[#f5f3f0] text-[#172033] ${className}`} {...props}>
      <div>
        <h1 className="text-[32px] font-bold leading-tight text-[#0b1220]">Paramètres</h1>
        <p className="mt-1 text-base text-[#667085]">Gérez vos préférences et paramètres de compte</p>
      </div>
      <SettingsTabs value={resolvedTab} onValueChange={changeTab} />
      <div role="tabpanel" aria-label={resolvedTab}>
        {resolvedTab === 'profile' && (profile ? <SettingsProfilePanel profile={profile} serviceOptions={serviceOptions} onSave={onProfileSave} onPhotoChange={onPhotoChange} /> : unavailable)}
        {resolvedTab === 'security' && (security ? <SettingsSecurityPanel security={security} sessions={sessions} onSecurityChange={onSecurityChange} onPasswordChange={onPasswordChange} onDisconnectSession={onDisconnectSession} /> : unavailable)}
        {resolvedTab === 'notifications' && (notifications ? <SettingsNotificationsPanel notifications={notifications} onChange={onNotificationsChange} /> : unavailable)}
        {resolvedTab === 'appearance' && (appearance ? <SettingsAppearancePanel appearance={appearance} onChange={onAppearanceChange} /> : unavailable)}
        {resolvedTab === 'general' && (general ? <SettingsGeneralPanel general={general} onChange={onGeneralChange} /> : unavailable)}
        {resolvedTab === 'system' && (systemInfo ? <SettingsSystemPanel systemInfo={systemInfo} onClearCache={onClearCache} onAssistanceAction={onAssistanceAction} /> : unavailable)}
      </div>
    </section>
  );
};
