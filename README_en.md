# `@mairie360/lib-components`

`@mairie360/lib-components` is the shared React component library for Mairie360 applications. It provides reusable UI primitives, navigation elements, and complete feature modules for calendars, messaging, e-learning, administration, projects, and user profiles.

The library is built with React 19, TypeScript, Tailwind CSS 4, and DaisyUI. Storybook is used to develop and document components in isolation.

## How the library works

The source code lives in `src/components`. Each top-level component is exposed through `src/index.tsx` and can be imported from the package root.

When `npm run build` is executed:

1. `scripts/generate-exports.js` scans `src/components` and regenerates `src/index.tsx`.
2. `tsup` bundles the TypeScript source as ESM and CommonJS, generates declarations, and writes the output to `dist`.
3. PostCSS compiles `src/app/globals.css`, including Tailwind CSS and DaisyUI, to `dist/styles.css`.
4. Only the `dist` directory is included in the published package.

The package is configured for the GitHub Packages registry under the `@mairie360` scope.

## Requirements

- Node.js 20.x
- npm
- React 19
- React DOM 19

## Installation

Configure npm to resolve the `@mairie360` scope from GitHub Packages. Add this line to your project or user `.npmrc` file:

```ini
@mairie360:registry=https://npm.pkg.github.com
```

If authentication is required, also provide a GitHub token with package read access:

```ini
//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
```

Then install the library:

```bash
npm install @mairie360/lib-components
```

## Usage

Import the compiled stylesheet once from the root of the consuming application:

```tsx
import '@mairie360/lib-components/dist/styles.css';
```

Components can then be imported from the package root:

```tsx
'use client';

import { useState } from 'react';
import { Alert, Button } from '@mairie360/lib-components';

export function Example() {
  const [showAlert, setShowAlert] = useState(false);

  return (
    <div className="space-y-4">
      <Button
        label="Save changes"
        primary
        onClick={() => setShowAlert(true)}
      />

      {showAlert && (
        <Alert
          type="success"
          title="Saved"
          message="Your changes have been saved."
          closable
          onClose={() => setShowAlert(false)}
        />
      )}
    </div>
  );
}
```

Interactive components use React hooks and browser APIs. In a Next.js App Router project, render them from a Client Component, as shown above.

`AppShell` places application copyright in the desktop sidebar and mobile
navigation drawer by default, preserving the content area's full available
height. `footerProps` still supplies real product information and actionable
links; no release version is invented. Use `footerPlacement="content"` only
when a horizontal footer is intentional. The standalone `Footer` component
keeps its horizontal default; `variant="sidebar"` selects its compact dark
presentation. `Sidebar` also accepts a `footer` React node outside its scrollable
navigation. Login authentication screens do not use `AppShell`.

## Foundations — MAIR-608

- **Charte** in `src/styles/municipal-theme.css`: primary teal `#70c1b3` (actions, accent, focus; dark text `--mairie-on-action` on it), secondary navy `#3c4f76` (links, secondary actions, info), neutral dark ink `#383f51` (text, navigation), neutral light mist `#c8bfc7` (borders, muted surfaces), each declined in Light and Dark; functional tones success / warning / danger keep their green / amber / red surfaces. New tokens: `--mairie-secondary*`, `--mairie-info-*`, `--mairie-logo-backing`.
- **One size scale** `xs | s | m | l | xl`: controls 24/32/40/48/56, icons 12/16/20/24/32, text 12/14/16/18/20, avatars 20/24/32/40/56, spacing 4/8/16/24/32, radius 4/6/8/12/16, logo 16/24/32/48/64 px, as `--mairie-<kind>-<size>` custom properties.
- **Tokens in code** from `@mairie360/lib-components/theme`: `tones`, `Tone`, `sizes`, `Size`, `scale`, `charteTokens`, `scaleVar`, `isSize`, `isTone`. Every normalised component takes `size` and, when it makes sense, `tone` from these types.
- **`Icon`** (`primitives`): the only way to render a lucide icon, typed size, current colour, decorative unless labelled. **`Logo`** (`shell`): the brand logo at one of the five charte heights.
- The Figma library (page Foundations « Charte & échelle », `Base/Icon`, `Base/Logo`) is the source of these values; change Figma first.

## Buttons and forms — MAIR-608 (lot 2)

