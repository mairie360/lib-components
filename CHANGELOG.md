# Changelog — @mairie360/lib-components

Versions published to GitHub Packages. The CI computes them from the conventional commits
(see « Version (MAIR-861) » in the README); this file says what each upgrade brings to a front.
Dependency updates (Renovate) are left out.

## 2.3.0 (minor, unreleased) — epic MAIR-1090 « Lib 2.3 : cadre blanc, nouveaux composants et sélecteurs de date »

Figma: [Nouveautés lib 2.3](https://www.figma.com/design/T7vetUfuzPEXk5TxjHRiO2/Mairie360-%E2%80%93-lib-components?node-id=589-6417) · [Jetons et mouvement](https://www.figma.com/design/T7vetUfuzPEXk5TxjHRiO2/Mairie360-%E2%80%93-lib-components?node-id=589-6188). Gathered on the epic branch from five pull requests.

**Foundations (lot 1)**
- White frame: sidebar, top bar and footer on the surface (`--mairie-shell-*`, `--mairie-shell-border`, `--mairie-navigation-*`), the Administration entry styled like the other destinations (MAIR-1091).
- Lighter action green `#8ad0c4` with `#2a303f` text; pastel dark palette.
- New tokens: `counter-background`, `on-counter`, `danger`, `danger-hover`, `on-danger`, `danger-surface`, `neutral-action`, `on-neutral`, `shell-border`, `navigation-active-indicator`, `illustration-background`, `on-module`, `shadow-pop`, `message-own-*` (MAIR-1152), `hero-*` (PageHero).
- Motion: `--mairie-motion-instant|fast|base|slow`, `--mairie-ease-standard|enter|exit|spring`, `--mairie-tooltip-delay: 0ms`, all at 0 under `prefers-reduced-motion`; `motion` / `motionVar` in `/theme`.
- Lora in the display preference: `font_family: 'lora'`, `fontFamilies`, `resolveFontFamily` (MAIR-1119). The front loads the font (`--font-lora`).
- `StatusPill` tones `purple` and `secondary-strong` (MAIR-1124); `icons` registry (camera, monitor-smartphone, Messagerie glyphs, MAIR-1108 / MAIR-1151) and `Icon spin`.
- `Counter`: round counter 0–9, « 9+ » above (MAIR-1094).

**Navigation and shell (lot 2)**
- Sidebar, DesktopNavigation and Header white, fluid opening 72 ↔ 248 px in 280 ms, active indicator bar, Administration aligned, Workflows kept out of `defaultSidebarItems`; navigation and bell counters use `Counter` (the bell shows « 9+ », no longer « 99+ ») (MAIR-1092).
- One icon animation per destination on hover (MAIR-1093).
- `AppShell`: `showFooter` (false by default: **the footer is hidden unless a front asks for it**), `layout="focus"` with the `bar` / `aside` / `content` / `footer` slots (MAIR-1139).
- `Header`: `showCommune`, `commune`, `showDate`, `date` (MAIR-1109).
- `PublicBackdrop` and `AccessibleShell backdrop="ribbons"` for the public pages (opt-in, MAIR-1103).

**Primitives (lot 3)**
- `DeleteGhostButton` and the red rule (solid = critical, outline = not critical, ghost = discreet); `ToolTip` immediate with an 80 ms fade (MAIR-1095).
- `IconChip` (MAIR-1108); `Panel` `icon`, radius 16 and `fill` (MAIR-1114); `ProgressMeter` module tones (MAIR-1115); `SettingToggle` icon and whole-row click (MAIR-1116); `MetricCard` `layout="inline"` (MAIR-1117) and `href` / `onClick` / `active` (MAIR-1140).
- `DataTable` sortable headers (`sortable`, `sortKey`, `sortDirection`, `onSortChange`, MAIR-1129) and the visible IconButton hover in a hovered row (MAIR-1112).
- `PageHeader variant="welcome"` (MAIR-1113); `OneTimeCodeField` error state (MAIR-1104; `Field` now points `aria-describedby` at the error only when there is one); `Tabs variant="pill"` (MAIR-1111); `FormActions` `dirty` / `sticky` (MAIR-1118); `AvatarGroup` (MAIR-1153).

**Feedback (lot 4)**
- `NotificationList` (panel / page / drawer, rows clickable only with `clickable: true` + `href`; `NotificationItem` gains optional `clickable` and `date`) (MAIR-1096).
- `StepProgress` and `Onboarding` (5 slides, logo intro) (MAIR-1097); `DataState` illustrated empty state and three-dot loading (MAIR-1098).
- `PageHero` + `PageHero.Stat` (MAIR-1105); `KanbanColumn` (MAIR-1130); `Modal` `footerStart` / `footerEnd` and `steps` / `currentStep` / `onStepChange` (MAIR-1131); `RadioGroup` card `leading` / `footer` (MAIR-1132).

**Dates (lot 5)**
- `Calendar`, `DatePicker` and `DateRangePicker`: choose a date without typing it (shortcuts, month / year views, disabled days, period presets, full keyboard); ISO `YYYY-MM-DD` values and date helpers in `/primitives`. `DateField` is deprecated in favour of `DatePicker` (MAIR-1099).

Fronts (MAIR-1101): bump to 2.3.0, replace the native date fields with `DatePicker`, plug `NotificationList` into the bell, pass `showFooter` where the footer must stay.

## 2.2.0 (minor) — 2026-11-20 — shared front plumbing

Modules that every front copied are now exported once; the fronts delete their copies.

- `/shared`: `readPageUrlState`, `pageStateUrl`, `urlChoice`, `urlText`, `urlPage`, `urlDate` (page state kept in the URL), `subscribePageReturn` (refresh when the tab comes back) and `parseFrontUrl`.
- `/react`: `usePageUrlState(schema, initialSearch?)`; the optional `initialSearch` renders the first frame with the server's search string.
- `proxyPublishedBffRequest` answers 415 when a body is sent in a media type the published operation does not declare (an empty body or an operation without a declared body is unchanged). Callers that post a body must send its `Content-Type`.

## 2.1.0 (minor) — 2026-11-17 — two-factor authentication and passkeys

Components of the Login and Settings two-factor screens (Figma lib `Mairie360 – lib-components`, MAIR-1074).

- `CopyField`: read-only monospace value with a copy button and « Copié » feedback; `SessionDetails` now uses it for the session identifier (MAIR-1069).
- `RecoveryCodes`: numbered two-column list of one-time codes with « Copier les codes » and « Télécharger (.txt) » (MAIR-1070).
- `PasskeyButton` (« Se connecter avec une passkey ») and `CreatePasskeyButton` (« Créer une passkey »), and the `passkeyIcon` glyph (pass it to `Icon`) (MAIR-1071).
- `QrCode`: inline-SVG QR code, always black on white (MAIR-1068). New dependency: `qrcode-generator` 2.0.4 (no dependency of its own).
- `OneTimeCodeField`: authenticator code (6 digits) or recovery code (`A1B2-C3D4`), cleaned on typing and pasting; `normalizeTotpCode` / `normalizeRecoveryCode` in `/shared` (MAIR-1067).
- `RadioGroup` `variant="card"` with `icon` and `badge` per option (MAIR-1073).
- `Divider`: line with an optional label such as « ou » (MAIR-1072).

## 2.0.1 (patch) — 2026-11-17 — MAIR-1066

- The veil of `Modal`, `ConfirmModal`, `Drawer`, `NotificationCenter` and the mobile menu uses the Figma
  `Base/Modal` Overlay slate (`--mairie-overlay-background: #383f51`) instead of black, still at 35 %.
- CHANGELOG: 2.0.0 is released (tag `v2.0.0`, 2026-11-12).

## 2.0.0 (major) — 2026-11-12 — epic MAIR-819 « V2 front lib »

Light-only theme, new logo and the components of the V2 fronts, gathered on `epic/MAIR-819-v2-front-lib`
from five pull requests:

- **Lot 1 (#509)**: readable notification counter (MAIR-832), active navigation item keeps its background
  (MAIR-886), no more front-specific rules in `municipal-theme.css` (MAIR-890), `StatusPill` « En revue »
  secondary and « Suspendu » (MAIR-898), `IconButton` presets and disabled sizes (MAIR-843, MAIR-862),
  `href` on `Button` (MAIR-842), `TextField type="time"` (MAIR-839), `checkNewPassword` and
  `NewPasswordField` (MAIR-837).
- **Lot 2 (#510)**: logout confirmation (MAIR-834), search as you type (MAIR-835), Figma modal widths and
  35 % veil (MAIR-857), `mainLayout="fill"` (MAIR-901), toast action and bottom-end placement
  (MAIR-903, MAIR-906).
- **Lot 3 (#511)**: `Rating`, `SettingToggle`, `ProfilePhotoField`, `DescriptionList`, `SessionDetails`,
  `describeUserAgent`, `Gantt` (MAIR-841, MAIR-941, MAIR-936, MAIR-930, MAIR-891).
- **Lot 4 (#512)**: `SessionList` compact layout, clickable rows, « Cet appareil », history and states
  (MAIR-845, MAIR-1000); `DataTable` interactive rows and cell kinds (MAIR-850, MAIR-869);
  `FilterSelect mode="menu"` (MAIR-849).
- **Lot 5**: new « mairie / 360 » logo (MAIR-831), light-only appearance with cookie v2 (MAIR-933),
  version rule and this changelog (MAIR-861).

### Breaking changes and migration notes for the fronts

- **MAIR-933 — always light.** `applyConfirmedAppearance` and `startAppearanceSync` always render
  `data-theme="light"` and `color-scheme: light`. The appearance cookie is now `v: 2` without `theme`;
  an old `v: 1` cookie is still read (its theme is ignored). `AppearanceTheme` and `Appearance.theme`
  are deprecated and will be removed at the next major version: remove the theme choice from Settings
  and stop sending `theme`. The dark tokens stay in `municipal-theme.css` for now.
- **MAIR-890** (lot 1): remove the root classes `.projects-shell`, `.messages-app-root`… that the theme no
  longer styles; the AppShell frame is self-sufficient.
- **MAIR-857 / MAIR-906** (lot 2): modals are wider (Figma sizes) and toasts now sit bottom right.

## 1.4.0 — 2026-11-04

- RGAA: page states captured and checked automatically with axe-core and Playwright (MAIR-318), RGAA
  scope and page states per front (MAIR-316); every exported component carries
  `data-m360-component` (component markers).
- Fix: accessibility defects raised by the CI (MAIR-473).
- CI: shared CICD v5.2.2 with the GDPR checks (MAIR-771).

## 1.3.0 — 2026-11-01

- New application frame (MAIR-765): collapsible teal navigation band, tinted top bar and footer, light
  and dark palettes derived from the logo.
- Unified theme, contrasts and accessible feedback (MAIR-547): navigation text tokens, contrast tests in
  both modes.
- `AppShell`: collapsible navigation and responsive frame (MAIR-548).

## 1.2.0 — 2026-11-01

- Colours aligned with the showcase website: neutrals, accent `#2d786c` and module identity colours.

## 1.1.0 — 2026-11-01

- GDPR: Playwright tests and legal pages for the fronts (MAIR-292); GDPR checklist on pull requests and
  deadline reminders (MAIR-295).

## 1.0.3 — 2026-10-21

Baseline consumed by the E-learning front before the V2.
