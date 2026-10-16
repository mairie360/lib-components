import React from 'react';
import { CalendarDays, Mail, MoreVertical, Pencil, Phone, RotateCcw, Trash2 } from 'lucide-react';

import type {
  AdministrationRole,
  AdministrationStatus,
  AdministrationUser,
  AdministrationUserAction,
} from './administration/types';
import { joinClasses } from './calendar/style';

export interface AdministrationUsersTableProps extends React.HTMLAttributes<HTMLDivElement> {
  users?: AdministrationUser[];
  onUserAction?: (user: AdministrationUser, action?: AdministrationUserAction) => void;
  onEditUser?: (user: AdministrationUser) => void;
  onToggleUserStatus?: (user: AdministrationUser) => void;
  onDeleteUser?: (user: AdministrationUser) => void;
}

const roleLabels: Record<AdministrationRole, string> = {
  admin: 'Administrateur',
  manager: 'Manager',
  user: 'Utilisateur',
};

const roleClassNames: Record<AdministrationRole, string> = {
  admin: 'bg-[var(--mairie-purple-surface)] text-[var(--mairie-purple-text)]',
  manager: 'bg-[var(--mairie-accent-surface)] text-[var(--mairie-accent)]',
  user: 'bg-[var(--mairie-surface-raised)] text-[var(--mairie-text)]',
};

const statusLabels: Record<AdministrationStatus, string> = {
  active: 'Actif',
  inactive: 'Inactif',
  suspended: 'Suspendu',
};

const statusClassNames: Record<AdministrationStatus, string> = {
  active: 'bg-[var(--mairie-success-surface)] text-[var(--mairie-success-text)]',
  inactive: 'bg-[var(--mairie-surface-raised)] text-[var(--mairie-muted)]',
  suspended: 'bg-[var(--mairie-warning-surface)] text-[var(--mairie-warning-text)]',
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const AdministrationUsersTable = ({
  users,
  onUserAction,
  onEditUser,
  onToggleUserStatus,
  onDeleteUser,
  className = '',
  ...props
}: AdministrationUsersTableProps) => {
  const [openMenuUserId, setOpenMenuUserId] = React.useState<string | null>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!openMenuUserId) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuUserId(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenuUserId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [openMenuUserId]);

  const handleMenuToggle = (user: AdministrationUser) => {
    setOpenMenuUserId((currentUserId) => (currentUserId === user.id ? null : user.id));
    onUserAction?.(user, 'open');
  };

  const handleMenuAction = (user: AdministrationUser, action: AdministrationUserAction) => {
    onUserAction?.(user, action);

    if (action === 'toggle-status') {
      onToggleUserStatus?.(user);
    }

    if (action === 'edit') {
      onEditUser?.(user);
    }

    if (action === 'delete') {
      onDeleteUser?.(user);
    }

    setOpenMenuUserId(null);
  };

  return (
    <div
      className={joinClasses(
        'overflow-hidden rounded-lg border border-[var(--mairie-border)] bg-[var(--mairie-surface)] text-[var(--mairie-text)]',
        className
      )}
      {...props}
    >
      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full border-collapse text-left">
          <thead className="bg-[var(--mairie-surface-raised)] text-xs font-bold uppercase tracking-normal text-[var(--mairie-muted)]">
            <tr className="border-b border-[var(--mairie-border)]">
              <th scope="col" className="px-6 py-4">
                Utilisateur
              </th>
              <th scope="col" className="px-6 py-4">
                Service
              </th>
              <th scope="col" className="px-6 py-4">
                Rôle
              </th>
              <th scope="col" className="px-6 py-4">
                Statut
              </th>
              <th scope="col" className="px-6 py-4">
                Dernière connexion
              </th>
              <th scope="col" className="px-6 py-4 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--mairie-border)] text-sm">
            {(users ?? []).map((user) => {
              const isMenuOpen = openMenuUserId === user.id;

              return (
                <tr key={user.id} className="bg-[var(--mairie-surface)] transition hover:bg-[var(--mairie-surface-raised)]">
                  <td className="px-6 py-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--mairie-action-background)] text-sm font-semibold text-[var(--mairie-on-action)]">
                        {getInitials(user.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-base font-semibold leading-6 text-[var(--mairie-text)]">{user.name}</div>
                        <div className="flex min-w-0 items-center gap-1.5 text-sm leading-5 text-[var(--mairie-muted)]">
                          <Mail className="size-3.5 shrink-0" strokeWidth={1.8} />
                          <span className="truncate">{user.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium leading-5 text-[var(--mairie-text)]">{user.service}</div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-sm leading-5 text-[var(--mairie-muted)]">
                      <Phone className="size-3.5 shrink-0" strokeWidth={1.8} />
                      <span>{user.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={joinClasses(
                        'inline-flex h-6 items-center rounded-md px-2 text-xs font-semibold leading-none',
                        roleClassNames[user.role]
                      )}
                    >
                      {roleLabels[user.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={joinClasses(
                        'inline-flex h-6 items-center rounded-md px-2 text-xs font-semibold leading-none',
                        statusClassNames[user.status]
                      )}
                    >
                      {statusLabels[user.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm leading-5 text-[var(--mairie-muted)]">
                      <CalendarDays className="size-3.5 shrink-0" strokeWidth={1.8} />
                      <span>{user.lastConnection}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div ref={isMenuOpen ? menuRef : undefined} className="relative inline-flex justify-end">
                      <button
                        type="button"
                        aria-label={`Actions pour ${user.name}`}
                        aria-haspopup="menu"
                        aria-expanded={isMenuOpen}
                        className="inline-flex size-8 items-center justify-center rounded-md text-[var(--mairie-text)] transition hover:bg-[var(--mairie-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/35"
                        onClick={() => handleMenuToggle(user)}
                      >
                        <MoreVertical className="size-5" strokeWidth={2} />
                      </button>

                      {isMenuOpen && (
                        <div
                          role="menu"
                          className="absolute right-0 top-9 z-30 w-48 overflow-hidden rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] p-1 text-left shadow-[var(--mairie-shadow)]"
                        >
                          <button
                            type="button"
                            role="menuitem"
                            disabled={!onToggleUserStatus && !onUserAction}
                            className="flex h-9 w-full items-center gap-2 rounded px-2 text-sm font-medium text-[var(--mairie-text)] hover:bg-[var(--mairie-surface-raised)]"
                            onClick={() => handleMenuAction(user, 'toggle-status')}
                          >
                            <RotateCcw className="size-4" strokeWidth={1.8} />
                            <span>{user.status === 'active' ? 'Désactiver' : 'Activer'}</span>
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            disabled={!onEditUser}
                            className="flex h-9 w-full items-center gap-2 rounded px-2 text-sm font-medium text-[var(--mairie-text)] hover:bg-[var(--mairie-surface-raised)]"
                            onClick={() => handleMenuAction(user, 'edit')}
                          >
                            <Pencil className="size-4" strokeWidth={1.8} />
                            <span>Modifier</span>
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            disabled={!onDeleteUser && !onUserAction}
                            className="flex h-9 w-full items-center gap-2 rounded px-2 text-sm font-medium text-[var(--mairie-error-text)] hover:bg-[var(--mairie-error-surface)]"
                            onClick={() => handleMenuAction(user, 'delete')}
                          >
                            <Trash2 className="size-4" strokeWidth={1.8} />
                            <span>Supprimer</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {(users?.length ?? 0) === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-[var(--mairie-muted)]">
                  {users ? 'Aucun utilisateur ne correspond aux filtres.' : 'Utilisateurs indisponibles.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
