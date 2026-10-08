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

## Component groups

### Conversation drafts — MAIR-461

Messaging retains in-memory composers only for visited conversation IDs. Numeric
and string IDs are equivalent. Inactive composers are hidden and disabled;
switching threads preserves text, attachments, mentions and business references
only for their originating conversation. Removing a conversation or changing
the current account clears its drafts and releases owned attachment URLs.
Return the real send result: a confirmation clears only the originating draft;
a refusal/rejection preserves it. Late settlements after account changes or
conversation removal cannot clear a replacement draft. Pending sends freeze
text, attachment removal/addition, mention/business suggestions and emoji actions.
Two independent sends may settle in either order without crossing their drafts.
These callback guarantees do not certify the consumer's BFF persistence or rights.

The delivery candidate retains the current main dependency updates and its
v4.2.0 reusable workflow, aligning only the matching action-version input.
A scoped Next/sharp override uses the patched image tooling (0.35.5, librsvg
2.63.2); no security/RGAA check or npm policy is disabled. Package publication
also requires the unchanged audit. Compatible tooling locks compression1.8.2
and proxy-addr2.0.8 remove their high/critical findings without changing backend
services or library runtime dependencies. Remaining braces/sprintf-js findings
are not waived or hidden by a forced breaking tooling downgrade. Publication
and the subsequent Messages consumer pin/integration must succeed before this
feature is considered delivered; local library builds are not published versions.

`Messaging.onCreateGroup` and `CreateGroupModal.onCreateGroup` accept a synchronous
or asynchronous `boolean | void` result. Return `false` or reject/throw to retain
the group name, description and members for retry. A confirmed success (including
legacy `void` callbacks) closes the `Messaging` dialog. While a promise is pending,
the form and close controls are disabled and repeated submissions are ignored.
Consumers must return their service result, not discard its promise, and must not
return success until the service has actually created the group.

The public API includes the following main groups:

- UI primitives: `Alert`, `Avatar`, `Badge`, `Button`, `Card`, `DropdownMenu`, `InputManager`, `Select`, `Spinner`, `Title`, and `ToolTip`.
- Layout and navigation: `Header`, `Footer`, `Sidebar`, `PageTitleBar`, `Item`, and `ItemContainer`.
- Calendar: `CalendarModule`, calendar grids, toolbars, sidebars, event fields, and event modals.
- Messaging: `Messaging`, conversation items, message bubbles, the composer, sidebar, and message modals.
- E-learning: `ElearningCatalog`, course cards, course details, filters, ratings, badges, and statistics.

  Course administration callbacks `onCreateCourse` / `onUpdateCourse` may return
  `boolean | void | Promise<boolean | void>`. Return the actual persistence promise
  and `false` on refusal to retain all form values for retry. Pending saves disable
  fields, cancellation and repeat submissions; only confirmation closes the form.
  Synchronous `void` callbacks remain compatible, but cannot report remote failure.
  Do not return `false` when the mutation succeeded and only catalogue refresh failed:
  retry that refresh separately without creating/updating the course again (MAIR-378).
  Author status selects preserve the exact draft value even when catalogue filter
  choices omit it. A missing current value is displayed through a disabled
  presentation-only option; it does not add a selectable business transition or
  alter catalogue filters. Received labels, order and disabled states are retained.
  Refreshing choices does not reset the draft or silently select the first option
  (MAIR-475).
- Administration: `AdministrationModule`, user management, settings, logs, audit, system status, and metric panels.
- Projects: `ProjectModule` and its project-management views and interactions.
- User experience: `UserProfile`, `UserProfilePage`, `ConfirmModal`, and progress or statistics components.

Feature modules can work with their included demonstration data, or receive application data and callbacks through props. Use their Storybook stories as the reference for supported states and interactions.

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
