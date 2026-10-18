# DutyFreeDeal contexte produit et consignes de refonte

Contexte établi au 13 octobre 2026. La version à reprendre est `dutyfree-maquette/`, dans `/Users/ethanlaloum/dev/DutyFreeDeal`. Les instructions les plus récentes de l’utilisateur priment sur ce document. Une refonte doit améliorer l’expérience et la présentation tout en conservant les décisions métier confirmées ci-dessous.

## Intérêt du projet

DutyFreeDeal est un projet de marketplace internationale destiné à augmenter le pouvoir d’achat des particuliers et à leur donner accès à des produits difficiles à trouver dans leur pays. Les deux promesses ont la même importance : des prix avantageux et l’accès à des offres inhabituelles ou peu accessibles localement.

Le concept a été discuté avec Reynald Vito Grattagliano, appelé Vito dans les échanges. Les notes parlent d’un mélange entre Alibaba et Amazon : des fournisseurs et vendeurs du monde entier, réunis dans une expérience d’achat simple. L’utilisateur porte la construction de la maquette et vient de la tech ; il attend une aide sur le produit, l’UX et la direction artistique, avec des raisons précises derrière chaque choix.

L’intention de marque est de rendre le duty free accessible sans passer par l’aéroport. Vito évoque le commerce parallèle pour expliquer le modèle. Le circuit d’approvisionnement, le mécanisme d’économies et les preuves de l’avantage commercial restent à préciser : ne pas les inventer. Le positionnement international, à lui seul, ne démontre pas une différence exclusive avec Amazon.

**Précision de l’utilisateur, 15 octobre 2026.** Le but de la plateforme est d’acheter moins cher. Ce n’est pas vraiment du duty free : aucune taxe n’est supprimée, c’est l’écart de prix qui doit donner l’impression d’acheter sans taxe. Le site ne promet donc aucune exonération. Le 15 octobre 2026, le client a reporté à plus tard la question des Introuvables, leur règle comme leur poids face au prix (Q-03 et Q-29 du cahier des charges) ; d’ici là, l’entrée Hard to find reste, alimentée à la main par l’équipe.

**Consigne du client, rapportée le 15 octobre 2026.** DutyFreeDeal fonctionne globalement comme les marketplaces existantes, Amazon en tête : ne pas réinventer la roue. Tout sujet qui a une réponse standard (compte, paiement, retours, réclamations, versements, avis, messagerie, frais de livraison, vérification des vendeurs, back office…) se tranche d’office selon ces pratiques, sans attendre le client ni l’utilisateur. Seuls les choix propres au projet leur sont soumis. Restent ouverts : source de l’avantage prix, commission, membership, pénalité financière de retard, société, écart de prix visé, paiement des gros biens.

Pour l’acheteur, la plateforme doit permettre de trouver une offre livrable chez lui, comprendre le produit et son vendeur, voir le prix et la livraison, puis acheter simplement. Pour le vendeur, elle doit permettre de proposer son catalogue au-delà de son marché local. Le back office doit donner une vue sur les vendeurs, les offres, les commandes et les problèmes à traiter.

L’ambition exprimée est une marketplace à terme plus vaste qu’Amazon, couvrant tous les univers de vente. C’est une vision de projet, pas une affirmation de taille, de trafic ou de catalogue déjà atteint.

## Décisions métier confirmées

