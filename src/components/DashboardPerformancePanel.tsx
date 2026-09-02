import React from 'react';

import { defaultDashboardPerformance } from './dashboard/defaultData';
import { joinDashboardClasses } from './dashboard/styles';
import type { DashboardPerformanceMetric } from './dashboard/types';

export interface DashboardPerformancePanelProps extends React.HTMLAttributes<HTMLElement> {
  metrics?: DashboardPerformanceMetric[];
}

const toneStyles = {
  green: 'bg-[#dcfce7] text-[#00a844]',
  blue: 'bg-[#dbeafe] text-[#0b5fff]',
  orange: 'bg-[#ffedd5] text-[#f4511e]',
};

export const DashboardPerformancePanel = ({
  metrics = defaultDashboardPerformance,
  className = '',
  ...props
}: DashboardPerformancePanelProps) => (
  <section className={joinDashboardClasses('rounded-lg border border-[#dfd9d1] bg-white p-6', className)} {...props}>
    <h2 className="text-base font-semibold text-[#243041]">Aperçu des performances</h2>
    <div className="mt-7 grid gap-7 sm:grid-cols-3">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <article key={metric.id} className="text-center">
            <div className={joinDashboardClasses('mx-auto flex size-16 items-center justify-center rounded-full', toneStyles[metric.tone])}>
              <Icon className="size-8" strokeWidth={2} aria-hidden="true" />
            </div>
            <h3 className="mt-3 font-semibold text-[#172033]">{metric.label}</h3>
            <div className={joinDashboardClasses('mt-1 text-xl font-bold', metric.tone === 'green' ? 'text-[#00a844]' : metric.tone === 'blue' ? 'text-[#0b5fff]' : 'text-[#f4511e]')}>{metric.value}</div>
            <p className="mt-1 text-sm text-[#687385]">{metric.description}</p>
          </article>
        );
      })}
    </div>
  </section>
);
