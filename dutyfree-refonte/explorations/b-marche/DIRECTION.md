# Direction B : « Marché mondial »

## Position

Le côté **Alibaba** du curseur : couleur, abondance, vendeurs du monde au premier plan. L’énergie vient de la **couleur à l’échelle de la page**, d’une **échelle typographique extrême** et de la **quantité de produits visibles**.

## Concept

**Le grand marché du monde, en affiches.** Une grille suisse rigoureuse remplie de grands aplats de couleurs franches, de produits détourés à très grande échelle et de prix énormes, comme les affichettes de prix des marchés. **Chaque pays de vendeur a sa couleur** : l’origine des vendeurs se lit d’un coup d’œil, la couleur a une fonction.

Références de vernaculaire réel (pas des sites web) : les affichettes de prix des marchés (mercados mexicains, marchés de quartier européens), les affiches typographiques suisses des années 1960, les pastilles autocollantes rondes des étals.

Interdits propres à cette direction : pas de néo-brutalisme (pas de bordures noires épaisses sur tout, pas d’ombres portées décalées dures, pas de pastels) ; pas d’étoiles « prix choc », de « PROMO », de pourcentages ; pas de dégradés ; pas de bandeau de texte défilant ; aucun cliché national (sombrero, taureau, drapeau géant, statue de la Liberté) : un pays s’exprime seulement par sa couleur-code et son nom.

## Palette

| Jeton | Valeur | Texte dessus | Usage |
| --- | --- | --- | --- |
| `--ink` | `#0F0E12` | blanc | Texte, boutons principaux, sections noires |
| `--white` | `#FFFFFF` | encre | Respirations, bandes de texte |
| `--mx` | `#E4007C` (rosa mexicano) | **blanc** | Vendeurs au Mexique |
| `--us` | `#2C3BFF` | blanc | Vendeurs aux États-Unis |
| `--es` | `#FF4B1F` | **encre** | Vendeurs en Espagne |
| `--fr` | `#FFD60A` | encre | Vendeurs en France |
| `--lime` | `#C8F03C` | encre | Sections, rayons (couleur hors code pays) |
| `--violet` | `#7B3CFF` | blanc | Sections, rayons (couleur hors code pays) |
| `--sky` | `#8FD3FF` | encre | Sections, rayons (couleur hors code pays) |

Règles : chaque section a **un aplat dominant pleine largeur** ; on alterne aplats saturés et blanc ; jamais deux aplats de même couleur côte à côte. Les quatre couleurs-pays sont réservées à l’information « pays du vendeur » (étals, pastilles, filtres) ; les sections et rayons utilisent aussi lime, violet et ciel. Action principale : **noir plein, texte blanc**, lisible sur toutes les couleurs. Vérifie chaque couple texte/fond (AA) : blanc sur `--mx` et `--us` et `--violet`, encre sur `--es`, `--fr`, `--lime`, `--sky`.

## Typographie

- **Affiche** : Anybody (variable : `wdth` 50–150, `wght` 100–900), titres en 800–900. **La largeur est un moyen d’expression** : très étroit (wdth 50–60) pour les prix et grands chiffres, très large (wdth 125–150) pour les mots-titres courts.
- **Texte** : Instrument Sans 400/500/600, 15 à 18 px.
- **Prix** : Anybody 900 wdth 55, très grands (cartes 44–56 px, hero 120–160 px), centimes réduits en exposant, « € » réduit.
- Échelle extrême : 12 / 14 / 16 / 20 / 28 / 44 / 72 / 120 / 200+.

## Grille et formes

12 colonnes, marges 40 px, gouttières 16 px à 1440 (dense, comme une affiche). Angles vifs pour les aplats ; seules les pastilles (pays, compteurs) sont rondes. Pas d’ombre, sauf panneaux flottants.

## Composants

