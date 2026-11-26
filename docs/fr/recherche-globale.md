# Recherche globale du bandeau

Le bandeau commun peut chercher dans tous les modules à la fois. Si on passe un `searchSource` au shell, le champ de recherche s'affiche sur tous les fronts, quelle que soit la page :

```tsx
import { AccessibleShell, createBffSearchSource } from '@mairie360/lib-components';

const searchSource = createBffSearchSource(); // GET /search sur l'origine du front

<AccessibleShell hrefs={hrefs} onNavigate={(href) => router.push(href)} searchSource={searchSource}>
```

- `createBffSearchSource({ path = '/search', limit })` appelle le `GET /search` du front, sur la même origine. Le proxy du front le transmet à son BFF avec la session. La route doit donc figurer dans le `contracts/openapi.json` du front. La promesse est rejetée si le statut est une erreur ou si la réponse ne respecte pas le contrat.
- La réponse a la forme `{ groups: [{ module, items }], unavailable: [module] }` : c'est le `GlobalSearchResponse` du BFF.
- Chaque résultat s'ouvre dans son module. `globalSearchHref` construit le lien à partir de `hrefs` :

  | Résultat | Lien |
  |---|---|
  | agent | `admin?user=<id>` (administrateurs uniquement, sinon affiché sans lien) |
  | projet | `projects?project=<id>` |
  | tâche | `projects?project=<parent_id>&task=<id>` |
  | événement | `calendar?date=<jour local>&event=<id>` |
  | conversation | `messages?conversation=<id>` |
  | message | `messages?conversation=<parent_id>&message=<id>` |
  | formation | `training?course=<id>` (destination `training`) |

  `searchResultHref` permet de remplacer ce lien. Un résultat dont le lien vaut `undefined` est affiché sans lien. C'est le module qui lit ces paramètres pour ouvrir la cible.
- Un module qui garde sa propre recherche (`headerProps.onSearch`) la retrouve en première option, « Rechercher « q » dans `<searchScopeLabel>` ». Entrée sans option active la lance aussi.

Comportement :
- Le champ est un combobox ARIA.
- La source est appelée 250 ms après la dernière frappe, pour 2 à 100 caractères (espaces de début et de fin retirés). L'appel précédent est annulé.
- Les flèches déplacent l'option active ; le focus reste dans le champ. Entrée l'ouvre. Échap ferme la liste, puis vide le champ.
- Une zone `role="status"`, toujours présente, annonce « Recherche en cours… », le nombre de résultats, les modules qui n'ont pas répondu ou l'échec de la recherche.

Figma : `Header/SearchResults`, page « Navigation & Shell ».
