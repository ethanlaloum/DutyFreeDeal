---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: ["js/app.js","js/views/home.js","css/home.css","css/components.css"]
---

# Accueil DutyFreeDeal (refonte)

## Scope

Surface : page d'accueil (`index.html`, route `#/`) et ses interactions principales (navigation, menu des rayons, recherche, destination, langues). Mode visiteur : Persuade. Validation sur ordinateur d'abord (1280 et 1440 px) ; la recette mobile vient ensuite.

## Audience, job, action

Particulier chez lui sur un ordinateur, avec une envie précise (un parfum, un casque) ou en curiosité ; le porteur du projet présente aussi la maquette à des partenaires. Il doit comprendre en un écran que le catalogue réunit des vendeurs de plusieurs pays et ne montre que ce qui est livrable chez lui, croire aux deux promesses (prix avantageux, produits difficiles à trouver), puis agir : chercher, ajouter au panier ou ouvrir l'un des 15 rayons.

## Proof and constraints

Vraies photographies (Wikimedia Commons, crédits conservés) ; offres, vendeurs, prix et délais fictifs et signalés comme tels. Aucune remise, garantie, commission ni règle opérationnelle inventée. Slogan exact, 15 rayons visibles en grandes cartes photo, pays de livraison distinct de la langue, prix produit mis en avant et livraison séparée.

## Direction contract

THESIS: DutyFreeDeal se lit comme un catalogue mondial de vente par correspondance, imprimé pour le pays de livraison : chaque offre est une entrée de catalogue (photo, vendeur et pays d'origine, prix, livraison à part) et l'accueil en est la couverture puis le sommaire. Refus de l'arrangement par défaut du secteur : bandeaux promotionnels en carrousel, tuiles promo et rangées de cartes identiques.

OWN-WORLD: papier couché blanc et fonds de planche gris pierre ; une seule encre d'accompagnement, vert sapin profond, qui tient le bandeau d'édition, l'onglet actif, l'action principale et la quatrième de couverture (pied de page) ; texte en noir teinté de vert. Archivo en plusieurs chasses : étendue et grasse pour la marque et les titres de chapitres, normale pour les entrées. Prix composés comme dans un catalogue (euros gras en chiffres tabulaires, centimes plus petits). Filets fins entre les entrées, numéros de renvoi sur la planche. Planches photo à angles vifs, contrôles à 4 px.

STORY: En un écran, le visiteur comprend que le catalogue rassemble des vendeurs de plusieurs pays, filtré sur ce qui part vers chez lui ; il croit aux deux promesses parce que la planche montre de vrais objets avec le pays du vendeur, le prix et la livraison énoncés séparément ; il cherche, ajoute au panier ou ouvre un chapitre parmi les 15 rayons.

FIRST VIEWPORT: À 1440×900 : bandeau d'édition de démonstration (36 px) ; en-tête de 72 px (marque, pays de livraison, langue, favoris, panier) ; rangée d'onglets de 48 px (Tous les rayons, Bons plans, Introuvables ; Mes commandes, Vendre). Puis la planche de couverture sur toute la largeur : slogan sur deux lignes vers 64 px en haut à gauche, phrase explicative de moins de 20 mots, recherche principale formulée « Je cherche… livrable en France » comme action dominante ; sur les 60 % de droite, trois vraies photos posées sur le fond pierre à des échelles différentes, avec renvois 1 à 3 ; au pied de la planche, une légende filetée des trois offres : renvoi, nom, pays du vendeur vers pays de livraison, prix, livraison, ajout au panier.

FORM: catalogue de vente par correspondance de choses introuvables (Manufrance, Manufactum, catalogues MUJI), position 3 sur ma liste ordonnée de sept, attribuée par le tirage enregistré dans .impeccable/questions/roll.json et reproduit à l'identique dans .impeccable/questions/roll-reproduction.txt (ASSIGNED INDEX 3, mêmes six challengers) ; seed: none (unavailable). Construction pilotée par le code (aucun outil de génération d'image disponible). Interaction signature : planche et légende liées (survol ou focus d'une entrée ↔ mise en évidence de l'objet), et réimpression de l'édition quand le pays de livraison change.

Raised by declined challengers:
- Raise (Rietveld, maison à panneaux coulissants) : la couleur est rationnée aux bords qui changent d'état ; le vert n'apparaît que sur l'action, la sélection et le focus, jamais en décoration.
- Raise (forge à marteau-pilon) : chiffres tabulaires alignés comme des mesures ; prix et frais de livraison tabulaires et alignés dans les légendes et le panier.
- Raise (algorave) : un changement est visible avant de s'appliquer ; le menu des pays annonce le nombre d'offres livrables avant de basculer.
- Raise (signal de diffusion dégradé) : un repère d'état fixé à un seul endroit ; pays de livraison et langue occupent toujours la même place de l'en-tête.

Grounded list ordered by resonance before the roll was applied (the roll assigned position 3; it printed no SEED REFERENCE line, hence seed: none):
1. Grand magasin : tableau des étages et sac signature (sélection d'Impeccable, risque : luxe familier de grand magasin).
2. Étiquette de colis et déclaration en douane (« De / À »).
3. Catalogue de vente par correspondance de choses introuvables (construit).
4. Style typographique international (multilingue, grilles).
5. Couloir vert « Rien à déclarer » (lecture littérale de l'aéroport, une seule candidate).
6. Vitrine de musée et cartel de provenance.
7. Étiquette de prix en rayon et ticket de caisse.

Alternates kept: ruban de provenance muséal (compétitif sur la clarté produit) ; tableau à palettes de gare (compétitif sur l'identification). Choix de direction délégué par l'utilisateur dans son brief (« présente brièvement la direction choisie, puis construis ») : pas de page de décision interactive.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Applied after the finish review

Encre verte retirée des éléments décoratifs (seconde ligne du slogan, icônes de titres, flèches de trajet) ; ligne d'édition imprimée dans le bandeau (« Édition France, en français ») ; Comment commander en page de conditions filetée ; gros biens avec bloc de caractéristiques fileté ; reflet du parfum rogné pour un sol commun.

## Unresolved

Photos réelles de la vitrine avec marques visibles (parfum, appareil photo) : à remplacer si de meilleures photos libres sans marque sont trouvées. Mode sombre non traité à cette étape. Pages secondaires (catalogue, fiche, panier, commande, vendeur, administration) à développer après validation de l'accueil.
