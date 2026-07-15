# `@mairie360/lib-components`

`@mairie360/lib-components` est la bibliothèque de composants React partagée entre les applications Mairie360. Elle fournit des composants d’interface réutilisables, des éléments de navigation et des modules fonctionnels complets pour le calendrier, la messagerie, la formation en ligne, l’administration, les projets et les profils utilisateurs.

La bibliothèque utilise React 19, TypeScript, Tailwind CSS 4 et DaisyUI. Storybook permet de développer et de documenter les composants de manière isolée.

## Fonctionnement de la bibliothèque

Le code source se trouve dans `src/components`. Chaque composant de premier niveau est exposé par `src/index.tsx` et peut être importé depuis la racine du package.

Lors de l’exécution de `npm run build` :

1. `scripts/generate-exports.js` analyse `src/components` et régénère `src/index.tsx`.
2. `tsup` compile le code TypeScript aux formats ESM et CommonJS, génère les déclarations de types et écrit le résultat dans `dist`.
3. PostCSS compile `src/app/globals.css`, qui inclut Tailwind CSS et DaisyUI, vers `dist/styles.css`.
4. Seul le répertoire `dist` est inclus dans le package publié.

Le package est configuré pour le registre GitHub Packages sous le scope `@mairie360`.

## Prérequis

- Node.js 20.x
- npm
- React 19
- React DOM 19

## Installation

Configurez npm pour résoudre le scope `@mairie360` depuis GitHub Packages. Ajoutez cette ligne au fichier `.npmrc` de votre projet ou de votre utilisateur :

```ini
@mairie360:registry=https://npm.pkg.github.com
```

Si une authentification est nécessaire, fournissez également un token GitHub autorisé à lire les packages :

```ini
//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
```

Installez ensuite la bibliothèque :

```bash
npm install @mairie360/lib-components
```

## Utilisation

Importez une seule fois la feuille de styles compilée depuis la racine de l’application qui consomme la bibliothèque :

```tsx
import '@mairie360/lib-components/dist/styles.css';
```

Les composants peuvent ensuite être importés depuis la racine du package :

```tsx
'use client';

import { useState } from 'react';
import { Alert, Button } from '@mairie360/lib-components';

export function Example() {
  const [showAlert, setShowAlert] = useState(false);

  return (
    <div className="space-y-4">
      <Button
        label="Enregistrer"
        primary
        onClick={() => setShowAlert(true)}
      />

      {showAlert && (
        <Alert
          type="success"
          title="Enregistré"
          message="Vos modifications ont été enregistrées."
          closable
          onClose={() => setShowAlert(false)}
        />
      )}
    </div>
  );
}
```

Les composants interactifs utilisent des hooks React et des API du navigateur. Dans un projet Next.js avec l’App Router, utilisez-les depuis un Client Component, comme dans l’exemple ci-dessus.

## Groupes de composants

L’API publique comprend les groupes principaux suivants :

- Composants d’interface : `Alert`, `Avatar`, `Badge`, `Button`, `Card`, `DropdownMenu`, `InputManager`, `Select`, `Spinner`, `Title` et `ToolTip`.
- Mise en page et navigation : `Header`, `Footer`, `Sidebar`, `PageTitleBar`, `Item` et `ItemContainer`.
- Calendrier : `CalendarModule`, les grilles, barres d’outils, panneaux latéraux, champs et fenêtres modales d’événements.
- Messagerie : `Messaging`, les conversations, bulles de messages, l’éditeur, le panneau latéral et les fenêtres modales.
- Formation en ligne : `ElearningCatalog`, les cartes et détails de formations, les filtres, évaluations, badges et statistiques.
- Administration : `AdministrationModule`, la gestion des utilisateurs, les paramètres, journaux, audits, états du système et indicateurs.
- Projets : `ProjectModule` ainsi que ses vues et interactions de gestion de projets.
- Expérience utilisateur : `UserProfile`, `UserProfilePage`, `ConfirmModal` et les composants de progression ou de statistiques.

Les modules fonctionnels peuvent utiliser les données de démonstration incluses ou recevoir les données et callbacks de l’application au moyen de leurs props. Consultez leurs stories Storybook pour connaître les états et interactions pris en charge.

## Développement local

Installez les versions exactes des dépendances définies dans le lockfile :

```bash
npm ci
```

Démarrez Storybook sur [http://localhost:6006](http://localhost:6006) :

```bash
npm run storybook
```

Storybook charge globalement la feuille de styles de la bibliothèque et détecte les stories correspondant à `src/**/*.stories.*` et `src/**/*.mdx`.

## Ajouter un composant

1. Ajoutez `src/components/ComponentName.tsx`.
2. Exportez un composant nommé comme le fichier : `ComponentName`.
3. Ajoutez une story Storybook dans `src/stories`.
4. Ajoutez des tests dans `src/__tests__` lorsque le composant comporte un comportement à vérifier.
5. Exécutez les tests et le build avant de proposer la modification.

Ne maintenez pas manuellement `src/index.tsx` pour les composants de premier niveau. Le script `prebuild` le régénère et écrase les modifications manuelles. Les fichiers placés dans les sous-répertoires de composants ne sont pas ajoutés automatiquement au point d’entrée du package.

## Commandes de validation

| Commande | Utilité |
| --- | --- |
| `npm test` | Exécute les tests Jest et génère le rapport de couverture. |
| `npm run build` | Génère les exports, compile la bibliothèque, produit les déclarations de types et construit le CSS. |
| `npm run build-storybook` | Produit une version statique de Storybook. |
| `npm run lighthouse` | Construit Storybook et exécute les contrôles d’accessibilité Lighthouse configurés. |
| `npm run chromatic` | Publie Storybook sur Chromatic pour la revue visuelle. Nécessite `CHROMATIC_PROJECT_TOKEN`. |

## Structure du projet

```text
src/
├── app/globals.css       # Point d’entrée des styles Tailwind et DaisyUI
├── assets/               # Ressources intégrées à la bibliothèque
├── components/           # Composants et utilitaires propres aux modules
├── stories/              # Stories et documentation Storybook
├── __tests__/            # Tests de composants avec Jest
└── index.tsx             # Point d’entrée public du package, généré automatiquement
scripts/
└── generate-exports.js   # Génère les exports publics des composants
tsup.config.ts            # Configuration de la compilation JavaScript et des types
```

## CI et publication

GitHub Actions exécute le workflow partagé des bibliothèques frontend Mairie360 lors des pushs, des pull requests et des lancements manuels. Les métadonnées du package publient `dist` sur GitHub Packages sous le nom `@mairie360/lib-components`.
