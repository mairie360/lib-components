import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Reads the --mairie-* colours of municipal-theme.css (Light in :root, Dark in
// html[data-theme="dark"]) and returns the colour a token renders with. Translucent shell tokens
// (MAIR-765) are composited over the layer they are drawn on, so contrasts are measured on what the
// user actually sees.
export type Theme = Record<string, string>;
type Rgba = [number, number, number, number];

const css = readFileSync(resolve(process.cwd(), 'src/styles/municipal-theme.css'), 'utf8');
const block = (selector: string) => {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`missing ${selector} block`);
  return css.slice(start, css.indexOf('}', start));
};
const colourValue = /^(#[\da-f]{3}|#[\da-f]{6}|rgb\(\s*\d+\s+\d+\s+\d+\s*(\/\s*[\d.]+%?\s*)?\)|var\(--mairie-[\w-]+\))$/i;
const declarations = (text: string): Theme => Object.fromEntries([...text.matchAll(/--mairie-([\w-]+):\s*([^;]+);/g)]
  .map(([, name, value]) => [name, value.trim().toLowerCase()] as const)
  .filter(([, value]) => colourValue.test(value)));

export const light: Theme = declarations(block(':root'));
export const dark: Theme = { ...light, ...declarations(block('html[data-theme="dark"]')) };
export const themes = [['light', light], ['dark', dark]] as const;

const parse = (name: string, value: string): Rgba => {
  if (value.startsWith('#')) {
    const hex = value.length === 4 ? [...value.slice(1)].map(c => c + c).join('') : value.slice(1);
    return [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16)).concat(1) as Rgba;
  }
  const match = /^rgb\(\s*(\d+)\s+(\d+)\s+(\d+)\s*(?:\/\s*([\d.]+)(%?)\s*)?\)$/.exec(value);
  if (!match) throw new Error(`--mairie-${name}: unsupported colour "${value}"`);
  const alpha = match[4] === undefined ? 1 : Number(match[4]) / (match[5] ? 100 : 1);
  return [Number(match[1]), Number(match[2]), Number(match[3]), alpha];
};

const declared = (theme: Theme, name: string): Rgba => {
  let value = theme[name];
  for (let depth = 0; value?.startsWith('var(') && depth < 5; depth += 1) value = theme[value.slice(12, -1)];
  if (!value || value.startsWith('var(')) throw new Error(`--mairie-${name} does not resolve to a colour`);
  return parse(name, value);
};

// The layer each translucent token is painted on: the veil sits on the page background, the band
// and the bars on the veil, the hover / active items and band controls on the band.
const underlay = (name: string) => {
  if (name === 'shell-background') return 'background';
  if (/^(navigation-(background|border)|shell-bar-(background|border))$/.test(name)) return 'shell-background';
  if (/^navigation-/.test(name)) return 'navigation-background';
  return 'background';
};

/** Opaque colour (#rrggbb) the token renders with in its shell layer. */
export const rendered = (theme: Theme, name: string): string => {
  const [r, g, b, a] = declared(theme, name);
  const base = a >= 1 ? [r, g, b] : (() => {
    const under = rendered(theme, underlay(name)).slice(1);
    return [0, 2, 4].map((i, k) => parseInt(under.slice(i, i + 2), 16) * (1 - a) + [r, g, b][k] * a);
  })();
  return `#${base.map(c => Math.round(c).toString(16).padStart(2, '0')).join('')}`;
};

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a: string, b: string) => {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
};
/** Contrast between two tokens as rendered in the theme. */
export const tokenContrast = (theme: Theme, foreground: string, background: string) => contrast(rendered(theme, foreground), rendered(theme, background));
