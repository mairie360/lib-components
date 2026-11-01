import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Light and Dark palettes (Figma « Foundations › Palettes — mode clair et mode sombre »): every
// text/background pair of the theme reaches AA (4.5:1), every control border, focus border and
// module identity colour reaches 3:1 (WCAG 1.4.11), in both modes. Dividers (--mairie-border)
// are decorative and not checked. Values are resolved from :root, then html[data-theme="dark"].
const css = readFileSync(resolve(process.cwd(), 'src/styles/municipal-theme.css'), 'utf8');
const block = (selector: string) => {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`missing ${selector} block`);
  return css.slice(start, css.indexOf('}', start));
};
const toHex = (name: string, value: string) => {
  const raw = value.trim().toLowerCase();
  if (/^#[\da-f]{6}$/.test(raw)) return raw;
  if (/^#[\da-f]{3}$/.test(raw)) return `#${[...raw.slice(1)].map(c => c + c).join('')}`;
  return raw.startsWith('var(--mairie-') ? raw : (() => { throw new Error(`--mairie-${name}: unsupported colour "${value.trim()}"`); })();
};
const declarations = (text: string) => Object.fromEntries([...text.matchAll(/--mairie-([\w-]+):\s*([^;]+);/g)]
  .filter(([, , value]) => /^\s*(#|var\(--mairie-)/.test(value) && !/,|\s\d/.test(value.trim()))
  .map(([, name, value]) => [name, toHex(name, value)]));
const light = declarations(block(':root'));
const dark = { ...light, ...declarations(block('html[data-theme="dark"]')) };
const resolveToken = (theme: Record<string, string>, name: string): string => {
  let value = theme[name];
  for (let depth = 0; value?.startsWith('var(') && depth < 5; depth += 1) value = theme[value.slice(12, -1)];
  if (!value || !value.startsWith('#')) throw new Error(`--mairie-${name} does not resolve to a colour`);
  return value;
};

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
};

const text: [string, string][] = [
  ['text', 'background'], ['text', 'surface'], ['text', 'surface-raised'],
  ['muted', 'background'], ['muted', 'surface'], ['muted', 'surface-raised'],
  ['accent', 'background'], ['accent', 'surface'], ['accent', 'accent-surface'], ['teal-text', 'accent-surface'],
  ['secondary', 'background'], ['secondary', 'surface'],
  ['on-action', 'action-background'], ['on-action', 'action-hover-background'],
  ['on-secondary', 'secondary-action-background'], ['on-secondary', 'secondary-action-hover-background'],
  ['success-text', 'success-surface'], ['warning-text', 'warning-surface'], ['error-text', 'error-surface'],
  ['info-text', 'info-surface'], ['purple-text', 'purple-surface'],
  ['navigation-text', 'navigation-background'], ['navigation-text', 'navigation-hover-background'],
];
const graphics: [string, string][] = [
  ['control-border', 'control-background'], ['control-border', 'surface'],
  ['navigation-control-border', 'navigation-background'], ['navigation-active-border', 'navigation-background'],
  ...['dashboard', 'projects', 'calendar', 'messaging', 'workflows', 'training'].map(module => [`module-${module}`, 'surface'] as [string, string]),
];

describe.each([['light', light], ['dark', dark]] as const)('%s palette', (_mode, theme) => {
  it.each(text)('text %s on %s reaches 4.5:1', (foreground, background) => {
    expect(contrast(resolveToken(theme, foreground), resolveToken(theme, background))).toBeGreaterThanOrEqual(4.5);
  });
  it.each(graphics)('%s on %s reaches 3:1', (foreground, background) => {
    expect(contrast(resolveToken(theme, foreground), resolveToken(theme, background))).toBeGreaterThanOrEqual(3);
  });
});
