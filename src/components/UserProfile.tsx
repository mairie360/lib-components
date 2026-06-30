import React from 'react';
import {
  Briefcase,
  Building2,
  CalendarClock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

import { Avatar } from './Avatar';
import { Card } from './Card';
import { PageTitleBar } from './PageTitleBar';
import { joinClasses } from './calendar/style';

export type UserProfileRole = 'admin' | 'manager' | 'user' | (string & {});

export interface UserProfileUser {
  name: string;
  avatar?: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
  service?: string;
  position?: string;
  role?: UserProfileRole;
  address?: string;
  city?: string;
  lastConnection?: string;
}

export interface UserProfileProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  user?: UserProfileUser;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
}

const defaultUser: UserProfileUser = {
  name: 'Admin Système',
  email: 'admin@mairie360.fr',
  role: 'admin',
  service: 'Administration',
};

const roleLabels: Record<string, string> = {
  admin: 'Administrateur',
  manager: 'Manager',
  user: 'Utilisateur',
};

const emptyValue = 'Non renseigné';

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

const formatRole = (role?: string) => {
  if (!role) return emptyValue;
  return roleLabels[role] || role;
};

type ProfileField = {
  label: string;
  value?: React.ReactNode;
  icon: LucideIcon;
};

export const UserProfile = ({
  user = defaultUser,
  title = 'Profil utilisateur',
  subtitle = 'Consultation des informations personnelles',
  className = '',
  ...props
}: UserProfileProps) => {
  const avatarSrc = user.avatar || user.avatarUrl;
  const roleLabel = formatRole(user.role);
  const location = [user.address, user.city].filter(Boolean).join(', ');
  const fields: ProfileField[] = [
    { label: 'Nom complet', value: user.name, icon: UserRound },
    { label: 'Adresse e-mail', value: user.email, icon: Mail },
    { label: 'Téléphone', value: user.phone, icon: Phone },
    { label: 'Service', value: user.service, icon: Building2 },
    { label: 'Fonction', value: user.position, icon: Briefcase },
    { label: 'Rôle', value: roleLabel, icon: ShieldCheck },
    { label: 'Adresse', value: location, icon: MapPin },
    { label: 'Dernière connexion', value: user.lastConnection, icon: CalendarClock },
  ];

  return (
    <section
      id="profile"
      aria-label={typeof title === 'string' ? title : undefined}
      className={joinClasses('space-y-6 text-[#172033]', className)}
      {...props}
    >
      <PageTitleBar title={title} subtitle={subtitle} />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
          <Avatar
            src={avatarSrc}
            alt={user.name}
            fallback={<span className="text-xl font-semibold leading-none text-white">{getInitials(user.name)}</span>}
            className="!h-20 !w-20 border-4 border-[#4b908d]"
          />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-2xl font-bold leading-8 text-[#172033]">
              {user.name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex h-7 items-center rounded-md bg-[#e4f2f1] px-3 text-sm font-medium text-[#1f5f5b]">
                {roleLabel}
              </span>
              {user.email && <span className="text-sm leading-6 text-[#5f6770]">{user.email}</span>}
            </div>
          </div>
        </div>
      </Card>

      <Card title="Informations personnelles">
        <dl className="grid gap-px border-t border-[#e4e0dc] bg-[#e4e0dc] sm:grid-cols-2">
          {fields.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex min-w-0 gap-3 bg-white px-6 py-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#f3f8f8] text-[#2c7773]">
                <Icon className="h-4 w-4" strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase leading-5 tracking-normal text-[#6b737c]">{label}</dt>
                <dd className="break-words text-base font-medium leading-6 text-[#172033]">{value || emptyValue}</dd>
              </div>
            </div>
          ))}
        </dl>
      </Card>
    </section>
  );
};
