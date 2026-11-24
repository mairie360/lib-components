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

  // MAIR-1092: 72 ↔ 248 px in 280 ms, labels fading in with a delay once the band is open.
  it('rests the desktop navigation at 72 px and opens it to 248 px in 280 ms on hover and keyboard focus', () => {
    expect(desktop).toMatch(/\.app-desktop-navigation \{[^}]*width: 72px;[^}]*transition: width 280ms var\(--mairie-ease-standard\);/);
    expect(desktop).toMatch(/\.app-desktop-navigation:is\(\[data-expanded="true"\], :has\(:focus-visible\)\) \{ width: 248px; \}/);
    expect(desktop).toMatch(/\.app-desktop-navigation :is\(\.app-navigation-label, \.app-navigation-commune\) \{[^}]*opacity: 0;/);
    expect(desktop).toMatch(/:has\(:focus-visible\)\) :is\(\.app-navigation-label, \.app-navigation-commune\) \{ opacity: 1; transform: none; transition-delay: 90ms; \}/);
  });

  it('MAIR-1092 marks the active entry with a 3 px indicator bar and keeps the counter on the icon when the band rests', () => {
    expect(desktop).toMatch(/nav button\[aria-current="page"\]::before \{[^}]*width: 3px;[^}]*background: var\(--mairie-navigation-active-indicator\);/);
    expect(desktop).toMatch(/:not\(\[data-expanded="true"\]\):not\(:has\(:focus-visible\)\) \.app-navigation-badge \{ position: absolute;/);
  });

  it('pushes the module aside instead of covering it', () => {
    const rule = desktop.match(/body\.mairie-ui \.app-desktop-navigation \{([^}]*)\}/)![1];
    expect(rule).toContain('position: relative');
    expect(rule).not.toMatch(/position: (fixed|absolute)/);
    expect(css).not.toMatch(/\.app-shell-frame \{ padding-left/);
  });

  it('removes the expansion animation for reduced motion', () => {
    expect(desktop).toMatch(/@media \(prefers-reduced-motion: reduce\) \{ body\.mairie-ui \.app-desktop-navigation \{ transition: none; \} \.app-desktop-navigation :is\(\.app-navigation-label, \.app-navigation-commune, \.app-navigation-logo\) \{ transition: none; \} \}/);
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
    // MAIR-1092: the Header sits on the white frame with the shell border.
    expect(source('components/Header/Header.tsx')).toMatch(/<header className="[^"]*border-b-\[var\(--mairie-shell-border\)\] bg-\[var\(--mairie-shell-background\)\]/);
    const footer = source('components/Footer/Footer.tsx');
    expect(footer).toContain('border-t border-[var(--mairie-shell-bar-border)] bg-[var(--mairie-shell-bar-background)]');
    expect(footer).not.toContain('hover:text-[var(--mairie-accent)]');
  });

  it('draws the navigation band with a border on its right and no shadow', () => {
    expect(desktop).toMatch(/border-right: 1px solid var\(--mairie-shell-border\); box-shadow: none;/);
    expect(source('components/Sidebar/Sidebar.tsx')).toContain('border-r border-[var(--mairie-shell-border)] bg-[var(--mairie-shell-background)]');
    expect(css).toMatch(/--mairie-navigation-shadow: none;/);
  });
});

describe('MAIR-886 / MAIR-890 shared stylesheet scope', () => {
  // MAIR-886: the active, hovered and Administration items keep their background and border:
  // their rules are as specific as the base `nav button` rule that resets them to transparent.
  it.each([
    'nav button:hover',
    'nav button[aria-current="page"]',
    'nav button[aria-current="page"]::before',
  ])('scopes .app-desktop-navigation %s under body.mairie-ui', selector => {
    expect(desktop).toContain(`body.mairie-ui .app-desktop-navigation ${selector} {`);
    expect(desktop).not.toMatch(new RegExp(`\\n\\s+\\.app-desktop-navigation ${selector.replace(/[[\]().*+?^$|]/g, '\\$&')} \\{`));
  });

  // MAIR-890: the AppShell frame is self-sufficient; no rule targets a front's root class or the
  // internal structure of the frame.
  it('targets no class owned by a front', () => {
    expect(css).not.toMatch(/projects-shell|calendar-scroll-shell|calendar-board|calendar-title-bar|messages-app-root|messages-module|elearning-|settings-shell|settings-file-picker|dashboard-app-shell|dashboard-panel-action|dashboard-recent-projects|administration-shell|administration-panel|administration-console|login-page/);
    expect(css).not.toContain('> .flex > .flex >');
  });
});

