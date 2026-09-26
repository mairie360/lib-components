import type { SettingsOption } from './types';

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