- **Pastille pays** : rond de 40 à 56 px, couleur-pays, code ISO2 (MX, US, ES, FR) en Anybody 900, légère rotation entre −8° et 8°, stable pour une offre donnée (dérivée de son id). Toujours accompagnée du texte « Vendeur au Mexique » (précision : pays du vendeur, pas lieu de fabrication).
- **Carte « étal »** : un aplat de la couleur du pays du vendeur (ratio environ 1:1,15) qui porte le produit. Si `cutout` existe, le détouré est posé directement sur l’aplat, grand, débordant légèrement ; sinon la photo (fond blanc) est présentée dans un panneau blanc à angles vifs au centre de l’aplat. Pastille pays en haut à gauche, prix géant en bas à gauche (couleur du texte selon le contraste). Sous l’aplat, sur bande blanche : nom (lien vers la fiche), vendeur, « + 19,90 € de livraison » sur sa ligne, bouton carré noir « Ajouter au panier » (icône + libellé accessible) et cœur.
- **Bouton principal** : rectangle noir, texte blanc 16 px 600, 52 px de haut ; au survol, il prend la couleur du contexte en texte encre ou blanc selon le contraste.

## Sections

### 0. Bandeau démo
Noir, texte blanc : `DFD.demoNotice` et lien « Sources et licences ».

### 1. En-tête (collant, blanc)
Logo « DutyFreeDeal » en Anybody 900 wdth 140 (très large), suivi de quatre petites pastilles aux couleurs-pays, qui disent « le monde » sans drapeau. Recherche d’en-tête (apparaît quand la recherche du hero sort de l’écran). « Livraison » + pastille pays + nom ▾ ; FR | EN ; Favoris ; Panier (pastille compteur). Rangée de navigation : Tous les rayons ▾ · Bons plans · Introuvables · Mes commandes · Devenir vendeur. Se compacte au défilement.

### 2. Hero « trois étals »
Composition empilée sur toute la largeur, **pas de split slogan/produits** :
- **Rangée 1 (blanche)** : le slogan exact sur **une seule ligne pleine largeur**, Anybody 900 étroit, environ 80 à 96 px, encre. Au chargement, la largeur des lettres s’ouvre (wdth 50 → valeur finale, 900 ms, expo.out) : le monde qui s’ouvre.
- **Rangée 2 (blanche)** : à gauche la phrase d’explication (20 px, 5 colonnes) ; à droite **la recherche principale dominante** (7 colonnes) : étiquette « Rechercher parmi les offres livrables en France », champ de 64 px à bordure encre 3 px, bouton noir « Rechercher ».
- **Rangée 3 : les trois étals**, trois colonnes égales pleine largeur, chacune un aplat de la couleur du pays du vendeur de l’offre vitrine (pour la France : rose MX, bleu US, orange ES). Dans chaque étal, le détouré du produit à très grande échelle (environ 60 % de la hauteur de l’étal), en bas : pastille pays, « Vendeur au Mexique · Mercado Horizonte · Démo », nom, **prix géant** (Anybody 900 wdth 55, 120 px ou plus), « + 24,90 € de livraison », bouton « Ajouter au panier ».
- À 1440×900 et 1280×800, le premier écran doit montrer le slogan, la recherche et le haut des trois étals avec les produits (prix visibles si possible). Ajuste les tailles.
- Au scroll : parallaxe à des vitesses différentes pour les trois détourés (yPercent −10, −20, −14), avec une légère rotation liée au défilement (±4°). Les étals deviennent vivants sans gêner la lecture.

**Moment signature n°1 : le réassort.** Changer de destination : chaque étal passe à la couleur du pays de son nouveau vendeur (transition de couleur de fond 500 ms), l’ancien produit glisse vers le bas et sort, le nouveau descend d’en haut, 100 ms d’écart entre les étals. Le marché se réapprovisionne pour votre pays.

### 3. « Le monde entier, livrable chez vous »
Bande typographique construite depuis les données : « **19** offres livrables en France », puis « de vendeurs au » [pastille MX] Mexique, [US] États-Unis, [ES] Espagne, [FR] France. Le grand nombre compte de 0 à la valeur quand la bande entre (c’est la taille du catalogue national), les pastilles se collent ensuite avec un rebond (back.out) et une rotation qui se pose. En dessous, les trois repères en trois blocs d’aplats (lime, ciel, violet) avec grand numéro : Livrable dans votre pays · Vendeurs vérifiés (KYC particuliers, KYB entreprises, simulé) · Un panier, un paiement (expéditions par vendeur, simulé).