- **`Button`** (`primitives`): `variant` solid | outline | ghost | link, `tone` (7 semantic tones), `size` xs–xl, `loading`, `icon` + `iconPosition`, forwardRef. The DaisyUI props are gone.
- **Presets by role** (same entry): `CreateButton`, `SaveButton`, `CancelButton`, `EditButton`, `DeleteButton`, `ConfirmDeleteButton`, `RefreshButton`, `RetryButton`, `CloseButton`, `BackButton`, `SendButton`, `DownloadButton`, `LogoutButton` (`ButtonPresets` by key). `IconButton` (square, `preset` close | more | edit | delete | previous | next | search | notifications, accessible name mandatory) and `LinkButton` (text, icon + text, icon only, image; anchor or button).
- **Fields** (same entry): `TextField` (+ `EmailField`, `PasswordField`, `SearchField`, `PhoneField`, `DateField`, `NumberField`, `NameField`), `TextArea`, `Checkbox`, `RadioGroup`, `Switch`, `Slider`, `FileField`, `SelectField`, `MultiSelect`, `FilterSelect`, `FormSection`, `FormActions`; all share the `Field` anatomy (label, required marker, hint, error with `role=alert`), forward their ref and spread native props.
- **react-hook-form adapter** (`@mairie360/lib-components/forms`, optional peers `react-hook-form`, `zod`, `@hookform/resolvers`): `useZodForm(schema)`, `<Form form onSubmit>`, `<FormField name render={({ error, ...field }) => <EmailField {...field} error={error} />} />`. The adapter has its own entry so the primitives stay loadable without those peers.

## Text, display, feedback and shared business — MAIR-608 (lots 3 and 4)

