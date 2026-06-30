import React from 'react';
import { UserRound } from 'lucide-react';

import { Footer } from './Footer';
import type { FooterProps } from './Footer';
import { Header } from './Header';
import type { HeaderProps } from './Header';
import { Sidebar, defaultSidebarItems } from './Sidebar';
import type { SidebarItem, SidebarProps } from './Sidebar';
import { UserProfile } from './UserProfile';
import type { UserProfileProps, UserProfileUser } from './UserProfile';
import { joinClasses } from './calendar/style';

export interface UserProfilePageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  user?: UserProfileUser;
  isAdmin?: boolean;
  activeItem?: string;
  headerProps?: Omit<HeaderProps, 'user' | 'isAdmin' | 'setSidebarOpen'>;
  sidebarProps?: Omit<SidebarProps, 'activeItem' | 'isAdmin'>;
  footerProps?: FooterProps;
  profileProps?: Omit<UserProfileProps, 'user'>;
}

const defaultUser: UserProfileUser = {
  name: 'Admin Système',
  email: 'admin@mairie360.fr',
  role: 'admin',
  service: 'Administration',
};

const profileSidebarItem: SidebarItem = {
  id: 'profile',
  label: 'Profil',
  icon: UserRound,
};

const defaultProfileSidebarItems: SidebarItem[] = [
  ...defaultSidebarItems.filter((item) => item.id !== 'settings'),
  profileSidebarItem,
  ...defaultSidebarItems.filter((item) => item.id === 'settings'),
];

export const UserProfilePage = ({
  user = defaultUser,
  isAdmin,
  activeItem = 'profile',
  headerProps,
  sidebarProps,
  footerProps,
  profileProps,
  className = '',
  ...props
}: UserProfilePageProps) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const resolvedIsAdmin = isAdmin ?? user.role === 'admin';
  const {
    onPageChange,
    onLogout,
    profileHref,
    ...restHeaderProps
  } = headerProps ?? {};
  const {
    items = defaultProfileSidebarItems,
    onItemSelect,
    className: sidebarClassName,
    ...restSidebarProps
  } = sidebarProps ?? {};

  const handlePageChange = (page: string) => {
    onPageChange?.(page);
    setSidebarOpen(false);
  };

  const handleSidebarItemSelect = (item: SidebarItem) => {
    onItemSelect?.(item);
    handlePageChange(item.id);
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
            user={user}
            isAdmin={resolvedIsAdmin}
            setSidebarOpen={setSidebarOpen}
            onPageChange={handlePageChange}
            onLogout={onLogout}
            profileHref={profileHref}
          />
          <main className="min-h-0 flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <UserProfile user={user} {...profileProps} />
          </main>
          <Footer version="2.1.0" {...footerProps} />
        </div>
      </div>
    </div>
  );
};
