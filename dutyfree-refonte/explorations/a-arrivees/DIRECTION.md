# Direction A : « Arrivées »

## Position

Le côté **Amazon** du curseur : dense, recherche d’abord, utilitaire, beaucoup d’offres à l’écran. L’énergie vient de l’**information en mouvement**, pas de la décoration.

## Concept

DutyFreeDeal est le **hall des arrivées des offres du monde**. Chaque offre arrive dans votre pays comme un vol sur un tableau. Le langage visuel est celui de la **signalétique aéroportuaire** (panneaux jaunes à texte noir, pictogrammes dans des carrés, flèches directionnelles, capitales condensées) et des **tableaux d’affichage à palettes** (Solari). C’est du design d’information : l’esthétique naît de la grille, de la typographie et du mouvement mécanique des palettes.

Références de vernaculaire réel (pas des sites web) : la signalétique jaune et noire de l’aéroport de Schiphol (Paul Mijksenaar), les tableaux à palettes Solari des gares et aéroports, les panneaux suspendus des halls.

Interdits propres à cette direction : aucun avion, aucune valise, aucune carte d’embarquement, aucun ciel, aucune photo d’aéroport (le visuel « voyage » a déjà été rejeté). La métaphore passe uniquement par la typographie, la signalétique et les palettes. Pas de « vol », « embarquement », « décollage ». Vocabulaire permis : Arrivées, Destination, Porte (numérotation des rayons), Tableau.

## Palette

| Jeton | Valeur | Usage |
| --- | --- | --- |
| `--board` | `#0B0C0E` | Fond tableau, sections sombres, texte sur jaune et sur blanc |
| `--board-raised` | `#16181C` | Rangées alternées, tuiles de palettes |
| `--rule` | `#2B2F36` | Filets sur fond sombre |
| `--signal` | `#FFD000` | Jaune signalétique : action principale, sélection, focus, bandeaux pleine largeur |
| `--white` | `#FFFFFF` | Sections claires, fonds des photos (les photos produits sont sur fond blanc) |
| `--muted-dark` | `#A3A9B3` | Texte secondaire sur fond sombre |
| `--muted-light` | `#4A4F57` | Texte secondaire sur blanc ou jaune |

Répartition visée : environ 55 % sombre, 25 % blanc, 20 % jaune. **Le jaune en grandes surfaces** (barre de navigation pleine largeur, une bande entière, boutons), jamais en filets timides. Aucune autre couleur que celles des photos.

## Typographie

- **Signalétique et titres** : Barlow Condensed 600/700/800, capitales, interlettrage +0,01em. Slogan 112 à 128 px à 1440, interligne 0,9.
- **Texte** : Barlow 400/500/600, 15 à 18 px.
- **Palettes et données** (codes pays, prix, heures, numéros de porte) : Martian Mono 500/700, chiffres tabulaires.
- Échelle : 12 / 14 / 16 / 18 / 22 / 32 / 48 / 72 / 120.

## Grille et formes

12 colonnes, marges 56 px, gouttières 24 px à 1440. Angles vifs partout (0 px) sauf les pastilles de compteur. Filets de 1 ou 2 px alignés sur la grille. Espacements multiples de 8. Aucune ombre, sauf une ombre douce unique pour les panneaux flottants (menus, notifications).

## Composant signature : la palette (split-flap)

Un composant réutilisable en JS/CSS :

- Chaque caractère est une tuile (`--board-raised`, glyphe blanc ou jaune en Martian Mono 700), coupée à mi-hauteur par une ligne noire de 1 px, avec une moitié haute et une moitié basse.
- Basculement : la moitié haute pivote vers le bas (rotateX 0 → −90°), puis la nouvelle moitié basse se déplie (90° → 0), 60 à 90 ms par bascule, en passant par 3 à 6 caractères intermédiaires avant de se fixer. Transformations 3D avec perspective, timelines GSAP. Léger décalage aléatoire entre tuiles d’un même mot.
- Usages : code destination géant du hero (FRA/ESP/USA/MEX, tuiles d’environ 96×128 px), codes pays vendeurs dans le tableau (petites tuiles d’environ 22 px), numéros de porte des rayons (01 à 15), horloge, compteur d’offres.
- Les textes longs (noms d’offres, statuts) se résolvent avec ScrambleTextPlugin, jeu de caractères en capitales et chiffres, pour imiter le tableau qui se met à jour.
- Accessibilité : tuiles `aria-hidden`, le texte final dans un élément visuellement masqué.

## Sections

### 0. Bandeau démo
Noir, 36 px. Étiquette jaune « DÉMO », `DFD.demoNotice`, lien « Sources et licences » vers le pied de page.

