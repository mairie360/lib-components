import React from 'react';

const dot: Record<'s' | 'm' | 'l', number> = { s: 6, m: 8, l: 10 };

/** MAIR-1098: three accent dots rising 3 px in turn (1.2 s, 150 ms apart); still under prefers-reduced-motion. Decorative. */
export function LoadingDots({ size }: { size: 's' | 'm' | 'l' }) {
  return (
    <span aria-hidden="true" data-loading-dots className="inline-flex items-end" style={{ gap: dot[size] * 0.75, paddingTop: 3 }}>
      {[0, 1, 2].map(index => <span key={index} className="mairie-loading-dot" style={{ width: dot[size], height: dot[size] }} />)}
    </span>
  );
}
