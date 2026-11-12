import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// MAIR-548: the hover/focus expansion and the single footer are CSS behaviour jsdom cannot lay out,
// so the shared theme is checked for the rules the Figma AppShell relies on.
const css = readFileSync(join(__dirname, '../styles/municipal-theme.css'), 'utf8');
const desktop = css.slice(css.indexOf('/* MAIR-548: shared shell'), css.indexOf('/* MAIR-526'));

describe('MAIR-548 shared shell stylesheet', () => {
  // CodeRabbit on #500: a click focuses a command; only keyboard focus (:focus-visible) may keep the band open.
  it('never expands on pointer focus (:focus-within)', () => {
    expect(desktop).not.toContain(':focus-within');
  });

  it('rests the desktop navigation at 71 px and expands it on hover and keyboard focus', () => {
    expect(desktop).toMatch(/\.app-desktop-navigation \{[^}]*width: 71px;/);
    expect(desktop).toMatch(/\.app-desktop-navigation:is\(\[data-expanded="true"\], :has\(:focus-visible\)\) \{ width: max-content;/);
    expect(desktop).toMatch(/:not\(\[data-expanded="true"\]\):not\(:has\(:focus-visible\)\) :is\(\.app-navigation-label, \.app-navigation-commune\)/);
  });

  it('pushes the module aside instead of covering it', () => {
    const rule = desktop.match(/body\.mairie-ui \.app-desktop-navigation \{([^}]*)\}/)![1];
    expect(rule).toContain('position: relative');
    expect(rule).not.toMatch(/position: (fixed|absolute)/);
    expect(css).not.toMatch(/\.app-shell-frame \{ padding-left/);
  });

  it('removes the expansion animation for reduced motion', () => {
    expect(desktop).toMatch(/@media \(prefers-reduced-motion: reduce\) \{ body\.mairie-ui \.app-desktop-navigation \{ transition: none; \} \}/);
  });

  it('keeps one compact full-width footer and a module area without margin', () => {
    expect(css).not.toMatch(/\.app-accessible-footer \{[^}]*width: 270px/);
    expect(css).not.toMatch(/position: fixed; left: 0; bottom: 0/);
    expect(desktop).toMatch(/\.app-accessible-footer \{[^}]*padding: 8px 24px 8px 20px;[^}]*font-size: 12px;/);
    expect(desktop).toContain('.app-shell-main { padding: 0; }');
  });

  it('sizes navigation commands as the Figma item: 42 px high, 16 px text', () => {
    expect(desktop).toMatch(/\.app-desktop-navigation nav button \{[^}]*height: 42px;[^}]*font-size: 16px;/);
  });
});

describe('MAIR-765 teal application frame', () => {
  const source = (path: string) => readFileSync(join(__dirname, '..', path), 'utf8');

  it('paints the teal veil over the page background on the frame and the mobile drawer', () => {
    expect(css).toMatch(/\.app-shell-veil, \.app-shell-drawer \{ background: linear-gradient\(var\(--mairie-shell-background\), var\(--mairie-shell-background\)\), var\(--mairie-background\); \}/);
    const shell = source('components/AppShell/AppShell.tsx');
    expect(shell).toContain("'app-shell-veil h-screen");
    expect(shell).toContain('className="app-shell-drawer relative');
  });

  it('tints the top bar and the footer with a border towards the module', () => {
    expect(source('components/Header/Header.tsx')).toMatch(/<header className="[^"]*border-b-\[var\(--mairie-shell-bar-border\)\] bg-\[var\(--mairie-shell-bar-background\)\]/);
    const footer = source('components/Footer/Footer.tsx');
    expect(footer).toContain('border-t border-[var(--mairie-shell-bar-border)] bg-[var(--mairie-shell-bar-background)]');
    expect(footer).not.toContain('hover:text-[var(--mairie-accent)]');
  });

  it('draws the navigation band with a border on its right and no shadow', () => {
    expect(desktop).toMatch(/border-right: 1px solid var\(--mairie-navigation-border\); box-shadow: none;/);
    expect(source('components/Sidebar/Sidebar.tsx')).toContain('border-r border-[var(--mairie-navigation-border)] bg-[var(--mairie-navigation-background)]');
    expect(css).toMatch(/--mairie-navigation-shadow: none;/);
  });
});

describe('MAIR-901 full-height module', () => {
  it('gives the fill main area the charte padding, no scroll and the whole height to its content', () => {
    expect(css).toMatch(/\.app-shell-main-area\[data-layout="fill"\] \{ display: flex; flex-direction: column; min-height: 0; overflow: hidden; padding: 20px 24px; \}/);
    expect(css).toMatch(/\.app-shell-main-area\[data-layout="fill"\] > :is\(\.app-main-content, :only-child\) \{ display: flex; flex: 1; flex-direction: column; min-height: 0; \}/);
  });
});
