import React from 'react';
import { Search, UserPlus } from 'lucide-react';

import {
  administrationRoleOptions,
  administrationStatusOptions,
} from './administration/options';
import type { AdministrationRole, AdministrationStatus } from './administration/types';
import { AdministrationSelect } from './AdministrationSelect';
import { joinClasses } from './calendar/style';

export interface AdministrationUserFiltersProps extends React.HTMLAttributes<HTMLDivElement> {
  searchValue?: string;
  roleValue?: AdministrationRole | 'all';
  statusValue?: AdministrationStatus | 'all';
  onSearchChange?: (value: string) => void;
  onRoleChange?: (value: AdministrationRole | 'all') => void;
  onStatusChange?: (value: AdministrationStatus | 'all') => void;
  onNewUserClick?: () => void;
}

export const AdministrationUserFilters = ({
  searchValue = '',
  roleValue = 'all',
  statusValue = 'all',
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onNewUserClick,
  className = '',
  ...props
}: AdministrationUserFiltersProps) => (
  <div
    className={joinClasses(
      'rounded-lg border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-6 py-6 text-[var(--mairie-text)]',
      className
    )}
    {...props}
  >
    <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_180px_180px_auto]">
      <label className="relative min-w-0">
        <span className="sr-only">Rechercher un utilisateur</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[var(--mairie-muted)]" />
        <input
          type="search"
          value={searchValue}
          placeholder="Rechercher un utilisateur..."
          className="h-9 w-full rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] pl-10 pr-3 text-sm text-[var(--mairie-text)] outline-none transition placeholder:text-[var(--mairie-muted)] focus:border-[var(--mairie-accent)] focus:ring-2 focus:ring-[var(--mairie-accent)]/20"
          onChange={(event) => onSearchChange?.(event.target.value)}
        />
      </label>

      <AdministrationSelect
        ariaLabel="Filtrer par rôle"
        value={roleValue}
        options={administrationRoleOptions}
        onValueChange={(value) => onRoleChange?.(value as AdministrationRole | 'all')}
      />

      <AdministrationSelect
        ariaLabel="Filtrer par statut"
        value={statusValue}
        options={administrationStatusOptions}
        onValueChange={(value) => onStatusChange?.(value as AdministrationStatus | 'all')}
      />

      <button
        type="button"
        disabled={!onNewUserClick}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[var(--mairie-action-background)] px-4 text-sm font-semibold text-[var(--mairie-on-action)] transition hover:bg-[var(--mairie-action-hover-background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/35 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onNewUserClick}
      >
        <UserPlus className="size-4" strokeWidth={1.9} />
        <span>Nouveau</span>
      </button>
    </div>
  </div>
);
