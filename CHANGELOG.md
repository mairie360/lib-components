# Changelog — @mairie360/lib-components

Versions published to GitHub Packages. The CI computes them from the conventional commits
(see « Version (MAIR-861) » in the README); this file says what each upgrade brings to a front.
Dependency updates (Renovate) are left out.

## 2.2.0 (minor, unreleased) — shared front plumbing

Modules that every front copied are now exported once; the fronts delete their copies.

- `/shared`: `readPageUrlState`, `pageStateUrl`, `urlChoice`, `urlText`, `urlPage`, `urlDate` (page state kept in the URL), `subscribePageReturn` (refresh when the tab comes back) and `parseFrontUrl`.
- `/react`: `usePageUrlState(schema, initialSearch?)`; the optional `initialSearch` renders the first frame with the server's search string.
- `proxyPublishedBffRequest` answers 415 when a body is sent in a media type the published operation does not declare (an empty body or an operation without a declared body is unchanged). Callers that post a body must send its `Content-Type`.

## 2.1.0 (minor, unreleased) — two-factor authentication and passkeys

Components of the Login and Settings two-factor screens (Figma lib `Mairie360 – lib-components`, MAIR-1074).

- `CopyField`: read-only monospace value with a copy button and « Copié » feedback; `SessionDetails` now uses it for the session identifier (MAIR-1069).
- `RecoveryCodes`: numbered two-column list of one-time codes with « Copier les codes » and « Télécharger (.txt) » (MAIR-1070).
- `PasskeyButton` (« Se connecter avec une passkey ») and `CreatePasskeyButton` (« Créer une passkey »), and the `passkeyIcon` glyph (pass it to `Icon`) (MAIR-1071).
- `QrCode`: inline-SVG QR code, always black on white (MAIR-1068). New dependency: `qrcode-generator` 2.0.4 (no dependency of its own).
- `OneTimeCodeField`: authenticator code (6 digits) or recovery code (`A1B2-C3D4`), cleaned on typing and pasting; `normalizeTotpCode` / `normalizeRecoveryCode` in `/shared` (MAIR-1067).
- `RadioGroup` `variant="card"` with `icon` and `badge` per option (MAIR-1073).
- `Divider`: line with an optional label such as « ou » (MAIR-1072).

## 2.0.1 (patch, unreleased) — MAIR-1066

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
