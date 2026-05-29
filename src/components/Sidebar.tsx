import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  Mail,
  Files,
  GraduationCap,
  Calendar,
  Shield,
  Settings,
  type LucideIcon,
} from 'lucide-react';

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
  /** Sidebar brand initial */
  brandInitial?: string;
  /** Additional CSS classes for the sidebar container */
  className?: string;
}

export const defaultSidebarItems: SidebarItem[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'projects', label: 'Projets', icon: Briefcase },
  { id: 'messages', label: 'Messagerie', icon: MessageSquare },
  { id: 'emails', label: 'E-mails', icon: Mail },
  { id: 'files', label: 'Fichiers', icon: Files },
  { id: 'training', label: 'Formation', icon: GraduationCap },
  { id: 'calendar', label: 'Calendrier', icon: Calendar },
  { id: 'admin', label: 'Administration', icon: Shield, adminOnly: true, badge: 'Admin' },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

export const Sidebar = ({
  activeItem = 'dashboard',
  isAdmin = false,
  items = defaultSidebarItems,
  onItemSelect,
  brandLabel = 'Mairie360',
  brandInitial = 'M',
  className = '',
}: SidebarProps) => {
  const visibleItems = items.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside
      aria-label="Navigation principale"
      className={`flex min-h-screen w-[260px] flex-col border-r border-[#3b514f] bg-[#2b2b2b] text-[#dff9ff] ${className}`}
    >
      <div className="flex h-16 items-center gap-2.5 border-b border-[#4b908d]/45 px-7">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1256a6] text-sm font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.25)]">
          {brandInitial}
        </div>
        <div className="text-lg font-semibold tracking-normal text-white">{brandLabel}</div>
      </div>

      <nav className="flex flex-1 flex-col gap-2 px-4 py-6" aria-label="Menu principal">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;

          return (
            <button
              key={item.id}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              className={`flex h-[42px] w-full items-center gap-3 rounded-md border px-3 text-left text-base transition-colors ${
                isActive
                  ? 'border-[#2677cf] bg-[#1c63b7] text-white shadow-[0_1px_2px_rgba(0,0,0,0.24)]'
                  : 'border-transparent text-[#dff9ff] hover:border-[#4b908d]/70 hover:bg-[#334d4a] hover:text-white'
              }`}
              onClick={() => onItemSelect?.(item)}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={1.9} />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span className="shrink-0 rounded-md bg-[#e60012] px-2 py-0.5 text-xs font-semibold leading-5 text-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
