# Shared navigation — MAIR-548

`AppShell` now exposes `collapsibleSidebar` (opt-in for compatibility) and `sidebarCookieDomain`. With the municipal theme and `body.mairie-ui`, desktop navigation retains accessible command names, hover/focus tooltips, Escape dismissal, badges and administration role filtering. Mobile navigation keeps its published behavior. Contentinfo stays outside aside and footer height bounds navigation scrolling.

The versioned `mairie360_sidebar` preference validates its parent domain and reads no authentication token. Dialogs make desktop commands inert. The server entry remains separate from client components. All eight frontends keep compatibility code for published UI 0.8.0 until an exact approved release is available; adoption uses the native AppShell properties and removes the local wrapper/menu.

Tests cover focus/Escape, preference, roles, destinations and landmarks. Release still requires the existing full-audit policy. A zero-production audit does not turn a failed full audit into a pass. No version or gate is bypassed.
