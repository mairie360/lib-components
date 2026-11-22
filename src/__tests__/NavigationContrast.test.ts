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

  // MAIR-1092: the 3 px indicator bar of the active destination is a non-text cue (WCAG 1.4.11).
  it.each(['navigation-background', 'shell-background', 'navigation-active-background'])('keeps the active indicator at 3:1 on %s', background => {
    expect(tokenContrast(theme, 'navigation-active-indicator', background)).toBeGreaterThanOrEqual(3);
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
  expect(rule('.app-desktop-navigation nav button[aria-current="page"]::before')).toContain('background: var(--mairie-navigation-active-indicator)');
  // MAIR-1092: Administration is styled like the other destinations, no rule of its own.
  expect(css).not.toContain('[data-admin="true"]');
  expect(rule('.app-navigation-badge')).toContain('color: var(--mairie-on-counter)');
  const navigationRules = [...css.matchAll(/[^{}]*\.app-(?:desktop-)?navigation(?!-initial)[^{}]*\{[^}]*\}/g)].map(([text]) => text);
  expect(navigationRules.length).toBeGreaterThan(0);
  expect(navigationRules.filter(text => text.includes('--mairie-on-action'))).toEqual([]);
});

it('MAIR-547 keeps --mairie-on-action out of the Sidebar and Footer navigation items', () => {
  const sidebar = readFileSync(resolve(process.cwd(), 'src/components/Sidebar/Sidebar.tsx'), 'utf8');
  const footer = readFileSync(resolve(process.cwd(), 'src/components/Footer/Footer.tsx'), 'utf8');
  expect(sidebar).toContain('text-[var(--mairie-navigation-active-text)]');
  expect(sidebar).toContain('bg-[var(--mairie-navigation-active-indicator)]');
  expect(sidebar).not.toContain('--mairie-navigation-admin');
  // The only remaining use is the brand initial, drawn on the teal action background.
  expect(sidebar.match(/--mairie-on-action/g) ?? []).toHaveLength(1);
  expect(footer).not.toContain('--mairie-on-action');
});

// MAIR-1091: the frame is white (Figma « Jetons et mouvement », lib 2.3): sidebar, top bar and footer on
// the surface, the Administration entry styled like the other destinations.
it.each([
  ['light', 'shell-background', '#ffffff'], ['light', 'navigation-background', '#ffffff'], ['light', 'shell-bar-background', '#ffffff'],
  ['light', 'navigation-hover-background', '#f1f6f5'], ['light', 'navigation-active-background', '#e3f3f0'],
  ['dark', 'shell-background', '#161920'], ['dark', 'navigation-background', '#161920'], ['dark', 'shell-bar-background', '#161920'],
  ['dark', 'navigation-hover-background', '#1f232d'], ['dark', 'navigation-active-background', '#233a37'],
] as const)('MAIR-1091 %s %s renders %s', (mode, token, expected) => {
  const theme = themes.find(([name]) => name === mode)![1];
  expect(rendered(theme, token)).toBe(expected);
});

it.each(['background', 'hover-background', 'active-background', 'text'])('MAIR-1091 aligns navigation-admin-%s on the other destinations', suffix => {
  for (const [, theme] of themes) expect(rendered(theme, `navigation-admin-${suffix}`)).toBe(rendered(theme, `navigation-${suffix}`));
});
