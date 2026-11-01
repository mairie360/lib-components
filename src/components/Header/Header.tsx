import React from 'react';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User as UserIcon,
  Settings,
  Shield,
  LogOut
} from 'lucide-react';

import { Avatar } from '../Avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '../DropdownMenu';

type User = {
  name?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  avatarUrl?: string;
  email?: string;
  role?: string;
  service?: string;
};

const roleLabels: Record<string, string> = {
  admin: 'Administrateur',
  administrateur: 'Administrateur',
  administrator: 'Administrateur',
  responsable: 'Responsable',
  manager: 'Responsable',
  maire: 'Maire',
  mayor: 'Maire',
  user: 'Utilisateur',
  utilisateur: 'Utilisateur',
  guest: 'Invité',
  invite: 'Invité',
};

const normalizeRole = (role?: string) =>
  role
    ?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '')
    .replace(/^role/, '') || '';

const getDisplayName = (user?: User) => {
  const explicitName = user?.name?.trim();
  if (explicitName) return explicitName;

  const structuredName = [user?.first_name, user?.last_name]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');

  return structuredName || user?.email?.trim() || 'Utilisateur';
};

const getInitials = (displayName: string) =>
  displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

export interface HeaderProps {
  /** Current user information, if logged in */
  user?: User;
  /** Callback to toggle the sidebar */
  setSidebarOpen?: (open: boolean) => void;
  /** Ref to the button that opens the mobile navigation. */
  menuButtonRef?: React.Ref<HTMLButtonElement>;
  /** Function to handle page navigation from header */
  onPageChange?: (page: string) => void;
  /** URL of the user profile page. Used when no client-side page handler is provided. */
  profileHref?: string | null;
  /** Callback function to handle user logout */
  onLogout?: () => void;
  /** Indicates if the logged-in user is an administrator */
  isAdmin?: boolean;
  onSearch?: (query: string) => void;
  onNotificationsClick?: () => void;
  notificationCount?: number;
  showProfile?: boolean;
  showSettings?: boolean;
  showAdministration?: boolean;
}

