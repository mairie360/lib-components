import React from 'react';
import { Bell, Info, MonitorCog, Palette, Shield, UserRound } from 'lucide-react';

import type { SettingsTabId } from './settings/types';

export interface SettingsTabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: SettingsTabId;
  onValueChange?: (value: SettingsTabId) => void;
}

const tabs = [
  { id: 'profile', label: 'Profil', icon: UserRound },
  { id: 'security', label: 'Sécurité', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Apparence', icon: Palette },
  { id: 'general', label: 'Général', icon: MonitorCog },
  { id: 'system', label: 'Système', icon: Info },
] satisfies Array<{ id: SettingsTabId; label: string; icon: typeof UserRound }>;

export const SettingsTabs = ({ value, onValueChange, className = '', ...props }: SettingsTabsProps) => (
  <div
    role="tablist"
    aria-label="Paramètres du compte"
    className={`grid overflow-x-auto rounded-xl bg-[#e9e7e4] p-1 sm:grid-cols-3 xl:grid-cols-6 ${className}`}
    {...props}
  >
    {tabs.map((tab) => {
      const Icon = tab.icon;
      const active = value === tab.id;
      return (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active}
          className={`inline-flex h-9 min-w-36 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/35 xl:min-w-0 ${
            active ? 'bg-white text-[#172033] shadow-sm' : 'text-[#3f454c] hover:bg-white/60'
          }`}
          onClick={() => onValueChange?.(tab.id)}
        >
          <Icon className="size-4" strokeWidth={1.8} />
          {tab.label}
        </button>
      );
    })}
  </div>
);

