# Global search of the header

The shared header can search every module at once. Give the shell a `searchSource` and the
search field shows on every front, whatever the page:

```tsx
import { AccessibleShell, createBffSearchSource } from '@mairie360/lib-components';

const searchSource = createBffSearchSource(); // GET /search on the front's own origin

<AccessibleShell hrefs={hrefs} onNavigate={(href) => router.push(href)} searchSource={searchSource}>
```

- `createBffSearchSource({ path = '/search', limit })` calls the front's same-origin `GET /search`,
  which its proxy forwards to its BFF with the session (the route must be in the front's
  `contracts/openapi.json`). It rejects on an error status or an answer out of contract.
- The answer is `{ groups: [{ module, items }], unavailable: [module] }`, the BFF `GlobalSearchResponse`.
- Each result opens in its module, built from `hrefs` by `globalSearchHref`:

  | Result | Link |
  |---|---|
  | agent | `admin?user=<id>` (administrators only; shown without a link otherwise) |
  | project | `projects?project=<id>` |
  | task | `projects?project=<parent_id>&task=<id>` |
  | event | `calendar?date=<local day>&event=<id>` |
  | conversation | `messages?conversation=<id>` |
  | message | `messages?conversation=<parent_id>&message=<id>` |
  | course | `training?course=<id>` (the `training` destination) |

  `searchResultHref` replaces it; a result whose href is `undefined` is shown without a link.
  The module reads those parameters to open the target.
- A module that keeps its own search (`headerProps.onSearch`) gets it as the first option,
  « Rechercher « q » dans `<searchScopeLabel>` », and on a plain Entrée.

Behaviour: the field is an ARIA combobox. The source is called 250 ms after the last keystroke,
for 2 to 100 characters once trimmed, and the previous call is aborted. Arrows move the active
option (focus stays in the field), Entrée opens it, Échap closes the list then clears the field.
A `role="status"` region, always present, announces « Recherche en cours… », the result count,
the modules that did not answer, or the failure. Figma: `Header/SearchResults` on the
« Navigation & Shell » page.
