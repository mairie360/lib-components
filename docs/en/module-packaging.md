# UI module entries — MAIR526 candidate

The source proposes additive module imports while preserving the historical package root and `@mairie360/lib-components/next`. This candidate is unpublished. Application adoption requires successful package checks and resolution of the MAIR439 audit blocker; the eight applications retain their current dependency.

```tsx
'use client';
import { SettingsModule } from '@mairie360/lib-components/settings';
import { Skeleton, ToastProvider, useToast } from '@mairie360/lib-components/primitives';
import type { SettingsModuleProps } from '@mairie360/lib-components/settings';
import type { ToastOptions } from '@mairie360/lib-components/primitives';
```

| Entry | Contents |
| --- | --- |
| `primitives` | Buttons, inputs, selects, loading and feedback |
| `settings` | Settings and profile panels |
| `dashboard` | Dashboard and cards |
| `projects` | Projects, statuses and Kanban |
| `messages` | Messaging and email |
| `calendar` | Calendar and events |
| `admin` | Administration and its panels |
| `elearning` | Course catalog and details |
| `shell` | Page shell and navigation |
| `next` | Server session operations only: bounded BFF proxy, Login-owned refresh and logout, peer `refresh` / `resume` handlers, cookies |
| `guard` | Page guard and CSP for `middleware.ts` (data routes answer JSON 401, documents resume locally) |
| `browser` | Same-origin `sessionFetch`: one shared refresh and one replay after a 401 |
| `shared` | Validated front URLs, CSP, display-only JWT role, instance civil dates (no React, no Next) |
| `react` | Client providers: display role, instance time zone, `useModalFocusScope` |
| `theme` | Appearance preference cookie and sync (no React, no Next) |

## Shared front kit (MAIR-126)

`guard`, `browser`, `shared`, `react`, `theme` and the `next` entry come from the former `@mairie360/front-kit` package (Front_End_Template#15), now published here. A front imports them as `@mairie360/lib-components/<entry>` instead of `@mairie360/front-kit/<entry>`, with the same exports. Each is its own bundle (no shared chunk) and never imports the UI root, so a front only ships the modules it imports: `scripts/check-server-entry.mjs` (run after every build) checks, on `dist`, that `shared`, `browser` and `theme` import nothing, `guard` only `next/server.js`, `react` only `react`, and that none reaches a UI entry. Their tests (`tests/kit/*.test.mjs`) run on the built entries through `npm run test:kit`, part of `npm test`, with a 60 % lines/functions/branches gate per entry; the React providers are measured by the consuming fronts.

UI entries carry a `use client` boundary. The `next` entry retains `dist/next.js`, `dist/next.cjs` and declarations without a client boundary. ESM and CommonJS have matching declarations. Root and module imports within one format must share their `ToastProvider` context; mixing formats in one application does not promise shared identity.

Styles remain explicit in the application layout:

```tsx
import '@mairie360/lib-components/dist/styles.css';
// Equivalent additive alias: @mairie360/lib-components/styles.css
```

`sideEffects: ["**/*.css"]` allows unused JavaScript removal while retaining explicit CSS imports. It does not load styles automatically. `scripts/generate-exports.js` remains the export generator: edit `scripts/ui-entrypoints.mjs`, then run the generator rather than manually editing `src/entries/*`.

## Reproducible checks

These commands use existing locked dependencies without consumer installation or registry access:

```sh
npm run build
node --test --test-concurrency=1 scripts/check-ui-package.mjs
MAIRIE_PACKAGE_NEXT_FIXTURE=1 node --test --test-concurrency=1 scripts/check-ui-package.mjs
```

The second command probes the actual tarball, Node ESM/CJS imports, NodeNext/Bundler types, shared contexts, CSS paths, two generator runs, chunk/map/declaration references and excluded development files. The third also builds a real Next App Router consumer: a server page calls `next`, a client child uses the root provider with the module hook, and checks inspect prerendered HTML and browser JavaScript. Without the environment flag, the Next fixture is explicitly skipped; the other probes alone cannot prove an RSC boundary.

To compare production graphs, separately build reference revision `b055ca66fcaf069abf2cecf288458f222d0675cc` and the candidate using the same Node, dependencies and style fixes:

```sh
node scripts/measure-ui-package.mjs --package-root=/path/reference --entry-mode=root --label=reference --output=/path/evidence/reference.json
node scripts/measure-ui-package.mjs --entry-mode=root --label=candidate-root --output=/path/evidence/candidate-root.json
node scripts/measure-ui-package.mjs --entry-mode=modules --label=candidate-modules --output=/path/evidence/candidate-modules.json
```

Four scenarios import a button, feedback primitives, settings, and a settings/dashboard/shell composition. Reports sum every emitted JavaScript file and transitive chunk in raw, gzip and Brotli bytes, and preserve graph metadata. React and Next peers remain external. These figures exclude styles, the Next runtime and real application routes; they are neither browser initial JavaScript measurements nor LCP evidence. No numerical improvement is claimed before all three measurements and application validation run.

### Candidate semantic colours (MAIR-526)

Components and general styles use municipal semantic roles: `text`/`muted`, `surface`/`surface-raised`, `control-background`/`control-border`, and `accent`/`accent-surface`. Success, warning, error and purple families retain labels and icons. Decorative palettes, learning levels, file types and presence indicators reuse these families without making colour the only information.

Blue actions use stable `action-background`, `action-hover-background` and `on-action` roles in both themes. Destructive and positive actions have dedicated roles. Item, MiniCard and ItemContainer use common card surfaces; navigation, branding, theme previews and media retain contextual roles. Legacy colours in compatibility **selectors** reference existing consumer classes; they are not colour declarations.

`node scripts/check-ui-colors.mjs` checks all runtime source, including files outside components, before each build. `node --test --test-concurrency=1 scripts/ui-color-policy.check.mjs scripts/check-semantic-components.cjs` tests the guard and compiles actual rendered component classes for cards, actions, focus, selected/unselected ratings, avatar initials, tooltips and calendar close controls in both themes. These targeted checks do not certify application-wide accessibility or screen-reader announcements.

Only approved central theme definitions and six contractual ItemContainer values are exempt: `bg-green-500`, `bg-blue-500`, `bg-yellow-500`, `bg-red-500`, `bg-purple-500`, and the `bg-green-500` default. `onStatusColorChange` receives the exact same values. Caller-supplied colours (`status.color`, `backgroundColor`, `colorClassName`, etc.) remain consumer data; their values and contrast are not normalized. Fixtures, stories and demo data are unchanged.

Commit `7b94765` remains historical evidence. Changed sources require a new build and tarball verification. The eight consumers retain their previously validated CSS copies; this candidate migration is not consumer delivery. MAIR-439 audit findings continue to block publication and adoption.
