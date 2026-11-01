import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// The active, hovered and Administration items of the sidebar write their label and icon in
// --mairie-navigation-active-text: it must reach AA text contrast (4.5:1) on every one of those
// backgrounds, in Light and Dark. The former --mairie-on-action (dark ink) gave 1.3:1 on navy.
const css = readFileSync(resolve(process.cwd(), 'src/styles/municipal-theme.css'), 'utf8');
const block = (selector: string) => css.slice(css.indexOf(`${selector} {`), css.indexOf('}', css.indexOf(`${selector} {`)));
const tokens = (text: string) => Object.fromEntries([...text.matchAll(/--mairie-([\w-]+):\s*(#[\da-f]{6});/gi)].map(([, name, hex]) => [name, hex.toLowerCase()]));
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
