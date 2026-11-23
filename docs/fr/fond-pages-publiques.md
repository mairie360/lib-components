# PublicBackdrop : fond des pages publiques (MAIR-1103)

`PublicBackdrop` dessine quatre grands rubans en aplats qui traversent la page en diagonale et ondulent lentement (une ondulation toutes les 10 à 20 s, sens alternés). C’est le composant Figma `Fond/Rubans` du fichier Login.

```tsx
import { PublicBackdrop } from '@mairie360/lib-components/shell';

<body>
  <PublicBackdrop />
  <div style={{ position: 'relative', zIndex: 1 }}>{/* main, Footer */}</div>
</body>
```

- Les couleurs viennent des jetons du thème de la page, jamais du composant : `--mairie-action-background` à 17 % et 24 %, `--mairie-secondary` à 7 %, `--mairie-accent` à 17 %, sur `--mairie-background`. Aucun dégradé.
- Décoratif : `aria-hidden`, `pointer-events: none`, `position: fixed` sous le contenu. Gardez le contenu sur une surface opaque (`Card`) pour que son contraste ne change pas.
- Mouvement : 60 images par seconde au plus, arrêté quand l’onglet est caché, image fixe avec `prefers-reduced-motion` (ou `animated={false}`). `variant="none"` ne dessine rien.

**Charte :** les animations décoratives en boucle restent interdites dans l’application. Les pages publiques (connexion, mot de passe oublié et réinitialisation, session expirée) en sont la seule exception, et seulement par ce composant.
