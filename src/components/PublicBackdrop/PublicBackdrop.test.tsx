import React from 'react';
import { act, render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { PUBLIC_BACKDROP_FRAME_MS, PublicBackdrop } from './PublicBackdrop';
import { RIBBONS, drawRibbons, ribbonEdge } from './ribbons';

type Context = {
  clearRect: jest.Mock;
  setTransform: jest.Mock;
  beginPath: jest.Mock;
  lineTo: jest.Mock;
  closePath: jest.Mock;
  fill: jest.Mock;
  globalAlpha: number;
  fillStyle: string;
  fills: Array<{ fillStyle: string; globalAlpha: number }>;
};

function fakeContext(): Context {
  const context = { clearRect: jest.fn(), setTransform: jest.fn(), beginPath: jest.fn(), lineTo: jest.fn(), closePath: jest.fn(), globalAlpha: 1, fillStyle: '', fills: [] } as unknown as Context;
  context.fill = jest.fn(() => context.fills.push({ fillStyle: context.fillStyle, globalAlpha: context.globalAlpha }));
  return context;
}

let context: Context;
let frames: Map<number, FrameRequestCallback>;
let nextFrame: number;
let reduce: boolean;
let visibility: DocumentVisibilityState;

beforeEach(() => {
  context = fakeContext();
  frames = new Map();
  nextFrame = 1;
  reduce = false;
  visibility = 'visible';
  jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => context as unknown as CanvasRenderingContext2D);
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    const id = nextFrame++;
    frames.set(id, callback);
    return id;
  });
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => void frames.delete(id));
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({ matches: query.includes('reduce') && reduce, media: query, addEventListener: jest.fn(), removeEventListener: jest.fn() }));
  jest.spyOn(document, 'visibilityState', 'get').mockImplementation(() => visibility);
  document.documentElement.style.setProperty('--mairie-action-background', 'rgb(112, 193, 179)');
  document.documentElement.style.setProperty('--mairie-secondary', 'rgb(60, 79, 118)');
  document.documentElement.style.setProperty('--mairie-accent', 'rgb(45, 120, 108)');
});

afterEach(() => jest.restoreAllMocks());

function runFrame(at: number) {
  const pending = [...frames.entries()];
  frames.clear();
  act(() => pending.forEach(([, callback]) => callback(at)));
}

// MAIR-1103: Figma `Fond/Rubans` of the Login file, the background of the public pages.
describe('MAIR-1103 PublicBackdrop', () => {
  it('is a decorative canvas fixed behind the page: hidden from assistive technology, no pointer events', async () => {
    const { container } = render(<main><PublicBackdrop /><h1>Connexion</h1></main>);
    const canvas = container.querySelector('canvas')!;
    expect(canvas).toHaveAttribute('aria-hidden', 'true');
    expect(canvas).toHaveAttribute('data-variant', 'ribbons');
    expect(canvas).toHaveAttribute('data-m360-component', 'PublicBackdrop');
    expect(canvas.className).toContain('pointer-events-none');
    expect(canvas.className).toContain('fixed');
    expect((await axe(container)).violations).toEqual([]);
  });

  it('paints the four ribbons flat with the theme tokens and their opacities, no colour of its own', () => {
    render(<PublicBackdrop />);
    expect(context.fills).toEqual([
      { fillStyle: 'rgb(112, 193, 179)', globalAlpha: 0.17 },
      { fillStyle: 'rgb(60, 79, 118)', globalAlpha: 0.07 },
      { fillStyle: 'rgb(112, 193, 179)', globalAlpha: 0.24 },
      { fillStyle: 'rgb(45, 120, 108)', globalAlpha: 0.17 },
    ]);
    expect(context.globalAlpha).toBe(1);
  });

  it('waves while visible, at 60 images per second at most', () => {
    render(<PublicBackdrop />);
    const drawn = () => context.clearRect.mock.calls.length;
    const first = drawn();
    expect(frames.size).toBe(1);
    runFrame(performance.now() + 1000);
    expect(drawn()).toBe(first + 1);
    runFrame(performance.now() + 1000 + PUBLIC_BACKDROP_FRAME_MS / 4);
    expect(drawn()).toBe(first + 1);
    expect(frames.size).toBe(1);
  });

  it('stops while the tab is hidden and starts again when it comes back', () => {
    render(<PublicBackdrop />);
    expect(frames.size).toBe(1);
    visibility = 'hidden';
    act(() => void document.dispatchEvent(new Event('visibilitychange')));
    expect(frames.size).toBe(0);
    visibility = 'visible';
    act(() => void document.dispatchEvent(new Event('visibilitychange')));
    expect(frames.size).toBe(1);
  });

  it('draws one still image with prefers-reduced-motion, redrawn on resize only', () => {
    reduce = true;
    render(<PublicBackdrop />);
    expect(context.fills).toHaveLength(4);
    expect(frames.size).toBe(0);
    act(() => void window.dispatchEvent(new Event('resize')));
    expect(context.fills).toHaveLength(8);
    expect(frames.size).toBe(0);
  });

  it('animated={false} is the still image for everyone', () => {
    render(<PublicBackdrop animated={false} />);
    expect(context.fills).toHaveLength(4);
    expect(frames.size).toBe(0);
  });

  it('variant="none" renders nothing', () => {
    const { container } = render(<PublicBackdrop variant="none" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('cancels its frame when unmounted', () => {
    const { unmount } = render(<PublicBackdrop />);
    expect(frames.size).toBe(1);
    unmount();
    expect(frames.size).toBe(0);
  });

  it('keeps drawing nothing when the browser has no 2D canvas', () => {
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => null);
    const { container } = render(<PublicBackdrop />);
    expect(container.querySelector('canvas')).not.toBeNull();
    expect(frames.size).toBe(0);
  });
});

describe('MAIR-1103 ribbons', () => {
  it('cross the page diagonally, each with its own thickness, in 10 to 20 s per wave and alternating directions', () => {
    expect(RIBBONS).toHaveLength(4);
    RIBBONS.forEach((ribbon) => {
      expect(ribbon.to).toBeLessThan(ribbon.from);
      expect(1 / Math.abs(ribbon.speed)).toBeGreaterThanOrEqual(10);
      expect(1 / Math.abs(ribbon.speed)).toBeLessThanOrEqual(20);
    });
    expect(RIBBONS.map((ribbon) => Math.sign(ribbon.speed))).toEqual([1, -1, 1, -1]);
  });

  it('keeps the upper edge above the lower one', () => {
    for (const ribbon of RIBBONS) {
      for (const x of [0, 400, 800]) expect(ribbonEdge(ribbon, x, 3, -1, 800, 600)).toBeLessThan(ribbonEdge(ribbon, x, 3, 1, 800, 600));
    }
  });

  it('skips a ribbon whose token is not defined on the page', () => {
    const paint = fakeContext();
    drawRibbons(paint as unknown as CanvasRenderingContext2D, [{ ...RIBBONS[0], colour: '' }, { ...RIBBONS[1], colour: 'rgb(1, 2, 3)' }], 100, 100, 0);
    expect(paint.fills).toEqual([{ fillStyle: 'rgb(1, 2, 3)', globalAlpha: 0.07 }]);
  });
});
