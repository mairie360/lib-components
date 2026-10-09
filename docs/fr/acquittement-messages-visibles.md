# Acquittement explicite des messages affichés — MAIR-269

`Messaging.onReadVisibleMessages(conversation, lastVisibleMessage)` ajoute une
commande dans le menu d’actions existant du fil. Le consommateur choisit de
l’activer ; le composant n’envoie aucune requête et ne modifie aucun compteur.

Après fermeture du menu, la prochaine frame vérifie la zone des messages, la
fenêtre et les ancêtres qui limitent son affichage. Le dernier message dont la
bulle intersecte cette zone visible est transmis, ou `null` si le document/fil
est masqué ou si aucun message n’est affiché. Une sélection différente ou un
démontage invalide la commande programmée. Une demande en cours reste unique.

Le callback accepte un retour `void`, booléen ou promesse de ces valeurs. Un
refus ou `false` affiche une erreur contrôlée pour cette conversation. Le
consommateur reste responsable de la requête contractuelle, des permissions,
de la confirmation serveur et de la relecture des compteurs réels. Il doit
refuser les identifiants absents/étrangers et ne jamais acquitter au bootstrap,
pendant le polling ou depuis un fil invisible.

Les tests exécutent les actions du composant avec une géométrie contrôlée :
clipping, états masqués, demandes en cours et changement de conversation. Ils
ne certifient pas le rendu natif, les contrôles API déployés ni la persistance.
La publication réelle du paquet et les vérifications du consommateur restent
des étapes distinctes.
