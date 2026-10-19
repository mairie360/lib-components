import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  GraduationCap,
  Calendar,
  Shield,
  Settings,
  type LucideIcon,
} from 'lucide-react';

import { mairie360LogoSrc } from '../assets/logo';

export type SidebarItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  badge?: string;
};

export interface SidebarProps {
  /** Currently selected navigation item id */
  activeItem?: string;
  /** Indicates if the logged-in user is an administrator */
  isAdmin?: boolean;
  /** Navigation items to display. Admin-only items are filtered automatically. */
  items?: SidebarItem[];
  /** Callback called when a navigation item is selected */
  onItemSelect?: (item: SidebarItem) => void;
  /** Sidebar brand label */
  brandLabel?: string;
  /** Sidebar logo source. Defaults to the bundled Mairie360 logo. Set to null to use the brand initial fallback. */
  brandLogoSrc?: string | null;
  /** Sidebar logo alternative text */
  brandLogoAlt?: string;
  /** Sidebar brand initial */
  brandInitial?: string;
  /** Application information placed below the independently scrollable navigation. */
  footer?: React.ReactNode;
  /** Additional CSS classes for the sidebar container */
  className?: string;
}

export const defaultSidebarItems: SidebarItem[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'projects', label: 'Projets', icon: Briefcase },
  { id: 'messages', label: 'Messagerie', icon: MessageSquare },
  { id: 'training', label: 'Formation', icon: GraduationCap },
  { id: 'calendar', label: 'Calendrier', icon: Calendar },
  { id: 'admin', label: 'Administration', icon: Shield, adminOnly: true },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

export const Sidebar = ({
  activeItem = 'dashboard',
  isAdmin = false,
  items = defaultSidebarItems,
  onItemSelect,
  brandLabel = 'Mairie360',
  brandLogoSrc = mairie360LogoSrc,
  brandLogoAlt = 'Logo Mairie360',
  brandInitial = 'M',
  footer,
  className = '',
}: SidebarProps) => {
  const [logoError, setLogoError] = React.useState(false);
  const visibleItems = items.filter((item) => !item.adminOnly || isAdmin);
  const shouldShowLogo = Boolean(brandLogoSrc && !logoError);

  React.useEffect(() => {
    setLogoError(false);
  }, [brandLogoSrc]);

  return (
    <aside
      aria-label="Navigation principale"
      className={`flex min-h-screen w-[260px] flex-col border-r border-[var(--mairie-navigation-border)] bg-[var(--mairie-navigation-background)] text-[var(--mairie-navigation-text)] ${className}`}
    >
      <div className="flex h-16 items-center gap-2.5 border-b border-[var(--mairie-navigation-border)]/45 px-7">
        {shouldShowLogo ? (
          <img
            src={brandLogoSrc as string}
            alt={brandLogoAlt}
            className="h-8 w-8 shrink-0 rounded-lg object-contain shadow-[var(--mairie-shadow)]"
            onError={() => setLogoError(true)}
          />
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--mairie-action-background)] text-sm font-semibold text-[var(--mairie-on-action)] shadow-[var(--mairie-shadow)]">
            {brandInitial}
          </div>
        )}
        <div className="text-lg font-semibold tracking-normal text-[var(--mairie-on-action)]">{brandLabel}</div>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 py-6" aria-label="Menu principal">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          const isAdministration = item.id === 'admin';
          let appearance = isActive
            ? 'border-[var(--mairie-navigation-active-border)] bg-[var(--mairie-navigation-active-background)] text-[var(--mairie-on-action)] shadow-[var(--mairie-shadow)]'
            : 'border-transparent text-[var(--mairie-navigation-text)] hover:border-[var(--mairie-navigation-border)]/70 hover:bg-[var(--mairie-navigation-hover-background)] hover:text-[var(--mairie-on-action)]';

          if (isAdministration) {
            appearance = isActive
              ? 'border-[var(--mairie-navigation-admin-active-border)] bg-[var(--mairie-navigation-admin-active-background)] text-[var(--mairie-on-action)] shadow-[var(--mairie-navigation-admin-shadow)] hover:bg-[var(--mairie-navigation-admin-active-background)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-navigation-admin-focus)]'
              : 'border-[var(--mairie-navigation-admin-border)] bg-[var(--mairie-navigation-admin-background)] text-[var(--mairie-on-action)] shadow-[var(--mairie-shadow)] hover:bg-[var(--mairie-navigation-admin-hover-background)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mairie-navigation-admin-focus)]';
          }

          return (
            <button
              key={item.id}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              className={`flex h-[42px] w-full shrink-0 items-center gap-3 rounded-md border px-3 text-left text-base transition-colors ${appearance}`}
              onClick={() => onItemSelect?.(item)}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={1.9} />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold leading-5 text-[var(--mairie-on-action)] ${isAdministration ? 'bg-[var(--mairie-on-action)]/20' : 'bg-[var(--mairie-error-action-background)]'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      {footer && <div className="shrink-0">{footer}</div>}
    </aside>
  );
};
