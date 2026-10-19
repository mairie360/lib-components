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
  biography?: string;
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

const getEditableValues = (user?: UserProfileUser): EditableProfileValues => ({
  email: user?.email || '',
  phone: user?.phone || '',
  address: user?.address || '',
  city: user?.city || '',
});

export const UserProfile = ({
  user,
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
  const [isEditing, setIsEditing] = React.useState(false);
  const [formValues, setFormValues] = React.useState<EditableProfileValues>(() => getEditableValues(user));

  React.useEffect(() => {
    setFormValues(getEditableValues(user));
    setIsEditing(false);
  }, [user]);

  const handleEdit = () => {
    setFormValues(getEditableValues(user));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormValues(getEditableValues(user));
    setIsEditing(false);
  };

  const handleFieldChange = (field: keyof EditableProfileValues) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues((values) => ({
      ...values,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (user && onUpdateUser) onUpdateUser({ ...user, ...formValues });
  };

  const editAction = editable && user && onUpdateUser && !isEditing ? (
    <button
      type="button"
      className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-[var(--mairie-action-background)] px-4 text-sm font-medium text-[var(--mairie-on-action)] shadow-sm transition-colors hover:bg-[var(--mairie-action-hover-background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/35"
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
        className={joinClasses('space-y-6 text-[var(--mairie-text)]', className)}
        {...props}
      >
        <PageTitleBar title={title} subtitle={subtitle} />
        <Card>
          <div
            role={error ? 'alert' : 'status'}
            className={joinClasses(
              'flex min-h-40 items-center justify-center gap-3 border-t border-[var(--mairie-border)] px-6 py-10 text-sm font-medium',
              error ? 'bg-[var(--mairie-error-surface)] text-[var(--mairie-error-text)]' : 'bg-[var(--mairie-surface)] text-[var(--mairie-muted)]',
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

  if (!user) {
    return (
      <section
        id="profile"
        aria-label={typeof title === 'string' ? title : undefined}
        className={joinClasses('space-y-6 text-[var(--mairie-text)]', className)}
        {...props}
      >
        <PageTitleBar title={title} subtitle={subtitle} />
        <Card>
          <div role="status" className="border-t border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-6 py-10 text-sm text-[var(--mairie-muted)]">
            Informations du profil indisponibles.
          </div>
        </Card>
      </section>
    );
  }

  const avatarSrc = user.avatar || user.avatarUrl;
  const roleLabel = formatRole(user.role);
  const statusLabel = formatStatus(user.status);
  const location = [user.address, user.city].filter(Boolean).join(', ');
  const fields: ProfileField[] = [
    { label: 'Nom complet', value: user.name, icon: UserRound },
    { label: 'Adresse e-mail', value: user.email, icon: Mail },
    { label: 'Téléphone', value: user.phone, icon: Phone },
    { label: 'Groupe ou service', value: user.service, icon: Building2 },
    { label: 'Rôle', value: roleLabel, icon: ShieldCheck },
    { label: 'Statut du compte', value: statusLabel, icon: Activity },
    ...(user.position
      ? [{ label: 'Fonction', value: user.position, icon: Briefcase }]
      : []),
    ...(location ? [{ label: 'Adresse', value: location, icon: MapPin }] : []),
    ...(user.lastConnection
      ? [{ label: 'Dernière connexion', value: user.lastConnection, icon: CalendarClock }]
      : []),
  ];

  return (
    <section
      id="profile"
      aria-label={typeof title === 'string' ? title : undefined}
      className={joinClasses('space-y-6 text-[var(--mairie-text)]', className)}
      {...props}
    >
      <PageTitleBar title={title} subtitle={subtitle} action={editAction} />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
          <Avatar
            src={avatarSrc}
            alt={user.name}
            fallback={<span className="text-xl font-semibold leading-none text-[var(--mairie-on-action)]">{getInitials(user.name)}</span>}
            className="!h-20 !w-20 border-4 border-[var(--mairie-accent)]"
          />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-2xl font-bold leading-8 text-[var(--mairie-text)]">
              {user.name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex h-7 items-center rounded-md bg-[var(--mairie-accent-surface)] px-3 text-sm font-medium text-[var(--mairie-teal-text)]">
                {roleLabel}
              </span>
              {user.email && <span className="text-sm leading-6 text-[var(--mairie-muted)]">{user.email}</span>}
            </div>
          </div>
        </div>
      </Card>

      <Card title="Informations personnelles">
        {isEditing ? (
          <form className="border-t border-[var(--mairie-border)] bg-[var(--mairie-surface)] p-6" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-[var(--mairie-text)]">
                <span>Adresse e-mail</span>
                <input
                  type="email"
                  value={formValues.email}
                  onChange={handleFieldChange('email')}
                  className="h-10 rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] px-3 text-sm text-[var(--mairie-text)] outline-none transition-colors focus:border-[var(--mairie-accent)] focus:ring-2 focus:ring-[var(--mairie-accent)]/15"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[var(--mairie-text)]">
                <span>Téléphone</span>
                <input
                  type="tel"
                  value={formValues.phone}
                  onChange={handleFieldChange('phone')}
                  className="h-10 rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] px-3 text-sm text-[var(--mairie-text)] outline-none transition-colors focus:border-[var(--mairie-accent)] focus:ring-2 focus:ring-[var(--mairie-accent)]/15"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[var(--mairie-text)]">
                <span>Adresse</span>
                <input
                  type="text"
                  value={formValues.address}
                  onChange={handleFieldChange('address')}
                  className="h-10 rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] px-3 text-sm text-[var(--mairie-text)] outline-none transition-colors focus:border-[var(--mairie-accent)] focus:ring-2 focus:ring-[var(--mairie-accent)]/15"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[var(--mairie-text)]">
                <span>Ville</span>
                <input
                  type="text"
                  value={formValues.city}
                  onChange={handleFieldChange('city')}
                  className="h-10 rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] px-3 text-sm text-[var(--mairie-text)] outline-none transition-colors focus:border-[var(--mairie-accent)] focus:ring-2 focus:ring-[var(--mairie-accent)]/15"
                />
              </label>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-4 text-sm font-medium text-[var(--mairie-text)] transition-colors hover:bg-[var(--mairie-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/25"
                onClick={handleCancel}
              >
                <X className="h-4 w-4" strokeWidth={1.8} />
                <span>{cancelLabel}</span>
              </button>
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[var(--mairie-action-background)] px-4 text-sm font-medium text-[var(--mairie-on-action)] shadow-sm transition-colors hover:bg-[var(--mairie-action-hover-background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/35"
              >
                <Check className="h-4 w-4" strokeWidth={1.8} />
                <span>{saveLabel}</span>
              </button>
            </div>
          </form>
        ) : (
          <dl className="grid gap-px border-t border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] sm:grid-cols-2">
            {fields.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex min-w-0 gap-3 bg-[var(--mairie-surface)] px-6 py-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--mairie-surface-raised)] text-[var(--mairie-teal-text)]">
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <dt className="text-xs font-semibold uppercase leading-5 tracking-normal text-[var(--mairie-muted)]">{label}</dt>
                  <dd className="break-words text-base font-medium leading-6 text-[var(--mairie-text)]">{value || emptyValue}</dd>
                </div>
              </div>
            ))}
          </dl>
        )}
      </Card>
    </section>
  );
};
