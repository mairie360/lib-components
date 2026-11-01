# Shared navigation — MAIR-548

Figma: [Navigation & Shell › AppShell](https://www.figma.com/design/T7vetUfuzPEXk5TxjHRiO2/Mairie360-%E2%80%93-lib-components?node-id=10-277) and [DesktopNavigation (Repos / Survol)](https://www.figma.com/design/T7vetUfuzPEXk5TxjHRiO2/Mairie360-%E2%80%93-lib-components?node-id=8-306).

`AccessibleShell` (and `AppShell` with `collapsibleSidebar`) lays the page out as the Figma AppShell: a navigation row (desktop navigation + header and module column) above one full-width footer. The module area (`main`) fills the free space without margin and is the only scrolling region.

On desktop (≥ 1024 px, theme `body.mairie-ui`), `DesktopNavigation` rests collapsed (about 71 px: logo and module icons). It expands to the width of its commands (about 207 px) while the pointer is over it or keyboard focus is inside it (`data-expanded`, `:has(:focus-visible)`: a click does not keep it open), pushing the module aside instead of covering it. The width transition is removed with `prefers-reduced-motion`. Commands are 42 px high, 16 px text, 20 px icons, as wide as their label; every command keeps its accessible name while collapsed. `sidebarProps.brandLabel` shows « Commune de » and the commune name next to the logo, wrapping long names.

There is no collapse button and no tooltip any more. `sidebarCookieDomain` and the `sidebar-preference` exports stay accepted for compatibility but no preference is written or read. `onCollapsedChange` reports `true` at rest and `false` while expanded.

Below 1024 px the mobile drawer keeps its behaviour (focus kept inside, Escape, focus returned to the menu button). While the drawer, a dialog or the notification centre is open, the desktop navigation, content and footer are inert.

Tests: `DesktopNavigationRuntime`, `AppShellRuntime`, `AppShellSkipNavigation` (behaviour) and `ShellLayoutCss` (expansion, reduced motion, footer and module rules of the theme).
