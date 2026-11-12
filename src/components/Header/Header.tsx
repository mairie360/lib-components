import React from 'react';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User as UserIcon,
  Settings,
  Shield,
  LogOut,
  X
} from 'lucide-react';

import { Avatar } from '../Avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '../DropdownMenu';
import { ConfirmModal } from '../ConfirmModal';
import { componentMarker } from '../component-marker';

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
  /** Callback function to handle user logout; a returned promise keeps « Se déconnecter » loading. */
  onLogout?: () => void | Promise<unknown>;
  /**
   * MAIR-834: « Déconnexion » first opens a confirmation (default true); `false` calls `onLogout` at once.
   */
  confirmLogout?: boolean;
  /** Indicates if the logged-in user is an administrator */
  isAdmin?: boolean;
  /** Called when the search form is submitted (Entrée). */
  onSearch?: (query: string) => void;
  /** MAIR-835: called on every keystroke and with '' when the search is cleared (✕ or Échap). */
  onSearchChange?: (query: string) => void;
  /** Controlled search value (with `onSearchChange`). */
  searchValue?: string;
  /** Accessible name of the search field (default « Rechercher »). */
  searchLabel?: string;
  searchPlaceholder?: string;
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
  confirmLogout = true,
  isAdmin = false,
  onSearch,
  onSearchChange,
  searchValue,
  searchLabel = 'Rechercher',
  searchPlaceholder = 'Rechercher...',
  onNotificationsClick,
  notificationCount,
  showProfile,
  showSettings,
  showAdministration,
}: HeaderProps) => {
  const [ownQuery, setOwnQuery] = React.useState('');
  const searchQuery = searchValue ?? ownQuery;
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const updateSearch = (query: string) => {
    if (searchValue === undefined) setOwnQuery(query);
    onSearchChange?.(query);
  };
  const clearSearch = () => { updateSearch(''); searchInputRef.current?.focus(); };
  const showSearch = Boolean(onSearch || onSearchChange);

  // MAIR-834: the menu item hands focus back to the account trigger before the confirmation opens,
  // so the dialog restores focus there on Annuler, the close button or Échap.
  const accountTriggerRef = React.useRef<HTMLButtonElement>(null);
  const [logoutOpen, setLogoutOpen] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);
  const requestLogout = () => {
    if (!confirmLogout) { void onLogout?.(); return; }
    accountTriggerRef.current?.focus();
    setLogoutOpen(true);
  };
  const confirmAndLogout = async () => {
    setLoggingOut(true);
    // A failed logout keeps the dialog open; the front reports the error (toast).
    try { await onLogout?.(); setLogoutOpen(false); } catch { /* stays open */ }
    finally { setLoggingOut(false); }
  };
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
    <header className="flex h-16 items-center justify-between border-b border-b-[var(--mairie-shell-bar-border)] bg-[var(--mairie-shell-bar-background)] px-4 text-[var(--mairie-text)] sm:px-6" {...componentMarker('Header')}>
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

        {showSearch && <form
          role="search"
          aria-label={searchLabel}
          className="relative"
          onSubmit={(event) => { event.preventDefault(); onSearch?.(searchQuery); }}
        >
          <Search aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--mairie-muted)]" />
          <input
            ref={searchInputRef}
            type="search"
            aria-label={searchLabel}
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(event) => updateSearch(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Escape' && searchQuery) { event.preventDefault(); updateSearch(''); } }}
            className="h-9 w-40 rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] pl-10 pr-9 text-sm text-[var(--mairie-text)] shadow-none outline-none transition-colors placeholder:text-[var(--mairie-muted)] focus:border-[var(--mairie-accent)] focus:ring-2 focus:ring-[var(--mairie-accent)]/15 sm:w-64 [&::-webkit-search-cancel-button]:hidden"
          />
          {searchQuery && <button
            type="button"
            aria-label="Effacer la recherche"
            onClick={clearSearch}
            className="absolute right-1.5 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-[var(--mairie-muted)] hover:bg-[var(--mairie-surface)] hover:text-[var(--mairie-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-accent)]"
          >
            <X aria-hidden="true" className="h-3.5 w-3.5" />
          </button>}
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
          {typeof notificationCount === 'number' && notificationCount > 0 && <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-md border border-[var(--mairie-surface)]/70 bg-[var(--mairie-error-action-background)] px-0.5 text-[11px] font-semibold leading-none text-[var(--mairie-navigation-admin-text)] shadow-md">
            {notificationCount > 99 ? '99+' : notificationCount}
          </span>}
        </button>}

        {hasIdentity && <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              ref={accountTriggerRef}
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
              onClick={requestLogout}
              className="cursor-pointer !gap-3 !rounded-none !px-3 !py-2.5 text-sm font-normal !text-[var(--mairie-error-text)] hover:!bg-[var(--mairie-error-surface)]"
            >
              <LogOut className="h-4 w-4 shrink-0 text-[var(--mairie-muted)]" strokeWidth={1.7} />
              Déconnexion
            </DropdownMenuItem></>}
          </DropdownMenuContent>
        </DropdownMenu>}
      </div>
      {onLogout && confirmLogout && <ConfirmModal
        open={logoutOpen}
        role="alertdialog"
        size="s"
        title={<span className="inline-flex items-center gap-2"><LogOut aria-hidden="true" className="h-5 w-5 text-[var(--mairie-muted)]" />Se déconnecter ?</span>}
        message="Vous allez être déconnecté de Mairie360 sur cet appareil. Pensez à enregistrer vos modifications en cours."
        destructive={false}
        confirmLabel="Se déconnecter"
        confirmIcon={LogOut}
        initialFocus="cancel"
        busy={loggingOut}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={() => { void confirmAndLogout(); }}
      />}
    </header>
  );
};
