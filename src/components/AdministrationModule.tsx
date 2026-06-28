import React from 'react';

import {
  defaultAdministrationAuditEntries,
  defaultAdministrationDatabaseMetrics,
  defaultAdministrationDangerActions,
  defaultAdministrationLogs,
  defaultAdministrationResources,
  defaultAdministrationServerStatuses,
  defaultAdministrationSettings,
  defaultAdministrationStats,
  defaultAdministrationUsers,
} from './administration/defaultData';
import type {
  AdministrationAuditEntry,
  AdministrationDangerAction,
  AdministrationDatabaseMetric,
  AdministrationLogEntry,
  AdministrationResource,
  AdministrationRole,
  AdministrationServerStatus,
  AdministrationSettingsState,
  AdministrationStat,
  AdministrationStatus,
  AdministrationTabId,
  AdministrationUser,
  AdministrationUserAction,
  AdministrationUserFormValues,
} from './administration/types';
import { AdministrationAuditPanel } from './AdministrationAuditPanel';
import { AdministrationLogsPanel } from './AdministrationLogsPanel';
import { AdministrationMetricCards } from './AdministrationMetricCards';
import { AdministrationSettingsPanel } from './AdministrationSettingsPanel';
import { AdministrationSystemPanel } from './AdministrationSystemPanel';
import { AdministrationTabs } from './AdministrationTabs';
import { AdministrationUserFilters } from './AdministrationUserFilters';
import { AdministrationUserModal } from './AdministrationUserModal';
import { AdministrationUsersTable } from './AdministrationUsersTable';
import { joinClasses } from './calendar/style';

export interface AdministrationModuleProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  activeTab?: AdministrationTabId;
  defaultActiveTab?: AdministrationTabId;
  stats?: AdministrationStat[];
  users?: AdministrationUser[];
  logs?: AdministrationLogEntry[];
  resources?: AdministrationResource[];
  databaseMetrics?: AdministrationDatabaseMetric[];
  serverStatuses?: AdministrationServerStatus[];
  auditEntries?: AdministrationAuditEntry[];
  settings?: AdministrationSettingsState;
  dangerActions?: AdministrationDangerAction[];
  onTabChange?: (tab: AdministrationTabId) => void;
  onCreateUser?: (values: AdministrationUserFormValues) => void;
  onUserAction?: (user: AdministrationUser, action?: AdministrationUserAction) => void;
  onRefreshLogs?: () => void;
  onExportLogsCsv?: () => void;
  onClearLogs?: () => void;
  onCreateBackup?: () => void;
  onSettingsChange?: (settings: AdministrationSettingsState) => void;
  onDangerAction?: (action: AdministrationDangerAction) => void;
}

const normalizeSearch = (value: string) =>
  value
    .toLocaleLowerCase('fr-FR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const createLocalUser = (values: AdministrationUserFormValues): AdministrationUser => ({
  id: `user-${Date.now()}`,
  name: values.name,
  email: values.email,
  service: values.service,
  phone: values.phone || '-',
  role: values.role,
  status: 'active',
  lastConnection: 'Jamais',
});

const roleOrder: AdministrationRole[] = ['user', 'manager', 'admin'];

const roleLabels: Record<AdministrationRole, string> = {
  admin: 'Administrateur',
  manager: 'Manager',
  user: 'Utilisateur',
};

const statusLabels: Record<AdministrationStatus, string> = {
  active: 'actif',
  inactive: 'inactif',
  suspended: 'suspendu',
};

const buildStatsFromUsers = (stats: AdministrationStat[], users: AdministrationUser[]) =>
  stats.map((stat) => {
    if (stat.id === 'users') {
      return { ...stat, value: users.length };
    }

    if (stat.id === 'active') {
      return {
        ...stat,
        value: users.filter((user) => user.status === 'active').length,
        indicator: users.length > 0 ? `${Math.round((users.filter((user) => user.status === 'active').length / users.length) * 100)}%` : '0%',
      };
    }

    return stat;
  });

const formatDateTime = (date: Date) =>
  new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);

const escapeCsvValue = (value: React.ReactNode) =>
  `"${String(value ?? '').replace(/"/g, '""')}"`;

const buildLogsCsv = (logs: AdministrationLogEntry[]) => {
  const rows = [
    ['Niveau', 'Source', 'Titre', 'Description', 'Acteur', 'Horodatage', 'Adresse IP'],
    ...logs.map((log) => [
      log.level,
      log.source,
      log.title,
      log.description,
      log.actor ?? '',
      log.timestamp,
      log.ipAddress ?? '',
    ]),
  ];

  return rows.map((row) => row.map(escapeCsvValue).join(',')).join('\n');
};

const downloadCsv = (filename: string, csv: string) => {
  if (typeof window === 'undefined' || typeof document === 'undefined' || typeof Blob === 'undefined') {
    return csv;
  }

  const url = window.URL?.createObjectURL?.(
    new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' })
  );

  if (!url) return csv;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL?.revokeObjectURL?.(url);

  return csv;
};

