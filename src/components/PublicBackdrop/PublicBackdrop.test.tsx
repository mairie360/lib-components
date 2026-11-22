import { act, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';

import { PublicBackdrop } from './PublicBackdrop';
import { ribbonPath, ribbons } from './ribbons';

type Listener = () => void;
function mockReducedMotion(reduce: boolean) {
  const listeners: Listener[] = [];
  const query = { matches: reduce, addEventListener: (_: string, listener: Listener) => listeners.push(listener), removeEventListener: jest.fn() };
  Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: jest.fn(() => query) });
  return { query, listeners };
}

function setVisibility(state: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => state });
  act(() => { document.dispatchEvent(new Event('visibilitychange')); });
}

afterEach(() => {
  delete (window as Partial<Window>).matchMedia;
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
});

describe('PublicBackdrop (MAIR-1103)', () => {
  it('is decorative: hidden from assistive technologies, fixed and never catching the pointer', async () => {
    mockReducedMotion(false);
    const { container } = render(<PublicBackdrop />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
    expect(svg).toHaveClass('pointer-events-none', 'fixed', 'inset-0');
    expect(svg).toHaveAttribute('data-m360-component', 'PublicBackdrop');
    expect((await axe(container)).violations).toEqual([]);
  });

  it('draws four flat ribbons on the theme tokens, at the agreed opacities', () => {
    mockReducedMotion(false);
    const { container } = render(<PublicBackdrop />);
    const paths = [...container.querySelectorAll('path')];
    expect(paths).toHaveLength(4);
    expect(paths.map((path) => [path.style.fill, Number(path.style.fillOpacity)])).toEqual([
      ['var(--mairie-action-background)', 0.17],
      ['var(--mairie-secondary)', 0.07],
      ['var(--mairie-action-background)', 0.24],
      ['var(--mairie-accent)', 0.17],
    ]);
    expect(container.querySelector('linearGradient, radialGradient')).toBeNull();
  });

  it('waves each ribbon in 10 to 20 s, in alternate directions', () => {
    mockReducedMotion(false);
    const { container } = render(<PublicBackdrop />);
    const animations = [...container.querySelectorAll('animate')];
    expect(animations).toHaveLength(4);
    for (const animation of animations) {
      const seconds = parseFloat(animation.getAttribute('dur')!);
      expect(seconds).toBeGreaterThanOrEqual(10);
      expect(seconds).toBeLessThanOrEqual(20);
      expect(animation).toHaveAttribute('repeatCount', 'indefinite');
    }
    expect(new Set(ribbons.map((ribbon) => ribbon.reverse))).toEqual(new Set([true, false]));
    const [first] = animations;
    const [from, to] = first.getAttribute('values')!.split(';');
    expect(from).not.toBe(to);
  });

  it('stays still under prefers-reduced-motion and when animation is turned off', () => {
    mockReducedMotion(true);
    const { container, rerender } = render(<PublicBackdrop />);
    expect(container.querySelector('animate')).toBeNull();
    expect(container.querySelector('svg')).not.toHaveAttribute('data-animated');
    mockReducedMotion(false);
    rerender(<PublicBackdrop animated={false} />);
    expect(container.querySelector('animate')).toBeNull();
  });

  it('stops waving when the user turns reduced motion on', () => {
    const { query, listeners } = mockReducedMotion(false);
    const { container } = render(<PublicBackdrop />);
    expect(container.querySelector('animate')).not.toBeNull();
    query.matches = true;
    act(() => listeners.forEach((listener) => listener()));
    expect(container.querySelector('animate')).toBeNull();
  });

  it('pauses while the tab is hidden', () => {
    mockReducedMotion(false);
    const pause = jest.fn();
    const resume = jest.fn();
    Object.assign(SVGSVGElement.prototype, { pauseAnimations: pause, unpauseAnimations: resume });
    const { container } = render(<PublicBackdrop />);
    const svg = container.querySelector('svg')!;
    setVisibility('hidden');
    expect(svg).toHaveAttribute('data-paused', 'true');
    expect(pause).toHaveBeenCalled();
    setVisibility('visible');
    expect(svg).not.toHaveAttribute('data-paused');
    expect(resume).toHaveBeenCalled();
    Reflect.deleteProperty(SVGSVGElement.prototype, 'pauseAnimations');
    Reflect.deleteProperty(SVGSVGElement.prototype, 'unpauseAnimations');
  });

  it('keeps the same path commands in both shapes of a wave, so they interpolate', () => {
    const ribbon = ribbons[0];
    const commands = (path: string) => path.replace(/-?[\d.]+/g, '').replace(/\s+/g, ' ').trim();
    expect(commands(ribbonPath(ribbon, 1))).toBe(commands(ribbonPath(ribbon, -1)));
    expect(ribbonPath(ribbon, 1)).toMatch(/^M .* Z$/);
  });
});
