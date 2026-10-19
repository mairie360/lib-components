import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

import type { AdministrationAuditEntry } from './administration/types';
import { joinClasses } from './calendar/style';

export interface AdministrationAuditPanelProps extends React.HTMLAttributes<HTMLElement> {
  entries?: AdministrationAuditEntry[];
}

const outcomeStyles: Record<AdministrationAuditEntry['outcome'], string> = {
  success: 'bg-[var(--mairie-success-surface)] text-[var(--mairie-success-text)]',
  danger: 'bg-[var(--mairie-error-surface)] text-[var(--mairie-error-text)]',
};

export const AdministrationAuditPanel = ({
  entries,
  className = '',
  ...props
}: AdministrationAuditPanelProps) => (
  <section
    className={joinClasses(
      'rounded-lg border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-6 py-6 text-[var(--mairie-text)]',
      className
    )}
    {...props}
  >
    <h2 className="text-base font-bold leading-6 text-[var(--mairie-text)]">Journal d’audit</h2>
    <p className="mt-1 text-base leading-6 text-[var(--mairie-muted)]">
      Historique de toutes les actions sensibles effectuées dans le système
    </p>

    <div className="mt-7 space-y-4">
      {(entries ?? []).map((entry) => {
        const Icon = entry.outcome === 'success' ? CheckCircle2 : XCircle;

        return (
          <article
            key={entry.id}
            className="flex gap-4 rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-4 py-4"
          >
            <div
              className={joinClasses(
                'flex size-9 shrink-0 items-center justify-center rounded-md',
                outcomeStyles[entry.outcome]
              )}
            >
              <Icon className="size-5" strokeWidth={1.8} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold leading-5 text-[var(--mairie-text)]">{entry.action}</h3>
                <span className="rounded-md border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-2 py-0.5 text-xs font-semibold leading-none text-[var(--mairie-muted)]">
                  {entry.actor}
                </span>
              </div>
              <p className="mt-1 text-sm leading-5 text-[var(--mairie-text)]">{entry.subject}</p>
              <p className="mt-3 text-xs leading-4 text-[var(--mairie-muted)]">{entry.description}</p>
              <p className="mt-3 text-xs leading-4 text-[var(--mairie-muted)]">{entry.timestamp}</p>
            </div>
          </article>
        );
      })}
      {(entries?.length ?? 0) === 0 && (
        <p className="rounded-md border border-[var(--mairie-border)] px-4 py-10 text-center text-sm text-[var(--mairie-muted)]">
          {entries ? 'Aucune action à afficher.' : 'Journal d’audit indisponible.'}
        </p>
      )}
    </div>
  </section>
);
