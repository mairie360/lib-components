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

`AppShell` place par défaut le copyright dans la sidebar sur ordinateur et dans
le tiroir de navigation sur mobile, sans réduire la hauteur disponible pour le
contenu. `footerProps` fournit toujours les informations produit réelles et les
liens raccordés ; aucune version de livraison n’est inventée. Utilisez
`footerPlacement="content"` uniquement lorsqu’un pied de page horizontal est
voulu. Le composant `Footer` seul reste horizontal par défaut ;
`variant="sidebar"` choisit sa présentation compacte sur fond sombre.
`Sidebar` accepte aussi un nœud React `footer`, hors de sa navigation défilante.
Les écrans d’authentification Login n’utilisent pas `AppShell`.

## Groupes de composants

Depuis MAIR-607, la bibliothèque ne contient que ce que plusieurs fronts
partagent. Un composant métier entre dans la bibliothèque quand au moins deux
fronts l'utilisent ; d'ici là il vit dans son front (il peut y naître puis
monter ici). Tout ce qui est affichage pur a sa place ici.

- **Primitives** (`@mairie360/lib-components/primitives`) : `Alert`, `Avatar`, `Badge`, `Button`, `Card`, `ConfirmModal`, `DropdownMenu`, `EmptyState`, `Paragraph`, `Select`, `Skeleton`, `Spinner`, `Title`, `Toast`, `ToastProvider` + `useToast`, `ToolTip`.
- **Shell** (`@mairie360/lib-components/shell`) : `AppShell`, `AccessibleShell` (le shell tel que les fronts le consomment : navigation repliable, entrée Administration selon le rôle de l'instance, shell inerte pendant une boîte de dialogue), `CurrentDate` (date du jour en français dans le fuseau de l'instance), `Header`, `Sidebar`, `Footer`, `DesktopNavigation`, `NotificationCenter`, `PageTitleBar`, plus les utilitaires du cookie `sidebar-preference` (MAIR-578).
- **Métier partagé** (`@mairie360/lib-components/primitives`) : `SessionList` (MAIR-607), la seule façon pour Administrator et Settings d'afficher les sessions d'un utilisateur : appareil, adresse IP, création, expiration ou révocation, badge d'état calculé par `sessionState`, action de déconnexion optionnelle (jamais sur la session courante), états chargement / vide / indisponible avec action Actualiser. `nextSessionExpiryDelay` fournit le minuteur unique qui fait passer les sessions actives en expirées.

Retirés par MAIR-607 (chacun ne servait qu'à un seul front, qui le possède
désormais) : les entrées `settings`, `dashboard`, `projects`, `messages`,
`calendar`, `admin` et `elearning`, `InputManager`, `ProgressBar`, `FileCard`,
`MiniCard`, `Item`, `ItemContainer`, `SortableItem`, `UserProfile` et
`UserProfilePage`. La bibliothèque Figma reflète cet inventaire page par page.

## Bibliothèque Figma

Le pendant design de ce paquet est la bibliothèque d’équipe Figma **[Mairie360 – lib-components](https://www.figma.com/design/T7vetUfuzPEXk5TxjHRiO2)** (équipe Figma Mairie360). Elle est générée depuis ce dépôt : un composant Figma par export de `src/index.tsx` (même nom, variantes pour les props React), les tokens `--mairie-*` de `src/styles/municipal-theme.css` en variables avec modes Light/Dark, les styles de texte et d’ombre, et les icônes lucide utilisées par les composants. Pages : Foundations, Index (inventaire complet), puis une page par groupe (Primitives, Feedback, Forms & Data, Navigation & Shell, Calendar, Dashboard, Messaging, Email, Files, E-learning, Projects, Settings, Administration).

La bibliothèque Figma est la source de vérité : un changement visuel ou de comportement est conçu et validé dans Figma **avant** d’écrire le code, et la pull request implémente ensuite le composant Figma. Toute maquette de front doit instancier ces composants au lieu de les redessiner.

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
## Vérification complète des types — 8 octobre 2026

`npm run typecheck` contrôle les composants, tests et exemples Storybook sans exclusion. Le workflow qualité existant appelle ce script. Les types HTML reflètent la transmission déjà présente dans Paragraph/Title ; les exemples utilisent le renderer installé et des valeurs d’entrée valides. Huit diagnostics hérités ont été reproduits avant correction ; la vérification complète passe désormais. Aucun changement du rendu typographique, de l’agencement, des API/BFF ou de la configuration RGAA.


Accessibilité du cadre commun

AppShell propose « Aller au contenu » comme premier arrêt clavier et place le focus sur main. Footer en variante sidebar conserve son emplacement visuel sans créer de landmark contentinfo imbriqué ; la variante horizontale conserve son rôle de pied de page. Ces corrections ciblées ne constituent pas un audit RGAA complet.


Thème commun MAIR-547 et [recette/limites de livraison](docs/qa/design-qa.md).

[Entrées UI par module : candidat, compatibilité et protocole de mesure](docs/fr/module-packaging.md).
