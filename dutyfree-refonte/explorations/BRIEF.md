# Explorations de direction : brief commun

Trois directions artistiques radicalement différentes de l’accueil DutyFreeDeal, construites en parallèle puis présentées côte à côte au porteur du projet, qui choisira ou mélangera. Chaque direction a son document `DIRECTION.md` dans son dossier ; ce brief fixe ce qui est commun et non négociable.

## Pourquoi ce travail

Le porteur du projet a jugé les versions précédentes « hyper fades », « mortes, sans vie ». Sa demande, mot pour mot : « j’ai besoin d’être impressionné, je veux pas du vibecoding, pas de générique, pas du vu et revu, des animations au scroll, bref c’est toi l’artiste ». La consigne reçue de Vito : DutyFreeDeal doit être « un mix entre Amazon et Alibaba ». Traduction en design : abondance de produits visibles, recherche au centre, vendeurs et pays des vendeurs mis en avant, prix et livraison lisibles en un coup d’œil, énergie. Sans leurs ficelles (fausses promos, faux avis, comptes à rebours).

Le `CLAUDE.md` racine décrit encore une direction « premium, épurée et aérée » en bleu nuit, ivoire et or : **elle est dépassée par les instructions récentes du porteur**. Suivre `DIRECTION.md`. Les **décisions métier** du `CLAUDE.md` restent, elles, obligatoires (résumées plus bas).

L’ancienne mise en page est un contre-modèle à ne pas reproduire : en-tête blanc à deux rangées, hero coupé en deux (slogan à gauche, trois produits à droite), diptyque blanc, grille de cartes beiges, fond pierre et accent vert unique.

## Périmètre

- Une **page d’accueil complète** par direction, interactive, desktop d’abord : elle doit être irréprochable à **1440×900** et **1280×800**. Mobile : pas de débordement horizontal à 390 px, sans plus.
- Les autres pages ne sont pas refaites : les liens profonds pointent vers la refonte existante, servie sur le même serveur (`../../#/catalog?q=…`, `../../#/catalog?category=<id>`, `../../#/catalog?collection=deals|rare`, `../../#/product/<id>`, `../../#/orders`, `../../#/wishlist`, `../../#/cart`, `../../#/seller/onboarding`).
- Langue : français. Le sélecteur FR | EN est présent ; FR est actif ; cliquer FR ne fait rien ; cliquer EN affiche une notification « Exploration disponible en français uniquement ».

## Fichiers

- Ton dossier : `explorations/<dossier>/` avec `index.html`, `style.css`, `main.js`, et `captures/` pour les captures. **Ne modifie rien en dehors de ton dossier.**
- Données : `../shared/catalog.js` (script classique, expose `window.DFD`), **en lecture seule**. Il sera régénéré pendant ton travail avec davantage d’offres (de 22 à environ 45, nouvelles photos réelles sous `../shared/photos/`) : c’est normal. **Tout doit être rendu depuis les données**, rien d’écrit en dur, et la mise en page doit tenir avec 40+ offres.
- Serveur local déjà lancé : `http://127.0.0.1:4181/explorations/<dossier>/` (racine = `dutyfree-refonte/`, cache désactivé).

## API des données (`window.DFD`)

- `DFD.slogan`, `DFD.pitch`, `DFD.demoNotice`, `DFD.nav`, `DFD.collections.deals|rare` (`name`, `text`).
- `DFD.countries` : `{ code: 'FR', iso3: 'FRA', name: 'France' }` × 4 (FR, ES, US, MX). Ce sont des marchés exemples.
- `DFD.departments` (15) : `{ id, name, short, image, thumb, imageAlt, subcategories: [..], categoryCount }`. `image` est un chemin relatif à ta page.
- `DFD.vendors` : `{ id, name, country, type: 'business'|'individual', verification: 'kyb'|'kyc', deliveryTo: [..], shipping: { FR: 24.9, … } }`. Les noms contiennent « · Démo » : le garder.
- `DFD.offers` : `{ id, name, rayon, rayonName, image, cutout|null, imageAlt, vendorId, price, stock, collections: ['deals'|'rare'], delivery, mode: 'purchase'|'quote' }`.
- `DFD.offersFor(destCode)` : offres livrables dans ce pays, enrichies de `vendor`, `from` (pays du vendeur), `to`, `shipping` (frais pour cette destination).
- `DFD.showcaseFor(destCode)` : les 3 offres de la vitrine (photos réelles ; pour la France : vendeurs au Mexique, aux États-Unis, en Espagne). `cutout` (détourage PNG/WebP transparent) existe pour ces trois-là.
- `DFD.price(n)` → « 82,00 € » ; `DFD.priceParts(n)` → `{ whole: '82', cents: '00', currency: '€' }`.
- `DFD.vendor(id)`, `DFD.country(code)`, `DFD.department(id)`, `DFD.credits` (`label`, `author`, `license`, `source`, `kind`).

