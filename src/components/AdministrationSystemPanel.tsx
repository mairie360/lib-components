import React from 'react';
import { Archive } from 'lucide-react';

import {
  defaultAdministrationDatabaseMetrics,
  defaultAdministrationResources,
  defaultAdministrationServerStatuses,
} from './administration/defaultData';
import type {
  AdministrationDatabaseMetric,
  AdministrationResource,
  AdministrationServerStatus,
} from './administration/types';
import { joinClasses } from './calendar/style';

export interface AdministrationSystemPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  resources?: AdministrationResource[];
  databaseMetrics?: AdministrationDatabaseMetric[];
  serverStatuses?: AdministrationServerStatus[];
  onCreateBackup?: () => void;
}

const resourceToneClassNames = {
  green: 'bg-[#00c853]',
  yellow: 'bg-[#f5b400]',
  red: 'bg-[#dc2626]',
};

const statusDotClassNames: Record<AdministrationServerStatus['status'], string> = {
  online: 'bg-[#00c853]',
  connected: 'bg-[#00c853]',
  available: 'bg-[#00c853]',
  warning: 'bg-[#f5b400]',
  offline: 'bg-[#dc2626]',
};

export const AdministrationSystemPanel = ({
  resources = defaultAdministrationResources,
  databaseMetrics = defaultAdministrationDatabaseMetrics,
  serverStatuses = defaultAdministrationServerStatuses,
  onCreateBackup,
  className = '',
  ...props
}: AdministrationSystemPanelProps) => (
  <div className={joinClasses('space-y-6 text-[#172033]', className)} {...props}>
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-lg border border-[#d8d2ca] bg-white px-6 py-6">
        <h2 className="text-base font-bold leading-6 text-[#172033]">Ressources Système</h2>
        <p className="mt-1 text-base leading-6 text-[#667085]">Utilisation en temps réel</p>

        <div className="mt-7 space-y-6">
          {resources.map((resource) => {
            const Icon = resource.icon;
            const tone = resource.tone ?? 'green';

            return (
              <div key={resource.id}>
                <div className="mb-2 flex items-center justify-between gap-4 text-sm leading-5">
                  <div className="flex min-w-0 items-center gap-2 font-semibold text-[#172033]">
                    <Icon className="size-4 shrink-0 text-[#64748b]" strokeWidth={1.8} />
                    <span className="truncate">{resource.label}</span>
                  </div>
                  <span className="shrink-0 text-[#334155]">{resource.valueLabel}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#e5e7eb]">
                  <div
                    className={joinClasses('h-full rounded-full', resourceToneClassNames[tone])}
                    style={{ width: `${Math.min(Math.max(resource.percentage, 0), 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-[#d8d2ca] bg-white px-6 py-6">
        <h2 className="text-base font-bold leading-6 text-[#172033]">Base de données</h2>
        <p className="mt-1 text-base leading-6 text-[#667085]">Informations et statistiques</p>

        <div className="mt-7 space-y-4">
          {databaseMetrics.map((metric) => (
            <div
              key={metric.id}
              className="flex min-h-12 items-center justify-between gap-4 rounded-md bg-[#fbfcfd] px-3 text-sm leading-5"
            >
              <span className="text-[#475569]">{metric.label}</span>
              <span className="text-base font-semibold text-[#172033]">{metric.value}</span>
            </div>
          ))}

          <button
            type="button"
            className="inline-flex h-9 w-full items-center justify-center gap-3 rounded-md border border-[#d8d2ca] bg-[#fbfaf9] px-4 text-sm font-semibold text-[#172033] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1256a6]/25"
            onClick={onCreateBackup}
          >
            <Archive className="size-4" strokeWidth={1.8} />
            <span>Créer une sauvegarde</span>
          </button>
        </div>
      </section>
    </div>

    <section className="rounded-lg border border-[#d8d2ca] bg-white px-6 py-6">
      <h2 className="text-base font-bold leading-6 text-[#172033]">État du serveur</h2>
      <p className="mt-1 text-base leading-6 text-[#667085]">Informations système et services</p>

      <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {serverStatuses.map((serverStatus) => (
          <article key={serverStatus.id} className="rounded-md border border-[#e3e0dc] bg-white p-4">
            <div className="flex items-center gap-2">
              <span
                className={joinClasses(
                  'size-2 rounded-full',
                  statusDotClassNames[serverStatus.status]
                )}
                aria-hidden="true"
              />
              <h3 className="text-sm font-semibold leading-5 text-[#172033]">{serverStatus.label}</h3>
            </div>
            <p className="mt-3 text-xs leading-4 text-[#475569]">{serverStatus.description}</p>
          </article>
        ))}
      </div>
    </section>
  </div>
);
