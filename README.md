# Next.js App with Storybook and Chromatic

## Description

Ce projet est une application développée avec **Next.js**.  
Nous utilisons **Storybook** pour le développement et la documentation des composants UI, et **Chromatic** pour les tests de régression visuelle. Des tests complémentaires garantissent également la qualité du code de l’application.

---

## Prérequis

- **Node.js** (version recommandée : `20.x`)
- **npm** ou **yarn**

---

## Démarrage du Projet

Clonez le dépôt et installez les dépendances :
```bash
git clone <repository-url>
cd <project-folder>
npm install
# ou
yarn install
```

---

## Utilisation comme Package

Pour utiliser cette bibliothèque dans un autre projet :

### Installation

```bash
npm install @mairie360/lib-components
# ou
yarn add @mairie360/lib-components
```

### Import des styles

**Important:** Pour que les composants s'affichent correctement, vous devez importer le fichier CSS dans votre application :

```typescript
import '@mairie360/lib-components/dist/styles.css';
```

### Utilisation des composants

```typescript
import { Button, Alert, Header } from '@mairie360/lib-components';

function MyApp() {
  return (
    <div>
      <Button>Click me</Button>
      <Alert type="success">Success message</Alert>
    </div>
  );
}
```

---

## Storybook
Storybook permet de développer, visualiser et tester vos composants UI de manière isolée.

## Lancer Storybook localement
Pour démarrer Storybook :
```bash
npm run storybook
# ou
yarn storybook
```
Accédez ensuite à l’interface sur http://localhost:6006.

## Chromatic
Chromatic est utilisé pour effectuer des tests de régression visuelle et faciliter la revue d’interface.

## Configuration
Assurez-vous que votre fichier .env contient bien la variable suivante :
```bash
CHROMATIC_PROJECT_TOKEN=clé_de_projet_chromatic
```

## Lancer Chromatic
Vous pouvez lancer Chromatic avec la commande suivante :
```bash
npm run chromatic
# ou
yarn chromatic
```
Cela va construire votre Storybook et le publier sur Chromatic pour effectuer des tests de régression visuelle.

## Exécuter LightHouse
LightHouse est un outil d’audit de performance et d’accessibilité. Vous pouvez l’exécuter sur votre application pour obtenir des rapports détaillés.
Pour exécuter LightHouse, utilisez la commande suivante :
```bash
npm run lighthouse
# ou
yarn lighthouse
```