| Sujet | Décision à conserver |
| --- | --- |
| Acheteurs au lancement | Particuliers uniquement. |
| Vendeurs | Particuliers et entreprises, après vérification. |
| Vérification | KYC pour les particuliers et KYB pour les entreprises ; vérification stricte adaptée au pays du vendeur. Les procédures exactes restent ouvertes. |
| Produits au lancement | Produits physiques neufs uniquement. Pas d’occasion ni de reconditionné. |
| Stock et expédition | Chaque vendeur gère son stock et expédie ses commandes. Aucun entrepôt DutyFreeDeal n’a été décidé ; ne pas déduire la propriété du stock. |
| Organisation internationale | Une seule plateforme avec des versions nationales, ouverte au monde entier : tous les pays, côté acheteurs comme côté vendeurs, sans liste de lancement (décision du client, 15 octobre 2026). Seule limite, imposée par la loi : les pays et personnes visés par des sanctions internationales. Chaque vendeur choisit les pays qu’il livre. France, Espagne, États-Unis et Mexique restent les quatre pays d’exemple de la maquette. |
| Catalogue national | Toutes les offres mondiales livrables dans le pays choisi. DutyFreeDeal France ne se limite pas aux vendeurs français. |
| Présentation des offres | Une fiche séparée pour chaque offre de vendeur, même lorsque le produit neuf est identique à celui d’un autre vendeur. |
| Prix | Prix produit mis en avant ; livraison affichée séparément. |
| Achat auprès de plusieurs vendeurs | Un seul panier et un seul paiement sur DutyFreeDeal, avec des expéditions organisées par vendeur. |
| Gros biens | Voitures et maisons préfabriquées passent par une demande de devis ou de réservation. Aucun acompte ni réservation confirmée n’a été défini. |
| Navigation | Recherche visible dès l’arrivée ; trois entrées principales : Tous les rayons, Bons plans, Introuvables (en anglais : All departments, Deals, Hard to find). |
| Publicité | Une marque ou un vendeur qui paie apparaît en tête des résultats de recherche, avec la mention « Sponsored », comme sur Amazon (décision du client, 15 octobre 2026). Paiement au clic, par enchère. |
| Langue du site | **Anglais uniquement** depuis le 14 octobre 2026 (nouvelle version `dutyfree-studio/`) : aucun texte français dans l’interface, plus de sélecteur de langue. Les versions précédentes restent bilingues français et anglais. Le pays de livraison reste un réglage. |
| Données de présentation | Catalogue de démonstration autorisé, clairement signalé : produits, vendeurs, prix, stocks, délais et statuts fictifs. |
| CORE | Autre morceau du projet, reporté à plus tard. Ne pas en inventer la nature ni l’intégrer maintenant. |

À terme, les idées comprennent aussi les biens virtuels, les services, les croisières ou les places de parking. Cette ambition ne change pas le périmètre de lancement physique et neuf. Auto et moto doit inclure les véhicules eux-mêmes ainsi que les pièces, équipements, accessoires et entretien ; Construction doit pouvoir accueillir l’habitat préfabriqué.

## Modèle commercial encore ouvert

Les notes mentionnent « 15 % net du prix global », un membership fournisseur, une vérification bancaire et une pénalité en cas de retard d’expédition. La vérification bancaire est confiée au prestataire de paiement, comme sur les grandes marketplaces. Les bases de calcul, conditions et montants de la commission, du membership et d’une éventuelle pénalité financière ne sont pas décidés. La publicité payante, elle, est décidée (tableau ci-dessus). Une identité d’entreprise américaine est évoquée ; ne pas présenter une société américaine comme déjà constituée.

Le premier interlocuteur du client après achat, les retours, remboursements, versements aux vendeurs, transporteurs et devises sont tranchés selon les pratiques standard des marketplaces (section 21 du cahier des charges). Une vérification du vendeur ne suffit pas à établir une garantie d’authenticité de chaque produit. Les sujets juridiques et fiscaux sont hors du travail actuel de maquette ; ne pas transformer le slogan en calcul d’exonération ou en avantage chiffré non validé.

## Direction visuelle et contenus validés

