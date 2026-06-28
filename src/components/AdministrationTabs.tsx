import React from 'react';
import { Eye, FileText, Server, Settings, Users } from 'lucide-react';

import type { AdministrationTabId } from './administration/types';
import { joinClasses } from './calendar/style';

export interface AdministrationTabItem {
  id: AdministrationTabId;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

export interface AdministrationTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value: AdministrationTabId;
  onValueChange?: (value: AdministrationTabId) => void;
  items?: AdministrationTabItem[];
}

export const defaultAdministrationTabs: AdministrationTabItem[] = [
  { id: 'users', label: 'Utilisateurs', icon: Users },
  { id: 'logs', label: 'Logs', icon: FileText },
  { id: 'system', label: 'Système', icon: Server },
  { id: 'audit', label: 'Audit', icon: Eye },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

export const AdministrationTabs = ({
  value,
  onValueChange,
  items = defaultAdministrationTabs,
  className = '',
  ...props
}: AdministrationTabsProps) => (
  <div
    role="tablist"
    aria-label="Sections d'administration"
    className={joinClasses(
      'grid gap-1 rounded-lg bg-[#ebe9e6] p-1 text-sm font-semibold text-[#2f3747] shadow-none sm:grid-cols-5',
      className
    )}
    {...props}
  >
    {items.map((item) => {
      const Icon = item.icon;
      const isActive = item.id === value;

      return (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={isActive}
          className={joinClasses(
            'inline-flex h-8 min-w-0 items-center justify-center gap-2 rounded-md px-3 text-sm leading-5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/50',
            isActive
              ? 'bg-white text-[#172033] shadow-[0_1px_2px_rgba(0,0,0,0.08)]'
              : 'text-[#2f3747] hover:bg-white/60'
          )}
          onClick={() => onValueChange?.(item.id)}
        >
          <Icon className="size-4 shrink-0" strokeWidth={1.8} />
          <span className="truncate">{item.label}</span>
        </button>
      );
    })}
  </div>
);
