# Chargement, absence de données et notifications

Ces primitives utilisent les variables du thème municipal existant. Importez la feuille de styles de la bibliothèque et fournissez les textes adaptés au contexte. Elles ne lancent aucune requête et ne déduisent jamais une réussite.

## Skeleton

`<Skeleton className="h-20" />` est décoratif et ignoré par les technologies d’assistance. Dans une zone de chargement, donnez un seul libellé au groupe : `<Skeleton label="Chargement des dossiers" />`. N’ajoutez pas une annonce par ligne. La pulsation respecte la préférence de réduction des animations ; `animated={false}` la supprime pour tout le monde. Le composant ne masque pas les erreurs ni le contenu déjà disponible.

## EmptyState

```tsx
<EmptyState
  title="Aucun dossier"
  description="Créez votre premier dossier pour commencer."
  icon={<FolderIcon />}
  action={<button onClick={openCreateDialog}>Créer un dossier</button>}
/>
```

Le titre nomme la section et constitue un titre de niveau 3. L’icône est décorative ; les actions sont des contrôles fournis par l’application. Aucun focus ni aucune action ne sont déclenchés au montage. Distinguez un résultat vide d’un chargement et d’une erreur réseau.

## Toast et ToastProvider

```tsx
<ToastProvider regionLabel="Notifications" closeLabel="Fermer la notification">
  <Application />
</ToastProvider>

function SaveButton() {
  const { notify } = useToast();
  const save = async () => {
    try {
      await saveAndValidateReceipt();
      notify({ variant: 'success', message: 'Dossier enregistré.' });
    } catch {
      notify({ variant: 'error', message: 'Enregistrement impossible. Réessayez.' });
    }
  };
  return <button onClick={save}>Enregistrer</button>;
}
```

`notify(options)` retourne un identifiant utilisable avec `dismiss(id)`. `message` est obligatoire ; `title`, `variant`, `closeLabel` et `duration` sont facultatifs. La variante par défaut est `info`. Les notifications ordinaires utilisent `status`/`polite`, seules les erreurs utilisent `alert`/`assertive`. Aucun focus n’est pris à l’arrivée. La touche Échap ferme uniquement une notification qui contient le focus. Une fermeture manuelle rend le focus au contrôle d’origine seulement si le focus était dans la notification et si ce contrôle existe encore et reste disponible. Une fermeture programmée ou une expiration ne déplace jamais le focus.

Les notifications sont **persistantes par défaut**. Un délai en millisecondes positif et fini peut être fourni par notification (`duration`) ou au provider (`defaultDuration`). `duration={null}` au niveau d’une notification désactive le délai du provider. Les erreurs restent toujours persistantes. Le temps restant est conservé pendant le survol, le focus interne, la perte de focus de la fenêtre ou le masquage du document. Il n’y a pas d’animation de notification.

Préférez la persistance pour les informations importantes. Si vous activez les délais, donnez aux utilisateurs la possibilité de les désactiver dans l’application et un temps de lecture adapté. Une notification ne remplace pas une erreur liée au champ ni une confirmation durable nécessaire à la tâche.

`Toast` est également disponible seul en mode contrôlé : `<Toast message="Reçu du serveur" onClose={dismiss} />`. Sans `onClose`, aucun bouton de fermeture n’est affiché. Le libellé de fermeture par défaut est « Fermer la notification » ; fournissez `closeLabel` pour une autre langue.

Le provider monte deux régions d’annonce vides avant la première notification. Les ajouts y conservent chaque message et son titre, même pour des messages identiques reçus ensemble ; les cartes visuelles restent navigables sans doubler l’annonce. Les textes cachés disparaissent avec la notification : aucun historique supplémentaire ne s’accumule. Les tests DOM vérifient cette structure ; ils ne remplacent pas une recette avec lecteur d’écran.

Référence de structure : [W3C, technique ARIA22 et sa procédure de test](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22#tests).
