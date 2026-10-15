# DutyFreeDeal maquette premium

Candidat de maquette basé sur le cadrage confirmé le 13 octobre 2026. Français et anglais. Les offres, vendeurs, prix, disponibilités et calculs de livraison sont des données de démonstration ; les photographies illustrent les offres et ne constituent pas un catalogue commercial réel. Aucun paiement, document d’identité ou message n’est transmis.

Le contexte complet du projet et les consignes pour une refonte sont réunis dans [CLAUDE.md](../CLAUDE.md), à la racine du dépôt.

## Aperçu local

Depuis ce dossier : `python3 -m http.server 4180 --bind 127.0.0.1`, puis ouvrir `http://127.0.0.1:4180`.

Cette version est préparée dans un dossier distinct de l’ancienne maquette. L’ancienne adresse Vercel reste disponible pendant la revue de ce candidat.

## Cadrage

- Acheteurs particuliers ; vendeurs particuliers ou entreprises après KYC/KYB, selon l’origine.
- Produits physiques neufs au lancement, tous univers de vente, dont les véhicules et l’habitat préfabriqué.
- Une plateforme et des marchés nationaux : toutes les offres mondiales livrables à la destination choisie.
- Une fiche par offre de vendeur, prix produit et livraison affichés séparément.
- Panier et paiement uniques pour plusieurs vendeurs ; stock et expédition gérés par chaque vendeur.
- Gros biens : demandes de devis ou de réservation simulées ; aucune réservation ni aucun acompte effectif.
- Recherche dès l’arrivée ; Tous les rayons, Bons plans et Introuvables ; direction premium et épurée.
- Catalogue de démonstration explicitement autorisé. CORE reporté.

Les mécanismes d’économies, référence de comparaison des prix, base des 15 % net, membership, modalités KYC/KYB par pays, pénalités de retard, réservations et organisation du service client restent à préciser avec Vito. Aucun calcul juridique, fiscal ou commercial définitif n’est implémenté pour ces sujets.

Note de questions : https://chatgpt.com/space/page_7c4fccd3d4788191a530f640789b1355

## Sources visuelles

L’accueil présente le slogan « Le duty free, sans passer par l’aéroport ». L’ancien visuel généré avec la valise et le sac est remplacé dans le hero par une vitrine utilisant les photographies Wikimedia Commons déjà présentes dans le projet. Les références, auteurs et licences sont conservés dans `ASSET_CREDITS.json`. Les photos sont réelles ; les offres, noms de vendeurs et prix présentés restent des exemples fictifs. Les pays affichés désignent le pays du vendeur, sans indication inventée du lieu de fabrication.

Les offres et les deux sélections sont présentées avant la grille complète des 15 grandes cartes de rayons. Cette étape reste une revue visuelle sur ordinateur ; la validation mobile et la publication restent reportées.

Les images de l’ancienne maquette et leurs crédits sont conservés dans `ASSET_CREDITS.json`. Les deux visuels de gros biens sont générés avec l’outil intégré ImageGen, puis enregistrés dans les assets de ce dossier.

Les rayons utilisent de grandes cartes photographiques sur l’accueil, des couvertures sur la page des 15 rayons et des miniatures dans le menu. Treize illustrations ont été générées via l’outil intégré ImageGen et inspectées, puis copiées dans `assets/departments/`. Les rayons Auto et Construction réutilisent les visuels ci-dessous. Leurs sources, chemins finaux et prompts exacts sont conservés dans `assets/departments/ASSET_PROMPTS.json` ; `department-images.js` fournit les légendes FR/EN. Ces illustrations n’ajoutent aucune offre au catalogue.

### Voiture

Fichier final : `assets/car.png`.

Prompt : Use case: product-mockup. Asset type: demo automotive listing photograph for the DutyFreeDeal premium marketplace. Primary request: a photorealistic new unbranded graphite electric crossover car in a warm neutral seamless photography studio, front three-quarter view. Entire car visible, elegant understated contemporary proportions, believable tyres and reflections, soft daylight and a subtle contact shadow, generous breathing room. Wide landscape composition suitable for a catalogue card and product page. No manufacturer logos, badges, readable number plates, people, text or watermark. This is a fictional demonstration vehicle, not an existing car model.

### Maison préfabriquée

Fichier final : `assets/house.png`.

Prompt : Use case: product-mockup. Asset type: demo prefabricated housing listing photograph for the DutyFreeDeal premium marketplace. Primary request: a photorealistic contemporary compact single-storey prefabricated modular house, natural timber cladding, charcoal metal details and generous glass doors, on a simple landscaped plot. Entire house clearly visible in a front three-quarter view, quiet pale daylight, refined architectural photography with realistic materials, clean surroundings and breathing room. Wide landscape composition suitable for a catalogue card and product page. No logos, company names, people, text or watermark. This is a fictional demonstration modular house, not a supplier reference.
