# Navigation partagée — MAIR-548

Figma : [Navigation & Shell › AppShell](https://www.figma.com/design/T7vetUfuzPEXk5TxjHRiO2/Mairie360-%E2%80%93-lib-components?node-id=10-277) et [DesktopNavigation (Repos / Survol)](https://www.figma.com/design/T7vetUfuzPEXk5TxjHRiO2/Mairie360-%E2%80%93-lib-components?node-id=8-306).

`AccessibleShell` (et `AppShell` avec `collapsibleSidebar`) suit l'AppShell de la maquette : une rangée de navigation (bandeau + colonne barre du haut et module) au-dessus d'un seul pied de page sur toute la largeur. La zone du module (`main`) remplit l'espace libre, sans marge, et elle seule défile.

Sur ordinateur (≥ 1024 px, thème `body.mairie-ui`), `DesktopNavigation` est réduit au repos (≈ 71 px : logo et icônes des services). Il se déplie à la largeur de ses boutons (≈ 207 px) au survol de la souris ou quand le focus clavier est dedans (`data-expanded`, `:has(:focus-visible)` : un clic ne le garde pas ouvert), en décalant le module sans le recouvrir. La transition de largeur est supprimée avec `prefers-reduced-motion`. Les éléments font 42 px de haut, texte 16 px, icône 20 px, largeur ajustée au libellé ; chacun garde son nom accessible une fois réduit. `sidebarProps.brandLabel` affiche « Commune de » et le nom de la commune à côté du logo, avec retour à la ligne pour les noms longs.

Il n'y a plus de bouton de repli ni d'infobulle. `sidebarCookieDomain` et les exports `sidebar-preference` restent acceptés pour la compatibilité, mais aucune préférence n'est écrite ni lue. `onCollapsedChange` reçoit `true` au repos et `false` une fois déplié.

Sous 1024 px, le tiroir mobile garde son comportement (focus contenu, Échap, retour du focus sur le bouton de menu). Tant que le tiroir, une boîte de dialogue ou le centre de notifications est ouvert, le bandeau, le contenu et le pied de page sont inertes.

Tests : `DesktopNavigationRuntime`, `AppShellRuntime`, `AppShellSkipNavigation` (comportement) et `ShellLayoutCss` (dépliage, mouvement réduit, règles du pied de page et du module dans le thème).
