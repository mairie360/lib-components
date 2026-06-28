import React from 'react';
import { Search, UserPlus } from 'lucide-react';

import {
  administrationRoleOptions,
  administrationStatusOptions,
} from './administration/defaultData';
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
      'rounded-lg border border-[#e3e0dc] bg-white px-6 py-6 text-[#172033]',
      className
    )}
    {...props}
  >
    <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_180px_180px_auto]">
      <label className="relative min-w-0">
        <span className="sr-only">Rechercher un utilisateur</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#94a3b8]" />
        <input
          type="search"
          value={searchValue}
          placeholder="Rechercher un utilisateur..."
          className="h-9 w-full rounded-md border border-[#d8d2ca] bg-white pl-10 pr-3 text-sm text-[#172033] outline-none transition placeholder:text-[#667085] focus:border-[#1256a6] focus:ring-2 focus:ring-[#1256a6]/20"
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
        className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#1256a6] px-4 text-sm font-semibold text-white transition hover:bg-[#0f4b91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/35"
        onClick={onNewUserClick}
      >
        <UserPlus className="size-4" strokeWidth={1.9} />
        <span>Nouveau</span>
      </button>
    </div>
  </div>
);
