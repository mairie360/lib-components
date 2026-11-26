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

import { mairie360LogoSrc } from '../../assets/logo';
import { Counter, counterText } from '../Counter';
import { componentMarker } from '../component-marker';

/**
 * Hover animation of a navigation icon (MAIR-1093, 400 ms, `--mairie-ease-spring`, none under
 * prefers-reduced-motion): tiles cascade, briefcase rummage, page turn, talking bubble, cap toss,
 * shield straightening, gear spin. Keyed by the `data-nav-anim` attribute of the entry.
 */
export type NavigationAnimation = 'dashboard' | 'projects' | 'calendar' | 'messages' | 'training' | 'admin' | 'settings' | 'none';

export type SidebarItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  /** Items to handle, shown with `Counter` (0–9, « 9+ » above). */
  count?: number;
  /** @deprecated Use `count`; a numeric badge is shown with `Counter`, any other text is ignored. */
  badge?: string;
  /** Icon animation on hover or keyboard focus; defaults to the item id (the default destinations have one each). */
  animation?: NavigationAnimation;
};

/** Number of items to handle of a navigation entry (`count`, or a numeric legacy `badge`). */
export function navigationCount(item: Pick<SidebarItem, 'count' | 'badge'>): number | undefined {
  if (typeof item.count === 'number' && Number.isFinite(item.count) && item.count > 0) return item.count;
  const badge = item.badge?.trim();
  return badge && /^\d+$/.test(badge) && Number(badge) > 0 ? Number(badge) : undefined;
}

/** Accessible name of a navigation entry: « Messagerie, 4 à traiter », « plus de 9 » above 9. */
export function navigationLabel(item: Pick<SidebarItem, 'label' | 'count' | 'badge'>): string {
  const count = navigationCount(item);
  if (count === undefined) return item.label;
  return `${item.label}, ${counterText(count) === '9+' ? 'plus de 9' : count} à traiter`;
}

export interface SidebarProps {
  /** Currently selected navigation item id */
  activeItem?: string;
  /** Indicates if the logged-in user is an administrator */
  isAdmin?: boolean;
  /** Navigation items to display. Admin-only items are filtered automatically. */
  items?: SidebarItem[];
  /** Callback called when a navigation item is selected */
  onItemSelect?: (item: SidebarItem) => void;
  /**
   * Commune name, shown under « Commune de » next to the logo. Without it the legacy « Mairie360 » label is shown.
   * Inside `AppShell` / `AccessibleShell`, pass the shell's `commune` instead: it feeds the header and the navigation.
   */
  brandLabel?: string;
  /**
   * Sidebar logo source. Defaults to the bundled Mairie360 logo. Set to null to use the brand initial fallback.
   * @deprecated Ignored inside `AppShell` / `AccessibleShell`, which always show the bundled logo so every front looks the same.
   */
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
  brandLabel,
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
      {...componentMarker('Sidebar')}
      aria-label="Navigation principale"
      className={`flex min-h-screen w-[260px] flex-col border-r border-[var(--mairie-shell-border)] bg-[var(--mairie-shell-background)] text-[var(--mairie-navigation-text)] ${className}`}
    >
      <div className="flex h-16 shrink-0 items-center gap-2.5 px-3">
        {shouldShowLogo ? (
          <img
            src={brandLogoSrc as string}
            alt={brandLogoAlt}
            className="h-12 w-auto shrink-0 object-contain"
            onError={() => setLogoError(true)}
          />
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--mairie-action-background)] text-sm font-semibold text-[var(--mairie-on-action)] shadow-[var(--mairie-shadow)]">
            {brandInitial}
          </div>
        )}
        {brandLabel?.trim() ? (
          <div className="flex min-w-0 flex-col border-l border-[var(--mairie-navigation-border)] pl-2.5 leading-tight">
            <span className="text-xs text-[var(--mairie-navigation-text)]">Commune de</span>
            <span className="break-words text-base font-semibold text-[var(--mairie-navigation-text)]">{brandLabel}</span>
          </div>
        ) : (
          <div className="text-lg font-semibold tracking-normal text-[var(--mairie-navigation-text)]">Mairie360</div>
        )}
      </div>

      <nav className="flex min-h-0 flex-1 flex-col items-stretch gap-2 overflow-y-auto overflow-x-hidden px-3 pb-6 pt-3" aria-label="Menu principal">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          const count = navigationCount(item);
          // MAIR-1092: every destination, Administration included, shares one style; the active one
          // gets the active background and the 3 px indicator bar on the edge of the band.
          const appearance = isActive
            ? 'bg-[var(--mairie-navigation-active-background)] text-[var(--mairie-navigation-active-text)] font-semibold'
            : 'text-[var(--mairie-navigation-text)] hover:bg-[var(--mairie-navigation-hover-background)] hover:text-[var(--mairie-navigation-active-text)]';

          return (
            <button
              key={item.id}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              aria-label={count === undefined ? undefined : navigationLabel(item)}
              data-nav-anim={item.animation ?? item.id}
              className={`relative flex h-[42px] w-full shrink-0 items-center gap-3 rounded-md border border-transparent pl-3 pr-3.5 text-left text-base transition-colors ${appearance}`}
              onClick={() => onItemSelect?.(item)}
            >
              {isActive && <span aria-hidden="true" data-nav-indicator className="absolute -left-[13px] bottom-2.5 top-2.5 w-[3px] rounded-r-[3px] bg-[var(--mairie-navigation-active-indicator)]" />}
              <Icon aria-hidden="true" className="mairie-nav-icon h-5 w-5 shrink-0" strokeWidth={1.9} />
              <span className="min-w-0 truncate">{item.label}</span>
              {count !== undefined && <Counter value={count} className="ml-auto" />}
            </button>
          );
        })}
      </nav>
      {footer && <div className="shrink-0">{footer}</div>}
    </aside>
  );
};
