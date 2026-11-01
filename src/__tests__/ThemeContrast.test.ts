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
];
const graphics: [string, string][] = [
  ['control-border', 'control-background'], ['control-border', 'surface'],
  ['navigation-control-border', 'navigation-background'], ['navigation-active-border', 'navigation-background'],
  ...['dashboard', 'projects', 'calendar', 'messaging', 'workflows', 'training'].map(module => [`module-${module}`, 'surface'] as [string, string]),
];

describe.each(themes)('%s palette', (_mode, theme) => {
  it.each(text)('text %s on %s reaches 4.5:1', (foreground, background) => {
    expect(tokenContrast(theme, foreground, background)).toBeGreaterThanOrEqual(4.5);
  });
  it.each(graphics)('%s on %s reaches 3:1', (foreground, background) => {
    expect(tokenContrast(theme, foreground, background)).toBeGreaterThanOrEqual(3);
  });
});
