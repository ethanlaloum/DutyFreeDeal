# Direction C : « Laissez-passer »

## Position

**L’identité propre** de DutyFreeDeal, premium et vivante. Moins dense que A et B, mais riche : la valeur, la précision, le détail qui récompense le regard. L’abondance reste présente dans une section dédiée.

## Concept

Le duty free évoque des objets précis : le passeport, les tampons, les billets de banque. Cette direction en fait une identité : **DutyFreeDeal est votre laissez-passer vers les offres du monde, sans passer par l’aéroport.** Le langage visuel est celui de l’**impression de sécurité** : guillochis (rosaces et ondes de lignes fines générées mathématiquement, comme sur les billets et les passeports), microtexte, encres profondes et saturées, tampons encreurs, sceau holographique, zone de lecture automatique (MRZ). Premium = précision des traits, rigueur typographique ; vivant = encres riches, motifs qui se dessinent et tournent, tampons qui frappent.

Interdits propres à cette direction : ne reproduire ni un vrai passeport, ni un vrai billet, ni des armoiries, drapeaux officiels, « République française » ou emblème d’État ; aucune mention de douane, taxe, exonération, « détaxe », « hors taxes » (le slogan est la seule allusion) ; **pas d’or** (l’ancienne identité bleu nuit et or est rejetée) ; pas d’avion ni de valise ; pas de « luxe » générique en serif gris sur beige.

## Palette (encres sur papier)

| Jeton | Valeur | Usage |
| --- | --- | --- |
| `--cover` | `#5A1123` | Bordeaux couverture : hero, bande des gros biens, pied de page |
| `--cover-deep` | `#3E0A17` | Bandeau démo, ombres de reliure |
| `--paper` | `#FBF8F1` | Papier de sécurité, **toujours** couvert d’un guillochis à 5–7 % d’opacité : jamais un aplat beige mort |
| `--ink` | `#1C1220` | Texte |
| `--muted` | `#5F5566` | Texte secondaire sur papier (6,6:1) |
| `--violet` | `#5B2BD9` | Encre de tampon (7:1 sur papier ; texte blanc dessus 7,5:1) |
| `--vermilion` | `#C8321F` | Sceau, **action principale** (bouton vermillon, texte blanc 5,3:1) |
| `--teal` | `#0E6F6A` | Encre fiduciaire (5,6:1 sur papier) |
| `--ultramarine` | `#1F3FBF` | Encre fiduciaire (texte blanc 8,3:1) |

**Hologramme** : un dégradé conique irisé (cyan, magenta, jaune pâle) réservé au seul sceau « Vendeur vérifié », qui réagit au pointeur et au scroll. C’est le seul dégradé autorisé.

Répartition : le bordeaux en grandes surfaces (hero, gros biens, pied), le papier guilloché ailleurs, les encres pour les tampons, cadres, titres de section, rayons. Le vermillon reste rare et réservé à l’action.

## Typographie

- **Titres** : Bodoni Moda (axes opsz 6–96, wght 400–900, italique). Slogan en opsz 96, graisse 500–600, environ 112 à 128 px ; « sans passer par l’aéroport » en italique. Titres de section 64 à 88 px.
- **Texte et interface** : Schibsted Grotesk 400/500/700, 15 à 17 px ; petites capitales espacées pour la navigation et les étiquettes.
- **Données, codes, MRZ** : IBM Plex Mono 400/600, capitales, interlettrage 0,08em.
- **Prix** : Bodoni Moda 700, 28 à 40 px, « € » et centimes réduits : la valeur faciale d’un timbre ou d’un billet.

## Grille et formes

12 colonnes, marges 64 px, gouttières 24 px. Angles vifs pour les pages et cadres ; bords dentelés pour les timbres. Une seule ombre douce, pour les pages qui se superposent et les panneaux flottants.

## Générateurs à coder (SVG, aucune image)

- `guilloche(options)` : rosace hypotrochoïde ou épitrochoïde, 6 à 14 courbes superposées et décalées, traits de 0,6 à 1 px. Variantes : **rosace** (hero, sceau, pied de page), **bande d’ondes** (filets de section, bordure inférieure de l’en-tête, cadres de cartes), **fond de page** très léger (motif SVG répété à 5–7 % d’opacité).
- `stamp(options)` : tampon SVG (cercle, rectangle à double cadre ou ovale), texte circulaire via `textPath`, encre légèrement imparfaite (filtre SVG `feTurbulence` + `feDisplacementMap` très léger, et quelques manques d’encre), rotation entre −12° et 12° stable par id. Les tampons sont décoratifs (`aria-hidden`) : l’information qu’ils portent existe aussi en texte HTML lisible à côté.
- **Microtexte** : ligne de « DUTYFREEDEAL » répété en 5–6 px utilisée comme filet (`aria-hidden`).

