import React from 'react';

import { Footer, type FooterProps } from './Footer';
import { Header, type HeaderProps } from './Header';
import { Sidebar, defaultSidebarItems, type SidebarItem, type SidebarProps } from './Sidebar';
import { joinClasses } from './calendar/style';

export interface AppShellProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onNavigate'> {
  activeItem?: string;
  isAdmin?: boolean;
  user?: HeaderProps['user'];
  onLogout?: () => void;
  /** Destinations supplied by the consuming frontend; the library reads no environment variables. */
  hrefs: Record<string, string | undefined>;
  /** Handle relative destinations with the consuming frontend's router. */
  onNavigate?: (href: string, itemId: string) => void;
  /** Compatibility callback for pages that already navigate by item id. */
  onPageChange?: (itemId: string) => void;
  headerProps?: Omit<HeaderProps, 'user' | 'isAdmin' | 'setSidebarOpen' | 'onPageChange' | 'onLogout' | 'profileHref'>;
  sidebarProps?: Omit<SidebarProps, 'activeItem' | 'isAdmin' | 'items' | 'onItemSelect'> & {
    items?: SidebarItem[];
    onItemSelect?: (item: SidebarItem) => void;
  };
  footerProps?: FooterProps;
  children: React.ReactNode;
}

const isAbsoluteWebUrl = (href: string) => /^https?:\/\//i.test(href);
const isSafeRelativeUrl = (href: string) =>
  !href.startsWith('//') && !/^[a-z][a-z\d+.-]*:/i.test(href);

export const AppShell = ({
  activeItem = 'dashboard',
  isAdmin = false,
  user,
  onLogout,
  hrefs,
  onNavigate,
  onPageChange,
  headerProps,
  sidebarProps,
  footerProps,
  children,
  className = '',
  ...props
}: AppShellProps) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  React.useEffect(() => {
    if (!sidebarOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [sidebarOpen]);

  const { items = defaultSidebarItems, onItemSelect, className: sidebarClassName, ...restSidebarProps } = sidebarProps ?? {};
  const canNavigate = (itemId: string) => {
    const href = hrefs[itemId]?.trim();
    return Boolean(
      (href && (isAbsoluteWebUrl(href) || (isSafeRelativeUrl(href) && onNavigate))) || onPageChange,
    );
  };
  const visibleItems = items.filter((item) => canNavigate(item.id));

  const navigate = (itemId: string) => {
    setSidebarOpen(false);
    const destinationId = itemId === 'profile' && !hrefs.profile ? 'settings' : itemId;
    const href = hrefs[destinationId]?.trim();
    if (href && isAbsoluteWebUrl(href)) {
      window.location.assign(href);
      return;
    }
    if (href && isSafeRelativeUrl(href) && onNavigate) {
      onNavigate(href, destinationId);
      return;
    }
    onPageChange?.(itemId);
  };

  const handleSidebarItemSelect = (item: SidebarItem) => {
    onItemSelect?.(item);
    navigate(item.id);
  };

  const profileHref = hrefs.profile?.trim() || hrefs.settings?.trim() || null;
  const headerCanNavigate = canNavigate('profile') || canNavigate('settings') || canNavigate('admin');
  const renderSidebar = () => (
    <Sidebar
      {...restSidebarProps}
      activeItem={activeItem}
      isAdmin={isAdmin}
      items={visibleItems}
      onItemSelect={handleSidebarItemSelect}
      className={joinClasses('h-full', sidebarClassName)}
    />
  );

  return (
    <div className={joinClasses('h-screen overflow-hidden bg-[#f5f3f0] font-sans text-[#172033]', className)} {...props}>
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
            {...headerProps}
            user={user}
            isAdmin={isAdmin}
            setSidebarOpen={setSidebarOpen}
            onPageChange={headerCanNavigate ? navigate : undefined}
            onLogout={onLogout}
            profileHref={profileHref}
            showProfile={canNavigate('profile') || canNavigate('settings')}
            showSettings={canNavigate('settings')}
            showAdministration={canNavigate('admin')}
          />
          <main className="min-h-0 flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
          <Footer {...footerProps} />
        </div>
      </div>
    </div>
  );
};
