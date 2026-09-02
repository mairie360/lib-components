import type {
  SettingsAppearanceState,
  SettingsGeneralState,
  SettingsNotificationState,
  SettingsOption,
  SettingsProfile,
  SettingsSecurityState,
  SettingsSession,
  SettingsSystemInfo,
} from './types';

export const defaultSettingsProfile: SettingsProfile = {
  initials: 'JD',
  fullName: 'Jean Dupont',
  email: 'jean.dupont@mairie.fr',
  phone: '+33 1 23 45 67 89',
  service: 'direction-generale',
  position: 'Directeur',
  biography: "Directeur de la mairie depuis 2018, passionné par le service public et l'innovation.",
};

export const defaultSettingsSecurity: SettingsSecurityState = {
  smsTwoFactor: false,
  authenticatorTwoFactor: false,
};

export const defaultSettingsSessions: SettingsSession[] = [
  {
    id: 'current-session',
    label: 'Session actuelle',
    description: 'Chrome sur Windows • Paris, France',
    current: true,
  },
  {
    id: 'mobile-session',
    label: 'Session mobile',
    description: 'Safari sur iPhone • Il y a 2 heures',
  },
];

export const defaultSettingsNotifications: SettingsNotificationState = {
  email: true,
  push: true,
  desktop: false,
  messages: true,
  projects: true,
  calendar: true,
};

export const defaultSettingsAppearance: SettingsAppearanceState = {
  theme: 'system',
  fontFamily: 'system',
  fontSize: 33,
  density: 'normal',
};

export const defaultSettingsGeneral: SettingsGeneralState = {
  language: 'fr',
  timezone: 'Europe/Paris',
  dateFormat: 'DD/MM/YYYY',
  homePage: 'dashboard',
  autoOpenNotifications: false,
};

export const defaultSettingsSystemInfo: SettingsSystemInfo = {
  appVersion: 'Mairie360 v2.1.0',
  lastUpdate: '15 novembre 2024',
  browser: 'Chrome 119.0.0.0',
  operatingSystem: 'Windows 11',
  storageUsedMb: 2.4,
  storageLimitMb: 50,
};

export const settingsServiceOptions: SettingsOption[] = [
  { value: 'direction-generale', label: 'Direction Générale' },
  { value: 'ressources-humaines', label: 'Ressources Humaines' },
  { value: 'urbanisme', label: 'Urbanisme' },
  { value: 'communication', label: 'Communication' },
];

export const settingsFontOptions: SettingsOption[] = [
  { value: 'system', label: 'Police système' },
  { value: 'sans', label: 'Sans serif' },
  { value: 'serif', label: 'Serif' },
];

export const settingsDensityOptions: SettingsOption[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'normal', label: 'Normal' },
  { value: 'comfortable', label: 'Confortable' },
];

export const settingsLanguageOptions: SettingsOption[] = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
];

export const settingsTimezoneOptions: SettingsOption[] = [
  { value: 'Europe/Paris', label: 'Europe/Paris (UTC+1)' },
  { value: 'Indian/Reunion', label: 'Indian/Réunion (UTC+4)' },
  { value: 'UTC', label: 'UTC' },
];

export const settingsDateFormatOptions: SettingsOption[] = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
];

export const settingsHomePageOptions: SettingsOption[] = [
  { value: 'dashboard', label: 'Tableau de bord' },
  { value: 'projects', label: 'Projets' },
  { value: 'calendar', label: 'Calendrier' },
  { value: 'messages', label: 'Messagerie' },
];

