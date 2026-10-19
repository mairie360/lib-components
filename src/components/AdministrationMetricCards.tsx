import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';

import type { AdministrationStat } from './administration/types';
import { joinClasses } from './calendar/style';

export interface AdministrationMetricCardsProps extends React.HTMLAttributes<HTMLDivElement> {
  stats?: AdministrationStat[];
}

const toneClasses = {
  blue: {
    iconWrap: 'bg-[var(--mairie-accent-surface)] text-[var(--mairie-accent)]',
    indicator: 'text-[var(--mairie-success-text)]',
  },
  green: {
    iconWrap: 'bg-[var(--mairie-success-surface)] text-[var(--mairie-success-text)]',
    indicator: 'text-[var(--mairie-success-text)]',
  },
  yellow: {
    iconWrap: 'bg-[var(--mairie-warning-surface)] text-[var(--mairie-warning-text)]',
    indicator: 'text-[var(--mairie-warning-text)]',
  },
  red: {
    iconWrap: 'bg-[var(--mairie-error-surface)] text-[var(--mairie-error-text)]',
    indicator: 'text-[var(--mairie-error-text)]',
  },
};

const renderIndicator = (indicator: React.ReactNode, className: string) => {
  if (indicator === 'up') {
    return <TrendingUp className={joinClasses('size-5', className)} strokeWidth={2} />;
  }

  if (indicator === 'down') {
    return <TrendingDown className={joinClasses('size-5', className)} strokeWidth={2} />;
  }

  return <span className={joinClasses('text-xs font-semibold leading-none', className)}>{indicator}</span>;
};

export const AdministrationMetricCards = ({
  stats,
  className = '',
  ...props
}: AdministrationMetricCardsProps) => (
  <div
    className={joinClasses('grid gap-4 sm:grid-cols-2 xl:grid-cols-4', className)}
    {...props}
  >
    {(stats ?? []).map((stat) => {
      const Icon = stat.icon;
      const tone = toneClasses[stat.tone];

      return (
        <article
          key={stat.id}
          className="min-h-[132px] rounded-lg border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-6 py-6 text-[var(--mairie-text)] shadow-none"
        >
          <div className="flex items-start justify-between gap-5">
            <div className={joinClasses('flex size-12 items-center justify-center rounded-md', tone.iconWrap)}>
              <Icon className="size-6" strokeWidth={2} />
            </div>
            {stat.indicator && (
              <div className="mt-4 flex h-5 min-w-5 items-center justify-end">
                {renderIndicator(stat.indicator, tone.indicator)}
              </div>
            )}
          </div>
          <div className="mt-5 text-2xl font-bold leading-none text-[var(--mairie-text)]">{stat.value}</div>
          <div className="mt-1 text-sm leading-5 text-[var(--mairie-text)]">{stat.label}</div>
        </article>
      );
    })}
    {(stats?.length ?? 0) === 0 && (
      <p className="rounded-lg border border-[var(--mairie-border)] bg-[var(--mairie-surface)] px-6 py-6 text-sm text-[var(--mairie-muted)]">
        {stats ? 'Aucun indicateur à afficher.' : 'Indicateurs indisponibles.'}
      </p>
    )}
  </div>
);