### 4. « Tout le marché » : le mur d’abondance
- Titre géant « TOUT LE MARCHÉ » dont la largeur s’étire au scroll (wdth 50 → 150, scrub) pendant que la section entre : le marché s’ouvre sur toute la largeur.
- Barre de filtres collante sous l’en-tête pendant cette section : Tout · Bons plans · Introuvables, puis les quatre pastilles-pays en interrupteurs (filtrer par pays du vendeur, `aria-pressed`), et un choix de rayon. Chaque filtre réorganise la grille avec GSAP Flip.
- Grille dense de 4 colonnes de cartes « étal », **toutes** les offres achetables livrables. Rythme d’affiche : une carte sur sept occupe 2×2 avec un prix encore plus grand (choix de mise en page uniquement, sans aucune signification promotionnelle).
- **Moment signature n°2 : l’étal qui se monte.** Par lots au scroll : l’aplat de couleur monte (clip-path depuis le bas), puis le produit surgit (scale 0,85 → 1, rotation −6° → 0, back.out), puis la pastille se colle. 60 ms d’écart. Une seule fois.

### 5. Bons plans | Introuvables
Deux grands aplats égaux côte à côte : Bons plans sur `--lime` (encre), Introuvables sur `--violet` (blanc). Chacun : titre géant (Anybody 900 wdth 130, environ 120 px), phrase, 3 offres, lien « Voir les N … livrables en France ». Au scroll, la largeur des deux titres s’anime **en même temps** : la symétrie dit l’importance égale.

### 6. Les 15 rayons : le mur d’affiches 5 × 3
- Quinze cartes en 5 colonnes × 3 rangées (exactement 15, toutes visibles), ratio 3:4.
- Chaque carte : un aplat de couleur (cycle sur les sept couleurs, jamais deux voisines identiques, ni horizontalement ni verticalement) et l’image du rayon **en duotone** : image en niveaux de gris, contraste renforcé, `mix-blend-mode: multiply` sur l’aplat (les illustrations beiges deviennent des affiches de couleur). Nom du rayon en Anybody 900 (largeur ajustée pour tenir), nombre de catégories, trois sous-catégories.
- Survol ou focus : l’image retrouve ses vraies couleurs (filtre, 400 ms), le nom s’élargit (wdth +20).
- Animation au scroll : vague depuis le centre de la grille (`stagger: { grid: [3, 5], from: 'center' }`), aplats qui passent de 0,9 à 1 avec une rotation qui se pose, puis les images apparaissent.

### 7. Gros biens sur demande
Fond noir, titre « VOITURES ET MAISONS, SUR DEVIS » en Anybody blanc très large. Deux grandes images (voiture, maison) avec pastilles « Prix indicatif 24 900 € » et « Devis ou réservation · aucun acompte (démo) », bouton blanc « Demander un devis ». Au scroll, les images passent de scale 1,15 à 1 (scrub).

### 8. Devenir vendeur
Aplat `--sky` : « Vendez au-delà de votre pays. » « Particuliers et entreprises, après vérification (KYC ou KYB). » Bouton noir « Devenir vendeur ».

### 9. Pied de page
Noir : liens, « Sources et licences » dépliable, mention démo, rappel des pastilles-pays.

## Menus et retours

- **Tous les rayons** : panneau sous l’en-tête avec la grille 5×3 des rayons en tuiles de couleur (mêmes couleurs que le mur) ; sélection d’un rayon = sous-catégories à droite et « Voir tout le rayon → ». Ouverture : tuiles en vague, 350 ms maximum.
- **Ajout au panier** : un clone du produit **vole en arc** jusqu’à l’icône du panier (450 ms), puis le compteur rebondit (scale 1,3 → 1). On voit où l’objet est parti. Notification en forme de pastille « Ajouté au panier ».
- **Destination** : panneau listant les 4 pays avec leur pastille.

## Exigences de détail

Rotations des pastilles stables ; jamais d’ombre portée ; `text-wrap: balance` sur les titres ; chiffres tabulaires pour les prix courants ; focus = contour encre de 3 px doublé d’un liseré blanc de 2 px (visible sur toutes les couleurs) ; les aplats bord à bord, sans marges blanches parasites entre sections.
