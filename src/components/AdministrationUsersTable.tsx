import React from 'react';
import { CalendarDays, Mail, MoreVertical, Phone } from 'lucide-react';

import { defaultAdministrationUsers } from './administration/defaultData';
import type { AdministrationRole, AdministrationStatus, AdministrationUser } from './administration/types';
import { joinClasses } from './calendar/style';

export interface AdministrationUsersTableProps extends React.HTMLAttributes<HTMLDivElement> {
  users?: AdministrationUser[];
  onUserAction?: (user: AdministrationUser) => void;
}

const roleLabels: Record<AdministrationRole, string> = {
  admin: 'Administrateur',
  manager: 'Manager',
  user: 'Utilisateur',
};

const roleClassNames: Record<AdministrationRole, string> = {
  admin: 'bg-[#f3ddff] text-[#8b1fc3]',
  manager: 'bg-[#dbeafe] text-[#1d4ed8]',
  user: 'bg-[#f3f4f6] text-[#172033]',
};

const statusLabels: Record<AdministrationStatus, string> = {
  active: 'Actif',
  inactive: 'Inactif',
  suspended: 'Suspendu',
};

const statusClassNames: Record<AdministrationStatus, string> = {
  active: 'bg-[#dcfce7] text-[#15803d]',
  inactive: 'bg-[#f3f4f6] text-[#475569]',
  suspended: 'bg-[#fef3c7] text-[#b45309]',
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
  users = defaultAdministrationUsers,
  onUserAction,
  className = '',
  ...props
}: AdministrationUsersTableProps) => (
  <div
    className={joinClasses(
      'overflow-hidden rounded-lg border border-[#e3e0dc] bg-white text-[#172033]',
      className
    )}
    {...props}
  >
    <div className="overflow-x-auto">
      <table className="min-w-[980px] w-full border-collapse text-left">
        <thead className="bg-[#fbfcfd] text-xs font-bold uppercase tracking-normal text-[#667085]">
          <tr className="border-b border-[#e3e0dc]">
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
        <tbody className="divide-y divide-[#e3e0dc] text-sm">
          {users.map((user) => (
            <tr key={user.id} className="bg-white transition hover:bg-[#fbfaf9]">
              <td className="px-6 py-4">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#1256a6] text-sm font-semibold text-white">
                    {getInitials(user.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-base font-semibold leading-6 text-[#0b1220]">{user.name}</div>
                    <div className="flex min-w-0 items-center gap-1.5 text-sm leading-5 text-[#667085]">
                      <Mail className="size-3.5 shrink-0" strokeWidth={1.8} />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="font-medium leading-5 text-[#172033]">{user.service}</div>
                <div className="mt-0.5 flex items-center gap-1.5 text-sm leading-5 text-[#667085]">
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
                <div className="flex items-center gap-1.5 text-sm leading-5 text-[#667085]">
                  <CalendarDays className="size-3.5 shrink-0" strokeWidth={1.8} />
                  <span>{user.lastConnection}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  type="button"
                  aria-label={`Actions pour ${user.name}`}
                  className="inline-flex size-8 items-center justify-center rounded-md text-[#172033] transition hover:bg-[#f1f5f9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/35"
                  onClick={() => onUserAction?.(user)}
                >
                  <MoreVertical className="size-5" strokeWidth={2} />
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-sm text-[#667085]">
                Aucun utilisateur ne correspond aux filtres.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