## Technique

- HTML, CSS, JavaScript sans framework ni build. CSS moderne bienvenu (grid, subgrid, `clamp`, `text-wrap: balance`, `@property`, `color-mix`).
- **GSAP 3.13.0** via jsDelivr, plugins gratuits enregistrés avec `gsap.registerPlugin(...)` :
  `https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js`, puis selon besoin `ScrollTrigger.min.js`, `SplitText.min.js`, `ScrambleTextPlugin.min.js`, `DrawSVGPlugin.min.js`, `Flip.min.js` (même dossier). Charge les skills `gsap-core`, `gsap-scrolltrigger`, `gsap-plugins`, `gsap-timeline` et `gsap-performance` avant d’écrire les animations.
- Polices via Google Fonts (`<link>` avec `display=swap` et `preconnect`).
- Icônes : SVG Phosphor (MIT) copiés en ligne depuis `../../node_modules/@phosphor-icons/core/assets/<regular|bold|fill>/<nom>.svg` (lis-les sur disque ; ne les charge pas à l’exécution). Pas d’emoji comme icône.
- Interdit : Lenis ou tout détournement du défilement natif, écouteurs `scroll` pour animer (utiliser ScrollTrigger / IntersectionObserver), autres bibliothèques, WebGL, images générées.
- État (panier, favoris, destination) en mémoire, éventuellement `localStorage` sous la clé `dutyfreedeal-explo-<dossier>`, chaque accès dans un try/catch.

## Contenus obligatoires (textes exacts)

- Slogan, au caractère près (apostrophe typographique) : **« Le duty free, sans passer par l’aéroport »**. Tu peux le couper en lignes, changer la casse par CSS (`text-transform`), jamais ajouter, retirer ou remplacer un mot.
- Phrase d’explication exacte : « Découvrez des bons plans du monde entier et des produits difficiles à trouver, livrables chez vous. »
- **Mention de démonstration** visible dès le premier écran (`DFD.demoNotice`) et rappelée dans le pied de page.
- **En-tête** : logo « DutyFreeDeal » (le clic ramène en haut de l’accueil, même déjà sur la page), recherche d’en-tête, destination (« Livraison » + pays, menu des 4 pays), langue FR | EN, Favoris (compteur), Panier (compteur). Navigation : **Tous les rayons** (ouvre un menu des 15 rayons et de leurs sous-catégories), **Bons plans**, **Introuvables** (vers leurs sections ou collections), **Mes commandes** ; « Devenir vendeur » accessible. L’en-tête reste visible au défilement et se compacte. La recherche d’en-tête apparaît quand la recherche principale sort de l’écran, avec le même brouillon.
- **Hero** : slogan, phrase, **recherche principale dominante** (étiquette « Rechercher parmi les offres livrables en France », pays dynamique ; placeholder « Parfum, casque, valise, rayon… » ; envoi vers `../../#/catalog?q=…`), et la **vitrine des 3 offres** `DFD.showcaseFor(dest)` avec leurs vraies photos.
- **Repères** : catalogue des offres livrables dans le pays choisi ; vendeurs vérifiés avant activation (KYC pour les particuliers, KYB pour les entreprises, procédure simulée dans la maquette) ; un seul panier et un seul paiement, expéditions organisées par vendeur (paiement simulé).
- **Bons plans** et **Introuvables** : deux sélections d’**importance strictement égale** (même taille, même structure, mêmes actions), chacune avec plusieurs offres et un lien « Voir les N … livrables en France ».
- **Abondance** : une section montre beaucoup d’offres livrables (c’est la part « Amazon/Alibaba »).
- **Les 15 rayons, tous visibles, en grandes cartes avec photo** (image de `DFD.departments`, traitement libre selon la direction), nom, sous-catégories, nombre de catégories ; toute la carte mène au catalogue du rayon. Interdits : n’en montrer qu’une partie, carrousel, défilement horizontal qui en masque, petites icônes.
- **Gros biens sur demande** (offres `mode: 'quote'` : voiture, maison) : « Demander un devis », sans paiement, « aucun acompte ni réservation confirmée » (démonstration).
- **Devenir vendeur** : particuliers et entreprises, après vérification.
- **Pied de page** : liens clients, liens vendeurs, accès maquette, et **« Sources et licences »** listant `DFD.credits` (libellé, auteur, licence, lien source). Les attributions sont obligatoires.