## Sections

### 0. Bandeau démo
Fond `--cover-deep`, texte papier, IBM Plex Mono 12 px : `DFD.demoNotice` et lien « Sources et licences ».

### 1. En-tête (collant)
Fond papier guilloché très léger, bordure inférieure = bande d’ondes guillochée teal de 6 px. Logo : petite rosace vermillon de 28 px + « DutyFreeDeal » en Bodoni Moda 700, « Deal » en italique. Recherche d’en-tête (apparaît quand la recherche du hero sort de l’écran). « Livraison · FRA » en mono + « France » ▾ ; FR | EN ; Favoris ; Panier (compteur dans une pastille vermillon). Navigation en petites capitales : Tous les rayons ▾ · Bons plans · Introuvables · Mes commandes · Devenir vendeur.

### 2. Hero : la couverture (fond `--cover`)
Composition **centrée et verticale**, pas de split :
- Une grande **rosace guillochée** (environ 900 px, traits vermillon et rose pâle à 35 % d’opacité) centrée derrière le slogan, qui **se dessine au chargement** (DrawSVG, courbes décalées de 80 ms, 1,6 s au total), puis tourne lentement avec le défilement (rotation liée au scroll, 0 → 40° sur la hauteur du hero).
- Slogan exact centré, Bodoni Moda couleur papier, effet de gaufrage discret (ombre portée claire d’un côté, sombre de l’autre, 1 px), deuxième ligne en italique. Entrée : SplitText par lignes qui montent derrière un masque (900 ms, expo.out, 120 ms d’écart).
- Phrase d’explication centrée (Schibsted 19 px, papier à 85 %).
- **Recherche principale dominante** centrée, comme un champ de formulaire officiel : étiquette mono capitales « RECHERCHER PARMI LES OFFRES LIVRABLES EN FRANCE », champ papier de 68 px, texte encre 20 px, bouton vermillon « Rechercher ».
- **La vitrine en éventail** : les 3 offres de `DFD.showcaseFor` sont trois « pages-visas » en papier (environ 320×430), légèrement tournées (−7°, 0°, 6°), qui se chevauchent au centre et **sortent par le bas du hero** comme des pages qui dépassent du passeport. Chaque page : cadre guilloché fin dans sa propre encre, vraie photo, tampon rond violet du pays du vendeur (« VENDEUR · MEXIQUE · MEX → FRA »), nom en Bodoni, vendeur, prix (valeur faciale), « + 24,90 € de livraison » sur sa ligne, bouton « Ajouter au panier », cœur. Au premier écran (1440×900 et 1280×800), on doit voir au moins le haut des trois pages, photos et tampons compris. Ajuste les tailles.
- **Zone MRZ** au bas de la couverture : deux lignes IBM Plex Mono 16–18 px, papier à 70 %, calculées depuis les données (`aria-hidden`) :
  `P<FRA<DUTYFREEDEAL<<SANS<PASSER<PAR<L<AEROPORT<<<<<<<<`
  `19<OFFRES<LIVRABLES<<MEX<USA<ESP<FRA<<<<<<<<<<<<<<<<<<`
  Code destination, nombre d’offres et pays des vendeurs sont dynamiques. Elle se résout en brouillage au chargement et à chaque changement de destination.

### 3. La vitrine s’ouvre : moment signature n°1 (section épinglée, scrub)
En faisant défiler, **la couverture s’ouvre** : le panneau bordeaux pivote autour de son bord gauche (rotateY 0 → −165°, perspective 2000 px) et découvre la page papier guillochée dessous ; en même temps, l’éventail se redresse et s’étale en une rangée de trois pages alignées, lisibles, à plat sur la page découverte (rotations → 0, écartement, légère mise à l’échelle). L’animation explique le passage : de la vitrine à la comparaison des offres.
Repli acceptable si la couverture 3D pose problème (performance, lisibilité) : l’éventail se redresse et s’étale pendant que le fond passe du bordeaux au papier par un volet. Mentionne le choix dans ton rendu.

Puis, sur cette page, **les trois repères frappés comme des tampons**, un par un au scroll (scale 1,6 → 1, rotation −14° → −6°, opacité 0 → 0,92, 220 ms, power4.in, petite secousse de la page de 1 à 2 px à l’impact) :
- tampon rond violet « LIVRABLE EN FRANCE », texte : le catalogue national réunit les offres du monde entier livrables chez vous ;
- tampon rectangulaire à double cadre teal « VENDEURS VÉRIFIÉS », texte : KYC pour les particuliers, KYB pour les entreprises, avant activation ; procédure simulée dans la maquette ;
- tampon ovale vermillon « UN PANIER · UN PAIEMENT », texte : expéditions organisées par vendeur ; paiement simulé.