**Mise à jour du 13 octobre 2026.** Les versions sobres (bleu nuit, ivoire et or avec DM Sans et Manrope, puis la refonte vert et pierre de `dutyfree-refonte/`) ont été jugées fades et « sans vie ». Trois explorations très marquées (A « Arrivées », B « Marché mondial », C « Laissez-passer », dans `dutyfree-refonte/explorations/`) ont ensuite été jugées « cheap », avec « des animations qui partent dans tous les sens ». L’utilisateur vise l’allure d’une plateforme qui vaut des milliards et a choisi comme références **Apple, Revolut / Stripe et Farfetch / SSENSE**. Il juge la direction **« Studio »** (`dutyfree-refonte/explorations/studio/`, détaillée dans son `DIRECTION.md`) « bien plus » premium et proche de ce qu’il recherche ; elle sert de base aux itérations suivantes, sans validation finale à ce stade.

Principes de cette direction : photographie homogène (produits détourés et posés sur un même fond studio, même ombre, même lumière), interface sobre en noir et blanc avec une seule police (Switzer), couleur portée par les produits et par des halos de lumière, une seule grammaire de mouvement lente et précise. À proscrire : codes du discount (prix géants, pastilles, aplats saturés multiples), thèmes déguisés (signalétique d’aéroport, passeport), animations hétérogènes (bascules, brouillages, rebonds, rotations, objets qui volent). L’inspiration Amazon et Alibaba concerne l’abondance, la recherche au centre, la lisibilité d’un grand catalogue et la visibilité des vendeurs ; la marque garde sa propre identité.

**18 octobre 2026 : l’utilisateur a choisi le fond « Mesh » pour l’accueil de `dutyfree-studio/`** (dégradé animé des quatre couleurs de la marque, qui suit le pointeur). Les autres fonds et la barre d’essai « Background » ont été retirés du code. Le même jour, avant la présentation au client, les écrans « Decisions » du back office, l’espace vendeur et la page « About » ont été alignés sur les décisions du cahier des charges, sans mention de Vito dans l’interface.

**18 octobre 2026 (soir) : logo et direction artistique de la marque.** L’utilisateur a fourni la planche « 01 / Midnight + Copper » (étiquette de prix inclinée cuivre portant « DFD » en blanc, logotype « dutyfreedeal.com » en minuscules arrondies avec « dutyfree » et « .com » en bleu nuit et « deal » en cuivre, icône d’app sur carré bleu nuit, version monochrome) et a demandé de l’appliquer à la maquette. Couleurs relevées sur la planche : **Midnight #12324B** et **Copper #CB6831**. Dans `dutyfree-studio/` : logo vectorisé dans `assets/brand/` (planche source et outils de tracé dans `tools/brand/`), logo complet dans l’en-tête et le pied de page, favicon = symbole, icône iOS = symbole sur bleu nuit ; le noir devient bleu nuit (en-tête et pied #12324B, chapitres sombres #0B2235), le texte des pages claires est bleu nuit, les actions principales sont cuivre (#B4561F derrière un texte blanc, pour un contraste AA), le fond Mesh passe à des bleus nuit éclairés de cuivre. Switzer reste la police de l’interface ; la typographie arrondie n’apparaît que dans le logo. Cette palette remplace le principe « noir et blanc » de la direction Studio ; le reste de la direction (photographie homogène, mouvement lent et unique) est conservé.

**Slogan demandé exactement : « Le duty free, sans passer par l’aéroport ».** Le site étant désormais en anglais uniquement, il s’affiche dans sa traduction fidèle **« Duty free, without going through the airport »**, déjà employée par la version anglaise de la maquette. **Le 15 octobre 2026, l’utilisateur a demandé que le titre de l’accueil de `dutyfree-studio/` soit « Buy Duty Free, without going through the airport »** (et le titre de la page Sell : « Sell beyond your country. » puis « Become a vendor »). La phrase explicative actuelle est : « Découvrez des bons plans du monde entier et des produits difficiles à trouver, livrables chez vous. » L’ancien titre « Plus de choix. Plus de possibilités. » a été explicitement rejeté car trop générique.

