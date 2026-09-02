import React from 'react';

import { SettingsAppearancePanel } from './SettingsAppearancePanel';
import { SettingsGeneralPanel } from './SettingsGeneralPanel';
import { SettingsNotificationsPanel } from './SettingsNotificationsPanel';
import { SettingsProfilePanel } from './SettingsProfilePanel';
import { SettingsSecurityPanel, type SettingsPasswordChange } from './SettingsSecurityPanel';
import { SettingsSystemPanel } from './SettingsSystemPanel';
import { SettingsTabs } from './SettingsTabs';
import {
  defaultSettingsAppearance,
  defaultSettingsGeneral,
  defaultSettingsNotifications,
  defaultSettingsProfile,
  defaultSettingsSecurity,
  defaultSettingsSessions,
  defaultSettingsSystemInfo,
} from './settings/defaultData';
import type {
  SettingsAppearanceState,
  SettingsAssistanceAction,
  SettingsGeneralState,
  SettingsNotificationState,
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
  profile = defaultSettingsProfile,
  security,
  sessions = defaultSettingsSessions,
  notifications,
  appearance,
  general,
  systemInfo = defaultSettingsSystemInfo,
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
  const [internalSecurity, setInternalSecurity] = React.useState(security ?? defaultSettingsSecurity);
  const [internalNotifications, setInternalNotifications] = React.useState(notifications ?? defaultSettingsNotifications);
  const [internalAppearance, setInternalAppearance] = React.useState(appearance ?? defaultSettingsAppearance);
  const [internalGeneral, setInternalGeneral] = React.useState(general ?? defaultSettingsGeneral);
  const resolvedTab = activeTab ?? internalTab;
  const resolvedSecurity = security ?? internalSecurity;
  const resolvedNotifications = notifications ?? internalNotifications;
  const resolvedAppearance = appearance ?? internalAppearance;
  const resolvedGeneral = general ?? internalGeneral;

  const changeTab = (tab: SettingsTabId) => {
    if (activeTab === undefined) setInternalTab(tab);
    onTabChange?.(tab);
  };
  const changeSecurity = (next: SettingsSecurityState) => {
    if (security === undefined) setInternalSecurity(next);
    onSecurityChange?.(next);
  };
  const changeNotifications = (next: SettingsNotificationState) => {
    if (notifications === undefined) setInternalNotifications(next);
    onNotificationsChange?.(next);
  };
  const changeAppearance = (next: SettingsAppearanceState) => {
    if (appearance === undefined) setInternalAppearance(next);
    onAppearanceChange?.(next);
  };
  const changeGeneral = (next: SettingsGeneralState) => {
    if (general === undefined) setInternalGeneral(next);
    onGeneralChange?.(next);
  };

  return (
    <section className={`space-y-6 bg-[#f5f3f0] text-[#172033] ${className}`} {...props}>
      <div>
        <h1 className="text-[32px] font-bold leading-tight text-[#0b1220]">Paramètres</h1>
        <p className="mt-1 text-base text-[#667085]">Gérez vos préférences et paramètres de compte</p>
      </div>
      <SettingsTabs value={resolvedTab} onValueChange={changeTab} />
      <div role="tabpanel" aria-label={resolvedTab}>
        {resolvedTab === 'profile' && <SettingsProfilePanel profile={profile} onSave={onProfileSave} onPhotoChange={onPhotoChange} />}
        {resolvedTab === 'security' && <SettingsSecurityPanel security={resolvedSecurity} sessions={sessions} onSecurityChange={changeSecurity} onPasswordChange={onPasswordChange} onDisconnectSession={onDisconnectSession} />}
        {resolvedTab === 'notifications' && <SettingsNotificationsPanel notifications={resolvedNotifications} onChange={changeNotifications} />}
        {resolvedTab === 'appearance' && <SettingsAppearancePanel appearance={resolvedAppearance} onChange={changeAppearance} />}
        {resolvedTab === 'general' && <SettingsGeneralPanel general={resolvedGeneral} onChange={changeGeneral} />}
        {resolvedTab === 'system' && <SettingsSystemPanel systemInfo={systemInfo} onClearCache={onClearCache} onAssistanceAction={onAssistanceAction} />}
      </div>
    </section>
  );
};