### 1. En-tête (collant, fond `--board`)
- Rangée 1 (72 px, 56 px une fois compactée) : logo (carré jaune de 32 px avec une flèche épaisse noire ↘ des arrivées, puis « DutyFreeDeal » en Barlow Condensed 800 blanc ; le clic ramène en haut) ; recherche d’en-tête (apparaît quand la recherche du hero sort de l’écran, même brouillon) ; « Livraison » + code pays en mini-palettes + nom ▾ ; FR | EN ; Favoris (compteur) ; Panier (tuile jaune avec compteur).
- Rangée 2 : **barre de signalétique jaune pleine largeur** (48 px, 40 px compactée), pictogrammes noirs dans des carrés et libellés capitales : [▦ TOUS LES RAYONS ▾] [BONS PLANS →] [INTROUVABLES →], puis à droite [MES COMMANDES] [DEVENIR VENDEUR]. Cette barre jaune est l’identité : elle est là dès le premier écran.

### 2. Hero « Arrivées » (fond `--board`, hauteur de l’écran moins l’en-tête)
Composition en couches, **pas un split slogan/produits** :
- Bande haute sur toute la largeur : ligne d’info Martian Mono 13 px jaune, « ARRIVÉES · FRANCE · 14:32 » (heure locale réelle, mise à jour chaque minute en palettes), et, alignés à droite, « DESTINATION » + **l’énorme code destination en trois palettes** (FRA). Ce code est un bouton : il ouvre le menu de destination.
- Le slogan exact sur deux lignes, sur toute la largeur, Barlow Condensed 800 capitales, environ 120 px, blanc ; la deuxième ligne « SANS PASSER PAR L’AÉROPORT » en jaune. Au chargement, les lettres se résolvent en brouillage comme un tableau qui se met à jour (1,2 s maximum au total).
- Dessous, sur une rangée : à gauche la phrase d’explication (Barlow 20 px, `--muted-dark`, 48ch maximum) ; à droite, **la recherche principale dominante** : étiquette « Rechercher parmi les offres livrables en France » (pays dynamique), champ blanc de 72 px, texte noir 22 px, bouton jaune « Rechercher » avec loupe. Sous la recherche, cinq raccourcis en mini-panneaux (Parfums, Casques, Montres, Baskets, Cuisine) vers le catalogue : on clique avant même de taper, comme sur Amazon.
- En bas du hero, **la vitrine des 3 offres en trois « écrans » côte à côte sur toute la largeur** : chaque écran est une tuile photo sur fond blanc (`object-fit: contain`, marges intérieures) surmontée d’un bandeau noir façon tableau : route en mini-palettes « MEX → FRA », nom (Barlow 600 18 px), vendeur (« Mercado Horizonte · Démo » et « KYB vérifié · démo »), prix en Martian Mono 700 28 px jaune, « + 24,90 € de livraison » sur sa propre ligne, bouton jaune « Ajouter au panier » et cœur. Les écrans s’allument en séquence après le slogan (clip-path de haut en bas, 120 ms d’écart).
- Les trois écrans doivent être visibles dans le premier écran à 1440×900 et à 1280×800 (au moins photo, nom et prix). Ajuste les tailles pour y parvenir.

**Moment signature n°1 : changer de destination.** Les trois palettes géantes basculent (FRA → ESP), l’heure, les routes des écrans, la vitrine et le tableau des arrivées se remettent à jour en palettes. L’animation raconte exactement ce qui se passe : le catalogue change avec le pays.

### 3. Repères (bande blanche)
Trois colonnes séparées par des filets, chacune avec un gros numéro en palettes jaunes sur tuile noire : « Livrable en France » (le catalogue national réunit les offres du monde entier livrables dans votre pays) ; « Vendeurs vérifiés » (KYC pour les particuliers, KYB pour les entreprises, avant activation ; procédure simulée dans la maquette) ; « Un panier, un paiement » (expéditions organisées par vendeur ; paiement simulé). Animation : chaque repère descend comme un panneau suspendu (translateY −24 px → 0 avec clip), en décalé.

### 4. Le tableau des arrivées (fond `--board`, pleine largeur) : la section maîtresse
- En-tête de section : « ARRIVÉES » (Barlow Condensed 800, 96 px), « Toutes les offres livrables en France, comparées vendeur par vendeur », compteur en palettes (19), filtres en contrôle segmenté (Tout · Bons plans · Introuvables · Sur devis, sélection jaune).
- Un vrai tableau accessible (`table` avec en-têtes de colonnes) : visuel 72 px sur fond blanc · Pays du vendeur (palettes MEX) · Offre (nom 18 px blanc, rayon 13 px) · Vendeur (« · Démo » + badge KYB/KYC) · Délai indicatif · Prix (Martian Mono 700, 22 px) · Livraison (« + 24,90 € ») · Statut (« LIVRABLE » en jaune, « SUR DEVIS » en contour) · Action (« Ajouter » ou « Devis »).
- Rangées alternées `--board` / `--board-raised`. Survol ou focus d’une rangée : toute la rangée passe en jaune, texte noir, comme le vol surligné (120 ms).
- 12 premières rangées, puis un bouton « Afficher les N offres » qui déroule le reste avec la même animation.
- **Moment signature n°2 : le tableau se met à jour au scroll.** Quand il entre dans l’écran, les rangées se mettent à jour de haut en bas (ScrollTrigger.batch, 45 ms d’écart) : palettes pays qui basculent, noms et prix qui se résolvent en brouillage (600 ms maximum par rangée). Une seule fois.
- Changement de destination ou de filtre : GSAP Flip pour retirer, ajouter et réordonner les rangées, puis les nouvelles valeurs se résolvent en palettes. Annonce `aria-live`.

