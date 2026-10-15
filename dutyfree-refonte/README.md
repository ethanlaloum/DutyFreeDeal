# DutyFreeDeal, refonte

Nouvelle maquette interactive de DutyFreeDeal, avec une direction artistique entièrement repensée. Étape en cours : **l'accueil abouti et ses interactions principales**, pour validation visuelle sur ordinateur (1280 et 1440 px). Les pages secondaires existent en version fonctionnelle simplifiée ; leur refonte détaillée et la recette mobile viennent après validation.

Les anciennes maquettes (`../dutyfree-maquette/`, `../dutyfree-prototype/`, `../vercel-prototype/`) et `../CLAUDE.md` n'ont pas été modifiés.

## Lancer l'aperçu

```sh
cd /Users/ethanlaloum/dev/DutyFreeDeal/dutyfree-refonte
python3 tools/serve.py          # équivalent : npm start
```

Ouvrir <http://127.0.0.1:4181/>. Le serveur (Python standard, aucune dépendance) désactive le cache : un simple rechargement montre l'état réel des fichiers. L'ancienne maquette reste sur le port 4180.

- Stockage local propre à la refonte : clé `dutyfreedeal-refonte-v1` (pays, langue, panier, favoris, demandes de devis).
- « Réinitialiser la démonstration », en pied de page, vide panier, favoris et demandes.
- Contrôle de syntaxe : `npm run check`. Tests d'interaction : `npm run qa` (navigateur ouvert avec `npx playwright-cli -s=refonte open http://127.0.0.1:4181/`).

## Direction : le catalogue mondial, édité pour votre pays

DutyFreeDeal se lit comme un **catalogue de vente par correspondance** (Manufrance, Manufactum, catalogues MUJI) imprimé pour le pays de livraison. Chaque offre est une entrée de catalogue : photo, vendeur et pays d'origine, prix, livraison à part. L'accueil en est la couverture, puis le sommaire.

- **Couverture** : slogan exact sur deux lignes, recherche dominante formulée par le pays de livraison (« Rechercher parmi les offres livrables en France »), et une **planche** de trois vraies photographies posées sur le même fond pierre, numérotées 1 à 3 comme dans un catalogue. La légende associée donne nom, trajet vendeur → livraison, prix et frais de livraison séparés.
- **Interaction signature** : survoler ou atteindre au clavier une entrée de légende soulève son objet sur la planche et atténue les autres. Changer de pays « réimprime » l'édition : la vitrine et les sélections se remplacent par des offres livrables, avec une courte transition.
- **Deux promesses à égalité** : Bons plans et Introuvables en diptyque strictement symétrique (même titre, même structure, mêmes actions).
- **Sommaire** : les 15 rayons en grandes cartes photo (3 larges, puis 3 rangées de 4), avec sous-catégories et nombre de catégories ; arborescence complète accessible.
- **Gros biens sur demande**, **Comment commander**, puis la **quatrième de couverture** (pied de page vert) avec l'invitation vendeur.

## Système de design (détail dans `DESIGN.md`)

| Élément | Choix | Raison |
| --- | --- | --- |
| Couleurs | Papier blanc, fond pierre `#eceeea`, encre vert-noir `#13221c`, une seule encre d'accompagnement : vert sapin `#105443` | Rompt avec le bleu nuit, l'ivoire et l'or rejetés ; le vert est réservé à l'action, à la sélection et au focus, ce qui rend chaque action principale évidente. |
| Typographie | Archivo (variable, axe de chasse 62 à 125 %), auto-hébergée | Une grotesque de catalogue : chasse élargie et grasse pour la marque et les titres, chasse normale pour les entrées ; chiffres tabulaires pour les prix. |
| Prix | Euros en gras, centimes et devise réduits ; livraison toujours sur une ligne séparée | Le prix produit est mis en avant, la livraison n'est jamais fondue dedans. |
| Formes | Planches photo à angles vifs, contrôles à 4 px, cercles réservés aux compteurs et aux renvois numérotés | Le papier découpé du catalogue, sans l'arrondi générique des marketplaces. |
| Profondeur | Une seule ombre teintée, pour les éléments flottants (menus, panier, notifications) | Les sections restent plates et lisibles. |
| Mouvement | Ouvertures de 140 à 340 ms en sortie exponentielle, réimpression au changement de pays, aucun effet en boucle ; tout est neutralisé en mouvement réduit | Chaque animation explique un changement d'état. |
| Icônes | Phosphor (MIT), sous-ensemble généré par `tools/build-icons.mjs` | Un seul trait cohérent, aucune icône dessinée à la main. |