## Règles métier (ne jamais enfreindre)

- Prix produit mis en avant ; **livraison toujours sur une ligne séparée** (« + 24,90 € de livraison »), jamais fondue dans le prix. Euros uniquement, quel que soit le pays.
- **Interdits** : prix barrés, pourcentages, « économisez », « promo », « prix choc », avis, étoiles, notes, compteurs de vues, « meilleure vente », comptes à rebours, urgence de stock inventée, chiffres de trafic, garanties, mentions de douane, taxe, exonération, « détaxe », « hors taxes ». Le slogan est la seule allusion au duty free.
- Le pays affiché est **le pays du vendeur**, pas le lieu de fabrication : écrire « Vendeur au Mexique », « Pays du vendeur », ou la route « MEX → FRA » (pays du vendeur → pays de livraison). Jamais « Made in », « Origine », « Provenance du produit ».
- Une offre = un vendeur. Le nom du vendeur est du texte simple (pas de lien).
- Une vérification du vendeur n’est pas une garantie d’authenticité : ne jamais écrire « authentique », « garanti », « certifié ».
- Particuliers uniquement côté acheteurs ; produits physiques neufs uniquement.
- Les offres, vendeurs, prix, stocks et délais sont fictifs ; les photos sont réelles mais illustratives. Ne pas présenter un objet photographié comme une référence commerciale réelle.

## Interactions requises

- **Changer de destination** met à jour toute la page (vitrine, sélections, abondance, libellés « livrables en … », frais de livraison) avec la transition propre à la direction, **sans jamais effacer une recherche en cours**, avec une annonce `aria-live` (« 16 offres livrables en Espagne »).
- **Ajouter au panier** incrémente le compteur, avec un retour visible propre à la direction et une notification. **Favori** : bouton cœur `aria-pressed`, compteur.
- **Menus** (Tous les rayons, destination) : ouverture au clic et au clavier, flèches dans les listes, **Échap ferme et rend le focus** au déclencheur, clic extérieur ferme.
- Photo et nom d’une offre mènent à sa fiche (`../../#/product/<id>`).

## Accessibilité et mouvement

- HTML sémantique (`header`, `nav`, `main`, `section` titrées, `footer`), un seul `h1` (le slogan), hiérarchie de titres logique, boutons pour les actions, liens pour la navigation.
- Contrastes AA vérifiés pour chaque couple texte/fond (4,5:1 texte courant, 3:1 grands textes et composants). Les couleurs saturées imposent de choisir noir ou blanc couple par couple.
- **Focus visible** partout, dessiné pour la direction, visible sur tous les fonds.
- Texte alternatif pour chaque image (`imageAlt`), `width`/`height` ou `aspect-ratio` pour éviter les sauts, `loading="lazy"` sous la ligne de flottaison.
- Animations décoratives de lettres (palettes, brouillage) : le vrai texte reste disponible pour les lecteurs d’écran (`aria-label` ou texte masqué visuellement, effets `aria-hidden`).
- **Mouvement réduit** : avec `prefers-reduced-motion: reduce`, aucune animation de scroll, de lettres ou de parallaxe ; tout le contenu est visible immédiatement. Utiliser `gsap.matchMedia()`. Les états initiaux cachés ne sont posés **que** par JavaScript dans le contexte « no-preference » : si GSAP ne charge pas, la page reste entièrement lisible.
- Chaque animation sert quelque chose : faire arriver un contenu, expliquer un changement d’état (destination, panier, filtre), montrer un parcours. Pas de boucle décorative perpétuelle (une horloge qui donne l’heure n’est pas décorative). Transformations et opacité uniquement, pas d’animation de propriétés de mise en page.

