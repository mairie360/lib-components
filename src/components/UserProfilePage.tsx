import React from 'react';
import { AppShell } from './AppShell';
import type { FooterProps } from './Footer';
import type { HeaderProps } from './Header';
import type { SidebarProps } from './Sidebar';
import { SettingsModule } from './SettingsModule';
import type { SettingsModuleProps } from './SettingsModule';
import type { UserProfileProps, UserProfileUser } from './UserProfile';
import type { SettingsProfile } from './settings/types';

export interface UserProfilePageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  user?: UserProfileUser;
  isAdmin?: boolean;
  activeItem?: string;
  onUpdateUser?: (user: UserProfileUser) => void;
  headerProps?: Omit<HeaderProps, 'user' | 'isAdmin' | 'setSidebarOpen'>;
  sidebarProps?: Omit<SidebarProps, 'activeItem' | 'isAdmin'>;
  footerProps?: FooterProps;
  hrefs?: Record<string, string | undefined>;
  onNavigate?: (href: string, itemId: string) => void;
  /** @deprecated Le profil est désormais rendu dans SettingsModule. */
  profileProps?: Omit<UserProfileProps, 'user' | 'onUpdateUser'>;
  settingsProps?: Omit<SettingsModuleProps, 'profile' | 'onProfileSave'>;
}

const defaultUser: UserProfileUser = {
  name: 'Utilisateur',
};

const getInitials = (name: string) => name
  .split(/\s+/)
  .filter(Boolean)
  .map((part) => part[0])
  .join('')
  .slice(0, 2)
  .toUpperCase();

const toSettingsProfile = (user: UserProfileUser): SettingsProfile => ({
  initials: getInitials(user.name),
  avatarUrl: user.avatarUrl ?? user.avatar,
  fullName: user.name,
  email: user.email ?? '',
  phone: user.phone ?? '',
  service: user.service ?? '',
  position: user.position ?? '',
  biography: user.biography ?? '',
});

export const UserProfilePage = ({
  user = defaultUser,
  isAdmin,
  activeItem = 'settings',
  onUpdateUser,
  headerProps,
  sidebarProps,
  footerProps,
  hrefs = {},
  onNavigate,
  profileProps,
  settingsProps,
  className = '',
  ...props
}: UserProfilePageProps) => {
  const [currentUser, setCurrentUser] = React.useState<UserProfileUser>(user);
  const resolvedIsAdmin = isAdmin ?? currentUser.role === 'admin';
  const {
    onPageChange,
    onLogout,
    profileHref,
    ...restHeaderProps
  } = headerProps ?? {};

  React.useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  const handleUpdateUser = (updatedUser: UserProfileUser) => {
    setCurrentUser(updatedUser);
    onUpdateUser?.(updatedUser);
  };

  const handleProfileSave = (profile: SettingsProfile) => {
    const updatedUser: UserProfileUser = {
      ...currentUser,
      name: profile.fullName,
      avatarUrl: profile.avatarUrl,
      email: profile.email,
      phone: profile.phone,
      service: profile.service,
      position: profile.position,
      biography: profile.biography,
    };

    handleUpdateUser(updatedUser);
  };

  return (
    <AppShell
      activeItem={activeItem}
      isAdmin={resolvedIsAdmin}
      user={currentUser}
      onLogout={onLogout}
      hrefs={{ ...hrefs, ...(profileHref ? { profile: profileHref } : {}) }}
      onNavigate={onNavigate}
      onPageChange={onPageChange}
      headerProps={restHeaderProps}
      sidebarProps={sidebarProps}
      footerProps={footerProps}
      className={className}
      {...props}
    >
      <SettingsModule
        defaultActiveTab="profile"
        profile={toSettingsProfile(currentUser)}
        onProfileSave={handleProfileSave}
        className={profileProps?.className}
        {...settingsProps}
      />
    </AppShell>
  );
};