describe('MAIR-901 full-height module', () => {
  it('gives the fill main area the charte padding, no scroll and the whole height to its content', () => {
    expect(css).toMatch(/\.app-shell-main-area\[data-layout="fill"\] \{ display: flex; flex-direction: column; min-height: 0; overflow: hidden; padding: 20px 24px; \}/);
    expect(css).toMatch(/\.app-shell-main-area\[data-layout="fill"\] > :is\(\.app-main-content, :only-child\) \{ display: flex; flex: 1; flex-direction: column; min-height: 0; \}/);
  });
});

// MAIR-1066: the veil colour of Modal, ConfirmModal, Drawer, NotificationCenter and the mobile menu is the
// Figma `Base/Modal` Overlay slate (#383f51), not black; the 35 % opacity stays on the components.
describe('MAIR-1066 overlay colour', () => {
  it('uses the Figma slate for --mairie-overlay-background', () => {
    expect(css).toMatch(/--mairie-overlay-background: #383f51;/);
    expect(css).not.toMatch(/--mairie-overlay-background: #000/);
  });
});

// MAIR-1093: one icon animation per destination, 400 ms with the spring easing, none under reduced motion.
describe('MAIR-1093 navigation icon animations', () => {
  const block = css.slice(css.indexOf('/* MAIR-1093'), css.indexOf('/* MAIR-1139'));
  it.each([
    ['dashboard', 'mairie-nav-tiles'], ['projects', 'mairie-nav-rummage'], ['calendar', 'mairie-nav-page-turn'], ['messages', 'mairie-nav-talk'],
    ['training', 'mairie-nav-toss'], ['admin', 'mairie-nav-straighten'], ['settings', 'mairie-nav-spin'],
  ])('animates the %s icon with %s', (destination, keyframes) => {
    expect(block).toContain(`@keyframes ${keyframes} {`);
    expect(block).toMatch(new RegExp(`\\[data-nav-anim="${destination}"\\]:is\\(:hover, :focus-visible\\) \\.mairie-nav-icon[^{]*\\{[^}]*${keyframes}`));
  });

  it('runs in 400 ms with the spring easing, only when motion is allowed', () => {
    const allowed = block.slice(block.indexOf('@media (prefers-reduced-motion: no-preference)'));
    expect(allowed).toContain('animation-duration: var(--mairie-motion-slow); animation-timing-function: var(--mairie-ease-spring);');
    expect(css).toMatch(/--mairie-motion-slow: 400ms;/);
    expect(block).toMatch(/@media \(prefers-reduced-motion: reduce\) \{ \[data-nav-anim\] \.mairie-nav-icon, \[data-nav-anim\] \.mairie-nav-icon rect \{ animation: none !important; \} \}/);
    expect(block.slice(0, block.indexOf('@media'))).not.toMatch(/animation:/);
  });
});

describe('MAIR-1139 focus layout', () => {
  const block = css.slice(css.indexOf('/* MAIR-1139'), css.indexOf('/* MAIR-1103'));
  it('lays out the bar (64 px), the 300 px table of contents, the content (28/40) and the sticky actions', () => {
    expect(block).toMatch(/\.app-focus-shell-with-aside \{ grid-template-columns: 300px minmax\(0, 1fr\);/);
    expect(block).toMatch(/\.app-focus-bar \{[^}]*height: 64px;[^}]*background: var\(--mairie-surface\); border-bottom: 1px solid var\(--mairie-border\);/);
    expect(block).toMatch(/\.app-focus-aside \{[^}]*background: var\(--mairie-surface\); border-right: 1px solid var\(--mairie-border\);/);
    expect(block).toMatch(/\.app-focus-aside-nav \{[^}]*overflow-y: auto;/);
    expect(block).toMatch(/\.app-focus-content \{[^}]*padding: 28px 40px; background: var\(--mairie-background\);/);
    expect(block).toMatch(/\.app-focus-footer \{[^}]*position: sticky; bottom: 0;[^}]*background: var\(--mairie-surface\); border-top: 1px solid var\(--mairie-border\);/);
  });

  it('folds the table of contents behind « Sommaire » below 900 px', () => {
    const narrow = block.slice(block.indexOf('@media (max-width: 899px)'));
    expect(narrow).toContain('.app-focus-aside-toggle {');
    expect(narrow).toContain('.app-focus-shell:not([data-aside-open="true"]) .app-focus-aside-nav { display: none; }');
    expect(block).toMatch(/^\.app-focus-aside-toggle \{ display: none; \}/m);
  });
});

describe('MAIR-1103 public backdrop', () => {
  it('lets the ribbons show through the frame and the main area only', () => {
    expect(css).toContain('.app-shell-root[data-backdrop="ribbons"] :is(.app-shell-veil, .app-shell-main-area) { background: transparent; }');
    expect(css).toContain('.app-shell-root[data-backdrop="ribbons"] > .mairie-public-backdrop { z-index: -1; }');
  });
});
