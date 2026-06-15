import React from 'react';

import { Card } from './Card';
import type { StatsPanelProps } from './calendar/types';

export type { CalendarStat, StatsPanelProps } from './calendar/types';

export const StatsPanel = ({ stats, title = 'Statistiques', className = '', ...props }: StatsPanelProps) => (
  <Card title={title} className={className} {...props}>
    <dl className="space-y-4 px-6 pb-6 pt-7">
      {stats.map((stat, index) => (
        <div key={index} className="flex items-center justify-between gap-4 text-sm leading-5">
          <dt className="text-[#172033]">{stat.label}</dt>
          <dd className="text-right font-bold text-[#172033]">{stat.value}</dd>
        </div>
      ))}
    </dl>
  </Card>
);