L’utilisateur a également rejeté l’ancien grand visuel généré avec une valise, un sac et un décor de voyage, jugé trop artificiel. Il a accepté son remplacement par une vitrine d’offres avec de vraies photographies. Une photo de port ou de conteneurs n’a pas été retenue : la proposition mise en œuvre montre directement des objets achetables et des vendeurs de plusieurs pays.

**Décision du 14 octobre 2026 : l’accueil ne présente plus la vitrine de trois offres sous la barre de recherche, et la section « Tous les rayons » (les 15 grandes cartes) vient juste après la recherche.** Le paragraphe suivant décrit l’ancienne vitrine, conservée dans les versions précédentes. L’accueil précédent présentait trois offres avec les photographies réelles `perfume.jpg`, `headphones.jpg` et `camera.jpg`, issues de Wikimedia Commons. Pour la destination France, la vitrine utilise des vendeurs exemples au Mexique, aux États-Unis et en Espagne. Les offres se remplacent selon leur visibilité, leur stock et leur disponibilité pour la destination. Les noms, vendeurs et prix restent fictifs malgré les photos réelles ; ne pas annoncer ces objets comme des références commerciales réellement proposées.

Les pays affichés désignent le pays du vendeur, pas le lieu de fabrication. Les crédits, auteurs et licences sont dans `dutyfree-maquette/ASSET_CREDITS.json` et `credits.js`. Conserver ces attributions lors d’une refonte.

Les grandes images de rayons ont été appréciées. **Les 15 rayons doivent tous rester présents sur l’accueil, dans de grandes cartes avec photos.** Ne pas revenir aux huit premiers, à de petites icônes, à un carrousel qui en masque une partie ou à une liste tronquée. Le rejet de l’image IA du hero n’est pas une interdiction générale de toutes les illustrations existantes : les images de rayons et les visuels voiture/maison sont actuellement générés et conservés. Dans la direction « Studio », chaque carte de rayon compose de vrais produits détourés de ce rayon sur fond sombre, à la place des illustrations générées ; la maison reste l’illustration générée existante.

## Les 15 rayons de la maquette

| Identifiant | Rayon |
| --- | --- |
| `fashion` | Mode, chaussures et accessoires |
| `beauty` | Beauté et parfums |
| `tech` | High-tech, informatique et téléphonie |
| `home` | Maison, mobilier et décoration |
| `kitchen` | Cuisine et électroménager |
| `garden` | Jardin et extérieur |
| `construction` | Bricolage, outillage et construction |
| `auto` | Auto et moto |
| `sports` | Sports et plein air |
| `toys` | Jeux et jouets |
| `baby` | Bébé et puériculture |
| `food` | Épicerie et boissons |
| `pets` | Animaux |
| `books` | Livres et culture |
| `office` | Bureau et papeterie |

Cette arborescence est la base de démonstration actuelle ; elle n’est pas un catalogue final exhaustif. Les rayons couvrent leurs biens principaux et leurs accessoires. Un rayon sans offre exemple doit afficher un état vide honnête, sans produits sans rapport ni offres inventées pour remplir la page.

## Organisation et logique UX de l’accueil actuel

Ordre demandé le 14 octobre 2026 pour la direction « Studio » : en-tête ; hero avec slogan, phrase d’explication et recherche principale dominante, **sans vitrine de produits** ; **les 15 rayons juste en dessous** ; puis repères, Bons plans | Introuvables, offres du monde entier, panier unique, gros biens sur devis, invitation vendeur et pied de page. La liste ci-dessous décrit l’accueil des versions précédentes.

1. En-tête : logo, recherche générale, destination, langues, favoris, panier ; navigation Tous les rayons, Bons plans, Introuvables et Mes commandes.
2. Hero : slogan, explication des deux bénéfices, recherche principale dominante et vitrine de trois offres avec photos réelles.
3. Repères de fonctionnement : offres livrables à destination, vérification des vendeurs, panier et paiement uniques, tous présentés dans le contexte de démonstration.
4. Deux sélections d’importance égale, Bons plans et Introuvables, avec deux offres chacune et des liens vers leurs collections.
5. Grille complète des 15 grandes cartes de rayons, quatre par ligne sur ordinateur, avec un lien « Voir les sous-catégories ».
6. Invitation Devenir vendeur, puis pied de page avec liens clients et accès de présentation regroupés séparément.