## Anti-générique (refus nets)

- Polices : ni Inter, Roboto, Arial, Helvetica, Poppins, Montserrat, Space Grotesk, DM Sans, Manrope, Archivo, ni police système comme police d’affichage.
- Ni dégradés violet-bleu, ni verre dépoli, ni halos lumineux, ni taches floues en arrière-plan, ni néomorphisme, ni texte en dégradé.
- Pas de grille de cartes blanches arrondies avec ombre douce comme motif principal. Pas de hero « texte centré + deux boutons ». Pas de split slogan à gauche / produits à droite.
- Pas de faux témoignages, faux logos clients, faux chiffres. Pas de lorem ipsum. Pas de texte d’interface en anglais.
- Pas d’effets « parce que c’est joli » : chaque effet doit pouvoir être justifié en une phrase par le besoin de l’acheteur ou par l’identité de la direction.

## Contrôle de l’outil de design

Un détecteur (Impeccable) s’exécute après tes modifications de fichiers et peut afficher des alertes. **Corrige** les problèmes mécaniques réels (contraste, image cassée, débordement, lisibilité). **Ignore** les recommandations de goût qui contredisent ta `DIRECTION.md` (nombre de couleurs d’accent, sobriété, police) : la direction est fixée par le directeur artistique, pas par l’outil.

## Vérification (obligatoire, avec de vraies captures)

Outil : `npx playwright-cli` (depuis `dutyfree-refonte/`), avec **ta propre session** `-s=<dossier>` pour ne pas gêner les autres agents. Lis `.claude/skills/playwright-cli/SKILL.md` pour les commandes. Exemples :

```sh
npx playwright-cli -s=<dossier> open http://127.0.0.1:4181/explorations/<dossier>/
npx playwright-cli -s=<dossier> resize 1440 900
npx playwright-cli -s=<dossier> screenshot --filename=explorations/<dossier>/captures/1440-hero.png
npx playwright-cli -s=<dossier> run-code "async page => { await page.mouse.wheel(0, 900); await page.waitForTimeout(800); }"
npx playwright-cli -s=<dossier> run-code "async page => page.emulateMedia({ reducedMotion: 'reduce' })"
npx playwright-cli -s=<dossier> console
```

Pour une capture de page entière, fais d’abord défiler toute la page par paliers (pour déclencher les animations), puis `page.screenshot({ path, fullPage: true })` via `run-code`.

Captures attendues dans `captures/` : `1440-hero.png`, `1280-hero.png`, `1440-full.png`, au moins quatre captures **pendant** des animations de scroll (`scroll-1.png`…), `destination-espagne.png` (après changement de pays), `menu-rayons.png`, `reduced-motion-hero.png`, `390-hero.png`.

Contrôles : aucune erreur console ; aucun débordement horizontal (1440, 1280, 390) ; 15 rayons présents ; toutes les images chargées (aucune cassée) ; clavier (Tab, Entrée, Échap) dans les menus ; recherche conservée au changement de pays ; mouvement réduit = tout visible et statique.

**Boucle d’exigence** : après la première version complète, regarde tes captures (lis les images) et critique-les sans complaisance contre `DIRECTION.md` et ce brief : est-ce que ça impressionne ? est-ce que ça ressemble à un gabarit déjà vu ? la hiérarchie est-elle claire ? les détails typographiques sont-ils soignés (alignements, espacements, césures, chiffres) ? Corrige, recapture. Au moins **deux passes** de correction avant de rendre.

## Rendu final (réponse courte)

1. Ce qui est construit, section par section (une ligne chacune).
2. Les 2 ou 3 moments signature, et où les voir (section, défilement).
3. Écarts volontaires par rapport à `DIRECTION.md` et pourquoi.
4. Problèmes connus ou non vérifiés.
5. Liste des captures.