export const AdministrationModule = ({
  title = 'Administration',
  subtitle = "Gérez les utilisateurs, surveillez le système et configurez l'application",
  activeTab,
  defaultActiveTab = 'users',
  stats,
  users,
  logs,
  resources = defaultAdministrationResources,
  databaseMetrics,
  serverStatuses = defaultAdministrationServerStatuses,
  auditEntries,
  settings = defaultAdministrationSettings,
  dangerActions = defaultAdministrationDangerActions,
  onTabChange,
  onCreateUser,
  onUserAction,
  onRefreshLogs,
  onExportLogsCsv,
  onClearLogs,
  onCreateBackup,
  onSettingsChange,
  onDangerAction,
  className = '',
  ...props
}: AdministrationModuleProps) => {
  const [internalActiveTab, setInternalActiveTab] = React.useState(defaultActiveTab);
  const [internalUsers, setInternalUsers] = React.useState(defaultAdministrationUsers);
  const [internalLogs, setInternalLogs] = React.useState(defaultAdministrationLogs);
  const [internalDatabaseMetrics, setInternalDatabaseMetrics] = React.useState(defaultAdministrationDatabaseMetrics);
  const [internalAuditEntries, setInternalAuditEntries] = React.useState(defaultAdministrationAuditEntries);
  const [searchValue, setSearchValue] = React.useState('');
  const [roleValue, setRoleValue] = React.useState<AdministrationRole | 'all'>('all');
  const [statusValue, setStatusValue] = React.useState<AdministrationStatus | 'all'>('all');
  const [logLevelValue, setLogLevelValue] = React.useState<AdministrationLogEntry['level'] | 'all'>('all');
  const [userModalOpen, setUserModalOpen] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const resolvedActiveTab = activeTab ?? internalActiveTab;
  const resolvedUsers = users ?? internalUsers;
  const resolvedLogs = logs ?? internalLogs;
  const resolvedDatabaseMetrics = databaseMetrics ?? internalDatabaseMetrics;
  const resolvedAuditEntries = auditEntries ?? internalAuditEntries;
  const resolvedStats = stats ?? buildStatsFromUsers(defaultAdministrationStats, resolvedUsers);
  const normalizedQuery = normalizeSearch(searchValue);
  const visibleUsers = resolvedUsers.filter((user) => {
    const searchable = normalizeSearch(`${user.name} ${user.email} ${user.service} ${user.phone}`);
    const matchesSearch = normalizedQuery.length === 0 || searchable.includes(normalizedQuery);
    const matchesRole = roleValue === 'all' || user.role === roleValue;
    const matchesStatus = statusValue === 'all' || user.status === statusValue;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleTabChange = (tab: AdministrationTabId) => {
    if (activeTab === undefined) {
      setInternalActiveTab(tab);
    }

    onTabChange?.(tab);
  };

  const handleCreateUser = (values: AdministrationUserFormValues) => {
    onCreateUser?.(values);

    if (users === undefined) {
      setInternalUsers((currentUsers) => [...currentUsers, createLocalUser(values)]);
    }

    setStatusMessage(`Utilisateur ${values.name} créé.`);
    setUserModalOpen(false);
  };

  const updateInternalUser = (userId: string, updater: (user: AdministrationUser) => AdministrationUser) => {
    if (users !== undefined) return;

    setInternalUsers((currentUsers) =>
      currentUsers.map((currentUser) => (currentUser.id === userId ? updater(currentUser) : currentUser))
    );
  };

  const handleUserStatusToggle = (user: AdministrationUser) => {
    const nextStatus: AdministrationStatus = user.status === 'active' ? 'inactive' : 'active';
    updateInternalUser(user.id, (currentUser) => ({
      ...currentUser,
      status: nextStatus,
    }));
    setStatusMessage(`${user.name} est maintenant ${statusLabels[nextStatus]}.`);
  };

  const handleUserRoleCycle = (user: AdministrationUser) => {
    const currentIndex = roleOrder.indexOf(user.role);
    const nextRole = roleOrder[(currentIndex + 1) % roleOrder.length];

    updateInternalUser(user.id, (currentUser) => ({
      ...currentUser,
      role: nextRole,
    }));
    setStatusMessage(`${user.name} est maintenant ${roleLabels[nextRole]}.`);
  };

  const handleUserDelete = (user: AdministrationUser) => {
    if (users === undefined) {
      setInternalUsers((currentUsers) => currentUsers.filter((currentUser) => currentUser.id !== user.id));
    }

    setStatusMessage(`${user.name} a été supprimé.`);
  };

  const prependLog = (log: AdministrationLogEntry) => {
    if (logs === undefined) {
      setInternalLogs((currentLogs) => [log, ...currentLogs]);
    }
  };

  const prependAuditEntry = (entry: AdministrationAuditEntry) => {
    if (auditEntries === undefined) {
      setInternalAuditEntries((currentEntries) => [entry, ...currentEntries]);
    }
  };

  const handleRefreshLogs = () => {
    onRefreshLogs?.();
    prependLog({
      id: `refresh-${Date.now()}`,
      level: 'info',
      source: 'SYSTEM',
      title: 'Actualisation effectuée',
      description: 'Les journaux système ont été actualisés',
      actor: 'admin@mairie360.fr',
      timestamp: formatDateTime(new Date()),
      ipAddress: '127.0.0.1',
    });
    setStatusMessage('Logs actualisés.');
  };

  const handleExportLogsCsv = () => {
    onExportLogsCsv?.();
    downloadCsv('mairie360-logs.csv', buildLogsCsv(resolvedLogs));
    setStatusMessage('Export CSV préparé.');
  };

  const handleClearLogs = () => {
    onClearLogs?.();

    if (logs === undefined) {
      setInternalLogs([]);
    }

    setStatusMessage('Tous les logs ont été effacés.');
  };

  const handleCreateBackup = () => {
    onCreateBackup?.();

    if (databaseMetrics === undefined) {
      setInternalDatabaseMetrics((currentMetrics) =>
        currentMetrics.map((metric) =>
          metric.id === 'last-backup' ? { ...metric, value: "À l'instant" } : metric
        )
      );
    }

    prependLog({
      id: `backup-${Date.now()}`,
      level: 'info',
      source: 'BACKUP',
      title: 'Sauvegarde créée',
      description: 'Une nouvelle sauvegarde de la base de données a été créée',
      actor: 'admin@mairie360.fr',
      timestamp: formatDateTime(new Date()),
    });
    setStatusMessage('Sauvegarde créée.');
  };

  const handleSettingsChange = (nextSettings: AdministrationSettingsState) => {
    onSettingsChange?.(nextSettings);
    setStatusMessage('Paramètres mis à jour.');
  };

  const handleDangerAction = (action: AdministrationDangerAction) => {
    onDangerAction?.(action);

    if (action.id === 'clear-logs') {
      if (logs === undefined) {
        setInternalLogs([]);
      }

      setStatusMessage('Tous les logs ont été effacés.');
      return;
    }

    prependAuditEntry({
      id: `${action.id}-${Date.now()}`,
      action: 'Action dangereuse',
      actor: 'Admin Système',
      subject: action.title,
      description: action.description,
      timestamp: formatDateTime(new Date()),
      outcome: 'success',
    });
    setStatusMessage(`${action.buttonLabel} effectué.`);
  };

  return (
    <section
      className={joinClasses('space-y-6 bg-[#f5f3f0] text-[#172033]', className)}
      {...props}
    >
      <div>
        <h1 className="text-[32px] font-bold leading-tight text-[#0b1220]">{title}</h1>
        {subtitle && <p className="mt-1 text-base leading-6 text-[#334155]">{subtitle}</p>}
      </div>

      <AdministrationMetricCards stats={resolvedStats} />

      <AdministrationTabs value={resolvedActiveTab} onValueChange={handleTabChange} />

      {statusMessage && (
        <div
          role="status"
          className="rounded-md border border-[#b9d6d5] bg-white px-4 py-3 text-sm font-medium text-[#2f5f5c]"
        >
          {statusMessage}
        </div>
      )}

      {resolvedActiveTab === 'users' && (
        <div className="space-y-6">
          <AdministrationUserFilters
            searchValue={searchValue}
            roleValue={roleValue}
            statusValue={statusValue}
            onSearchChange={setSearchValue}
            onRoleChange={setRoleValue}
            onStatusChange={setStatusValue}
            onNewUserClick={() => setUserModalOpen(true)}
          />
          <AdministrationUsersTable
            users={visibleUsers}
            onUserAction={onUserAction}
            onToggleUserStatus={handleUserStatusToggle}
            onCycleUserRole={handleUserRoleCycle}
            onDeleteUser={handleUserDelete}
          />
        </div>
      )}

      {resolvedActiveTab === 'logs' && (
        <AdministrationLogsPanel
          logs={resolvedLogs}
          levelValue={logLevelValue}
          onLevelChange={setLogLevelValue}
          onRefresh={handleRefreshLogs}
          onExportCsv={handleExportLogsCsv}
          onClear={handleClearLogs}
        />
      )}

      {resolvedActiveTab === 'system' && (
        <AdministrationSystemPanel
          resources={resources}
          databaseMetrics={resolvedDatabaseMetrics}
          serverStatuses={serverStatuses}
          onCreateBackup={handleCreateBackup}
        />
      )}

      {resolvedActiveTab === 'audit' && <AdministrationAuditPanel entries={resolvedAuditEntries} />}

      {resolvedActiveTab === 'settings' && (
        <AdministrationSettingsPanel
          settings={settings}
          dangerActions={dangerActions}
          onSettingsChange={handleSettingsChange}
          onDangerAction={handleDangerAction}
        />
      )}

      <AdministrationUserModal
        isOpen={userModalOpen}
        onCancel={() => setUserModalOpen(false)}
        onCreateUser={handleCreateUser}
      />
    </section>
  );
};
