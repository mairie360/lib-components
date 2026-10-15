import React from 'react';
import { Archive } from 'lucide-react';

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
  green: 'bg-[var(--mairie-success-action-background)]',
  yellow: 'bg-[var(--mairie-warning-text)]',
  red: 'bg-[var(--mairie-error-action-background)]',
};

const statusDotClassNames: Record<AdministrationServerStatus['status'], string> = {
  online: 'bg-[var(--mairie-success-action-background)]',
  connected: 'bg-[var(--mairie-success-action-background)]',
  available: 'bg-[var(--mairie-success-action-background)]',
  warning: 'bg-[var(--mairie-warning-text)]',
  offline: 'bg-[var(--mairie-error-action-background)]',
};

export const AdministrationSystemPanel = ({
  resources,
  databaseMetrics,
  serverStatuses,
  onCreateBackup,
  className = '',
  ...props
}: AdministrationSystemPanelProps) => (
  <div className={joinClasses('space-y-6 text-[var(--mairie-text)]', className)} {...props}>
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-lg border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-6 py-6">
        <h2 className="text-base font-bold leading-6 text-[var(--mairie-text)]">Ressources Système</h2>
        <p className="mt-1 text-base leading-6 text-[var(--mairie-muted)]">Utilisation en temps réel</p>

        <div className="mt-7 space-y-6">
          {(resources ?? []).map((resource) => {
            const Icon = resource.icon;
            const tone = resource.tone ?? 'green';

            return (
              <div key={resource.id}>
                <div className="mb-2 flex items-center justify-between gap-4 text-sm leading-5">
                  <div className="flex min-w-0 items-center gap-2 font-semibold text-[var(--mairie-text)]">
                    <Icon className="size-4 shrink-0 text-[var(--mairie-muted)]" strokeWidth={1.8} />
                    <span className="truncate">{resource.label}</span>
                  </div>
                  <span className="shrink-0 text-[var(--mairie-text)]">{resource.valueLabel}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--mairie-surface-raised)]">
                  <div
                    className={joinClasses('h-full rounded-full', resourceToneClassNames[tone])}
                    style={{ width: `${Math.min(Math.max(resource.percentage, 0), 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
          {(resources?.length ?? 0) === 0 && (
            <p className="text-sm text-[var(--mairie-muted)]">{resources ? 'Aucune ressource à afficher.' : 'Ressources indisponibles.'}</p>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-6 py-6">
        <h2 className="text-base font-bold leading-6 text-[var(--mairie-text)]">Base de données</h2>
        <p className="mt-1 text-base leading-6 text-[var(--mairie-muted)]">Informations et statistiques</p>

        <div className="mt-7 space-y-4">
          {(databaseMetrics ?? []).map((metric) => (
            <div
              key={metric.id}
              className="flex min-h-12 items-center justify-between gap-4 rounded-md bg-[var(--mairie-surface-raised)] px-3 text-sm leading-5"
            >
              <span className="text-[var(--mairie-muted)]">{metric.label}</span>
              <span className="text-base font-semibold text-[var(--mairie-text)]">{metric.value}</span>
            </div>
          ))}
          {(databaseMetrics?.length ?? 0) === 0 && (
            <p className="text-sm text-[var(--mairie-muted)]">{databaseMetrics ? 'Aucune métrique à afficher.' : 'Métriques indisponibles.'}</p>
          )}

          <button
            type="button"
            disabled={!onCreateBackup}
            className="inline-flex h-9 w-full items-center justify-center gap-3 rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] px-4 text-sm font-semibold text-[var(--mairie-text)] transition hover:bg-[var(--mairie-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/25"
            onClick={onCreateBackup}
          >
            <Archive className="size-4" strokeWidth={1.8} />
            <span>Créer une sauvegarde</span>
          </button>
        </div>
      </section>
    </div>

    <section className="rounded-lg border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-6 py-6">
      <h2 className="text-base font-bold leading-6 text-[var(--mairie-text)]">État du serveur</h2>
      <p className="mt-1 text-base leading-6 text-[var(--mairie-muted)]">Informations système et services</p>

      <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(serverStatuses ?? []).map((serverStatus) => (
          <article key={serverStatus.id} className="rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] p-4">
            <div className="flex items-center gap-2">
              <span
                className={joinClasses(
                  'size-2 rounded-full',
                  statusDotClassNames[serverStatus.status]
                )}
                aria-hidden="true"
              />
              <h3 className="text-sm font-semibold leading-5 text-[var(--mairie-text)]">{serverStatus.label}</h3>
            </div>
            <p className="mt-3 text-xs leading-4 text-[var(--mairie-muted)]">{serverStatus.description}</p>
          </article>
        ))}
        {(serverStatuses?.length ?? 0) === 0 && (
          <p className="text-sm text-[var(--mairie-muted)]">{serverStatuses ? 'Aucun état à afficher.' : 'État du serveur indisponible.'}</p>
        )}
      </div>
    </section>
  </div>
);
