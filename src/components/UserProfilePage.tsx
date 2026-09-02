import React from 'react';
import { Footer } from './Footer';
import type { FooterProps } from './Footer';
import { Header } from './Header';
import type { HeaderProps } from './Header';
import { Sidebar, defaultSidebarItems } from './Sidebar';
import type { SidebarItem, SidebarProps } from './Sidebar';
import { SettingsModule } from './SettingsModule';
import type { SettingsModuleProps } from './SettingsModule';
import type { UserProfileProps, UserProfileUser } from './UserProfile';
import { joinClasses } from './calendar/style';
import type { SettingsProfile } from './settings/types';

export interface UserProfilePageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  user?: UserProfileUser;
  isAdmin?: boolean;
  activeItem?: string;
  onUpdateUser?: (user: UserProfileUser) => void;
  headerProps?: Omit<HeaderProps, 'user' | 'isAdmin' | 'setSidebarOpen'>;
  sidebarProps?: Omit<SidebarProps, 'activeItem' | 'isAdmin'>;
  footerProps?: FooterProps;
  /** @deprecated Le profil est désormais rendu dans SettingsModule. */
  profileProps?: Omit<UserProfileProps, 'user' | 'onUpdateUser'>;
  settingsProps?: Omit<SettingsModuleProps, 'profile' | 'onProfileSave'>;
}

const defaultUser: UserProfileUser = {
  name: 'Admin Système',
  email: 'admin@mairie360.fr',
  role: 'admin',
  service: 'Administration',
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
  profileProps,
  settingsProps,
  className = '',
  ...props
}: UserProfilePageProps) => {
  const [currentUser, setCurrentUser] = React.useState<UserProfileUser>(user);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const resolvedIsAdmin = isAdmin ?? currentUser.role === 'admin';
  const {
    onPageChange,
    onLogout,
    profileHref,
    ...restHeaderProps
  } = headerProps ?? {};
  const {
    items = defaultSidebarItems,
    onItemSelect,
    className: sidebarClassName,
    ...restSidebarProps
  } = sidebarProps ?? {};

  React.useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  const handlePageChange = (page: string) => {
    onPageChange?.(page);
    setSidebarOpen(false);
  };

  const handleSidebarItemSelect = (item: SidebarItem) => {
    onItemSelect?.(item);
    handlePageChange(item.id);
  };

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

  const renderSidebar = () => (
    <Sidebar
      activeItem={activeItem}
      isAdmin={resolvedIsAdmin}
      items={items}
      onItemSelect={handleSidebarItemSelect}
      className={joinClasses('h-full', sidebarClassName)}
      {...restSidebarProps}
    />
  );

  return (
    <div
      className={joinClasses('h-screen overflow-hidden bg-[#f5f3f0] font-sans text-[#172033]', className)}
      {...props}
    >
      <div className="flex h-screen">
        <div className="hidden shrink-0 lg:block">{renderSidebar()}</div>

        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation mobile">
            <button
              type="button"
              aria-label="Fermer la navigation"
              className="absolute inset-0 h-full w-full bg-black/35"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative h-full w-[260px] max-w-[82vw] shadow-2xl">{renderSidebar()}</div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            {...restHeaderProps}
            user={currentUser}
            isAdmin={resolvedIsAdmin}
            setSidebarOpen={setSidebarOpen}
            onPageChange={handlePageChange}
            onLogout={onLogout}
            profileHref={profileHref ?? '/settings?tab=profile'}
          />
          <main className="min-h-0 flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <SettingsModule
              defaultActiveTab="profile"
              profile={toSettingsProfile(currentUser)}
              onProfileSave={handleProfileSave}
              className={profileProps?.className}
              {...settingsProps}
            />
          </main>
          <Footer version="2.1.0" {...footerProps} />
        </div>
      </div>
    </div>
  );
};
