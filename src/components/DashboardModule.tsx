import React from 'react';

import { DashboardMetricCards } from './DashboardMetricCards';
import { DashboardPendingTasks } from './DashboardPendingTasks';
import { DashboardPerformancePanel } from './DashboardPerformancePanel';
import { DashboardQuickActions } from './DashboardQuickActions';
import { DashboardRecentProjects } from './DashboardRecentProjects';
import { DashboardUpcomingEvents } from './DashboardUpcomingEvents';
import {
  defaultDashboardEvents,
  defaultDashboardMetrics,
  defaultDashboardPerformance,
  defaultDashboardProjects,
  defaultDashboardQuickActions,
  defaultDashboardTasks,
} from './dashboard/defaultData';
import { joinDashboardClasses } from './dashboard/styles';
import type {
  DashboardEvent,
  DashboardMetric,
  DashboardPerformanceMetric,
  DashboardProject,
  DashboardQuickAction,
  DashboardQuickActionId,
  DashboardTask,
} from './dashboard/types';

export interface DashboardModuleProps extends React.HTMLAttributes<HTMLElement> {
  userFirstName?: string;
  metrics?: DashboardMetric[];
  projects?: DashboardProject[];
  tasks?: DashboardTask[];
  quickActions?: DashboardQuickAction[];
  events?: DashboardEvent[];
  performance?: DashboardPerformanceMetric[];
  showPerformance?: boolean;
  onProjectSelect?: (project: DashboardProject) => void;
  onViewAllProjects?: () => void;
  onTaskSelect?: (task: DashboardTask) => void;
  onViewAllTasks?: () => void;
  onQuickAction?: (action: DashboardQuickActionId) => void;
  onEventSelect?: (event: DashboardEvent) => void;
  onOpenCalendar?: () => void;
}

export const DashboardModule = ({
  userFirstName = 'Jean',
  metrics = defaultDashboardMetrics,
  projects = defaultDashboardProjects,
  tasks = defaultDashboardTasks,
  quickActions = defaultDashboardQuickActions,
  events = defaultDashboardEvents,
  performance = defaultDashboardPerformance,
  showPerformance = true,
  onProjectSelect,
  onViewAllProjects,
  onTaskSelect,
  onViewAllTasks,
  onQuickAction,
  onEventSelect,
  onOpenCalendar,
  className = '',
  ...props
}: DashboardModuleProps) => (
  <section className={joinDashboardClasses('space-y-6 bg-[#f5f3f0] text-[#172033]', className)} {...props}>
    <header>
      <h1 className="text-[28px] font-bold leading-tight text-[#172033]">Tableau de Bord</h1>
      <p className="mt-1 text-base text-[#687385]">Bienvenue {userFirstName}, voici un aperçu de vos activités</p>
    </header>
    <DashboardMetricCards metrics={metrics} />
    <div className="grid gap-6 xl:grid-cols-2">
      <DashboardRecentProjects projects={projects} onSelect={onProjectSelect} onViewAll={onViewAllProjects} />
      <DashboardPendingTasks tasks={tasks} onSelect={onTaskSelect} onViewAll={onViewAllTasks} />
      <DashboardQuickActions actions={quickActions} onAction={onQuickAction} />
      <DashboardUpcomingEvents events={events} onSelect={onEventSelect} onOpenCalendar={onOpenCalendar} />
    </div>
    {showPerformance && <DashboardPerformancePanel metrics={performance} />}
  </section>
);
