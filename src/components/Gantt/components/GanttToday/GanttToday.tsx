'use client';

import React from 'react';

import { componentMarker } from '../../../component-marker';

export interface GanttTodayProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
}

/** The « aujourd'hui » marker (MAIR-891, Figma `Gantt/Today`): a vertical --mairie-error-text line with its caption. */
export function GanttToday({ label = 'Aujourd’hui', className = '', ...props }: GanttTodayProps) {
  return (
    <div {...props} {...componentMarker('GanttToday', props)} aria-hidden="true" className={`pointer-events-none flex h-full flex-col items-center ${className}`.trim()}>
      <span className="whitespace-nowrap font-medium text-[var(--mairie-error-text)]" style={{ fontSize: 'var(--mairie-text-xs)' }}>{label}</span>
      <span className="w-0.5 flex-1 bg-[var(--mairie-error-text)]" />
    </div>
  );
}
