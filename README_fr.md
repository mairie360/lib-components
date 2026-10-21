# `@mairie360/lib-components`

`@mairie360/lib-components` est la bibliothèque de composants React partagée entre les applications Mairie360. Elle fournit des composants d’interface réutilisables, le shell applicatif (navigation, en-tête, barre latérale) et les composants métier partagés par plusieurs fronts ; chaque module fonctionnel vit dans son propre front.

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

## Fondations — MAIR-608

- **Charte** dans `src/styles/municipal-theme.css` : teal principal `#70c1b3` (actions, accent, focus ; texte sombre `--mairie-on-action` dessus), bleu secondaire `#3c4f76` (liens, actions secondaires, info), sombre neutre `#383f51` (texte, navigation), clair neutre `#c8bfc7` (bordures, surfaces atténuées), chacune déclinée en Light et Dark ; les tons fonctionnels succès / avertissement / danger gardent leurs surfaces verte / ambre / rouge. Nouveaux jetons : `--mairie-secondary*`, `--mairie-info-*`, `--mairie-logo-backing`.
- **Une seule échelle de tailles** `xs | s | m | l | xl` : contrôles 24/32/40/48/56, icônes 12/16/20/24/32, texte 12/14/16/18/20, avatars 20/24/32/40/56, espacements 4/8/16/24/32, rayons 4/6/8/12/16, logo 16/24/32/48/64 px, en propriétés `--mairie-<type>-<taille>`.
- **Jetons côté code** depuis `@mairie360/lib-components/theme` : `tones`, `Tone`, `sizes`, `Size`, `scale`, `charteTokens`, `scaleVar`, `isSize`, `isTone`. Chaque composant normalisé prend `size` et, quand c'est pertinent, `tone` de ces types.
- **`Icon`** (`primitives`) : la seule façon d'afficher une icône lucide, taille typée, couleur courante, décorative sans libellé. **`Logo`** (`shell`) : le logo aux cinq hauteurs de la charte.
- La bibliothèque Figma (page Foundations « Charte & échelle », `Base/Icon`, `Base/Logo`) est la source de ces valeurs ; on change Figma d'abord.

## Boutons et formulaires — MAIR-608 (lot 2)

- **`Button`** (`primitives`) : `variant` solid | outline | ghost | link, `tone` (7 tons), `size` xs–xl, `loading`, `icon` + `iconPosition`, forwardRef. Les props DaisyUI disparaissent.
- **Préréglages par rôle** : `CreateButton`, `SaveButton`, `CancelButton`, `EditButton`, `DeleteButton`, `ConfirmDeleteButton`, `RefreshButton`, `RetryButton`, `CloseButton`, `BackButton`, `SendButton`, `DownloadButton`, `LogoutButton` (`ButtonPresets` par clé). `IconButton` (carré, `preset` close | more | edit | delete | previous | next | search | notifications, nom accessible obligatoire) et `LinkButton` (texte, icône + texte, icône seule, image ; lien ou bouton).
- **Champs** : `TextField` (+ `EmailField`, `PasswordField`, `SearchField`, `PhoneField`, `DateField`, `NumberField`, `NameField`), `TextArea`, `Checkbox`, `RadioGroup`, `Switch`, `Slider`, `FileField`, `SelectField`, `MultiSelect`, `FilterSelect`, `FormSection`, `FormActions` ; même anatomie `Field` (libellé, marqueur obligatoire, aide, erreur en `role=alert`), ref transmise, props natives.
- **Adaptateur react-hook-form** (`@mairie360/lib-components/forms`, pairs optionnels `react-hook-form`, `zod`, `@hookform/resolvers`) : `useZodForm(schema)`, `<Form form onSubmit>`, `<FormField name render={({ error, ...field }) => <EmailField {...field} error={error} />} />`. Entrée séparée pour que les primitives restent chargeables sans ces pairs.

## Texte, affichage, retours et métier partagé — MAIR-608 (lots 3 et 4)

- **`Text`** (`primitives`) : `as`, `size` xs–xl, `weight`, `tone`. Préréglages : `PageTitle` (h1), `SectionTitle` (h2), `PanelTitle` (h3), `ModalTitle`, `Body`, `BodySmall`, `Help`, `ErrorText`, `Caption`, `Label`, `Overline`, `Link`, `Metric`. `Title`, `Paragraph` et `Badge` disparaissent.
- **Affichage** : `Panel` (en-tête + contenu, `state` loading | empty | unavailable via `DataState`), `PageHeader` (h1, sous-titre ou `showDate`, `actions` ; remplace `PageTitleBar`), `StatusPill` (ton × taille × point) avec `StatusBadge status=` (Figma Status/*) et `PriorityPill level=`, `Tag` / `TagList`, `MetricCard`, `ProgressMeter`, `Tabs` (flèches, panneaux optionnels), `SegmentedControl` (groupe radio), `Pagination` (+ `paginationSummary`), `DataTable` (en-tête triable, états via `DataState`), `DateTime` (`short | medium | long | relative | dateOnly`, fuseau de l’instance, « Indisponible » si invalide ; `formatDateTime`, `formatRelative`), `Skeleton` (forme line | block | circle × taille, reflet animé si le mouvement est autorisé, préréglages `Skeleton.TextBlock`, `.Card`, `.TableRow`, `.UserIdentity`), `Icon`, `Avatar` (échelle avatar, `initialsOf`), `Spinner` (taille, libellé annoncé optionnel).
- **Retours** : `Alert` (ton × taille, action, fermeture ; les alertes danger sont en `role=alert`) avec `ErrorAlert`, `WarningAlert`, `InfoAlert`, `SuccessAlert`, `UnavailableAlert` ; `DataState` (loading | empty | unavailable | error, taille, `onRetry` / `onCreate` ; remplace `EmptyState`) ; `Toast` par `tone` avec la barre de décompte, et `useToast()` expose aussi `error`, `success`, `warning`, `info` (erreurs et avertissements persistent, succès et info durent `TOAST_DEFAULT_DURATION` = 5 s ; pile en haut à droite) ; `Modal` (taille xs–xl, focus piégé, Échap et voile ferment, focus rendu à l’ouvreur), `ConfirmModal` sur `Modal` xs avec `CancelButton` / `ConfirmDeleteButton` (`open` ; `isOpen` toujours accepté), `Drawer` (m | l).
- **Métier partagé** : `UserIdentity` (avatar + nom + e-mail, `variant` full | nameOnly | photo), `AvatarStack` (« +n » avec les noms masqués dans son libellé), `SessionExpiredNotice` (`loginHref` ou `onReconnect`), `PendingFeatureNotice` (remplaçant d’une route 501).

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

Le pendant design de ce paquet est la bibliothèque d’équipe Figma **[Mairie360 – lib-components](https://www.figma.com/design/T7vetUfuzPEXk5TxjHRiO2)** (équipe Figma Mairie360). Elle reflète ce paquet : un composant Figma par export de `src/index.tsx` (même nom, variantes pour les props React), les tokens `--mairie-*` de `src/styles/municipal-theme.css` en variables avec modes Light/Dark, les styles de texte et d’ombre, et les icônes lucide utilisées par les composants. Pages : Foundations, Index (inventaire complet), puis une page par groupe (Primitives, Feedback, Forms & Data, Navigation & Shell, Sessions). Les pages fonctionnelles retirées par MAIR-607 (Calendar, Dashboard, Messaging, E-learning, Projects, Settings, Administration) vivent désormais dans la maquette Figma de chaque front.

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
