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
  /** Optional client-side router for relative destinations; otherwise use a full-page navigation. */
  onNavigate?: (href: string, itemId: string) => void;
  /** Compatibility callback for pages that already navigate by item id. */
  onPageChange?: (itemId: string) => void;
  headerProps?: Omit<HeaderProps, 'user' | 'isAdmin' | 'setSidebarOpen' | 'menuButtonRef' | 'onPageChange' | 'onLogout' | 'profileHref'>;
  sidebarProps?: Omit<SidebarProps, 'activeItem' | 'isAdmin' | 'items' | 'onItemSelect'> & {
    items?: SidebarItem[];
    onItemSelect?: (item: SidebarItem) => void;
  };
  footerProps?: FooterProps;
  children: React.ReactNode;
}

const isAbsoluteWebUrl = (href: string) => /^https?:\/\//i.test(href);
const isSafeRelativeUrl = (href: string) =>
  !href.startsWith('//') && !href.includes('\\') && !/^[a-z][a-z\d+.-]*:/i.test(href);
const safeHref = (href: string | undefined) => {
  const value = href?.trim();
  return value && (isAbsoluteWebUrl(value) || isSafeRelativeUrl(value)) ? value : undefined;
};

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
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!sidebarOpen) return;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setSidebarOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !drawerRef.current) return;

      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'),
      ).filter((element) => element.tabIndex >= 0 && !element.closest('[aria-hidden="true"]'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!first || !last) {
        event.preventDefault();
        drawerRef.current.focus();
      } else if (!active || !focusable.includes(active) || (event.shiftKey && active === first) || (!event.shiftKey && active === last)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    };

    const closeOnDesktop = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', closeOnDesktop);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', closeOnDesktop);
      if (menuButtonRef.current?.isConnected) menuButtonRef.current.focus();
    };
  }, [sidebarOpen]);

  const { items = defaultSidebarItems, onItemSelect, className: sidebarClassName, ...restSidebarProps } = sidebarProps ?? {};
  const canNavigate = (itemId: string) => {
    return Boolean(safeHref(hrefs[itemId]) || onPageChange);
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
    if (href && isSafeRelativeUrl(href)) {
      if (onNavigate) onNavigate(href, destinationId);
      else window.location.assign(href);
      return;
    }
    onPageChange?.(itemId);
  };

  const handleSidebarItemSelect = (item: SidebarItem) => {
    onItemSelect?.(item);
    navigate(item.id);
  };

  const profileHref = safeHref(hrefs.profile) || safeHref(hrefs.settings) || null;
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
          <div ref={drawerRef} tabIndex={-1} className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation mobile">
            <button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              className="absolute inset-0 h-full w-full bg-black/35"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative h-full w-[260px] max-w-[82vw] shadow-2xl">
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Fermer la navigation"
                className="absolute right-3 top-3 z-10 rounded-md p-2 text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                onClick={() => setSidebarOpen(false)}
              >
                ×
              </button>
              {renderSidebar()}
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col" inert={sidebarOpen}>
          <Header
            {...headerProps}
            user={user}
            isAdmin={isAdmin}
            setSidebarOpen={setSidebarOpen}
            menuButtonRef={menuButtonRef}
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
