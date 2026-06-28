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
  onUserAction?: (user: AdministrationUser) => void;
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

export const AdministrationModule = ({
  title = 'Administration',
  subtitle = "Gérez les utilisateurs, surveillez le système et configurez l'application",
  activeTab,
  defaultActiveTab = 'users',
  stats,
  users,
  logs = defaultAdministrationLogs,
  resources = defaultAdministrationResources,
  databaseMetrics = defaultAdministrationDatabaseMetrics,
  serverStatuses = defaultAdministrationServerStatuses,
  auditEntries = defaultAdministrationAuditEntries,
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
  const [searchValue, setSearchValue] = React.useState('');
  const [roleValue, setRoleValue] = React.useState<AdministrationRole | 'all'>('all');
  const [statusValue, setStatusValue] = React.useState<AdministrationStatus | 'all'>('all');
  const [logLevelValue, setLogLevelValue] = React.useState<AdministrationLogEntry['level'] | 'all'>('all');
  const [userModalOpen, setUserModalOpen] = React.useState(false);
  const resolvedActiveTab = activeTab ?? internalActiveTab;
  const resolvedUsers = users ?? internalUsers;
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

    setUserModalOpen(false);
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
          <AdministrationUsersTable users={visibleUsers} onUserAction={onUserAction} />
        </div>
      )}

      {resolvedActiveTab === 'logs' && (
        <AdministrationLogsPanel
          logs={logs}
          levelValue={logLevelValue}
          onLevelChange={setLogLevelValue}
          onRefresh={onRefreshLogs}
          onExportCsv={onExportLogsCsv}
          onClear={onClearLogs}
        />
      )}

      {resolvedActiveTab === 'system' && (
        <AdministrationSystemPanel
          resources={resources}
          databaseMetrics={databaseMetrics}
          serverStatuses={serverStatuses}
          onCreateBackup={onCreateBackup}
        />
      )}

      {resolvedActiveTab === 'audit' && <AdministrationAuditPanel entries={auditEntries} />}

      {resolvedActiveTab === 'settings' && (
        <AdministrationSettingsPanel
          settings={settings}
          dangerActions={dangerActions}
          onSettingsChange={onSettingsChange}
          onDangerAction={onDangerAction}
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
