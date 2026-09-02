import React from 'react';

import { defaultDashboardProjects } from './dashboard/defaultData';
import { clampDashboardProgress, joinDashboardClasses } from './dashboard/styles';
import type { DashboardProject, DashboardProjectStatus } from './dashboard/types';

export interface DashboardRecentProjectsProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onSelect'> {
  projects?: DashboardProject[];
  onSelect?: (project: DashboardProject) => void;
  onViewAll?: () => void;
}

const statusLabels: Record<DashboardProjectStatus, string> = {
  'in-progress': 'En cours',
  completed: 'Terminé',
  paused: 'En pause',
};

const statusStyles: Record<DashboardProjectStatus, string> = {
  'in-progress': 'bg-[#155bb5] text-white',
  completed: 'bg-[#00a844] text-white',
  paused: 'bg-[#fef3c7] text-[#92400e]',
};

export const DashboardRecentProjects = ({
  projects = defaultDashboardProjects,
  onSelect,
  onViewAll,
  className = '',
  ...props
}: DashboardRecentProjectsProps) => (
  <section className={joinDashboardClasses('rounded-lg border border-[#dfd9d1] bg-white p-6', className)} {...props}>
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-base font-semibold text-[#243041]">Projets récents</h2>
      <button type="button" className="rounded-md border border-[#c8d9d8] bg-[#e6f3f2] px-3 py-2 text-sm font-medium text-[#285c59]" onClick={onViewAll}>Voir tous</button>
    </div>
    <div className="mt-6 space-y-4">
      {projects.map((project) => {
        const progress = clampDashboardProgress(project.progress);
        return (
          <button key={project.id} type="button" className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155bb5]/30" onClick={() => onSelect?.(project)}>
            <span className="flex items-center justify-between gap-4">
              <span className="font-semibold text-[#172033]">{project.name}</span>
              <span className={joinDashboardClasses('rounded-md px-2.5 py-1 text-xs font-semibold', statusStyles[project.status])}>{statusLabels[project.status]}</span>
            </span>
            <span className="mt-2 flex items-center justify-between gap-4 text-sm text-[#687385]">
              <span>Progression: {progress}%</span>
              <span>Échéance: {project.dueDate}</span>
            </span>
            <span className="mt-2 block h-2 overflow-hidden rounded-full bg-[#d8e2ef]" aria-label={`Progression ${progress}%`} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <span className="block h-full rounded-full bg-[#155bb5]" style={{ width: `${progress}%` }} />
            </span>
          </button>
        );
      })}
      {projects.length === 0 && <p className="py-8 text-center text-sm text-[#687385]">Aucun projet récent.</p>}
    </div>
  </section>
);