- **`Text`** (`primitives`): `as`, `size` xs–xl, `weight`, `tone` (default, muted, primary, secondary, success, warning, danger, inverse). Presets fix the element and style: `PageTitle` (h1), `SectionTitle` (h2), `PanelTitle` (h3), `ModalTitle`, `Body`, `BodySmall`, `Help`, `ErrorText`, `Caption`, `Label`, `Overline`, `Link`, `Metric`. `Title`, `Paragraph` and `Badge` are gone.
- **Display**: `Panel` (header + content, `state` loading | empty | unavailable through `DataState`), `PageHeader` (h1, subtitle or `showDate`, `actions`; replaces `PageTitleBar`), `StatusPill` (tone × size × dot) with `StatusBadge status=` (Figma Status/*: active, inactive, invited, expired, revoked, todo, inprogress, review, done, late, draft, published, unknown) and `PriorityPill level=`, `Tag` / `TagList`, `MetricCard`, `ProgressMeter`, `Tabs` (arrow keys, optional panels), `SegmentedControl` (radio group), `Pagination` (+ `paginationSummary`), `DataTable` (sortable header, states through `DataState`), `DateTime` (`short | medium | long | relative | dateOnly`, instance time zone, « Indisponible » for an invalid value; helpers `formatDateTime`, `formatRelative`), `Skeleton` (shape line | block | circle × size, shimmer for users allowing motion, presets `Skeleton.TextBlock`, `.Card`, `.TableRow`, `.UserIdentity`), `Icon`, `Avatar` (size on the avatar scale, `initialsOf`), `Spinner` (size, optional announced label).
- **Feedback**: `Alert` (tone × size, action, dismiss; danger alerts are `role=alert`) with `ErrorAlert`, `WarningAlert`, `InfoAlert`, `SuccessAlert`, `UnavailableAlert`; `DataState` (loading | empty | unavailable | error, size, `onRetry` / `onCreate`; replaces `EmptyState`); `Toast` by `tone` with the countdown bar, and `useToast()` now also returns `error`, `success`, `warning`, `info` (errors and warnings persist, success and info last `TOAST_DEFAULT_DURATION` = 5 s; toasts stack top right); `Modal` (size xs–xl, focus trap, Escape and backdrop close, focus restored to the opener), `ConfirmModal` on `Modal` xs with the `CancelButton` / `ConfirmDeleteButton` presets (`open`; `isOpen` still accepted), `Drawer` (m | l).
- **Shared business**: `UserIdentity` (avatar + name + e-mail, `variant` full | nameOnly | photo), `AvatarStack` (« +n » with the hidden names in its label), `SessionExpiredNotice` (`loginHref` or `onReconnect`), `PendingFeatureNotice` (HTTP 501 placeholder).

## Component groups

Since MAIR-607 the library only ships what several fronts share. A business
component enters the library when at least two fronts use it; until then it
lives in its front (it can be born there and move here later). Everything that
is pure display belongs here.

- **Primitives** (`@mairie360/lib-components/primitives`): `Alert`, `Avatar`, `Badge`, `Button`, `Card`, `ConfirmModal`, `DropdownMenu`, `EmptyState`, `Paragraph`, `Select`, `Skeleton`, `Spinner`, `Title`, `Toast`, `ToastProvider` + `useToast`, `ToolTip`.
- **Shell** (`@mairie360/lib-components/shell`): `AppShell`, `AccessibleShell` (the shell as the fronts consume it: collapsible desktop navigation, administration entry from the trusted instance role, shell kept inert while a dialog or alert dialog is open), `CurrentDate` (French page date in the instance time zone), `Header`, `Sidebar`, `Footer`, `DesktopNavigation`, `NotificationCenter`, `PageTitleBar`, plus the `sidebar-preference` cookie helpers (MAIR-578).
- **Shared business** (`@mairie360/lib-components/primitives`): `SessionList` (MAIR-607), the single way Administrator and Settings display a user's sessions: device, IP address, creation, expiry or revocation date, state badge computed by `sessionState`, optional revoke action (never on the current session), loading / empty / unavailable states with a retry action. `nextSessionExpiryDelay` gives the one timer that flips active sessions to expired.

Removed in MAIR-607 (each lived in a single front, which now owns it): the
`settings`, `dashboard`, `projects`, `messages`, `calendar`, `admin` and
`elearning` entries, `InputManager`, `ProgressBar`, `FileCard`, `MiniCard`,
`Item`, `ItemContainer`, `SortableItem`, `UserProfile` and `UserProfilePage`.
The Figma library mirrors this inventory page by page.

## Figma library

The design counterpart of this package lives in the Figma team library **[Mairie360 – lib-components](https://www.figma.com/design/T7vetUfuzPEXk5TxjHRiO2)** (Mairie360 Figma team). It is generated from this repository: one Figma component per export of `src/index.tsx` (same name, variants for the React props), the `--mairie-*` tokens of `src/styles/municipal-theme.css` as variables with Light/Dark modes, the text and shadow styles, and the lucide icons used by the components. Pages: Foundations, Index (full inventory), then one page per group (Primitives, Feedback, Forms & Data, Navigation & Shell, Calendar, Dashboard, Messaging, Email, Files, E-learning, Projects, Settings, Administration).

The Figma library is the source of truth: a visual or behavioural change is designed and agreed in Figma **before** the code is written, and the pull request then implements the Figma component. Every front mock-up must instantiate these components instead of redrawing them.

## Local development

Install the exact dependency versions from the lockfile:

```bash
npm ci
```

Start Storybook at [http://localhost:6006](http://localhost:6006):

```bash
npm run storybook
```

Storybook loads the library stylesheet globally and discovers stories matching `src/**/*.stories.*` and `src/**/*.mdx`.

## Adding a component

1. Add `src/components/ComponentName.tsx`.
2. Export a named component whose name matches the filename: `ComponentName`.
3. Add a Storybook story under `src/stories`.
4. Add tests under `src/__tests__` when the component has behavior to verify.
5. Run the tests and build before submitting the change.

Do not manually maintain `src/index.tsx` for top-level components. The `prebuild` script regenerates it and will overwrite manual changes. Files inside nested component folders are not added automatically to the package entry point.

## Validation commands

| Command | Purpose |
| --- | --- |
| `npm test` | Run Jest tests and generate coverage. |
| `npm run build` | Generate exports, bundle the library, emit declarations, and build the CSS. |
| `npm run build-storybook` | Produce a static Storybook build. |
| `npm run lighthouse` | Build Storybook and run the configured Lighthouse accessibility checks. |
| `npm run chromatic` | Publish Storybook to Chromatic for visual review. Requires `CHROMATIC_PROJECT_TOKEN`. |

## Project structure

```text
src/
├── app/globals.css       # Tailwind and DaisyUI stylesheet entry point
├── assets/               # Assets bundled with the library
├── components/           # Component source files and feature-specific helpers
├── stories/              # Storybook stories and documentation
├── __tests__/            # Jest component tests
└── index.tsx             # Generated public package entry point
scripts/
└── generate-exports.js   # Creates the public component exports
tsup.config.ts            # JavaScript and declaration bundle configuration
```

## CI and publishing

GitHub Actions runs the shared Mairie360 frontend-library workflow for pushes, pull requests, and manual executions. The package metadata publishes `dist` to GitHub Packages using the `@mairie360/lib-components` package name.
## Full library type validation — 8 October 2026

`npm run typecheck` validates component sources, tests and Storybook examples without exclusions. The existing quality workflow invokes this script. HTML attribute types now match the existing Paragraph/Title passthrough; stories use the installed renderer types and valid input values. Eight inherited diagnostics were reproduced before correction and the full check now passes. No runtime typography, layout, API/BFF or RGAA configuration changes.


Shared frame accessibility

AppShell offers “Aller au contenu” as its first keyboard stop and focuses main. The sidebar Footer keeps its visual placement without creating a nested contentinfo landmark; the horizontal variant retains footer semantics. These targeted fixes are not a complete RGAA audit.


Shared MAIR-547 theme and [QA/release limitations](docs/qa/design-qa.md).

[UI module entries: candidate, compatibility and measurement protocol](docs/en/module-packaging.md).
