import React from 'react';
import { Download, HardDrive, LifeBuoy, MessageCircleQuestion, Trash2, TriangleAlert } from 'lucide-react';

import { SettingsSection } from './settings/controls';
import type { SettingsAssistanceAction, SettingsSystemInfo } from './settings/types';

export interface SettingsSystemPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  systemInfo: SettingsSystemInfo;
  onClearCache?: () => void;
  onAssistanceAction?: (action: SettingsAssistanceAction) => void;
}

const assistanceActions = [
  { id: 'help', label: "Centre d'aide", icon: MessageCircleQuestion },
  { id: 'support', label: 'Contacter le support', icon: LifeBuoy },
  { id: 'report', label: 'Signaler un problème', icon: TriangleAlert },
  { id: 'download-logs', label: 'Télécharger les logs', icon: Download },
] satisfies Array<{ id: SettingsAssistanceAction; label: string; icon: typeof LifeBuoy }>;

export const SettingsSystemPanel = ({ systemInfo, onClearCache, onAssistanceAction, className = '', ...props }: SettingsSystemPanelProps) => {
  const percentage = systemInfo.storageLimitMb > 0
    ? Math.min(100, Math.max(0, (systemInfo.storageUsedMb / systemInfo.storageLimitMb) * 100))
    : 0;

  return (
    <div className={`space-y-6 ${className}`} {...props}>
      <SettingsSection title="Informations système">
        <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {[
            ["Version de l'application", systemInfo.appVersion],
            ['Dernière mise à jour', systemInfo.lastUpdate],
            ['Navigateur', systemInfo.browser],
            ["Système d'exploitation", systemInfo.operatingSystem],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-sm text-[#667085]">{label}</dt>
              <dd className="mt-1 text-base font-semibold text-[#172033]">{value}</dd>
            </div>
          ))}
        </dl>
      </SettingsSection>

      <SettingsSection title="Stockage et données">
        <div className="flex justify-between gap-4 text-sm"><span>Données utilisées</span><span>{systemInfo.storageUsedMb} MB / {systemInfo.storageLimitMb} MB</span></div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e5e7eb]" aria-label="Utilisation du stockage" aria-valuemin={0} aria-valuemax={systemInfo.storageLimitMb} aria-valuenow={systemInfo.storageUsedMb} role="progressbar">
          <div className="h-full rounded-full bg-[#1256a6]" style={{ width: `${percentage}%` }} />
        </div>
        <button type="button" className="mt-4 inline-flex h-9 items-center gap-2 rounded-md border border-[#d8d2ca] bg-[#fbfaf9] px-4 text-sm font-semibold" onClick={onClearCache}>
          <HardDrive className="size-4" />
          Vider le cache
        </button>
        <p className="mt-2 text-sm text-[#667085]">Supprime les données temporaires pour libérer de l'espace</p>
      </SettingsSection>

      <SettingsSection title="Assistance">
        <div className="grid gap-3 sm:grid-cols-2">
          {assistanceActions.map((action) => {
            const Icon = action.icon;
            return (
              <button key={action.id} type="button" className="inline-flex h-10 items-center gap-2 rounded-md border border-[#d8d2ca] bg-[#fbfaf9] px-4 text-left text-sm font-semibold hover:bg-white" onClick={() => onAssistanceAction?.(action.id)}>
                <Icon className="size-4" />
                {action.label}
              </button>
            );
          })}
        </div>
      </SettingsSection>
    </div>
  );
};

