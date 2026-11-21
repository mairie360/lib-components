import { themes, tokenContrast } from '../test-utils/themeColours';

// Light and Dark palettes (Figma « Foundations › Palettes — mode clair et mode sombre »): every
// text/background pair of the theme reaches AA (4.5:1), every control border, focus border and
// module identity colour reaches 3:1 (WCAG 1.4.11), in both modes. Dividers (--mairie-border)
// are decorative and not checked. Values are resolved from :root, then html[data-theme="dark"];
// translucent shell tokens are composited over their layer (MAIR-765).
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
  ['text', 'shell-bar-background'], ['muted', 'shell-bar-background'],
  // MAIR-1091: tokens of lib 2.3.
  ['on-counter', 'counter-background'], ['on-danger', 'danger'], ['on-danger', 'danger-hover'],
  ['error-text', 'danger-surface'], ['on-neutral', 'neutral-action'],
  ['navigation-active-text', 'navigation-active-background'], ['navigation-text', 'shell-background'],
  ['text', 'illustration-background'], ['muted', 'illustration-background'],
  // MAIR-1152: own message bubbles.
  ['message-own-on', 'message-own-background'],
];
const graphics: [string, string][] = [
  ['control-border', 'control-background'], ['control-border', 'surface'],
  ['navigation-control-border', 'navigation-background'], ['navigation-active-border', 'navigation-background'],
  ['navigation-active-indicator', 'navigation-active-background'], ['danger', 'surface'], ['counter-background', 'surface'],
  ...['dashboard', 'projects', 'calendar', 'messaging', 'workflows', 'training'].map(module => [`module-${module}`, 'surface'] as [string, string]),
  // MAIR-1108: icon of a module IconChip. MAIR-1115: module fill of a ProgressMeter on its track.
  ...['dashboard', 'projects', 'calendar', 'messaging', 'workflows', 'training'].map(module => ['on-module', `module-${module}`] as [string, string]),
  ...['dashboard', 'projects', 'calendar', 'messaging', 'training'].map(module => [`module-${module}`, 'surface-raised'] as [string, string]),
];

describe.each(themes)('%s palette', (_mode, theme) => {
  it.each(text)('text %s on %s reaches 4.5:1', (foreground, background) => {
    expect(tokenContrast(theme, foreground, background)).toBeGreaterThanOrEqual(4.5);
  });
  it.each(graphics)('%s on %s reaches 3:1', (foreground, background) => {
    expect(tokenContrast(theme, foreground, background)).toBeGreaterThanOrEqual(3);
  });
});
