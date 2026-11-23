'use client';

import React from 'react';

import { componentMarker } from '../component-marker';
import { RIBBONS, drawRibbons, type RibbonPaint } from './ribbons';

export type PublicBackdropVariant = 'ribbons' | 'none';

export interface PublicBackdropProps extends Omit<React.CanvasHTMLAttributes<HTMLCanvasElement>, 'children'> {
  /** `ribbons` (default): four flat ribbons crossing the page; `none`: nothing is drawn. */
  variant?: PublicBackdropVariant;
  /** `false` draws the ribbons once, still (the reduced-motion rendering, for everyone). */
  animated?: boolean;
}

/** One frame every 16 ms at most: never more than 60 images per second, whatever the screen refreshes at. */
export const PUBLIC_BACKDROP_FRAME_MS = 1000 / 60;

function reducedMotion() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Colours of the ribbons, read from the theme tokens of the page (no colour is written in the component). */
function paints(element: HTMLElement): RibbonPaint[] {
  const own = getComputedStyle(element);
  const page = getComputedStyle(element.ownerDocument.documentElement);
  return RIBBONS.map((ribbon) => ({ ...ribbon, colour: (own.getPropertyValue(ribbon.token) || page.getPropertyValue(ribbon.token)).trim() }));
}

/**
 * Background of the public pages (MAIR-1103, Figma `Fond/Rubans` of the Login file): four wide flat ribbons
 * that cross the page diagonally behind the content and wave slowly. Decorative only: `aria-hidden`, no pointer
 * events, fixed under the page (render it first, the content after it with `position: relative`). The animation
 * stops while the tab is hidden and is replaced by a still image when the visitor asks for reduced motion.
 * The one decorative loop the charte allows, and only on the public pages (sign-in, recovery, session expired).
 */
export function PublicBackdrop({ variant = 'ribbons', animated = true, className = '', style, ...props }: PublicBackdropProps) {
  const canvas = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext('2d');
    if (!element || !context || variant === 'none') return;
    const still = !animated || reducedMotion();
    const colours = paints(element);
    const start = performance.now();
    let frame = 0;
    let last = -Infinity;
    let width = 0;
    let height = 0;

    const resize = () => {
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      width = window.innerWidth;
      height = window.innerHeight;
      element.width = Math.round(width * ratio);
      element.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const draw = (now: number) => drawRibbons(context, colours, width, height, still ? 0 : (now - start) / 1000);
    const tick = (now: number) => {
      frame = 0;
      if (now - last >= PUBLIC_BACKDROP_FRAME_MS - 1) {
        last = now;
        draw(now);
      }
      schedule();
    };
    const schedule = () => {
      if (!still && !frame && document.visibilityState !== 'hidden') frame = window.requestAnimationFrame(tick);
    };
    const stop = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    };
    const onVisibility = () => (document.visibilityState === 'hidden' ? stop() : schedule());
    const onResize = () => {
      resize();
      draw(performance.now());
    };

    resize();
    draw(start);
    schedule();
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [variant, animated]);

  if (variant === 'none') return null;
  return (
    <canvas
      {...props}
      {...componentMarker('PublicBackdrop', props)}
      ref={canvas}
      aria-hidden="true"
      data-variant={variant}
      className={`pointer-events-none fixed inset-0 block h-full w-full ${className}`.trim()}
      style={{ zIndex: 0, ...style }}
    />
  );
}
