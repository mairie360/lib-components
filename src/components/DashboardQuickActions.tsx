import React from 'react';

import { defaultDashboardQuickActions } from './dashboard/defaultData';
import { joinDashboardClasses } from './dashboard/styles';
import type { DashboardQuickAction, DashboardQuickActionId } from './dashboard/types';

export interface DashboardQuickActionsProps extends React.HTMLAttributes<HTMLElement> {
  actions?: DashboardQuickAction[];
  onAction?: (action: DashboardQuickActionId) => void;
}

export const DashboardQuickActions = ({
  actions = defaultDashboardQuickActions,
  onAction,
  className = '',
  ...props
}: DashboardQuickActionsProps) => (
  <section className={joinDashboardClasses('rounded-lg border border-[#dfd9d1] bg-white p-6', className)} {...props}>
    <h2 className="text-base font-semibold text-[#243041]">Actions rapides</h2>
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button key={action.id} type="button" disabled={action.disabled} className="flex min-h-20 flex-col items-center justify-center gap-3 rounded-md border border-[#d8d2ca] bg-[#fbfaf9] px-4 py-3 font-medium text-[#172033] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155bb5]/30 disabled:cursor-not-allowed disabled:opacity-45" onClick={() => onAction?.(action.id)}>
            <Icon className="size-5" strokeWidth={1.8} aria-hidden="true" />
            <span>{action.label}</span>
          </button>
        );
      })}
    </div>
  </section>
);
