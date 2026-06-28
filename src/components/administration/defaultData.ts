import {
  Activity,
  AlertTriangle,
  CircleX,
  Cpu,
  Database,
  HardDrive,
  KeyRound,
  RotateCcw,
  Trash2,
  Users,
  Wifi,
} from 'lucide-react';

import type {
  AdministrationAuditEntry,
  AdministrationDangerAction,
  AdministrationDatabaseMetric,
  AdministrationLogEntry,
  AdministrationResource,
  AdministrationServerStatus,
  AdministrationSettingsState,
  AdministrationStat,
  AdministrationUser,
} from './types';

export const defaultAdministrationStats: AdministrationStat[] = [
  {
    id: 'users',
    label: 'Utilisateurs total',
    value: 4,
    tone: 'blue',
    icon: Users,
    indicator: 'up',
  },
  {
    id: 'active',
    label: 'Comptes actifs',
    value: 3,
    tone: 'green',
    icon: Activity,
    indicator: '75%',
  },
  {
    id: 'warnings',
    label: 'Avertissements',
    value: 1,
    tone: 'yellow',
    icon: AlertTriangle,
    indicator: '!',
  },
  {
    id: 'errors',
    label: 'Erreurs système',
    value: 2,
    tone: 'red',
    icon: CircleX,
    indicator: 'down',
  },
];

export const defaultAdministrationUsers: AdministrationUser[] = [
  {
    id: 'admin-systeme',
    name: 'Admin Système',
    email: 'admin@mairie360.fr',
    service: 'Direction',
    phone: '+33 1 23 45 67 89',
    role: 'admin',
    status: 'active',
    lastConnection: '28/06/2026',
  },
  {
    id: 'marie-martin',
    name: 'Marie Martin',
    email: 'marie.martin@mairie360.fr',
    service: 'Ressources Humaines',
    phone: '+33 1 23 45 67 90',
    role: 'manager',
    status: 'active',
    lastConnection: '27/12/2024',
  },
  {
    id: 'jean-dupont',
    name: 'Jean Dupont',
    email: 'jean.dupont@mairie360.fr',
    service: 'Urbanisme',
    phone: '+33 1 23 45 67 91',
    role: 'user',
    status: 'active',
    lastConnection: '26/12/2024',
  },
  {
    id: 'sophie-bernard',
    name: 'Sophie Bernard',
    email: 'sophie.bernard@mairie360.fr',
    service: 'Communication',
    phone: '+33 1 23 45 67 92',
    role: 'user',
    status: 'suspended',
    lastConnection: '24/12/2024',
  },
];

export const defaultAdministrationLogs: AdministrationLogEntry[] = [
  {
    id: 'auth-success',
    level: 'info',
    source: 'AUTH',
    title: 'Connexion réussie',
    description: 'Connexion depuis Chrome sur Windows',
    actor: 'admin@mairie360.fr',
    timestamp: '28/06/2026 20:16:25',
    ipAddress: '192.168.1.100',
  },
  {
    id: 'api-error',
    level: 'error',
    source: 'API',
    title: 'Erreur de requête',
    description: "Timeout lors de l'appel à /api/projects",
    timestamp: '28/06/2026 20:11:25',
    ipAddress: '192.168.1.101',
  },
  {
    id: 'storage-warning',
    level: 'warning',
    source: 'STORAGE',
    title: 'Espace disque faible',
    description: 'Utilisation à 85% du stockage',
    timestamp: '28/06/2026 20:06:25',
  },
];

export const defaultAdministrationResources: AdministrationResource[] = [
  {
    id: 'cpu',
    label: 'CPU',
    valueLabel: '45 % / 100 %',
    percentage: 45,
    tone: 'green',
    icon: Cpu,
  },
  {
    id: 'ram',
    label: 'RAM',
    valueLabel: '6.2 GB / 16 GB',
    percentage: 39,
    tone: 'green',
    icon: Database,
  },
  {
    id: 'disk',
    label: 'Disque',
    valueLabel: '85 % / 100 %',
    percentage: 85,
    tone: 'yellow',
    icon: HardDrive,
  },
  {
    id: 'network',
    label: 'Réseau',
    valueLabel: '125 Mbps / 1000 Mbps',
    percentage: 13,
    tone: 'green',
    icon: Wifi,
  },
];

