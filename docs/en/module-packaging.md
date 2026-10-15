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
| `next` | Server session operations only |

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
