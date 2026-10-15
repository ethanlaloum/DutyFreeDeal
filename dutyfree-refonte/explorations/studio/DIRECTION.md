# Direction « Studio »

Demandée le 13 octobre 2026 après le rejet des directions A, B et C (« cheap », « des animations qui partent dans tous les sens »). Références choisies par le porteur : **Apple**, **Revolut / Stripe**, **Farfetch / SSENSE**. Consigne : repartir de zéro, viser l’allure d’une plateforme qui vaut des milliards, sans retomber dans le fade. Retour du porteur sur la première version : « le style premium est bien plus présent, ça se rapproche de ce que je recherche ».

## Idée

Les produits du monde entier, photographiés comme en studio et livrés chez vous. La qualité perçue vient de trois choses, pas de la décoration :

1. **Une photographie homogène.** Chaque produit est détouré (masque de sujet Apple Vision, `../shared/tools/vision_cutout.py`, objet par objet si besoin) et posé sur le même fond, avec la même ombre de contact et une échelle cohérente. Les détourages imparfaits sont écartés ; le verre du flacon de parfum a été rendu translucide à la main pour la scène sombre.
2. **Une interface qui se tait.** Noir, blanc, gris ; une seule police (Switzer) ; la couleur vient des produits.
3. **Une seule grammaire de mouvement**, lente et précise.

## Couleur et lumière

- Scène : `#0A0A0B`, surfaces sombres `#141416`, texte `#F5F5F7`, secondaire `#A1A1A6`.
- Pages claires : blanc, fond studio `#F5F5F7`, texte `#111113`, secondaire `#6E6E73`.
- **Signature : la lumière de la scène.** Une seule aurore (ambre, rose, violet, cyan) derrière la vitrine d’ouverture, qui dérive très lentement. C’est le seul endroit où la couleur n’appartient pas à un produit : pas de halos pastel ailleurs, pas de reflets miroir.
- Sur fond sombre, les objets reposent sur une flaque de lumière discrète ; sur fond clair, sur une ombre douce.
- Actions : pastilles uniquement. Blanc sur fond sombre, noir sur fond clair, contour pour « Ajouter ».

## Typographie

Switzer (Fontshare, licence gratuite ITF), 400 à 700. Slogan en 600 avec interlettrage −0,035em et deuxième ligne en gris ; titres de section 1,5 fois plus petits que le slogan. Prix en chiffres tabulaires, taille normale ; la livraison toujours sur la ligne suivante, avant l’action. Noms d’offres sans numéro de série, en casse française.

## Rythme

Trois chapitres : la scène (sombre), un chapitre clair (repères en phrases, Bons plans | Introuvables, « Du monde entier », panier unique), un chapitre sombre (15 rayons, gros biens sur devis), puis l’invitation vendeur (claire) et le pied de page (noir).

## Mouvement

- **Apparition** : opacité 0 → 1, montée de 28 px, 1 s, `expo.out`, 70 ms d’écart, une seule fois.
- **Scène** : au défilement, le texte du hero s’efface vers le haut et la vitrine monte légèrement.
- **Lumière** : l’aurore de la scène dérive en 28 s ; rien d’autre ne boucle.
- **Survol** : élévation de 4 px, 600 ms.
- **Changement d’état** (pays, filtre, panier) : fondu court, puis la même apparition.

Interdits : rotation, rebond, glissement horizontal, bascule, brouillage de lettres, objets qui volent, propriétés de mise en page animées. Avec la préférence de mouvement réduit, tout est visible et immobile.

## Règles de contenu propres à la page

- Les objets ne se répètent pas d’une section à l’autre : la grille et le panier d’exemple évitent ceux de la vitrine et des sélections ; les rayons les évitent aussi, sauf quand la carte resterait vide.
- Un « introuvable » n’est jamais proposé par un vendeur du pays de livraison. Les sélections varient rayons et vendeurs.
- Bons plans et Introuvables : une grande offre puis deux petites, même composition des deux côtés ; « Du monde entier » : huit détourages, pays des vendeurs en alternance.
- Les compteurs « Voir les N » correspondent aux listes du catalogue de la refonte, qui contient désormais les 53 offres de démonstration. Le panier, les favoris et la destination sont ceux de la refonte (même clé de stockage, relue au retour sur la page) : un seul panier pour toute la démonstration.
- Menu « Tous les rayons » : univers à gauche, catégories à droite, filtre, fermeture explicite, flèches au clavier. Sous 900 px, un bouton Menu reprend la navigation et la langue.

## Étape actuelle

Accueil complet en direction Studio, pour validation sur ordinateur (1440 et 1280 px). Restent à faire si la direction est validée : les autres pages dans cette direction (catalogue, fiche offre, panier et commande, espace vendeur, administration), la version anglaise, la recette mobile.
