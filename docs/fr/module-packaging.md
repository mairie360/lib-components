# Entrées UI par module — candidat MAIR526

Le code source propose des imports additionnels par module, tout en conservant les imports historiques à la racine et `@mairie360/lib-components/next`. Cette proposition n’est pas publiée. L’adoption dans les applications attend les contrôles du paquet et la résolution du blocage d’audit MAIR439 ; les huit applications gardent leur dépendance actuelle.

```tsx
'use client';
import { SettingsModule } from '@mairie360/lib-components/settings';
import { Skeleton, ToastProvider, useToast } from '@mairie360/lib-components/primitives';
import type { SettingsModuleProps } from '@mairie360/lib-components/settings';
import type { ToastOptions } from '@mairie360/lib-components/primitives';
```

| Entrée | Contenu |
| --- | --- |
| `primitives` | Boutons, champs, sélections, retours de chargement et notifications |
| `settings` | Paramètres et panneaux de profil |
| `dashboard` | Tableau de bord et cartes |
| `projects` | Projets, statuts et tableaux Kanban |
| `messages` | Messagerie et courriels |
| `calendar` | Calendrier et événements |
| `admin` | Administration et panneaux associés |
| `elearning` | Catalogue et détails des formations |
| `shell` | Structure de page et navigation |
| `next` | Opérations de session côté serveur uniquement |

Les entrées UI portent une frontière `use client`. L’entrée `next` conserve ses fichiers `dist/next.js`, `dist/next.cjs` et ses déclarations, sans frontière client. Les formats ESM et CommonJS disposent chacun de déclarations adaptées. Des imports racine et par module dans un même format doivent partager le même contexte `ToastProvider` ; mélanger deux formats dans une même application n’est pas un contrat d’identité partagé.

Les styles restent explicites dans le layout de l’application :

```tsx
import '@mairie360/lib-components/dist/styles.css';
// Alias additionnel équivalent : @mairie360/lib-components/styles.css
```

La déclaration `sideEffects: ["**/*.css"]` permet l’élimination du JavaScript inutilisé en conservant un import CSS explicite. Elle ne charge pas les styles automatiquement. Le générateur `scripts/generate-exports.js` reste la source des exports : modifier l’inventaire `scripts/ui-entrypoints.mjs`, puis exécuter le générateur ; ne pas éditer manuellement `src/entries/*`.

## Validation reproductible

Ces commandes utilisent les dépendances déjà verrouillées, sans installation de consommateur ni accès au registre :

```sh
npm run build
node --test --test-concurrency=1 scripts/check-ui-package.mjs
MAIRIE_PACKAGE_NEXT_FIXTURE=1 node --test --test-concurrency=1 scripts/check-ui-package.mjs
```

La deuxième commande teste le vrai tarball, ses imports Node ESM/CJS, les types NodeNext et Bundler, le partage de contexte, les chemins CSS, le générateur exécuté deux fois, les références aux chunks/maps/déclarations et l’absence de fichiers de développement. La troisième ajoute un vrai build Next App Router : page serveur appelant `next`, enfant client utilisant le fournisseur racine et le hook par module, rendu précompilé et inspection du JavaScript navigateur. La fixture Next est explicitement ignorée sans sa variable d’activation ; les autres tests ne prouvent pas à eux seuls une frontière RSC valide.

Pour comparer les graphes de production, construire séparément la révision de référence `b055ca66fcaf069abf2cecf288458f222d0675cc` et le candidat avec le même Node, les mêmes dépendances et les mêmes corrections de style :

```sh
node scripts/measure-ui-package.mjs --package-root=/chemin/reference --entry-mode=root --label=reference --output=/chemin/preuves/reference.json
node scripts/measure-ui-package.mjs --entry-mode=root --label=candidat-racine --output=/chemin/preuves/candidat-racine.json
node scripts/measure-ui-package.mjs --entry-mode=modules --label=candidat-modules --output=/chemin/preuves/candidat-modules.json
```

Les quatre scénarios importent un bouton, les primitives de retour, les paramètres, puis une composition paramètres/tableau de bord/structure. Le rapport additionne chaque fichier JavaScript émis et ses chunks transitifs, en octets bruts, gzip et Brotli ; il conserve les métadonnées du graphe. React et Next restent externes. Ces nombres excluent les styles, le runtime Next et les routes réelles : ils ne constituent ni une mesure de JavaScript initial navigateur ni une preuve de LCP. Aucun gain chiffré n’est annoncé avant exécution des trois mesures et de la recette applicative.