La recherche centrale sert de point d’entrée ; celle de l’en-tête accompagne la navigation. L’en-tête reste visible au défilement et se compacte. Le pays près de la recherche explique le périmètre des résultats. Dans les versions précédentes, les offres avaient été remontées avant les 15 rayons pour montrer plus tôt ce qu’on peut acheter ; le 14 octobre 2026, l’utilisateur a demandé l’inverse pour la direction « Studio » (rayons en haut).

Toute une carte rayon ouvre son catalogue. Le menu Tous les rayons permet de choisir un univers à gauche puis une catégorie à droite, avec recherche, miniatures et fermeture explicite. Photo et titre d’une offre ouvrent sa fiche. Le cœur sauvegarde l’offre. Ajouter au panier suit le prix et la livraison. Le nom du vendeur est un texte simple tant qu’une destination dédiée n’est pas définie.

Préserver les recherches non envoyées lors d’un changement de pays, de langue, de favoris ou d’un ajout au panier. FR et EN sont deux choix explicites ; cliquer la langue déjà active ne change rien. Les logos ramènent en haut de l’accueil même lorsque la route est déjà ouverte. Préserver navigation clavier, focus visible, fermeture avec Échap et respect de la préférence de mouvement réduit.

Ces choix ont des raisons UX, mais leur efficacité commerciale n’a pas été mesurée auprès d’utilisateurs. Chaque bouton, libellé et animation doit servir un objectif client identifiable. Les parcours essentiels, la compréhension et la fiabilité priment sur l’accumulation de fonctions ou les animations décoratives.

## État réel de la réalisation

Il s’agit d’une maquette interactive statique, avec des simulations locales. Elle présente recherche et filtres, fiches d’offres, favoris, panier par vendeur, commande de démonstration, historique, demandes pour gros biens, inscription vendeur et interfaces vendeur/admin. Aucun backend, paiement, envoi de message, traitement réel de KYC/KYB ou service bancaire n’est connecté.

Le jeu initial contient 15 rayons, 182 nœuds de catégories, 10 vendeurs et 22 offres : 18 en achat direct et 4 sur demande. Toutes les sommes sont des exemples en EUR, y compris dans les marchés US et Mexique ; aucune règle de conversion ou de devise nationale n’a été décidée. Les frais de livraison de démonstration sont calculés une fois par vendeur dans le panier, ce qui n’est pas une règle commerciale définitive.

La direction et les changements ont été appliqués à la demande de l’utilisateur ; une validation visuelle finale de l’ensemble n’a pas été explicitement donnée. L’utilisateur veut valider le design sur ordinateur d’abord. **La vérification mobile et la validation complète de tous les parcours ont été reportées.** Des règles CSS adaptatives existent, sans constituer une preuve de validation mobile.

Vérifications ciblées déjà effectuées sur ordinateur : slogan, vraie vitrine photographique, présence des 15 rayons, recherches header/hero, conservation des textes pendant les actions mineures, FR/EN et focus restauré, adaptation des offres à la destination, ajout/retrait de démonstration, menus, en-tête compact, pied de page et syntaxe JavaScript. Ne pas présenter cela comme une recette exhaustive de la plateforme.

## Structure du dépôt et aperçu local

