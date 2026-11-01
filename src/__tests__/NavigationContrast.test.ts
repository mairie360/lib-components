import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { rendered, themes, tokenContrast } from '../test-utils/themeColours';

// MAIR-547: the active and hovered navigation items write their label and icon in
// --mairie-navigation-active-text, the Administration entry and counters in
// --mairie-navigation-admin-text. Both must reach AA text contrast (4.5:1) on their backgrounds,
// in Light and Dark, measured on the colours the translucent teal band renders (MAIR-765).
const css = readFileSync(resolve(process.cwd(), 'src/styles/municipal-theme.css'), 'utf8');
const pairs: Array<[string, string]> = [
  ['navigation-text', 'navigation-background'],
  ['navigation-active-text', 'navigation-active-background'],
  ['navigation-active-text', 'navigation-hover-background'],
  ['navigation-admin-text', 'navigation-admin-background'],
  ['navigation-admin-text', 'navigation-admin-hover-background'],
  ['navigation-admin-text', 'navigation-admin-active-background'],
];

describe.each(themes)('MAIR-547 %s navigation', (_theme, theme) => {
  it.each(pairs)('%s reaches 4.5:1 on %s', (text, background) => {
    expect(tokenContrast(theme, text, background)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(['navigation-background', 'navigation-active-background'])('keeps the active border at 3:1 on %s', background => {
    expect(tokenContrast(theme, 'navigation-active-border', background)).toBeGreaterThanOrEqual(3);
  });
});

// DesktopNavigation is styled by the stylesheet, not by Sidebar classes: its active, hover,
// Administration and badge rules use the readable tokens, and no navigation rule writes in
// --mairie-on-action (dark ink, made for text on the teal action colour).
it('MAIR-547 styles the desktop navigation with the readable navigation text tokens', () => {
  const rule = (selector: string) => {
    const start = css.indexOf(`${selector} {`);
    expect(start).toBeGreaterThan(-1);
    return css.slice(start, css.indexOf('}', start));
  };
  expect(rule('.app-desktop-navigation nav button:hover')).toContain('color: var(--mairie-navigation-active-text)');
  expect(rule('.app-desktop-navigation nav button[aria-current="page"]')).toContain('color: var(--mairie-navigation-active-text)');
  expect(rule('.app-desktop-navigation nav button[data-admin="true"]')).toContain('color: var(--mairie-navigation-admin-text)');
  expect(rule('.app-navigation-badge')).toContain('color: var(--mairie-navigation-admin-text)');
  const navigationRules = [...css.matchAll(/[^{}]*\.app-(?:desktop-)?navigation(?!-initial)[^{}]*\{[^}]*\}/g)].map(([text]) => text);
  expect(navigationRules.length).toBeGreaterThan(0);
  expect(navigationRules.filter(text => text.includes('--mairie-on-action'))).toEqual([]);
});

it('MAIR-547 keeps --mairie-on-action out of the Sidebar and Footer navigation items', () => {
  const sidebar = readFileSync(resolve(process.cwd(), 'src/components/Sidebar/Sidebar.tsx'), 'utf8');
  const footer = readFileSync(resolve(process.cwd(), 'src/components/Footer/Footer.tsx'), 'utf8');
  expect(sidebar).toContain('text-[var(--mairie-navigation-active-text)]');
  expect(sidebar).toContain('text-[var(--mairie-navigation-admin-text)]');
  // The only remaining use is the brand initial, drawn on the teal action background.
  expect(sidebar.match(/--mairie-on-action/g) ?? []).toHaveLength(1);
  expect(footer).not.toContain('--mairie-on-action');
});

// MAIR-765: the translucent teal layers render the Figma « Proposition C » colours.
it.each([
  ['light', 'shell-background', '#e4f1ee'], ['light', 'navigation-background', '#d5eae7'], ['light', 'shell-bar-background', '#cde7e3'],
  ['light', 'navigation-hover-background', '#bde1da'], ['light', 'navigation-active-background', '#addad2'],
  ['dark', 'shell-background', '#171e22'], ['dark', 'navigation-background', '#1f2d2f'], ['dark', 'shell-bar-background', '#253839'],
  ['dark', 'navigation-hover-background', '#2f4a49'], ['dark', 'navigation-active-background', '#3a5f5c'],
] as const)('MAIR-765 %s %s renders %s', (mode, token, expected) => {
  const theme = themes.find(([name]) => name === mode)![1];
  const [r, g, b] = [1, 3, 5].map(i => parseInt(rendered(theme, token).slice(i, i + 2), 16));
  const [er, eg, eb] = [1, 3, 5].map(i => parseInt(expected.slice(i, i + 2), 16));
  // One unit of rounding tolerance per channel against the Figma swatches.
  expect([Math.abs(r - er), Math.abs(g - eg), Math.abs(b - eb)].every(d => d <= 1)).toBe(true);
});
