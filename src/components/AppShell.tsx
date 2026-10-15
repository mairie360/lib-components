import React from 'react';

import { Footer, type FooterProps } from './Footer';
import { DesktopNavigation } from './DesktopNavigation';
import { configureSidebarCookieDomain } from '../utils/sidebar-preference';
import { Header, type HeaderProps } from './Header';
import { Sidebar, defaultSidebarItems, type SidebarItem, type SidebarProps } from './Sidebar';
import { NotificationCenter, type NotificationSource } from './NotificationCenter';
import { joinClasses } from './calendar/style';

export interface AppShellProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onNavigate'> {
  /** Opt into the shared desktop collapse and municipal theme layout. */
  collapsibleSidebar?: boolean;
  /** Validated shared preference scope; no authentication cookie is changed. */
  sidebarCookieDomain?: string;
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
  notificationsSource?: NotificationSource;
  headerProps?: Omit<HeaderProps, 'user' | 'isAdmin' | 'setSidebarOpen' | 'menuButtonRef' | 'onPageChange' | 'onLogout' | 'profileHref'>;
  sidebarProps?: Omit<SidebarProps, 'activeItem' | 'isAdmin' | 'items' | 'onItemSelect' | 'footer'> & {
    items?: SidebarItem[];
    onItemSelect?: (item: SidebarItem) => void;
  };
  footerProps?: FooterProps;
  /** Sidebar placement matches the frontend prototype; content preserves the legacy horizontal layout. */
  footerPlacement?: 'sidebar' | 'content';
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
  collapsibleSidebar = false, sidebarCookieDomain,
  activeItem = 'dashboard',
  isAdmin = false,
  user,
  onLogout,
  hrefs,
  onNavigate,
  onPageChange,
  headerProps,
  notificationsSource,
  sidebarProps,
  footerProps,
  footerPlacement = 'sidebar',
  children,
  className = '',
  ...props
}: AppShellProps) => {
  const accountKey = JSON.stringify(user ?? {});
  const [notificationsOwner, setNotificationsOwner] = React.useState<string | null>(null);
  const [notificationReceipt, setNotificationReceipt] = React.useState<{ owner: string; count: number } | null>(null);
  const notificationsOpen = notificationsOwner === accountKey;
  const notificationCount = notificationReceipt?.owner === accountKey ? notificationReceipt.count : undefined;
  const receiveNotificationCount = React.useCallback((count: number) => setNotificationReceipt({ owner:accountKey,count }), [accountKey]);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const [footerHeight, setFooterHeight] = React.useState(76);
  const shellRef = React.useRef<HTMLDivElement>(null);
  configureSidebarCookieDomain(sidebarCookieDomain);
  React.useEffect(() => {
    if (!collapsibleSidebar || typeof ResizeObserver === 'undefined') return;
    const footer = shellRef.current?.querySelector('footer.app-accessible-footer');
    if (!footer) return;
    const measure = () => setFooterHeight(Math.ceil(footer.getBoundingClientRect().height));
    const observer = new ResizeObserver(measure); observer.observe(footer); measure();
    return () => observer.disconnect();
  }, [collapsibleSidebar]);
  const effectiveFooterPlacement = collapsibleSidebar ? 'content' : footerPlacement;
  const mainId = React.useId();
  const mainRef = React.useRef<HTMLElement>(null);
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
      footer={effectiveFooterPlacement === 'sidebar' ? <Footer {...footerProps} variant="sidebar" /> : undefined}
      className={joinClasses('h-full', collapsibleSidebar ? 'app-published-sidebar' : undefined, sidebarClassName)}
    />
  );

  return (
    <div {...props} ref={shellRef} data-sidebar-collapsed={collapsibleSidebar ? collapsed : undefined} className={joinClasses('h-screen overflow-hidden bg-[var(--mairie-background)] font-sans text-[var(--mairie-text)]', collapsibleSidebar ? 'app-shell-frame' : undefined, className)} style={collapsibleSidebar ? { ...props.style, '--app-footer-height': `${footerHeight}px` } as React.CSSProperties : props.style}>
      {collapsibleSidebar && <DesktopNavigation activeItem={activeItem} isAdmin={isAdmin} hrefs={hrefs} onNavigate={onNavigate} onPageChange={onPageChange} sidebarProps={sidebarProps} inactive={sidebarOpen || notificationsOpen} onCollapsedChange={setCollapsed} />}
      <div inert={sidebarOpen || notificationsOpen}>
        <a
          href={`#${mainId}`}
          onClick={() => mainRef.current?.focus()}
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-[var(--mairie-surface)] focus:p-3 focus:font-semibold focus:text-[var(--mairie-accent)] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--mairie-accent)]"
        >
          Aller au contenu
        </a>
      </div>
      {notificationsOpen && <NotificationCenter key={accountKey} source={notificationsSource} onClose={() => setNotificationsOwner(null)} onUnreadCount={receiveNotificationCount} />}
      <div className="flex h-screen">
        <div className="hidden shrink-0 lg:block">{renderSidebar()}</div>

        {sidebarOpen && (
          <div ref={drawerRef} tabIndex={-1} className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation mobile">
            <button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              className="absolute inset-0 h-full w-full bg-[var(--mairie-overlay-background)]/35"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative h-full w-[260px] max-w-[82vw] shadow-2xl">
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Fermer la navigation"
                className="absolute right-3 top-3 z-10 rounded-md p-2 text-[var(--mairie-on-action)] hover:bg-[var(--mairie-surface)]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--mairie-on-action)]"
                onClick={() => setSidebarOpen(false)}
              >
                ×
              </button>
              {renderSidebar()}
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col" inert={sidebarOpen || notificationsOpen}>
          <Header
            {...headerProps}
            notificationCount={notificationCount ?? headerProps?.notificationCount}
            onNotificationsClick={headerProps?.onNotificationsClick ?? (() => setNotificationsOwner(accountKey))}
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
          <main id={mainId} ref={mainRef} tabIndex={-1} className="min-h-0 flex-1 overflow-auto px-4 py-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--mairie-accent)] sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
          {effectiveFooterPlacement === 'content' && <Footer {...footerProps} className={joinClasses(collapsibleSidebar ? "app-accessible-footer" : undefined, footerProps?.className)} variant="horizontal" />}
        </div>
      </div>
    </div>
  );
};
