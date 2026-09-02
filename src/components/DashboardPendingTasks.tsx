import React from 'react';

import { defaultDashboardTasks } from './dashboard/defaultData';
import { joinDashboardClasses } from './dashboard/styles';
import type { DashboardTask, DashboardTaskPriority } from './dashboard/types';

export interface DashboardPendingTasksProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onSelect'> {
  tasks?: DashboardTask[];
  onSelect?: (task: DashboardTask) => void;
  onViewAll?: () => void;
}

const priorityLabels: Record<DashboardTaskPriority, string> = { high: 'Haute', medium: 'Moyenne', low: 'Basse' };
const priorityStyles: Record<DashboardTaskPriority, string> = {
  high: 'bg-[#fee2e2] text-[#dc2626]',
  medium: 'bg-[#ffedd5] text-[#c2410c]',
  low: 'bg-[#dcfce7] text-[#15803d]',
};

export const DashboardPendingTasks = ({
  tasks = defaultDashboardTasks,
  onSelect,
  onViewAll,
  className = '',
  ...props
}: DashboardPendingTasksProps) => (
  <section className={joinDashboardClasses('rounded-lg border border-[#dfd9d1] bg-white p-6', className)} {...props}>
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-base font-semibold text-[#243041]">Tâches en attente</h2>
      <button type="button" className="rounded-md border border-[#d8d2ca] bg-[#fbfaf9] px-3 py-2 text-sm font-medium text-[#243041]" onClick={onViewAll}>Voir toutes</button>
    </div>
    <div className="mt-6 space-y-3">
      {tasks.map((task) => (
        <button key={task.id} type="button" className="flex w-full items-center gap-3 rounded-md border border-[#e5e0da] bg-[#fbfaf9] px-3 py-3 text-left transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155bb5]/30" onClick={() => onSelect?.(task)}>
          <span className="size-2 shrink-0 rounded-full bg-[#f97316]" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold text-[#243041]">{task.title}</span>
            <span className="block text-sm text-[#687385]">Échéance: {task.dueLabel}</span>
          </span>
          <span className={joinDashboardClasses('rounded-md px-2.5 py-1 text-xs font-medium', priorityStyles[task.priority])}>{priorityLabels[task.priority]}</span>
        </button>
      ))}
      {tasks.length === 0 && <p className="py-8 text-center text-sm text-[#687385]">Aucune tâche en attente.</p>}
    </div>
  </section>
);
