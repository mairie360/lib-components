import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';

import { defaultAdministrationStats } from './administration/defaultData';
import type { AdministrationStat } from './administration/types';
import { joinClasses } from './calendar/style';

export interface AdministrationMetricCardsProps extends React.HTMLAttributes<HTMLDivElement> {
  stats?: AdministrationStat[];
}

const toneClasses = {
  blue: {
    iconWrap: 'bg-[#dbeafe] text-[#0b5fff]',
    indicator: 'text-[#16a34a]',
  },
  green: {
    iconWrap: 'bg-[#d1fae5] text-[#00b44a]',
    indicator: 'text-[#16a34a]',
  },
  yellow: {
    iconWrap: 'bg-[#fff4b8] text-[#f59e0b]',
    indicator: 'text-[#f59e0b]',
  },
  red: {
    iconWrap: 'bg-[#ffd8dc] text-[#ff1f2d]',
    indicator: 'text-[#ff1f2d]',
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
  stats = defaultAdministrationStats,
  className = '',
  ...props
}: AdministrationMetricCardsProps) => (
  <div
    className={joinClasses('grid gap-4 sm:grid-cols-2 xl:grid-cols-4', className)}
    {...props}
  >
    {stats.map((stat) => {
      const Icon = stat.icon;
      const tone = toneClasses[stat.tone];

      return (
        <article
          key={stat.id}
          className="min-h-[132px] rounded-lg border border-[#e3e0dc] bg-white px-6 py-6 text-[#172033] shadow-none"
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
          <div className="mt-5 text-2xl font-bold leading-none text-[#0b1220]">{stat.value}</div>
          <div className="mt-1 text-sm leading-5 text-[#334155]">{stat.label}</div>
        </article>
      );
    })}
  </div>
);
