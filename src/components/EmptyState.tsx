'use client';

import React, { useId } from 'react';

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title' | 'children'> {
  title: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon, action, className = '', ...props }: EmptyStateProps) {
  const titleId = useId();
  return <section {...props} aria-labelledby={titleId} className={`rounded-2xl border border-[var(--mairie-border)] bg-[var(--mairie-surface)] p-6 text-center text-[var(--mairie-text)] ${className}`}>
    {icon && <div aria-hidden="true" className="mb-3 flex justify-center text-[var(--mairie-muted)]">{icon}</div>}
    <h3 id={titleId} className="text-lg font-semibold">{title}</h3>
    {description && <div className="mt-2 text-sm text-[var(--mairie-muted)]">{description}</div>}
    {action && <div className="mt-4 flex flex-wrap justify-center gap-2">{action}</div>}
  </section>;
}
