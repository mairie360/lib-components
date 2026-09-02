export type SettingsTabId =
  | 'profile'
  | 'security'
  | 'notifications'
  | 'appearance'
  | 'general'
  | 'system';

export interface SettingsProfile {
  initials: string;
  avatarUrl?: string;
  fullName: string;
  email: string;
  phone: string;
  service: string;
  position: string;
  biography: string;
}

export interface SettingsSession {
  id: string;
  label: string;
  description: string;
  current?: boolean;
}

export interface SettingsSecurityState {
  smsTwoFactor: boolean;
  authenticatorTwoFactor: boolean;
}

export interface SettingsNotificationState {
  email: boolean;
  push: boolean;
  desktop: boolean;
  messages: boolean;
  projects: boolean;
  calendar: boolean;
}

export type SettingsTheme = 'light' | 'dark' | 'system';

export interface SettingsAppearanceState {
  theme: SettingsTheme;
  fontFamily: string;
  fontSize: number;
  density: string;
}

export interface SettingsGeneralState {
  language: string;
  timezone: string;
  dateFormat: string;
  homePage: string;
  autoOpenNotifications: boolean;
}

export interface SettingsSystemInfo {
  appVersion: string;
  lastUpdate: string;
  browser: string;
  operatingSystem: string;
  storageUsedMb: number;
  storageLimitMb: number;
}

export type SettingsAssistanceAction = 'help' | 'support' | 'report' | 'download-logs';

export interface SettingsOption {
  value: string;
  label: string;
}

