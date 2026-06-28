import type React from 'react';
import type { LucideIcon } from 'lucide-react';

export type AdministrationTabId = 'users' | 'logs' | 'system' | 'audit' | 'settings';

export type AdministrationRole = 'admin' | 'manager' | 'user';

export type AdministrationStatus = 'active' | 'inactive' | 'suspended';

export type AdministrationTone = 'blue' | 'green' | 'yellow' | 'red' | 'gray';

export type AdministrationUserAction = 'open' | 'edit' | 'toggle-status' | 'delete';

export interface AdministrationStat {
  id: string;
  label: string;
  value: React.ReactNode;
  tone: Exclude<AdministrationTone, 'gray'>;
  icon: LucideIcon;
  indicator?: React.ReactNode;
}

export interface AdministrationUser {
  id: string;
  name: string;
  email: string;
  service: string;
  phone: string;
  role: AdministrationRole;
  status: AdministrationStatus;
  lastConnection: string;
}

export interface AdministrationUserFormValues {
  name: string;
  email: string;
  service: string;
  phone: string;
  role: AdministrationRole;
}

export interface AdministrationLogEntry {
  id: string;
  level: 'info' | 'warning' | 'error';
  source: string;
  title: string;
  description: string;
  actor?: string;
  timestamp: string;
  ipAddress?: string;
}

export interface AdministrationResource {
  id: string;
  label: string;
  valueLabel: string;
  percentage: number;
  tone?: 'green' | 'yellow' | 'red';
  icon: LucideIcon;
}

export interface AdministrationDatabaseMetric {
  id: string;
  label: string;
  value: React.ReactNode;
}

export interface AdministrationServerStatus {
  id: string;
  label: string;
  description: string;
  status: 'online' | 'connected' | 'available' | 'warning' | 'offline';
}

export interface AdministrationAuditEntry {
  id: string;
  action: string;
  actor: string;
  subject: string;
  description: string;
  timestamp: string;
  outcome: 'success' | 'danger';
}

export interface AdministrationSettingsState {
  twoFactorEnabled: boolean;
  sessionExpirationHours: number;
  maxLoginAttempts: number;
  maintenanceMode: boolean;
  publicRegistration: boolean;
  emailNotifications: boolean;
  backupFrequency: string;
}

export interface AdministrationDangerAction {
  id: string;
  title: string;
  description: string;
  buttonLabel: string;
  icon: LucideIcon;
}
