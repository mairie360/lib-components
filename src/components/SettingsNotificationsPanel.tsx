import React from 'react';

import { SettingsSection, SettingsToggle } from './settings/controls';
import type { SettingsNotificationState } from './settings/types';

export interface SettingsNotificationsPanelProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  notifications: SettingsNotificationState;
  onChange?: (notifications: SettingsNotificationState) => void;
}

export const SettingsNotificationsPanel = ({ notifications, onChange, className = '', ...props }: SettingsNotificationsPanelProps) => {
  const update = (field: keyof SettingsNotificationState, value: boolean) =>
    onChange?.({ ...notifications, [field]: value });

  return (
    <div className={className} {...props}>
      <SettingsSection title="Préférences de notification">
        <div className="space-y-1">
          <SettingsToggle label="Notifications par e-mail" description="Recevez les notifications importantes par e-mail" checked={notifications.email} onChange={(value) => update('email', value)} />
          <SettingsToggle label="Notifications push" description="Notifications instantanées dans votre navigateur" checked={notifications.push} onChange={(value) => update('push', value)} />
          <SettingsToggle label="Notifications desktop" description="Notifications sur votre bureau" checked={notifications.desktop} onChange={(value) => update('desktop', value)} />
        </div>
        <div className="my-5 border-t border-[#e3e0dc]" />
        <h3 className="mb-2 text-sm font-bold text-[#172033]">Types de notifications</h3>
        <SettingsToggle label="Messages" description="Nouveaux messages reçus" checked={notifications.messages} onChange={(value) => update('messages', value)} />
        <SettingsToggle label="Projets" description="Mises à jour des projets" checked={notifications.projects} onChange={(value) => update('projects', value)} />
        <SettingsToggle label="Calendrier" description="Rappels d'événements" checked={notifications.calendar} onChange={(value) => update('calendar', value)} />
      </SettingsSection>
    </div>
  );
};
