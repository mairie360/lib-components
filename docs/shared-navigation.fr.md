# Navigation partagée — MAIR-548

`AppShell` expose désormais `collapsibleSidebar` (désactivé par défaut pour compatibilité) et `sidebarCookieDomain`. Avec le thème municipal et `body.mairie-ui`, la navigation desktop conserve ses libellés accessibles, les infobulles au focus/survol, Échap, les badges et le filtre Administration. Le menu mobile conserve son comportement publié. Le pied de page est un contenu hors de `aside` ; sa hauteur borne le défilement des commandes.

La préférence `mairie360_sidebar=v1:collapsed|expanded` valide le domaine parent avant écriture et ne lit aucun jeton. Les dialogues rendent les commandes desktop inertes. L’entrée serveur reste séparée des composants client. Les huit fronts conservent une compatibilité locale avec UI 0.8.0 jusqu’à publication d’une version exacte validée ; la migration consiste à utiliser l’AppShell natif avec ces deux propriétés et retirer le wrapper/menu local.

Les tests couvrent focus/Échap, préférence, rôle, destinations et landmarks. La publication reste bloquée tant que l’audit complet ne satisfait pas la politique existante ; l’absence de vulnérabilités de production ne transforme pas un audit complet échoué en succès. Aucune version ni gate n’est contournée.
