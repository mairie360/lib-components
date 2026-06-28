import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

import { defaultAdministrationAuditEntries } from './administration/defaultData';
import type { AdministrationAuditEntry } from './administration/types';
import { joinClasses } from './calendar/style';

export interface AdministrationAuditPanelProps extends React.HTMLAttributes<HTMLElement> {
  entries?: AdministrationAuditEntry[];
}

const outcomeStyles: Record<AdministrationAuditEntry['outcome'], string> = {
  success: 'bg-[#dcfce7] text-[#00b44a]',
  danger: 'bg-[#fee2e2] text-[#ff1f2d]',
};

export const AdministrationAuditPanel = ({
  entries = defaultAdministrationAuditEntries,
  className = '',
  ...props
}: AdministrationAuditPanelProps) => (
  <section
    className={joinClasses(
      'rounded-lg border border-[#d8d2ca] bg-white px-6 py-6 text-[#172033]',
      className
    )}
    {...props}
  >
    <h2 className="text-base font-bold leading-6 text-[#172033]">Journal d'audit</h2>
    <p className="mt-1 text-base leading-6 text-[#667085]">
      Historique de toutes les actions sensibles effectuées dans le système
    </p>

    <div className="mt-7 space-y-4">
      {entries.map((entry) => {
        const Icon = entry.outcome === 'success' ? CheckCircle2 : XCircle;

        return (
          <article
            key={entry.id}
            className="flex gap-4 rounded-md border border-[#e3e0dc] bg-white px-4 py-4"
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
                <h3 className="text-sm font-bold leading-5 text-[#172033]">{entry.action}</h3>
                <span className="rounded-md border border-[#d8d2ca] bg-white px-2 py-0.5 text-xs font-semibold leading-none text-[#4c5258]">
                  {entry.actor}
                </span>
              </div>
              <p className="mt-1 text-sm leading-5 text-[#334155]">{entry.subject}</p>
              <p className="mt-3 text-xs leading-4 text-[#667085]">{entry.description}</p>
              <p className="mt-3 text-xs leading-4 text-[#94a3b8]">{entry.timestamp}</p>
            </div>
          </article>
        );
      })}
    </div>
  </section>
);