Hiérarchie des boutons : le vert plein marque l'action principale du contexte (Rechercher sur la couverture, Ajouter au panier sur une fiche ou dans les résultats, Passer commande dans le panier, Voir tout le rayon dans le menu). Les ajouts depuis l'accueil sont en contour pour ne pas concurrencer la recherche.

## Comment les outils demandés ont servi

| Outil | Installation | Contribution réelle |
| --- | --- | --- |
| **Taste Skill** (Leonxlnx/taste-skill, `design-taste-frontend`) | `npx skills add … --skill design-taste-frontend`, copié dans `.claude/skills/` | Lecture du brief et réglages (variance 6, mouvement 4, densité 4), protocole de refonte complète, interdits appliqués : aucun tiret cadratin visible, aucun sur-titre, couleur d'accent unique, icônes d'une vraie bibliothèque, polices auto-hébergées, pas d'écouteur de défilement (IntersectionObserver), une seule intention par bouton (« Devenir vendeur » partout), checklist finale passée. |
| **Impeccable** (pbakaus/impeccable) | `npx impeccable install --providers=claude --scope=project`, déplacé dans ce dossier | `PRODUCT.md`, tirage de direction (`concept-seed` : la direction construite est la 3ᵉ de ma liste classée, renforcée par quatre disciplines des challengers écartés), contrat de direction (`.impeccable/surfaces/index-html.md`), plancher de qualité, détecteur sur fichiers et pages rendues (6 alertes corrigées), revue finale par un relecteur séparé, provenance intégrée aux 38 images, `DESIGN.md`. |
| **Playwright CLI** (microsoft/playwright-cli) | `npm i -D @playwright/cli`, skill installée dans `.claude/skills/` | Toutes les captures, la vérification des 15 rayons et des images, des débordements à 1280 et 1440 px, des états de focus et de survol, et 43 tests d'interaction (`tools/qa-interactions.js`). A révélé et permis de corriger : en-tête collant inopérant, rectangles blancs sur la planche, numéros mal placés, cache périmé du serveur. |
| **Awesome DESIGN.md** (VoltAgent/awesome-design-md, choisi par le porteur du projet) | Références copiées dans `references/awesome-design-md/` | Airbnb (recherche qui se replie dans l'en-tête), Wise (frais énoncés à part), DJI (couleur réservée à l'action), Meta et Apple (photographie sans habillage, une seule ombre) ; mydealz comme contre-exemple. Détail dans `references/awesome-design-md/README.md`. |

## Structure

| Emplacement | Rôle |
| --- | --- |
| `index.html` | Entrée, polices préchargées, hôtes de rendu, dialogues. |
| `css/tokens.css` | Jetons : couleurs, typographie, espacements, formes, ombres, mouvement, couches. |
| `css/base.css`, `components.css`, `home.css`, `pages.css` | Base et surfaces du navigateur, composants, accueil, pages secondaires. |
| `js/app.js` | Routeur, rendu, délégation des événements, conservation des brouillons et du focus. |
| `js/core.js`, `i18n.js` | État et stockage, accès aux données, prix ; textes FR/EN. |
| `js/header.js`, `search.js`, `cart.js`, `quote.js`, `toast.js` | En-tête, pays, langue, menu des rayons ; recherche avec suggestions ; panier multi-vendeurs ; demandes de devis ; notifications. |
| `js/views/` | Accueil, catalogue, fiche offre, pages secondaires. |
| `js/data.js`, `departments.js`, `credits.js` | Catalogue de démonstration copié de l'ancienne maquette ; images de rayons ; crédits. |
| `assets/` | Photos et illustrations en WebP (environ 2 Mo au lieu de 35), polices, favicon, `CREDITS.json`, prompts des illustrations. |
| `PRODUCT.md`, `DESIGN.md`, `.impeccable/` | Vérité produit, système visuel, contrat de direction, captures de revue. |
| `tools/` | Serveur local, génération des icônes, scripts Playwright. |
| `references/` | Références VoltAgent consultées. |