export const Header = ({
  user,
  setSidebarOpen,
  menuButtonRef,
  onPageChange,
  profileHref = null,
  onLogout,
  isAdmin = false,
  onSearch,
  onNotificationsClick,
  notificationCount,
  showProfile,
  showSettings,
  showAdministration,
}: HeaderProps) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const hasIdentity = Boolean(
    user?.name?.trim() || user?.first_name?.trim() || user?.last_name?.trim() || user?.email?.trim(),
  );
  const displayName = getDisplayName(user);
  const displayEmail = user?.email?.trim() || '';
  const displayService = user?.service?.trim() || '';

  const avatarSrc = user?.avatar || user?.avatarUrl;
  const role = user?.role;
  const normalizedRole = normalizeRole(role);
  const roleLabel = isAdmin || normalizedRole === 'admin'
    ? 'Administrateur'
    : roleLabels[normalizedRole] || role?.trim();
  const canAdministrate = isAdmin || normalizedRole === 'admin';
  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    if (onPageChange && profileHref && !/^https?:\/\//i.test(profileHref)) {
      event.preventDefault();
      onPageChange('profile');
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-b-[var(--mairie-border)] bg-[var(--mairie-surface)] px-4 text-[var(--mairie-text)] shadow-[var(--mairie-shadow)] sm:px-6">
      <div className="flex flex-1 items-center gap-3 sm:gap-4">
        <button
          ref={menuButtonRef}
          type="button"
          aria-label="Ouvrir la navigation"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-transparent text-[var(--mairie-text)] transition-colors hover:border-[var(--mairie-accent)]/30 hover:bg-[var(--mairie-success-action-background)]/10 lg:hidden"
          onClick={() => setSidebarOpen?.(true)}
        >
          <Menu className="h-4 w-4" />
        </button>

        {onSearch && <form
          role="search"
          className="relative"
          onSubmit={(event) => { event.preventDefault(); onSearch(searchQuery); }}
        >
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--mairie-muted)]" />
          <input
            type="search"
            aria-label="Rechercher"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-9 w-40 rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] pl-10 pr-3 text-sm text-[var(--mairie-text)] shadow-none outline-none transition-colors placeholder:text-[var(--mairie-muted)] focus:border-[var(--mairie-accent)] focus:ring-2 focus:ring-[var(--mairie-accent)]/15 sm:w-64"
          />
        </form>}
      </div>

      <div className="flex items-center gap-4">
        {onNotificationsClick && <button
          type="button"
          aria-label="Notifications"
          className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-[var(--mairie-text)] transition-colors hover:border-[var(--mairie-accent)]/30 hover:bg-[var(--mairie-success-action-background)]/10"
          onClick={onNotificationsClick}
        >
          <Bell className="h-[17px] w-[17px]" strokeWidth={1.8} />
          {typeof notificationCount === 'number' && notificationCount > 0 && <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-md border border-[var(--mairie-surface)]/70 bg-[var(--mairie-error-action-background)] px-0.5 text-[11px] font-semibold leading-none text-[var(--mairie-on-action)] shadow-md">
            {notificationCount > 99 ? '99+' : notificationCount}
          </span>}
        </button>}

        {hasIdentity && <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center gap-3 rounded-md border border-transparent px-1 text-sm font-medium text-[var(--mairie-text)] transition-colors hover:border-[var(--mairie-accent)]/30 hover:bg-[var(--mairie-success-action-background)]/10"
            >
              <Avatar
                src={avatarSrc}
                alt={displayName}
                fallback={getInitials(displayName)}
                size="s"
                className="border-2 border-[var(--mairie-accent)]"
              />
              <span className="hidden whitespace-nowrap sm:inline">{displayName}</span>
              <ChevronDown className="hidden h-4 w-4 sm:inline" strokeWidth={1.8} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={7}
            className="!w-[260px] !min-w-[260px] !rounded-lg !border-[var(--mairie-border)] bg-[var(--mairie-surface)] !p-0 shadow-[var(--mairie-shadow)]"
          >
            <div className="space-y-2.5 px-3.5 py-3 text-sm">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--mairie-muted)]">
                  Nom
                </div>
                <div className="mt-0.5 break-words font-semibold leading-5 text-[var(--mairie-text)]">
                  {displayName}
                </div>
              </div>
              {displayEmail && (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--mairie-muted)]">
                    Adresse e-mail
                  </div>
                  <div className="mt-0.5 break-all text-xs leading-5 text-[var(--mairie-muted)]">
                    {displayEmail}
                  </div>
                </div>
              )}
              {roleLabel && (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--mairie-muted)]">
                    Rôle
                  </div>
                  <div className="mt-0.5 text-xs font-medium leading-5 text-[var(--mairie-teal-text)]">
                    {roleLabel}
                  </div>
                </div>
              )}
              {displayService && (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--mairie-muted)]">
                    Groupe ou service
                  </div>
                  <div className="mt-0.5 break-words text-xs leading-5 text-[var(--mairie-muted)]">
                    {displayService}
                  </div>
                </div>
              )}
            </div>
            <DropdownMenuSeparator className="mx-0 my-0 bg-[var(--mairie-surface-raised)]" />
            {(showProfile ?? Boolean(profileHref || onPageChange)) && (profileHref ? (
              <DropdownMenuItem
                asChild
                onClick={handleProfileClick}
                className="cursor-pointer !gap-3 !rounded-none !px-3 !py-2.5 text-sm font-normal !text-[var(--mairie-muted)] hover:!bg-[var(--mairie-surface-raised)]"
              >
                <a href={profileHref}>
                  <UserIcon className="h-4 w-4 shrink-0 text-[var(--mairie-muted)]" strokeWidth={1.7} />
                  Profil
                </a>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => onPageChange?.('profile')}
                className="cursor-pointer !gap-3 !rounded-none !px-3 !py-2.5 text-sm font-normal !text-[var(--mairie-muted)] hover:!bg-[var(--mairie-surface-raised)]"
              >
                <UserIcon className="h-4 w-4 shrink-0 text-[var(--mairie-muted)]" strokeWidth={1.7} />
                Profil
              </DropdownMenuItem>
            ))}
            {(showSettings ?? Boolean(onPageChange)) && <DropdownMenuItem
              onClick={() => onPageChange?.('settings')}
              className="cursor-pointer !gap-3 !rounded-none !px-3 !py-2.5 text-sm font-normal !text-[var(--mairie-muted)] hover:!bg-[var(--mairie-surface-raised)]"
            >
              <Settings className="h-4 w-4 shrink-0 text-[var(--mairie-muted)]" strokeWidth={1.7} />
              Paramètres
            </DropdownMenuItem>}
            {canAdministrate && (showAdministration ?? Boolean(onPageChange)) && (
              <>
                <DropdownMenuSeparator className="mx-0 my-0 bg-[var(--mairie-surface-raised)]" />
                <DropdownMenuItem
                  onClick={() => onPageChange?.('admin')}
                  className="cursor-pointer !gap-3 !rounded-none !px-3 !py-2.5 text-sm font-normal !text-[var(--mairie-muted)] hover:!bg-[var(--mairie-surface-raised)]"
                >
                  <Shield className="h-4 w-4 shrink-0 text-[var(--mairie-muted)]" strokeWidth={1.7} />
                  Administration
                </DropdownMenuItem>
              </>
            )}
            {onLogout && <><DropdownMenuSeparator className="mx-0 my-0 bg-[var(--mairie-surface-raised)]" />
            <DropdownMenuItem
              onClick={onLogout}
              className="cursor-pointer !gap-3 !rounded-none !px-3 !py-2.5 text-sm font-normal !text-[var(--mairie-error-text)] hover:!bg-[var(--mairie-error-surface)]"
            >
              <LogOut className="h-4 w-4 shrink-0 text-[var(--mairie-muted)]" strokeWidth={1.7} />
              Déconnexion
            </DropdownMenuItem></>}
          </DropdownMenuContent>
        </DropdownMenu>}
      </div>
    </header>
  );
};
