# Shared theme and semantic shell fixes — 14 October 2026

MAIR-473 / MAIR-547. Canonical opt-in theme: src/styles/municipal-theme.css. The same theme is used by all eight frontend consumers on published UI 0.8.0 through a temporary compatibility shell.

AppShell supplies a keyboard skip link and a focusable unique main. Sidebar Footer is a div; content Footer retains its contentinfo landmark. Dashboard subtitles use #475569. The theme aligns Geist, surfaces, sidebar, controls, focus, and reduced motion.

Validation: 35 Jest suites / 363 tests, types, lint (zero errors), build including DTS/CSS and server-entry check passed. Native consumer QA at 1487 × 1058 and 320 × 900, including a 1487 × 540 keyboard/sidebar check. See MAIR-544 and consumer docs/qa/design-qa.md.

Release remains blocked: full npm audit reports 5 high / 22 moderate, including GHSA-vfj7-8cjw-p6xm in braces through development dependencies; production audit reports zero. No audit downgrade, exception, gate change or package release. Screen-reader and deployed RGAA acceptance remain pending. This is a visual result, not a global accessibility certification.

final result: passed
