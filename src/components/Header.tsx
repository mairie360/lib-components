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

import { Avatar } from './Avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from './DropdownMenu';

type User = {
  name: string;
  avatar?: string;
  avatarUrl?: string;
  email?: string;
  role?: string;
};

export interface HeaderProps {
  /** Current user information, if logged in */
  user?: User;
  /** Callback to toggle the sidebar */
  setSidebarOpen?: (open: boolean) => void;
  /** Function to handle page navigation from header */
  onPageChange?: (page: string) => void;
  /** Callback function to handle user logout */
  onLogout?: () => void;
  /** Indicates if the logged-in user is an administrator */
  isAdmin?: boolean;
}

export const Header = ({
  user,
  setSidebarOpen,
  onPageChange = () => {},
  onLogout,
  isAdmin = false,
}: HeaderProps) => {
  const isDefaultUser = !user;
  const displayName = user?.name || 'Admin Système';
  const displayEmail = user?.email || (isDefaultUser ? 'admin@mairie360.fr' : '');

  const getUserInitials = () => {
    return displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const avatarSrc = user?.avatar || user?.avatarUrl;
  const role = user?.role;
  const roleLabel = (() => {
    if (isAdmin || role === 'admin' || isDefaultUser) return '👑 Administrateur';
    if (role === 'manager') return 'Manager';
    if (role === 'user') return 'Utilisateur';
    return role;
  })();
  const canAdministrate = isAdmin || role === 'admin' || isDefaultUser;

  return (
    <header className="flex h-16 items-center justify-between border-t border-t-[#2f2a28] border-b border-b-[#b9d6d5] bg-white px-4 text-[#172033] shadow-[0_2px_8px_rgba(0,0,0,0.16)] sm:px-6">
      <div className="flex flex-1 items-center gap-3 sm:gap-4">
        <button
          type="button"
          aria-label="Ouvrir la navigation"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-transparent text-[#172033] transition-colors hover:border-[#4b908d]/30 hover:bg-[#4b908d]/10 lg:hidden"
          onClick={() => setSidebarOpen?.(true)}
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="relative hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#535d67]" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="h-9 w-64 rounded-md border border-[#b9d6d5] bg-[#fbfaf9] pl-10 pr-3 text-sm text-[#172033] shadow-none outline-none transition-colors placeholder:text-[#67717c] focus:border-[#4b908d] focus:ring-2 focus:ring-[#4b908d]/15 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Rechercher"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-transparent text-[#172033] transition-colors hover:border-[#4b908d]/30 hover:bg-[#4b908d]/10 sm:hidden"
        >
          <Search className="h-4 w-4" />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-[#172033] transition-colors hover:border-[#4b908d]/30 hover:bg-[#4b908d]/10"
        >
          <Bell className="h-[17px] w-[17px]" strokeWidth={1.8} />
          <span className="absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center rounded-md border border-white/70 bg-[#d8292f] text-[11px] font-semibold leading-none text-white shadow-md">
            3
          </span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center gap-3 rounded-md border border-transparent px-1 text-sm font-medium text-[#172033] transition-colors hover:border-[#4b908d]/30 hover:bg-[#4b908d]/10"
            >
              <Avatar
                src={avatarSrc}
                alt={displayName}
                fallback={<span className="text-[11px] font-semibold leading-none text-white">{getUserInitials()}</span>}
                className="!h-6 !w-6 border-2 border-[#4b908d]"
              />
              <span className="hidden whitespace-nowrap sm:inline">{displayName}</span>
              <ChevronDown className="hidden h-4 w-4 sm:inline" strokeWidth={1.8} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={7}
            className="!w-[150px] !min-w-[150px] !rounded-md !border-[#bfdad8] bg-white !p-0 shadow-[0_6px_18px_rgba(0,0,0,0.14)]"
          >
            <div className="px-3 py-2 text-sm">
              <div className="font-medium leading-5 text-[#2a2f35]">{displayName}</div>
              {displayEmail && (
                <div className="truncate text-xs leading-5 text-[#7a8087]">{displayEmail}</div>
              )}
              {roleLabel && (
                <div className="truncate text-xs leading-5 text-[#7a8087]">{roleLabel}</div>
              )}
            </div>
            <DropdownMenuSeparator className="mx-0 my-0 bg-[#e4e0dc]" />
            <DropdownMenuItem
              onClick={() => onPageChange('profile')}
              className="cursor-pointer !gap-3 !rounded-none !px-3 !py-2.5 text-sm font-normal !text-[#4c5258] hover:!bg-[#f5f5f5]"
            >
              <UserIcon className="h-4 w-4 shrink-0 text-[#6c7278]" strokeWidth={1.7} />
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onPageChange('settings')}
              className="cursor-pointer !gap-3 !rounded-none !px-3 !py-2.5 text-sm font-normal !text-[#4c5258] hover:!bg-[#f5f5f5]"
            >
              <Settings className="h-4 w-4 shrink-0 text-[#6c7278]" strokeWidth={1.7} />
              Paramètres
            </DropdownMenuItem>
            {canAdministrate && (
              <>
                <DropdownMenuSeparator className="mx-0 my-0 bg-[#e4e0dc]" />
                <DropdownMenuItem
                  onClick={() => onPageChange('admin')}
                  className="cursor-pointer !gap-3 !rounded-none !px-3 !py-2.5 text-sm font-normal !text-[#4c5258] hover:!bg-[#f5f5f5]"
                >
                  <Shield className="h-4 w-4 shrink-0 text-[#6c7278]" strokeWidth={1.7} />
                  Administration
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator className="mx-0 my-0 bg-[#e4e0dc]" />
            <DropdownMenuItem
              onClick={onLogout}
              className="cursor-pointer !gap-3 !rounded-none !px-3 !py-2.5 text-sm font-normal !text-[#e60012] hover:!bg-[#fff2f2]"
            >
              <LogOut className="h-4 w-4 shrink-0 text-[#6c7278]" strokeWidth={1.7} />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
