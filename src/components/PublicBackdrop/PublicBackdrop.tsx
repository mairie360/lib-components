'use client';

import React from 'react';

import { componentMarker } from '../component-marker';
import { BACKDROP_HEIGHT, BACKDROP_WIDTH, ribbonPath, ribbons } from './ribbons';

export interface PublicBackdropProps extends Omit<React.SVGAttributes<SVGSVGElement>, 'children'> {
  /** Lets the ribbons wave (default true); the drawing stays still under prefers-reduced-motion anyway. */
  animated?: boolean;
}

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';
const spline = '0.45 0 0.55 1;0.45 0 0.55 1';

const reducedMotion = () => (typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia(reducedMotionQuery) : undefined);
const subscribeMotion = (notify: () => void) => {
  const query = reducedMotion();
  query?.addEventListener?.('change', notify);
  return () => query?.removeEventListener?.('change', notify);
};
const subscribeVisibility = (notify: () => void) => {
  if (typeof document === 'undefined') return () => {};
  document.addEventListener('visibilitychange', notify);
  return () => document.removeEventListener('visibilitychange', notify);
};
const never = () => false;

/**
 * Backdrop of the public pages (MAIR-1103, Figma Login « Rubans fluides »): four flat ribbons crossing
 * the page diagonally and waving slowly (one cycle of 10 to 20 s per ribbon, alternate directions).
 * Decorative: fixed behind the content, hidden from assistive technologies, never catches the pointer.
 * The waves pause while the tab is hidden and are not drawn at all under prefers-reduced-motion, nor
 * before hydration, so the server renders the still image.
 */
export function PublicBackdrop({ animated = true, className = '', style, ...props }: PublicBackdropProps) {
  const svgRef = React.useRef<SVGSVGElement>(null);
  // False on the server and during hydration, so the server renders the still image.
  const motionAllowed = React.useSyncExternalStore(subscribeMotion, () => !reducedMotion()?.matches, never);
  const motion = animated && motionAllowed;
  const hidden = React.useSyncExternalStore(subscribeVisibility, () => document.visibilityState === 'hidden', never);

  React.useEffect(() => {
    const svg = svgRef.current;
    if (!motion || !svg) return;
    // SMIL keeps its own clock: pausing it stops the redraws of a hidden tab.
    if (hidden) svg.pauseAnimations?.();
    else svg.unpauseAnimations?.();
  }, [hidden, motion]);

  return (
    <svg
      {...props}
      {...componentMarker('PublicBackdrop', props)}
      ref={svgRef}
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${BACKDROP_WIDTH} ${BACKDROP_HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
      data-animated={motion || undefined}
      data-paused={motion && hidden ? true : undefined}
      className={`mairie-public-backdrop pointer-events-none fixed inset-0 z-0 h-full w-full ${className}`.trim()}
      style={style}
    >
      {ribbons.map((ribbon) => {
        const shapes = [ribbonPath(ribbon, 1), ribbonPath(ribbon, -1)];
        const [from, to] = ribbon.reverse ? [shapes[1], shapes[0]] : shapes;
        return (
          <path key={`${ribbon.token}-${ribbon.start}`} d={from} data-ribbon={ribbon.token.slice('--mairie-'.length)} style={{ fill: `var(${ribbon.token})`, fillOpacity: ribbon.opacity }}>
            {motion && <animate attributeName="d" values={`${from};${to};${from}`} keyTimes="0;0.5;1" calcMode="spline" keySplines={spline} dur={`${ribbon.duration}s`} repeatCount="indefinite" />}
          </path>
        );
      })}
    </svg>
  );
}
