import React from 'react';

export interface SkeletonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'role'> {
  /** Omit for a decorative placeholder; supply localized loading text to announce it. */
  label?: string;
  animated?: boolean;
}

export function Skeleton({ label, animated = true, className = '', ...props }: SkeletonProps) {
  const visual = <div {...props} aria-hidden="true" className={`h-4 w-full rounded-xl bg-[var(--mairie-surface-raised)] ${animated ? 'motion-safe:animate-pulse' : ''} ${className}`} />;
  return label ? <div role="status" aria-live="polite"><span className="sr-only">{label}</span>{visual}</div> : visual;
}
