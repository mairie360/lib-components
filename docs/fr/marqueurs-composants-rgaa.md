# Marqueurs de composants RGAA (MAIR-318)

Chaque composant exporté pose `data-m360-component` sur son élément DOM racine. Le moteur RGAA de
`mairie360/CICD` (`tests/a11y/`) le lit sur chaque état capturé d'un front et liste les composants
de `@mairie360/lib-components` importés par le front qu'aucun état n'affiche : une modale jamais
ouverte ou une variante jamais affichée n'échappe plus en silence aux vérifications d'accessibilité.

## La valeur

Les noms exportés des composants qui rendent l'élément, du plus extérieur au plus intérieur,
séparés par des espaces. Un nom se cherche avec `[data-m360-component~="Modal"]`.

| Rendu | Élément racine |
| --- | --- |
| `<Button />` | `data-m360-component="Button"` |
| `<SaveButton />` | `data-m360-component="SaveButton Button"` |
| `<ConfirmModal />` | `data-m360-component="ConfirmModal Modal"` |
| `<EmailField />` | `data-m360-component="EmailField TextField Field"` |

Les noms sont les noms exportés et restent stables d'une version à l'autre. Un composant sans
racine unique le pose sur chaque élément qu'il rend au premier niveau : `ToastProvider` sur ses
zones d'annonce et sa liste de toasts, les parties de `Select` et `DropdownMenu`
(`SelectTrigger`, `DropdownMenuContent`, ...) sur leur propre élément. `SelectScrollUpButton`,
`SelectScrollDownButton` et `DropdownMenuPortal` ne rendent aucun élément.

## Dans le code

`src/components/component-marker.ts` :

- `componentMarker(name, props)` renvoie l'attribut, fusionné avec le marqueur passé par
  l'appelant dans `props`. À étaler sur l'élément racine après `{...props}`, ou à passer au
  composant interne (`<Modal {...props} {...componentMarker('ConfirmModal', props)}>`).
- `withoutMarker(props)` retire le marqueur de l'appelant, pour un composant qui étale ses props
  sur un contrôle interne (`<input {...withoutMarker(props)} />` dans `TextField`).

`src/__tests__/ComponentMarkers.test.tsx` rend chaque composant exporté et échoue quand l'un
d'eux n'a pas de marqueur, ou quand un nouvel export n'y a pas de fixture.
