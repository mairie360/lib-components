import React from 'react';
import { AlertTriangle, Clock3, Download, Info, RefreshCw, Trash2, Wifi, XCircle } from 'lucide-react';

import { administrationLogLevelOptions } from './administration/options';
import type { AdministrationLogEntry } from './administration/types';
import { AdministrationSelect } from './AdministrationSelect';
import { joinClasses } from './calendar/style';

export interface AdministrationLogsPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  logs?: AdministrationLogEntry[];
  levelValue?: AdministrationLogEntry['level'] | 'all';
  onLevelChange?: (value: AdministrationLogEntry['level'] | 'all') => void;
  onRefresh?: () => void;
  onExportCsv?: () => void;
  onClear?: () => void;
}

const levelStyles = {
  info: {
    icon: Info,
    chip: 'bg-[var(--mairie-accent-surface)] text-[var(--mairie-accent)]',
    iconWrap: 'bg-[var(--mairie-accent-surface)] text-[var(--mairie-accent)]',
  },
  warning: {
    icon: AlertTriangle,
    chip: 'bg-[var(--mairie-warning-surface)] text-[var(--mairie-warning-text)]',
    iconWrap: 'bg-[var(--mairie-warning-surface)] text-[var(--mairie-warning-text)]',
  },
  error: {
    icon: XCircle,
    chip: 'bg-[var(--mairie-error-surface)] text-[var(--mairie-error-text)]',
    iconWrap: 'bg-[var(--mairie-error-surface)] text-[var(--mairie-error-text)]',
  },
};

export const AdministrationLogsPanel = ({
  logs,
  levelValue = 'all',
  onLevelChange,
  onRefresh,
  onExportCsv,
  onClear,
  className = '',
  ...props
}: AdministrationLogsPanelProps) => {
  const visibleLogs = levelValue === 'all' ? (logs ?? []) : (logs ?? []).filter((log) => log.level === levelValue);

  return (
    <section
      className={joinClasses(
        'rounded-lg border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-6 py-6 text-[var(--mairie-text)]',
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <AdministrationSelect
            ariaLabel="Filtrer les logs par niveau"
            value={levelValue}
            options={administrationLogLevelOptions}
            className="w-full sm:w-[180px]"
            onValueChange={(value) => onLevelChange?.(value as AdministrationLogEntry['level'] | 'all')}
          />
          <button
            type="button"
            disabled={!onRefresh}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] px-4 text-sm font-semibold text-[var(--mairie-text)] transition hover:bg-[var(--mairie-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/25"
            onClick={onRefresh}
          >
            <RefreshCw className="size-4" strokeWidth={1.8} />
            <span>Actualiser</span>
          </button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            disabled={!onExportCsv}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] px-4 text-sm font-semibold text-[var(--mairie-text)] transition hover:bg-[var(--mairie-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/25"
            onClick={onExportCsv}
          >
            <Download className="size-4" strokeWidth={1.8} />
            <span>Exporter CSV</span>
          </button>
          <button
            type="button"
            disabled={!onClear}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface-raised)] px-4 text-sm font-semibold text-[var(--mairie-text)] transition hover:bg-[var(--mairie-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mairie-accent)]/25"
            onClick={onClear}
          >
            <Trash2 className="size-4" strokeWidth={1.8} />
            <span>Effacer</span>
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {visibleLogs.map((log) => {
          const style = levelStyles[log.level];
          const Icon = style.icon;

          return (
            <article
              key={log.id}
              className="flex gap-4 rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-4 py-4"
            >
              <div className={joinClasses('mt-0.5 flex h-5 w-8 items-center justify-center rounded-md', style.iconWrap)}>
                <Icon className="size-3.5" strokeWidth={1.9} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold leading-5 text-[var(--mairie-text)]">[{log.source}]</span>
                  <span className="text-sm font-semibold leading-5 text-[var(--mairie-text)]">{log.title}</span>
                  {log.actor && (
                    <span className="rounded-md border border-[var(--mairie-border)] px-2 py-0.5 text-xs font-semibold leading-none text-[var(--mairie-muted)]">
                      {log.actor}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm leading-5 text-[var(--mairie-text)]">{log.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-5 text-xs leading-4 text-[var(--mairie-muted)]">
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="size-3.5" strokeWidth={1.7} />
                    {log.timestamp}
                  </span>
                  {log.ipAddress && (
                    <span className="inline-flex items-center gap-1">
                      <Wifi className="size-3.5" strokeWidth={1.7} />
                      {log.ipAddress}
                    </span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
        {visibleLogs.length === 0 && (
          <div className="rounded-md border border-[var(--mairie-border)] px-4 py-10 text-center text-sm text-[var(--mairie-muted)]">
            {logs ? 'Aucun log pour ce niveau.' : 'Journaux indisponibles.'}
          </div>
        )}
      </div>
    </section>
  );
};
