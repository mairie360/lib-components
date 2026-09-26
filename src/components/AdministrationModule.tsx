import React from 'react';

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
import { ConfirmModal } from './ConfirmModal';

type AdministrationConfirmation =
  | { kind: 'clear-logs'; action?: undefined }
  | { kind: 'danger'; action: AdministrationDangerAction };

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
  onUpdateUser?: (user: AdministrationUser) => void;
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

const getUserFormValues = (user: AdministrationUser): AdministrationUserFormValues => ({
  name: user.name,
  email: user.email,
  service: user.service,
  phone: user.phone,
  role: user.role,
});

export const AdministrationModule = ({
  title = 'Administration',
  subtitle = "Gérez les utilisateurs, surveillez le système et configurez l'application",
  activeTab,
  defaultActiveTab = 'users',
  stats,
  users,
  logs,
  resources,
  databaseMetrics,
  serverStatuses,
  auditEntries,
  settings,
  dangerActions,
  onTabChange,
  onCreateUser,
  onUpdateUser,
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
  const [searchValue, setSearchValue] = React.useState('');
  const [roleValue, setRoleValue] = React.useState<AdministrationRole | 'all'>('all');
  const [statusValue, setStatusValue] = React.useState<AdministrationStatus | 'all'>('all');
  const [logLevelValue, setLogLevelValue] = React.useState<AdministrationLogEntry['level'] | 'all'>('all');
  const [userModalOpen, setUserModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<AdministrationUser | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = React.useState<AdministrationConfirmation | null>(null);
  const resolvedActiveTab = activeTab ?? internalActiveTab;
  const normalizedQuery = normalizeSearch(searchValue);
  const visibleUsers = users?.filter((user) => {
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

  const handleNewUserClick = () => {
    setEditingUser(null);
    setUserModalOpen(true);
  };

  const handleEditUser = (user: AdministrationUser) => {
    setEditingUser(user);
    setUserModalOpen(true);
  };

  const handleCancelUserModal = () => {
    setUserModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmitUserModal = (values: AdministrationUserFormValues) => {
    if (!editingUser) {
      if (!onCreateUser) return;
      onCreateUser(values);
      setUserModalOpen(false);
      return;
    }

    if (!onUpdateUser) return;
    const updatedUser: AdministrationUser = {
      ...editingUser,
      ...values,
      phone: values.phone || '-',
    };

    onUpdateUser(updatedUser);
    setEditingUser(null);
    setUserModalOpen(false);
  };

  const handleClearLogs = () => {
    setPendingConfirmation({ kind: 'clear-logs' });
  };

  const handleDangerAction = (action: AdministrationDangerAction) => {
    setPendingConfirmation({ kind: 'danger', action });
  };

  const confirmPendingAction = () => {
    if (!pendingConfirmation) return;

    if (pendingConfirmation.kind === 'clear-logs') {
      onClearLogs?.();
    } else {
      onDangerAction?.(pendingConfirmation.action);
    }

    setPendingConfirmation(null);
  };

  const confirmationAction = pendingConfirmation?.kind === 'danger'
    ? pendingConfirmation.action
    : undefined;
  const confirmationTitle = confirmationAction?.title ?? 'Effacer les logs système';
  const confirmationMessage = confirmationAction?.description
    ?? 'Cette action supprimera définitivement tous les logs système. Elle est irréversible.';
  const confirmationLabel = confirmationAction?.buttonLabel ?? 'Effacer les logs';

  return (
    <section
      className={joinClasses('space-y-6 bg-[#f5f3f0] text-[#172033]', className)}
      {...props}
    >
      <div>
        <h1 className="text-[32px] font-bold leading-tight text-[#0b1220]">{title}</h1>
        {subtitle && <p className="mt-1 text-base leading-6 text-[#334155]">{subtitle}</p>}
      </div>

      <AdministrationMetricCards stats={stats} />

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
            onNewUserClick={onCreateUser ? handleNewUserClick : undefined}
          />
          <AdministrationUsersTable
            users={visibleUsers}
            onUserAction={onUserAction}
            onEditUser={onUpdateUser ? handleEditUser : undefined}
          />
        </div>
      )}

      {resolvedActiveTab === 'logs' && (
        <AdministrationLogsPanel
          logs={logs}
          levelValue={logLevelValue}
          onLevelChange={setLogLevelValue}
          onRefresh={onRefreshLogs}
          onExportCsv={onExportLogsCsv}
          onClear={onClearLogs ? handleClearLogs : undefined}
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
          onDangerAction={onDangerAction ? handleDangerAction : undefined}
        />
      )}

      <AdministrationUserModal
        isOpen={userModalOpen}
        title={editingUser ? 'Modifier utilisateur' : 'Nouvel utilisateur'}
        subtitle={editingUser ? 'Mettez à jour les informations du compte utilisateur' : 'Créez un nouveau compte utilisateur'}
        submitLabel={editingUser ? 'Enregistrer' : 'Créer'}
        initialValues={editingUser ? getUserFormValues(editingUser) : undefined}
        onCancel={handleCancelUserModal}
        onCreateUser={handleSubmitUserModal}
      />

      <ConfirmModal
        isOpen={pendingConfirmation !== null}
        title={confirmationTitle}
        message={confirmationMessage}
        confirmLabel={confirmationLabel}
        onCancel={() => setPendingConfirmation(null)}
        onConfirm={confirmPendingAction}
      />
    </section>
  );
};