## Vérifications effectuées (13 octobre 2026, sur ordinateur)

- **Rendu à 1440×900 et 1280×800** : couverture entière dans le premier écran (slogan, recherche, légende et planche), aucun débordement horizontal, 24 images chargées sur l'accueil et aucune image cassée. Les 15 rayons sont présents en grandes cartes photo.
- **43 tests d'interaction** (`tools/qa-interactions.js`, tous réussis) : suggestions de recherche au clavier, Échap ; changement de pays avec nombre d'offres annoncé avant de basculer, focus rendu au contrôle, annonce pour lecteurs d'écran ; FR/EN avec le pays inchangé, clic sur la langue active sans effet ; menu des rayons au clavier, filtre et Échap ; ajout au panier, notification, tiroir groupé par vendeur, quantités ; favori ; recherche d'en-tête qui apparaît au défilement avec le même brouillon ; demande de devis avec erreurs puis confirmation, focus restauré ; logo qui remonte en haut ; recherche qui ouvre les résultats ; clé de stockage propre ; console sans erreur.
- **Conservation des recherches non envoyées** pendant le changement de pays, de langue, l'ajout au panier et les favoris.
- **Focus clavier visible** sur tous les contrôles (contour vert décalé, clair sur fond vert) ; ordre de tabulation logique ; survols discrets.
- **Mouvement réduit** : animations et transitions ramenées à 1 ms quand la préférence est active.
- **Contrastes** : textes ≥ 4,5:1 (texte secondaire 5,2:1 sur le fond pierre), bordures de champs ≥ 3:1.
- **Impeccable** : détecteur à 0 alerte sur l'accueil, le catalogue et la fiche ; revue finale par un relecteur séparé (verdicts successifs et corrections consignés dans `.impeccable/`).
- **Largeurs étroites** (390, 768 px) : aucun débordement horizontal ; c'est une vérification de structure, pas une recette mobile.

## Restant à faire

- **Validation visuelle** de cet accueil par le porteur du projet.
- **Recette mobile complète** (mise en page, menus et panier tactiles), seulement préparée par `css/adaptive.css`.
- **Refonte détaillée des pages secondaires** : catalogue et filtres, fiche offre, paiement de démonstration, commandes et suivi par vendeur, inscription vendeur KYC/KYB, espace vendeur, administration. Elles sont aujourd'hui fonctionnelles et simplifiées, ou annoncées « étape suivante ».
- **Photographies** : les photos réelles de la vitrine montrent des marques (CHANEL, SONY) alors que les offres sont fictives ; aucune meilleure photo libre sans marque n'a été trouvée (Wikimedia Commons ; Unsplash exige une authentification). À remplacer si tu disposes de photos libres ou fournies par des vendeurs.
- **Voiture et maison** : le même visuel sert à la carte du rayon et à l'offre sur demande (aucun outil de génération d'image disponible ici).
- **Mode sombre** : non traité à cette étape, par choix d'un monde « papier » clair.
- **Décisions ouvertes à ne pas inventer** : source des économies, référence de prix, commission, membership, KYC/KYB par pays, modalités des devis, transport, devises, service client.

## Sources et licences

Les photographies de la vitrine sont réelles (Wikimedia Commons) ; auteurs, licences et liens sont dans `assets/CREDITS.json` et sur la page « Sources et licences » de la maquette. Les offres, vendeurs et prix associés sont fictifs. Les images de rayons, la voiture et la maison sont des illustrations générées pour la maquette précédente ; leurs prompts exacts sont conservés et intégrés dans chaque fichier. Archivo : SIL Open Font License 1.1. Phosphor Icons : MIT.
