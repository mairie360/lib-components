import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// The active, hovered and Administration items of the sidebar write their label and icon in
// --mairie-navigation-active-text: it must reach AA text contrast (4.5:1) on every one of those
// backgrounds, in Light and Dark. The former --mairie-on-action (dark ink) gave 1.3:1 on navy.
const css = readFileSync(resolve(process.cwd(), 'src/styles/municipal-theme.css'), 'utf8');
const block = (selector: string) => css.slice(css.indexOf(`${selector} {`), css.indexOf('}', css.indexOf(`${selector} {`)));
// Every --mairie-navigation-* declaration is read, whatever its format: #rgb is expanded, and any
// other value throws, so a dark override can never fall back silently to the light value.
const toHex = (name: string, value: string) => {
  const raw = value.trim().toLowerCase();
  if (/^#[\da-f]{6}$/.test(raw)) return raw;
  if (/^#[\da-f]{3}$/.test(raw)) return `#${[...raw.slice(1)].map(c => c + c).join('')}`;
  throw new Error(`--mairie-${name}: unsupported colour "${value.trim()}" (use #rgb or #rrggbb)`);
};
const tokens = (text: string) => Object.fromEntries([...text.matchAll(/--mairie-(navigation-[\w-]+):\s*([^;]+);/g)].filter(([, name]) => !/shadow/.test(name)).map(([, name, value]) => [name, toHex(name, value)]));
const light = tokens(block(':root'));
const dark = { ...light, ...tokens(block('html[data-theme="dark"]')) };

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
};

const backgrounds = ['navigation-active-background', 'navigation-hover-background', 'navigation-admin-background', 'navigation-admin-hover-background', 'navigation-admin-active-background'];

describe.each([['light', light], ['dark', dark]] as const)('%s theme', (_theme, theme) => {
  it.each(backgrounds)('navigation-active-text reaches 4.5:1 on %s', background => {
    expect(theme['navigation-active-text']).toBeDefined();
    expect(theme[background]).toBeDefined();
    expect(contrast(theme['navigation-active-text'], theme[background])).toBeGreaterThanOrEqual(4.5);
  });
});

// DesktopNavigation (AccessibleShell on desktop) is styled by the stylesheet, not by Sidebar classes:
// its active, Administration and badge rules must use the same readable token, and no navigation
// rule may write in --mairie-on-action (dark ink, made for text on the teal action colour).
it('styles the desktop navigation with the readable navigation text tokens', () => {
  const rule = (selector: string) => {
    const start = css.indexOf(`${selector} {`);
    expect(start).toBeGreaterThan(-1);
    return css.slice(start, css.indexOf('}', start));
  };
  expect(rule('.app-desktop-navigation nav button[aria-current="page"]')).toContain('color: var(--mairie-navigation-active-text)');
  expect(rule('.app-desktop-navigation nav button[data-admin="true"]')).toContain('color: var(--mairie-navigation-active-text)');
  expect(rule('.app-navigation-badge')).toContain('color: var(--mairie-navigation-active-text)');
  expect(rule('.app-navigation-tooltip')).toContain('color: var(--mairie-navigation-text)');
  const navigationRules = [...css.matchAll(/[^{}]*\.app-(?:desktop-)?navigation[^{}]*\{[^}]*\}/g)].map(([text]) => text);
  expect(navigationRules.length).toBeGreaterThan(0);
  expect(navigationRules.filter(text => text.includes('--mairie-on-action'))).toEqual([]);
});