### 5. Bons plans | Introuvables (bande jaune pleine largeur, texte noir)
- Deux colonnes strictement égales séparées par un filet noir de 2 px. Chacune : pictogramme dans un carré noir, titre Barlow Condensed 800 capitales 88 px, phrase de `DFD.collections`, 4 offres en grille 2×2, lien « Voir les 9 bons plans livrables en France → ».
- Carte d’offre sur jaune : tuile blanche, bordure noire de 2 px, angles vifs ; photo sur blanc ; pays du vendeur en mini-palettes noires ; nom ; prix en Martian Mono 700 ; « + … de livraison » ; bouton noir « Ajouter au panier » à texte jaune ; cœur.
- Animation : les deux colonnes arrivent **en même temps** (gauche depuis la gauche, droite depuis la droite, symétriques) ; les cartes pivotent comme des panneaux qu’on retourne (rotateX −90° → 0, origine en haut, perspective 800 px), 80 ms d’écart.

### 6. Tous les rayons : « 15 portes » (fond `--board`)
- Titre « TOUS LES RAYONS », sous-titre calculé depuis les données (« 15 rayons · N catégories, des parfums aux maisons préfabriquées »), lien « Voir l’arborescence complète » qui ouvre le menu Tous les rayons.
- Grille : rangée 1 avec 3 grandes cartes (4 colonnes chacune, ratio 4:3) ; rangées 2 à 4 avec 4 cartes (3 colonnes, ratio 1:1). Les 15 visibles.
- Carte : photo du rayon pleine carte (désaturation légère de 15 % et contraste 1,05 pour l’accorder au noir) ; en bas, une **plaque de signalétique** : carré jaune avec le numéro de porte en palettes noires (« 07 »), nom du rayon en Barlow Condensed 700 capitales blanc sur noir, flèche ; sous la plaque, trois sous-catégories en 13 px et le nombre de catégories. Toute la carte est un lien vers le catalogue du rayon.
- Survol ou focus : la plaque passe en jaune à texte noir, la flèche avance de 6 px, la photo zoome à 1,04 (400 ms).
- Animation au scroll : les plaques descendent du plafond (clip-path de haut en bas) en vague de gauche à droite et de haut en bas, puis les numéros de porte basculent de 00 au bon numéro.

### 7. Gros biens sur demande (fond blanc)
Titre « SUR DEVIS » dans un panneau jaune. Deux grandes cartes horizontales (voiture, maison) : photo à 60 %, et à droite une fiche façon manifeste en lignes mono : Prix indicatif · Modalité : demande de devis ou de réservation · Acompte : aucun (démonstration) · Transport et délai : à préciser dans le devis. Bouton contour noir « Demander un devis » vers la fiche. Animation : la photo entre par un volet horizontal lié au scroll (scrub léger).

### 8. Comment ça marche (fond `--board`)
Quatre panneaux reliés par **une flèche jaune épaisse qui se dessine au scroll** (DrawSVG, scrub) : 1 Choisissez votre pays de livraison · 2 Comparez les offres, une fiche par vendeur · 3 Un panier, un paiement (simulé) · 4 Chaque vendeur expédie sa commande. La flèche matérialise le parcours.

### 9. Devenir vendeur (bande jaune)
« VENDEZ AU-DELÀ DE VOTRE PAYS », « Particuliers et entreprises, après vérification (KYC ou KYB). », bouton noir « Devenir vendeur ».

### 10. Pied de page (`--board`)
Colonnes Acheter / Vendre / Maquette, « Sources et licences » dépliable (`details`) listant `DFD.credits`, mention démo.

## Menus et retours

- **Tous les rayons** : panneau sous la barre jaune, fond `--board`, deux colonnes : à gauche les 15 rayons (numéro de porte + nom ; survol et flèches clavier = sélection jaune), à droite les sous-catégories du rayon choisi, une vignette et « Voir tout le rayon → ». Ouverture : les lignes se déroulent en palettes, 300 ms maximum.
- **Destination** : panneau listant les 4 pays (code mono + nom) ; le choix fait basculer les palettes partout.
- **Panier** : la tuile panier fait basculer son compteur en palette ; notification façon panneau en bas à droite (« AJOUTÉ · Parfum Signature 01 · Mercado Horizonte · Démo »), 3 s.

## Exigences de détail

Chiffres tabulaires partout ; prix avec centimes (« 82,00 € ») ; `text-wrap: balance` sur les titres, aucun mot seul en dernière ligne ; focus = contour jaune de 3 px décalé de 2 px (contour noir sur fond jaune) ; aucun texte gris sur jaune ; alignements stricts sur la grille.