| Emplacement | Fonction |
| --- | --- |
| `dutyfree-maquette/` | Version actuelle à prendre comme base de refonte. |
| `dutyfree-maquette/index.html` | Entrée HTML et ordre de chargement des scripts. |
| `dutyfree-maquette/app.js` | Rendu des pages, routes, interactions et état de démonstration. |
| `dutyfree-maquette/data.js` | Pays, vendeurs, arborescence et catalogue fictif via `window.DFD_DATA`. |
| `dutyfree-maquette/styles.css` | Mise en page, identité visuelle, états et adaptation aux tailles d’écran. |
| `dutyfree-maquette/selects.js` | Menus de sélection personnalisés, recherche, clavier, focus ; conserve les selects natifs et leurs événements. |
| `dutyfree-maquette/department-images.js` | Correspondance entre rayons, images et textes alternatifs FR/EN. |
| `dutyfree-maquette/assets/` | Photographies réelles, illustrations générées et favicon. |
| `dutyfree-maquette/ASSET_CREDITS.json`, `credits.js` | Sources et licences des visuels. |
| `dutyfree-maquette/assets/departments/ASSET_PROMPTS.json` | Prompts et provenance des illustrations générées de rayons. |
| `dutyfree-maquette/README.md` | Cadrage, lancement et détails des sources visuelles. |
| `dutyfree-maquette/CONTRACT.md` | Ancien contrat de construction ; les rôles entre agents et consignes de génération initiale sont historiques. |
| `dutyfree-refonte/` | Refonte vert et pierre (jugée fade), serveur `python3 tools/serve.py` sur le port 4181. |
| `dutyfree-refonte/explorations/` | Explorations de direction : A, B et C écartées ; `studio/` est la direction en cours ; `shared/` contient le catalogue généré depuis la refonte, les photos Commons sourcées (manifeste et licences) et les outils de génération (`gen-catalog.mjs`) et de détourage (`vision_cutout.py`). Depuis le 13 octobre 2026, `dutyfree-refonte/js/data.js` compte 53 offres de démonstration (31 ajoutées avec photos réelles et crédits dans `assets/CREDITS.json`), noms sans suffixe « 01 ». |
| `dutyfree-prototype/`, `vercel-prototype/`, archive Netlify | Anciennes versions, à conserver comme références, pas comme base principale. |

La version actuelle utilise HTML, CSS et JavaScript sans framework, build ou bibliothèque d’animation obligatoire. Les polices sont chargées depuis Google Fonts. Les données d’interaction sont stockées dans `localStorage` sous la clé `dutyfreedeal-candidate-v3`. Les textes FR/EN sont dans les helpers de l’app et les objets bilingues des données.

Depuis la racine du projet, lancer l’aperçu avec :

```sh
python3 -m http.server 4180 --bind 127.0.0.1 --directory dutyfree-maquette
```

Ouvrir `http://127.0.0.1:4180/`. Si ce port est occupé, vérifier le serveur existant avant d’en lancer un autre. Contrôle de syntaxe utile : `node --check dutyfree-maquette/app.js`.

Routes principales : `#/`, `#/catalog`, `#/categories`, `#/product/{id}`, `#/wishlist`, `#/cart`, `#/checkout`, `#/orders`. Le catalogue utilise notamment `q`, `category`, `collection`, `origin`, `mode`, `max`, `stock` et `sort`. Interfaces vendeur : `#/seller`, `#/seller/onboarding`, `#/seller/inventory`, `#/seller/orders`. Interfaces de présentation admin : `#/admin` et sous-routes `vendors`, `products`, `orders`, `requests`, `settings`. Présentation et crédits : `#/credits`.

