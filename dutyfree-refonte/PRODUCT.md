# Product

<!-- impeccable:product-schema 1 -->

Source : `../CLAUDE.md` (contexte établi au 13 octobre 2026) et brief de refonte du 13 octobre 2026. Rédigé sans nouvel entretien : l'utilisateur a demandé de ne pas reconfirmer les décisions déjà actées. Les points marqués « ouvert » ne doivent pas être inventés.

## Platform

web

## Stack

Maquette statique existante (`../dutyfree-maquette/`) : HTML, CSS et JavaScript sans framework ni build. La refonte conserve cette pile : aucune migration n'est nécessaire pour l'aperçu. Aperçu local servi sur le port 4181, distinct de l'ancienne version (4180).

## Users

- **Acheteurs** : particuliers uniquement au lancement. Ils choisissent un pays de livraison et cherchent une offre livrable chez eux, comprennent le produit et son vendeur, voient le prix et la livraison, achètent simplement (ou demandent un devis pour les gros biens), puis retrouvent leur commande.
- **Vendeurs** : particuliers et entreprises, après vérification (KYC pour les particuliers, KYB pour les entreprises). Ils veulent proposer leur catalogue au-delà de leur marché local.
- **Administration** : vue sur les vendeurs, les offres, les commandes et les problèmes à traiter.
- **Contexte de présentation** : le porteur du projet présente la maquette à son associé (Vito) et à des partenaires ; elle doit être crédible comme une vraie marketplace internationale.

## Product Purpose

Marketplace internationale qui augmente le pouvoir d'achat des particuliers et leur donne accès à des produits difficiles à trouver dans leur pays. Deux promesses d'importance égale : des prix avantageux, et l'accès à des offres inhabituelles ou peu accessibles localement. Intention de marque : rendre le duty free accessible sans passer par l'aéroport. Succès : l'acheteur trouve une offre livrable chez lui, la comprend et l'achète sans friction.

## Positioning

Une seule plateforme avec des versions nationales. Le catalogue national réunit toutes les offres mondiales livrables dans le pays choisi (DutyFreeDeal France ne se limite pas aux vendeurs français). Une fiche par offre de vendeur, un seul panier et un seul paiement pour plusieurs vendeurs, des expéditions organisées par vendeur. Le positionnement international ne prouve pas à lui seul une différence exclusive avec Amazon ; le mécanisme d'économies et ses preuves restent ouverts.

## Operating Context

- Maquette interactive statique avec simulations locales ; aucun backend, paiement, message, KYC/KYB réel ni service bancaire connecté.
- Catalogue de démonstration autorisé et clairement signalé : 15 rayons, 182 nœuds de catégories, 10 vendeurs, 22 offres (18 en achat direct, 4 sur demande). Produits, vendeurs, prix, stocks, délais et statuts fictifs.
- France, Espagne, États-Unis et Mexique sont des exemples de marchés, pas une liste de lancement validée.
- Toutes les sommes sont des exemples en EUR, y compris pour les États-Unis et le Mexique ; aucune règle de devise n'est décidée.
- Les frais de livraison de démonstration sont comptés une fois par vendeur dans le panier ; ce n'est pas une règle commerciale définitive.
- Le pays affiché pour une offre est le pays du vendeur, jamais le lieu de fabrication.

## Capabilities and Constraints

- Produits physiques neufs uniquement au lancement ; ni occasion ni reconditionné.
- Chaque vendeur gère son stock et expédie ses commandes ; aucun entrepôt DutyFreeDeal n'est décidé.
- Gros biens (voitures, maisons préfabriquées) : demande de devis ou de réservation ; aucun acompte ni réservation confirmée.
- Navigation : recherche visible dès l'arrivée ; trois entrées principales : Tous les rayons, Bons plans, Introuvables.
- Langues : français et anglais. Le pays de livraison et la langue sont deux réglages distincts.
- Prix produit mis en avant, livraison affichée séparément.
- Les 15 rayons : Mode, chaussures et accessoires ; Beauté et parfums ; High-tech, informatique et téléphonie ; Maison, mobilier et décoration ; Cuisine et électroménager ; Jardin et extérieur ; Bricolage, outillage et construction ; Auto et moto ; Sports et plein air ; Jeux et jouets ; Bébé et puériculture ; Épicerie et boissons ; Animaux ; Livres et culture ; Bureau et papeterie. Un rayon sans offre affiche un état vide honnête.
- CORE : autre partie du projet, reportée ; ne pas en inventer la nature.
- Ouverts, à ne pas inventer : source et preuve des économies, référence de comparaison des prix, « 15 % net du prix global », membership fournisseur, procédures KYC/KYB par pays, pénalités de retard, premier interlocuteur du client, retours et remboursements, versements aux vendeurs, transporteurs, devises, adaptations par marché, modalités des devis et réservations, identité juridique de l'entreprise.

## Brand Commitments

- Nom : DutyFreeDeal.
- Slogan exact : « Le duty free, sans passer par l'aéroport ».
- Les deux promesses restent à égalité dans la hiérarchie : prix avantageux et produits difficiles à trouver.
- Les 15 rayons figurent tous sur l'accueil, dans de grandes cartes avec photos ; ni liste tronquée, ni carrousel qui en masque une partie, ni petites icônes.
- Vitrine d'accueil avec de vraies photographies, sources et licences conservées.
- Rejetés : le titre « Plus de choix. Plus de possibilités. » (trop générique) ; le grand visuel généré avec la valise et le sac ; la photo de port ou de conteneurs ; l'ancienne identité bleu nuit, ivoire et or avec DM Sans et Manrope (rejetée le 13 octobre 2026, à traiter comme une simple trace).
- Direction demandée : premium, distinctive, lisible et aérée, tout en permettant d'explorer un catalogue très large. L'inspiration Amazon porte sur la lisibilité d'un grand catalogue, pas sur l'identité.

## Evidence on Hand

- Photographies réelles Wikimedia Commons, avec auteurs et licences : parfum, casque, appareil photo, sac, montre, baskets, chaise, valise (`../dutyfree-maquette/ASSET_CREDITS.json`).
- Illustrations générées acceptées pour les rayons (13 images) et pour la voiture et la maison de démonstration, avec leurs prompts (`../dutyfree-maquette/assets/departments/ASSET_PROMPTS.json`, `../dutyfree-maquette/README.md`).
- Absents et à ne pas fabriquer : vrais prix, vrais vendeurs, avis clients, chiffres de trafic, preuves d'économies, remises, prix barrés, garanties d'authenticité, commissions, règles opérationnelles.

## Product Principles

1. Deux promesses, un même poids : le prix ne doit jamais éclipser la rareté, ni l'inverse.
2. Honnêteté : toute donnée de démonstration est signalée ; les mécanismes commerciaux ouverts restent ouverts.
3. Ce qui est montré est livrable : le pays de livraison cadre les offres ; il ne se confond pas avec la langue.
4. Chaque action a une fonction, une priorité et un emplacement justifiés par un besoin d'acheteur.
5. L'étendue sans troncature : toute l'arborescence reste accessible, les 15 rayons restent visibles.

## Accessibility & Inclusion

Navigation clavier complète, focus visible, fermeture des menus avec Échap, respect du mouvement réduit, textes alternatifs FR/EN, contrastes WCAG AA, états vides explicites. Les recherches non envoyées sont conservées pendant les actions mineures (changement de pays, de langue, favoris, ajout au panier).
