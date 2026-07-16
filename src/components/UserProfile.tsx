import React from 'react';
import {
  Activity,
  AlertCircle,
  Briefcase,
  Building2,
  CalendarClock,
  Check,
  Mail,
  LoaderCircle,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  UserRound,
  X,
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
  status?: string;
  address?: string;
  city?: string;
  lastConnection?: string;
}

export interface UserProfileProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  user?: UserProfileUser;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  editable?: boolean;
  loading?: boolean;
  error?: string | null;
  editLabel?: string;
  saveLabel?: string;
  cancelLabel?: string;
  onUpdateUser?: (user: UserProfileUser) => void;
}

const defaultUser: UserProfileUser = {
  name: 'Admin Système',
  email: 'admin@mairie360.fr',
  role: 'admin',
  service: 'Administration',
};

const roleLabels: Record<string, string> = {
  admin: 'Administrateur',
  administrateur: 'Administrateur',
  administrator: 'Administrateur',
  responsable: 'Responsable',
  manager: 'Responsable',
  maire: 'Maire',
  user: 'Utilisateur',
  utilisateur: 'Utilisateur',
  guest: 'Invité',
  invite: 'Invité',
};

const statusLabels: Record<string, string> = {
  active: 'Actif',
  inactive: 'Inactif',
  offline: 'Hors ligne',
  suspended: 'Suspendu',
  archived: 'Archivé',
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
  const normalizedRole = role.trim().toLowerCase();
  return roleLabels[normalizedRole] || role;
};

const formatStatus = (status?: string) => {
  if (!status) return emptyValue;
  return statusLabels[status.trim().toLowerCase()] || status;
};

type ProfileField = {
  label: string;
  value?: React.ReactNode;
  icon: LucideIcon;
};

type EditableProfileValues = Pick<UserProfileUser, 'email' | 'phone' | 'address' | 'city'>;

const getEditableValues = (user: UserProfileUser): EditableProfileValues => ({
  email: user.email || '',
  phone: user.phone || '',
  address: user.address || '',
  city: user.city || '',
});