### 4. Bons plans | Introuvables : la double page
Deux pages papier face à face séparées par une reliure centrale (ombre intérieure douce et couture en pointillés), poids strictement égal. Page gauche : bande guillochée teal, titre Bodoni « Bons plans », phrase, 3 offres en liste (vignette, nom, vendeur, pays du vendeur, prix, livraison, ajouter) ; page droite : bande violette, « Introuvables », même structure. Numéros de page en bas (« 4 », « 5 ») et ligne de microtexte. Animation : en entrant, les deux pages s’ouvrent depuis la reliure (rotateY ±25° → 0 autour du centre, simultanées).

### 5. Toutes les offres : l’album de timbres (abondance) : moment signature n°2
Sur papier, une planche de timbres : **chaque offre est un timbre à bords dentelés** (masque CSS en dégradés radiaux) : photo, **valeur faciale** dans un coin (prix en Bodoni 700), pays du vendeur imprimé verticalement le long du bord (« MEXIQUE » en mono), nom, vendeur, « + 19,90 € de livraison », bouton « Ajouter ». 4 par rangée, toutes les offres livrables, onglets de filtre (Tout · Bons plans · Introuvables · par pays du vendeur) avec réorganisation GSAP Flip. Animation : les timbres arrivent par lots, chacun posé avec une légère rotation stable (−2° à 2°) qui se redresse, comme collés dans un album. Survol : le timbre se soulève (−4 px, ombre douce) et un reflet guilloché le traverse.

### 6. Les 15 rayons : les pages de visas
Grille éditoriale, les 15 visibles : rangée 1 avec 3 grandes cartes (ratio 4:5), puis 3 rangées de 4 (ratio 1:1). Chaque carte : cadre guilloché fin dans une encre (cycle violet, teal, vermillon, ultramarine, bordeaux), « N° 07 » en Bodoni italique, photo du rayon avec traitement à l’encre (photo en couleur + calque de l’encre de la carte en `mix-blend-mode: color` à 25 % : les illustrations beiges s’accordent à l’encre sans devenir monochromes), nom du rayon en Bodoni 600, trois sous-catégories en petites capitales, nombre de catégories en mono. Un petit tampon rond de l’encre de la carte (numéro du rayon) frappe dans le coin quand la carte entre dans l’écran. Survol ou focus : l’encre se retire (couleurs naturelles), le cadre guilloché s’anime.

### 7. Gros biens sur demande : les certificats (bande `--cover`)
Deux documents papier façon certificat (large bordure guillochée, sceau vermillon) pour la voiture et la maison : photo, champs remplis en mono (Prix indicatif : 24 900 € · Modalité : demande de devis ou de réservation · Acompte : aucun, démonstration · Transport et délai : à préciser dans le devis), bouton « Demander un devis ». Animation : le sceau frappe, les champs se remplissent en brouillage.

### 8. Devenir vendeur : le sceau holographique
Grand sceau rond irisé (dégradé conique + guillochis gravé + texte circulaire « VENDEUR VÉRIFIÉ · KYC · KYB · DÉMO ») qui réagit au pointeur (rotation de teinte) et au défilement. Texte : « Vendez au-delà de votre pays. Particuliers et entreprises, après une vérification adaptée au pays du vendeur. Procédure simulée dans la maquette. » Bouton vermillon « Devenir vendeur ».

### 9. Pied de page : la quatrième de couverture
Fond `--cover`, rosace, liens, « Sources et licences » dépliable listant `DFD.credits`, mention démo, MRZ finale.

## Menus et retours

- **Tous les rayons** : panneau papier façon sommaire : à gauche la liste N° 01 à 15 en Bodoni, à droite les sous-catégories du rayon choisi, une vignette et « Voir tout le rayon → ». Ouverture : la page glisse avec un léger pivot (rotateX 8° → 0).
- **Ajout au panier** : un petit tampon vermillon « AJOUTÉ » frappe sur la carte (220 ms), le compteur rebondit ; notification papier à bord guilloché.
- **Destination** : la MRZ et les tampons de la vitrine se réimpriment (brouillage et nouveau tampon qui frappe), les listes se mettent à jour avec Flip.

## Exigences de détail

Traits de guillochis nets (pas de flou), précis, jamais épais ; Bodoni seulement à grande taille (jamais sous 20 px, l’interface reste en Schibsted) ; `text-wrap: balance` sur les titres ; chiffres tabulaires en Schibsted pour les données ; focus = contour vermillon de 2 px décalé de 3 px (papier sur bordeaux) ; tous les tampons ont leur équivalent texte lisible.