Les captures récentes sont `dutyfree-maquette/accueil-vitrine-desktop.png` et `accueil-selections-desktop.png`. D’autres captures du dossier représentent des étapes antérieures ; le code actuel prévaut. L’ancienne URL Vercel est `https://dutyfree-deal-prototype.vercel.app` ; elle n’est pas la preuve que la nouvelle maquette est publiée. La publication a été reportée pendant la revue visuelle ; les anciennes instructions de déploiement ne constituent pas une autorisation de publier une refonte. **Le 15 octobre 2026, à la demande de l’utilisateur, `dutyfree-studio/` a été poussé sur GitHub (dépôt privé `ethanlaloum/DutyFreeDeal`) et déployé sur Railway : projet « secure-dedication » (workspace « Ethan Laloum's Projects »), service `DutyFreeDeal`, dossier racine `/dutyfree-studio`, image Caddy (`Dockerfile`, `Caddyfile`), adresse https://dutyfreedeal-production.up.railway.app. Chaque push sur `main` qui touche `dutyfree-studio/` est censé redéployer ; le 18 octobre 2026, le push n’a déclenché aucun build et il a fallu rattacher la source (dépôt, branche `main`) pour lancer le déploiement : vérifier la liste des déploiements Railway après chaque push.** Le soir du 18 octobre 2026, le push du logo n’a de nouveau rien déclenché ; rattacher la source à `main` (outil Railway `connect-service-source`) a lancé le déploiement, mais le push suivant n’a toujours rien déclenché. Le déploiement automatique reste donc en panne : après un push qui change le site servi (index.html, css, js, assets), relancer le déploiement en rattachant la source, puis vérifier.
**Cahier des charges (15 octobre 2026).** Le client a demandé un dossier complet de la plateforme, bâti avec l’utilisateur par échanges successifs. Il est rédigé dans un document Claude Docs : https://claude.ai/code/artifact/c342c8b1-1e1d-48ed-8603-8017b1d36f53. Il compte 30 sections et des exigences numérotées (INT, CAT, ACH, VEN, ADM, RG, ENF). Chaque exigence porte un statut : Décidé (confirmé par le client), Standard (pratique des grandes marketplaces retenue d’office), À décider ou Plus tard. Les questions Q-01 à Q-38 se répartissent en onze décisions du client, cinq vérifications par un juriste ou un fiscaliste, et 22 questions tranchées selon les pratiques standard. Le 15 octobre 2026, le client a tranché Q-04 (le monde entier) et Q-37 (publicité payante) et reporté Q-03 et Q-29 (Introuvables) ; sept décisions restent ouvertes. Le mettre à jour quand une question est tranchée. La maquette `dutyfree-studio/` compte 53 offres (49 en achat direct, 4 sur devis) et stocke ses données sous la clé `dutyfreedeal-studio-v1`.

## Questions à poser à Vito

Liste antérieure au cahier des charges. Depuis le 15 octobre 2026, la section 29 du document fait foi : la plupart de ces questions y sont tranchées, par le client ou selon les pratiques standard.

1. Quels exemples et quelles preuves rendent les deux promesses, prix et produits difficiles à trouver, immédiatement compréhensibles ?
2. D’où vient l’avantage de prix : quels vendeurs, approvisionnements et circuits de commerce parallèle ? Donner un produit et un exemple chiffré réel.
3. À quelle référence compare-t-on un bon deal, qui fournit ce prix et quels autres montants éventuels faut-il expliquer au client ?
4. Comment organiser les catégories, filtres et fiches selon les biens, et quels produits/vendeurs du réseau permettront d’illustrer cette diversité ?
5. Qui contrôle l’état neuf, la qualité, l’authenticité et les annonces ? Quelles preuves sont disponibles et qui traite les signalements ?
6. Quels pays ouvrir en premier côté acheteurs et côté vendeurs, et quel marché choisir pour la présentation ?
7. Quelles langues, devises, promotions, méthodes de paiement et formes d’assistance adapter à chaque version nationale ?
8. Que vérifier avant activation : identité, entreprise, banque, produits et capacité d’expédition ? Quels critères changent selon le pays et demandent une décision humaine ?
9. Comment publier les catalogues : saisie, import ou connexion à une boutique ? Quelles offres nécessitent une validation préalable ?
10. Que signifie « 15 % net du prix global » : assiette, frais inclus, commission brute ou revenu net ? Décomposer une commande exemple de 100 €.
11. À quoi sert le membership, est-il obligatoire, quand est-il payé et quelles conditions distinguent particuliers et entreprises ?
12. Quand le vendeur reçoit-il son argent ? Qui supporte frais de paiement, annulations, remboursements et réclamations ?
13. Qui choisit les transporteurs et frais, utilise quels contrats, et contrôle l’existence et la mise à jour du stock ?
14. Comment suivre plusieurs expéditions avec un paiement unique, notamment en cas de livraison ou d’annulation partielle ?
15. Quel événement prouve l’expédition, quel délai engage le vendeur, quelles pénalités/exceptions et quelle solution pour l’acheteur en cas de retard ?
16. Quel premier interlocuteur pour le client, vendeur ou DutyFreeDeal ? Qui décide et finance les retours ou remboursements ?
17. Quel scénario, quels produits, vendeurs et éléments de marque doivent convaincre pendant la présentation ?
18. Quelles informations, actions, alertes et responsabilités faut-il montrer dans le back office ?

À préciser également : les modalités exactes des devis et réservations de gros biens, les éventuels acomptes, configurations, transports et engagements. La note de cadrage est accessible au propriétaire à `https://chatgpt.com/space/page_7c4fccd3d4788191a530f640789b1355` ; son accès n’est pas nécessaire pour comprendre les questions reprises ici.

## Consignes pour une refonte demandée

- Lire ce contexte et le code actuel avant de proposer une direction. Conserver les règles métier confirmées, les 15 rayons visibles, les deux promesses à égalité, le slogan demandé et les photos réelles de la vitrine, sauf nouvelle instruction explicite.
- Expliquer les choix par les besoins de l’acheteur : comprendre la promesse, trouver, comparer une offre vendeur, connaître prix et livraison, acheter ou demander un devis, puis retrouver sa commande.
- Demander une clarification lorsqu’une décision métier propre au projet manque ou qu’une demande contredit une décision confirmée. L’utilisateur a demandé de ne pas deviner ; ne pas lui faire reconfirmer des décisions déjà actées. Ce qui a une réponse standard sur les grandes marketplaces se décide sans demander (consigne du client ci-dessus).
- Respecter l’étape de validation visuelle sur ordinateur. Quand une analyse ou proposition est demandée avant modification, la présenter d’abord ; une fois les changements autorisés, les réaliser sans redemander l’accord pour chaque détail courant.
- Conserver les parcours existants et les valeurs des formulaires pendant la refonte. Une migration technique éventuelle doit expliquer ce qu’elle apporte et préserver le comportement confirmé ; la stack actuelle ne nécessite aucune migration pour être prévisualisée.
- Garder les simulations clairement identifiées. Ne pas inventer réductions, prix barrés, avis clients, chiffres de trafic, garanties, règles de commission, devises, procédures bancaires ou pénalités comme des faits établis.
- Préserver clavier, focus, contrastes, textes alternatifs, états vides et comportement des menus. Les animations doivent expliquer une action ou un état, et respecter le mouvement réduit.
- Vérifier les changements concernés sur ordinateur et fournir des captures du rendu. La recette mobile, les parcours complets et la publication restent des étapes ultérieures, sauf nouvelle demande de l’utilisateur.
- Garder les anciennes versions et la traçabilité des assets. Mettre à jour ce contexte lorsque l’utilisateur tranche un point ouvert.

## Exemple de demande à adresser à Claude

« Lis CLAUDE.md et examine dutyfree-maquette. Propose une refonte premium de DutyFreeDeal en respectant les décisions métier, les 15 grandes cartes de rayons, les deux promesses et le slogan validé. Explique la hiérarchie et le rôle des actions. Présente d’abord ta direction pour validation avant de modifier. Le travail porte sur la maquette, avec des offres fictives, une vitrine de vraies photos, et une revue sur ordinateur. Pose-moi une question si une information indispensable manque. »