export const UserProfile = ({
  user = defaultUser,
  title = 'Profil utilisateur',
  subtitle = 'Consultation des informations personnelles',
  editable = true,
  loading = false,
  error = null,
  editLabel = 'Modifier',
  saveLabel = 'Enregistrer',
  cancelLabel = 'Annuler',
  onUpdateUser,
  className = '',
  ...props
}: UserProfileProps) => {
  const [currentUser, setCurrentUser] = React.useState<UserProfileUser>(user);
  const [isEditing, setIsEditing] = React.useState(false);
  const [formValues, setFormValues] = React.useState<EditableProfileValues>(() => getEditableValues(user));
  const [statusMessage, setStatusMessage] = React.useState('');

  React.useEffect(() => {
    setCurrentUser(user);
    setFormValues(getEditableValues(user));
    setIsEditing(false);
    setStatusMessage('');
  }, [user]);

  const avatarSrc = currentUser.avatar || currentUser.avatarUrl;
  const roleLabel = formatRole(currentUser.role);
  const statusLabel = formatStatus(currentUser.status);
  const location = [currentUser.address, currentUser.city].filter(Boolean).join(', ');
  const fields: ProfileField[] = [
    { label: 'Nom complet', value: currentUser.name, icon: UserRound },
    { label: 'Adresse e-mail', value: currentUser.email, icon: Mail },
    { label: 'Téléphone', value: currentUser.phone, icon: Phone },
    { label: 'Groupe ou service', value: currentUser.service, icon: Building2 },
    { label: 'Rôle', value: roleLabel, icon: ShieldCheck },
    { label: 'Statut du compte', value: statusLabel, icon: Activity },
    ...(currentUser.position
      ? [{ label: 'Fonction', value: currentUser.position, icon: Briefcase }]
      : []),
    ...(location ? [{ label: 'Adresse', value: location, icon: MapPin }] : []),
    ...(currentUser.lastConnection
      ? [{ label: 'Dernière connexion', value: currentUser.lastConnection, icon: CalendarClock }]
      : []),
  ];

  const handleEdit = () => {
    setFormValues(getEditableValues(currentUser));
    setStatusMessage('');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormValues(getEditableValues(currentUser));
    setIsEditing(false);
    setStatusMessage('');
  };

  const handleFieldChange = (field: keyof EditableProfileValues) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues((values) => ({
      ...values,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const updatedUser = {
      ...currentUser,
      ...formValues,
    };

    setCurrentUser(updatedUser);
    setIsEditing(false);
    setStatusMessage('Informations personnelles mises à jour.');
    onUpdateUser?.(updatedUser);
  };

  const editAction = editable && !isEditing ? (
    <button
      type="button"
      className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-[#1256a6] px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#0f4a8d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/35"
      onClick={handleEdit}
    >
      <Pencil className="h-4 w-4" strokeWidth={1.8} />
      <span>{editLabel}</span>
    </button>
  ) : null;

  if (loading || error) {
    return (
      <section
        id="profile"
        aria-label={typeof title === 'string' ? title : undefined}
        className={joinClasses('space-y-6 text-[#172033]', className)}
        {...props}
      >
        <PageTitleBar title={title} subtitle={subtitle} />
        <Card>
          <div
            role={error ? 'alert' : 'status'}
            className={joinClasses(
              'flex min-h-40 items-center justify-center gap-3 border-t border-[#e4e0dc] px-6 py-10 text-sm font-medium',
              error ? 'bg-[#fff7f6] text-[#912018]' : 'bg-white text-[#5f6770]',
            )}
          >
            {error ? (
              <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
            ) : (
              <LoaderCircle className="h-5 w-5 shrink-0 animate-spin" aria-hidden="true" />
            )}
            <span>{error || 'Chargement des informations du profil…'}</span>
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section
      id="profile"
      aria-label={typeof title === 'string' ? title : undefined}
      className={joinClasses('space-y-6 text-[#172033]', className)}
      {...props}
    >
      <PageTitleBar title={title} subtitle={subtitle} action={editAction} />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
          <Avatar
            src={avatarSrc}
            alt={currentUser.name}
            fallback={<span className="text-xl font-semibold leading-none text-white">{getInitials(currentUser.name)}</span>}
            className="!h-20 !w-20 border-4 border-[#4b908d]"
          />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-2xl font-bold leading-8 text-[#172033]">
              {currentUser.name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex h-7 items-center rounded-md bg-[#e4f2f1] px-3 text-sm font-medium text-[#1f5f5b]">
                {roleLabel}
              </span>
              {currentUser.email && <span className="text-sm leading-6 text-[#5f6770]">{currentUser.email}</span>}
            </div>
          </div>
        </div>
      </Card>

      <Card title="Informations personnelles">
        {isEditing ? (
          <form className="border-t border-[#e4e0dc] bg-white p-6" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-[#172033]">
                <span>Adresse e-mail</span>
                <input
                  type="email"
                  value={formValues.email}
                  onChange={handleFieldChange('email')}
                  className="h-10 rounded-md border border-[#b9d6d5] bg-[#fbfaf9] px-3 text-sm text-[#172033] outline-none transition-colors focus:border-[#4b908d] focus:ring-2 focus:ring-[#4b908d]/15"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[#172033]">
                <span>Téléphone</span>
                <input
                  type="tel"
                  value={formValues.phone}
                  onChange={handleFieldChange('phone')}
                  className="h-10 rounded-md border border-[#b9d6d5] bg-[#fbfaf9] px-3 text-sm text-[#172033] outline-none transition-colors focus:border-[#4b908d] focus:ring-2 focus:ring-[#4b908d]/15"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[#172033]">
                <span>Adresse</span>
                <input
                  type="text"
                  value={formValues.address}
                  onChange={handleFieldChange('address')}
                  className="h-10 rounded-md border border-[#b9d6d5] bg-[#fbfaf9] px-3 text-sm text-[#172033] outline-none transition-colors focus:border-[#4b908d] focus:ring-2 focus:ring-[#4b908d]/15"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[#172033]">
                <span>Ville</span>
                <input
                  type="text"
                  value={formValues.city}
                  onChange={handleFieldChange('city')}
                  className="h-10 rounded-md border border-[#b9d6d5] bg-[#fbfaf9] px-3 text-sm text-[#172033] outline-none transition-colors focus:border-[#4b908d] focus:ring-2 focus:ring-[#4b908d]/15"
                />
              </label>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#b9d6d5] bg-white px-4 text-sm font-medium text-[#172033] transition-colors hover:bg-[#f5f5f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4b908d]/25"
                onClick={handleCancel}
              >
                <X className="h-4 w-4" strokeWidth={1.8} />
                <span>{cancelLabel}</span>
              </button>
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#1256a6] px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#0f4a8d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/35"
              >
                <Check className="h-4 w-4" strokeWidth={1.8} />
                <span>{saveLabel}</span>
              </button>
            </div>
          </form>
        ) : (
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
        )}
      </Card>
      {statusMessage && (
        <div role="status" className="sr-only">
          {statusMessage}
        </div>
      )}
    </section>
  );
};