export const defaultAdministrationDatabaseMetrics: AdministrationDatabaseMetric[] = [
  { id: 'size', label: 'Taille totale', value: '2.3 GB' },
  { id: 'tables', label: 'Tables', value: 42 },
  { id: 'records', label: 'Enregistrements', value: '125,438' },
  { id: 'last-backup', label: 'Dernière sauvegarde', value: 'Il y a 2h' },
];

export const defaultAdministrationServerStatuses: AdministrationServerStatus[] = [
  { id: 'api', label: 'API', description: 'En ligne', status: 'online' },
  { id: 'database', label: 'Base de données', description: 'Connectée', status: 'connected' },
  { id: 'storage', label: 'Storage', description: 'Disponible', status: 'available' },
  { id: 'email', label: 'Email', description: 'Latence élevée', status: 'warning' },
];

export const defaultAdministrationAuditEntries: AdministrationAuditEntry[] = [
  {
    id: 'role-change',
    action: 'Modification',
    actor: 'Admin Système',
    subject: 'Utilisateur: Marie Martin',
    description: 'Changement de rôle: user → manager',
    timestamp: '28/06/2026 20:16:25',
    outcome: 'success',
  },
  {
    id: 'project-delete',
    action: 'Suppression',
    actor: 'Admin Système',
    subject: 'Projet: Ancien site web',
    description: 'Projet archivé puis supprimé',
    timestamp: '28/06/2026 20:11:25',
    outcome: 'success',
  },
  {
    id: 'denied-system-edit',
    action: 'Tentative de modification',
    actor: 'Marie Martin',
    subject: 'Paramètres système',
    description: 'Accès refusé - permissions insuffisantes',
    timestamp: '28/06/2026 20:06:25',
    outcome: 'danger',
  },
];

export const defaultAdministrationSettings: AdministrationSettingsState = {
  twoFactorEnabled: false,
  sessionExpirationHours: 8,
  maxLoginAttempts: 5,
  maintenanceMode: false,
  publicRegistration: true,
  emailNotifications: true,
  backupFrequency: 'daily',
};

export const defaultAdministrationDangerActions: AdministrationDangerAction[] = [
  {
    id: 'reset-passwords',
    title: 'Réinitialiser tous les mots de passe',
    description: 'Force tous les utilisateurs à réinitialiser leur mot de passe à la prochaine connexion.',
    buttonLabel: 'Réinitialiser',
    icon: KeyRound,
  },
  {
    id: 'clear-logs',
    title: 'Effacer tous les logs',
    description: 'Supprime définitivement tous les logs du système. Cette action est irréversible.',
    buttonLabel: 'Effacer les logs',
    icon: Trash2,
  },
];

export const administrationBackupFrequencies = [
  { value: 'hourly', label: 'Toutes les heures' },
  { value: 'daily', label: 'Quotidienne' },
  { value: 'weekly', label: 'Hebdomadaire' },
  { value: 'monthly', label: 'Mensuelle' },
];

export const administrationLogLevelOptions = [
  { value: 'all', label: 'Tous les niveaux' },
  { value: 'info', label: 'Information' },
  { value: 'warning', label: 'Avertissement' },
  { value: 'error', label: 'Erreur' },
];

export const administrationRoleOptions = [
  { value: 'all', label: 'Tous les rôles' },
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'user', label: 'Utilisateur' },
];

export const administrationStatusOptions = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
  { value: 'suspended', label: 'Suspendu' },
];

export const administrationUserRoleOptions = [
  { value: 'admin', label: 'Administrateur' },
  { value: 'manager', label: 'Manager' },
  { value: 'user', label: 'Utilisateur' },
];

export const RefreshIcon = RotateCcw;
