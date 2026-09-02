import React from 'react';

import { defaultDashboardMetrics } from './dashboard/defaultData';
import { joinDashboardClasses } from './dashboard/styles';
import type { DashboardMetric, DashboardTone } from './dashboard/types';

export interface DashboardMetricCardsProps extends React.HTMLAttributes<HTMLDivElement> {
  metrics?: DashboardMetric[];
}

const toneStyles: Record<DashboardTone, string> = {
  blue: 'text-[#0b5fff] bg-[#eaf2ff]',
  green: 'text-[#00a844] bg-[#e6f9ee]',
  purple: 'text-[#8b16ff] bg-[#f3e8ff]',
  orange: 'text-[#f4511e] bg-[#fff0e8]',
  red: 'text-[#dc2626] bg-[#fee2e2]',
};

export const DashboardMetricCards = ({
  metrics = defaultDashboardMetrics,
  className = '',
  ...props
}: DashboardMetricCardsProps) => (
  <div className={joinDashboardClasses('grid gap-4 sm:grid-cols-2 xl:grid-cols-4', className)} {...props}>
    {metrics.map((metric) => {
      const Icon = metric.icon;
      return (
        <article key={metric.id} className="rounded-lg border border-[#dfd9d1] bg-white px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <dl>
              <dt className="text-sm text-[#475569]">{metric.label}</dt>
              <dd className="mt-1 text-2xl font-bold text-[#111827]">{metric.value}</dd>
              {metric.trend && (
                <dd className={joinDashboardClasses(
                  'mt-1 text-xs font-medium',
                  metric.trendTone === 'negative' ? 'text-[#ef4444]' : metric.trendTone === 'neutral' ? 'text-[#64748b]' : 'text-[#00a844]'
                )}>{metric.trend}</dd>
              )}
            </dl>
            <div className={joinDashboardClasses('flex size-10 items-center justify-center rounded-md', toneStyles[metric.tone])}>
              <Icon className="size-7" strokeWidth={2} aria-hidden="true" />
            </div>
          </div>
        </article>
      );
    })}
  </div>
);
