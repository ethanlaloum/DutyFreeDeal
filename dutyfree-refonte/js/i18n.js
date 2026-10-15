/* Interface strings, FR and EN. Product data carries its own bilingual labels. No em or en dashes in visible copy. */
const plural = (n, one, many) => (n === 1 ? one : many);
const frPlural = (n, one, many) => (n <= 1 ? one : many);

export const STRINGS = {
  docTitle: { fr: 'DutyFreeDeal : le duty free, sans passer par l’aéroport', en: 'DutyFreeDeal: duty free, without going through the airport' },
  skip: { fr: 'Aller au contenu', en: 'Skip to content' },
  stripText: {
    fr: ({ country }) => `<strong>Édition ${country}, en français.</strong> Maquette interactive : produits, vendeurs et prix fictifs, aucune transaction réelle.`,
    en: ({ country }) => `<strong>${country} edition, in English.</strong> Interactive prototype: fictional products, sellers and prices, no real transactions.`
  },
  stripLink: { fr: 'Sources et licences', en: 'Sources and licences' },
  homeLabel: { fr: 'DutyFreeDeal, retour en haut de l’accueil', en: 'DutyFreeDeal, back to the top of the home page' },

  /* Search */
  searchLabelHeader: { fr: 'Rechercher dans le catalogue', en: 'Search the catalogue' },
  searchLabelCover: {
    fr: ({ country }) => `Rechercher parmi les offres livrables <strong>${country}</strong>`,
    en: ({ country }) => `Search offers that deliver <strong>${country}</strong>`
  },
  searchPlaceholderHeader: { fr: 'Rechercher un produit, un rayon…', en: 'Search for a product or department…' },
  searchPlaceholderCover: { fr: 'Parfum, casque, valise, rayon…', en: 'Fragrance, headphones, suitcase…' },
  searchSubmit: { fr: 'Rechercher', en: 'Search' },
  searchClear: { fr: 'Effacer la recherche', en: 'Clear search' },
  suggestCategories: { fr: 'Rayons et catégories', en: 'Departments and categories' },
  suggestOffers: { fr: 'Offres livrables', en: 'Offers that deliver' },
  suggestAll: { fr: ({ q }) => `Rechercher « ${q} » dans tout le catalogue`, en: ({ q }) => `Search “${q}” in the whole catalogue` },
  suggestCount: {
    fr: ({ n }) => `${n} suggestion${frPlural(n, '', 's')} disponible${frPlural(n, '', 's')}. Utilisez les flèches haut et bas.`,
    en: ({ n }) => `${n} suggestion${plural(n, '', 's')} available. Use the up and down arrows.`
  },

  /* Destination and language */
  deliverTo: { fr: 'Livraison', en: 'Deliver to' },
  destinationButton: { fr: ({ country }) => `Pays de livraison : ${country}. Modifier`, en: ({ country }) => `Delivery country: ${country}. Change` },
  destinationTitle: { fr: 'Pays de livraison', en: 'Delivery country' },
  destinationIntro: {
    fr: 'Le catalogue n’affiche que les offres livrables dans ce pays. La langue se règle à part.',
    en: 'The catalogue only shows offers that deliver to this country. Language is a separate setting.'
  },
  destinationCount: {
    fr: ({ n }) => (n === 0 ? 'Aucune offre livrable' : `${n} offre${frPlural(n, '', 's')} livrable${frPlural(n, '', 's')}`),
    en: ({ n }) => (n === 0 ? 'No offers deliver' : `${n} offer${plural(n, '', 's')} deliver${plural(n, 's', '')}`)
  },
  destinationNote: {
    fr: 'Pays donnés en exemple pour la démonstration, pas une liste de lancement.',
    en: 'Example countries for the demonstration, not a launch list.'
  },
  destinationChanged: {
    fr: ({ country, n }) => `Livraison ${country} : ${n} offre${frPlural(n, '', 's')} livrable${frPlural(n, '', 's')}. Votre recherche est conservée.`,
    en: ({ country, n }) => `Delivering ${country}: ${n} offer${plural(n, '', 's')} available. Your search is kept.`
  },
  languageLabel: { fr: 'Langue', en: 'Language' },
  languageChanged: { fr: 'Langue : français. Votre recherche est conservée.', en: 'Language: English. Your search is kept.' },

  /* Account */
  favorites: { fr: 'Favoris', en: 'Saved' },
  favoritesCount: { fr: ({ n }) => `Favoris, ${n} offre${frPlural(n, '', 's')}`, en: ({ n }) => `Saved, ${n} offer${plural(n, '', 's')}` },
  cart: { fr: 'Panier', en: 'Cart' },
  cartCountLabel: { fr: ({ n }) => `Ouvrir le panier, ${n} article${frPlural(n, '', 's')}`, en: ({ n }) => `Open cart, ${n} item${plural(n, '', 's')}` },

  /* Tabs */
  allDepartments: { fr: 'Tous les rayons', en: 'All departments' },
  deals: { fr: 'Bons plans', en: 'Deals' },
  rare: { fr: 'Introuvables', en: 'Hard to find' },
  orders: { fr: 'Mes commandes', en: 'My orders' },
  sell: { fr: 'Vendre sur DutyFreeDeal', en: 'Sell on DutyFreeDeal' },
  navCatalogue: { fr: 'Catalogue', en: 'Catalogue' },
  navAccount: { fr: 'Commandes et vente', en: 'Orders and selling' },
  navTools: { fr: 'Livraison, langue, favoris et panier', en: 'Delivery, language, saved offers and cart' },

  /* Departments menu */
  menuRegion: { fr: 'Tous les rayons', en: 'All departments' },
  menuDepartments: { fr: 'Rayons', en: 'Departments' },
  menuFilterLabel: { fr: 'Filtrer les rayons et les catégories', en: 'Filter departments and categories' },
  menuFilterPlaceholder: { fr: 'Filtrer les 15 rayons…', en: 'Filter the 15 departments…' },
  menuSeeAll: { fr: 'Voir tout le rayon', en: 'See the whole department' },
  menuClose: { fr: 'Fermer', en: 'Close' },
  menuFilterClear: { fr: 'Effacer le filtre', en: 'Clear filter' },
  menuNoMatch: { fr: ({ q }) => `Aucun rayon ne correspond à « ${q} »`, en: ({ q }) => `No department matches “${q}”` },
  menuNoMatchText: {
    fr: 'Essayez un autre mot, ou cherchez directement parmi les offres.',
    en: 'Try another word, or search the offers directly.'
  },
  menuSearchOffers: { fr: ({ q }) => `Chercher « ${q} » dans les offres`, en: ({ q }) => `Search “${q}” in offers` },
  categoriesCount: { fr: ({ n }) => `${n} catégorie${frPlural(n, '', 's')}`, en: ({ n }) => `${n} categor${plural(n, 'y', 'ies')}` },
  offersCountShort: {
    fr: ({ n }) => (n === 0 ? 'pas encore d’offre de démonstration' : `${n} offre${frPlural(n, '', 's')} de démonstration`),
    en: ({ n }) => (n === 0 ? 'no demonstration offer yet' : `${n} demonstration offer${plural(n, '', 's')}`)
  },

  /* Cover */
  sloganA: { fr: 'Le duty free,', en: 'Duty free,' },
  sloganB: { fr: 'sans passer par l’aéroport', en: 'without going through the airport' },
  coverLead: {
    fr: 'Découvrez des bons plans du monde entier et des produits difficiles à trouver, livrables chez vous.',
    en: 'Discover deals from around the world and hard-to-find products, delivered to your home.'
  },
  plateLabel: { fr: 'Vitrine : trois offres livrables chez vous', en: 'Showcase: three offers that deliver to you' },
  plateNote: {
    fr: 'Photos réelles (Wikimedia Commons) ; offres, vendeurs et prix fictifs.',
    en: 'Real photos (Wikimedia Commons); fictional offers, sellers and prices.'
  },
  plateSources: { fr: 'Sources', en: 'Sources' },
  add: { fr: 'Ajouter', en: 'Add' },
  addedShort: { fr: 'Ajouté', en: 'Added' },
  addToCart: { fr: 'Ajouter au panier', en: 'Add to cart' },
  addToCartFor: { fr: ({ name }) => `Ajouter ${name} au panier`, en: ({ name }) => `Add ${name} to cart` },
  shippingPlus: { fr: ({ amount }) => `+ ${amount} de livraison`, en: ({ amount }) => `+ ${amount} delivery` },
  routeLabel: {
    fr: ({ from, to }) => `Vendeur ${from}, livraison ${to}`,
    en: ({ from, to }) => `Seller ${from}, delivering ${to}`
  },
  localSeller: { fr: ({ country }) => `Vendeur ${country}`, en: ({ country }) => `Seller ${country}` },
  saveFor: { fr: ({ name }) => `Enregistrer ${name} dans les favoris`, en: ({ name }) => `Save ${name}` },
  favAdded: { fr: 'Offre ajoutée aux favoris.', en: 'Offer saved.' },
  favRemoved: { fr: 'Offre retirée des favoris.', en: 'Offer removed from saved.' },

  /* Promises */
  dealsText: {
    fr: 'Des prix avantageux, proposés par des vendeurs du monde entier, avec la livraison affichée à part.',
    en: 'Attractive prices from sellers around the world, with delivery shown separately.'
  },
  rareText: {
    fr: 'Des produits difficiles à trouver dans votre pays, proposés par des vendeurs du monde entier.',
    en: 'Products that are hard to find in your country, offered by sellers around the world.'
  },
  dealsMore: {
    fr: ({ n }) => `Voir ${n === 1 ? 'le bon plan livrable' : `les ${n} bons plans livrables`}`,
    en: ({ n }) => `See ${n === 1 ? 'the deal' : `all ${n} deals`} that deliver`
  },
  rareMore: {
    fr: ({ n }) => `Voir ${n === 1 ? 'l’introuvable livrable' : `les ${n} introuvables livrables`}`,
    en: ({ n }) => `See ${n === 1 ? 'the hard-to-find offer' : `all ${n} hard-to-find offers`} that deliver`
  },
  collectionEmpty: {
    fr: 'Aucune offre de cette sélection n’est livrable dans ce pays pour l’instant.',
    en: 'No offer in this selection delivers to this country yet.'
  },

  /* Departments */
  rayonsTitle: { fr: 'Tous les rayons', en: 'All departments' },
  rayonsText: {
    fr: ({ n }) => `15 rayons et ${n} catégories, des parfums aux maisons préfabriquées. Chaque rayon couvre ses produits et leurs accessoires.`,
    en: ({ n }) => `15 departments and ${n} categories, from fragrances to prefabricated homes. Each department covers its products and their accessories.`
  },
  rayonsTree: { fr: 'Voir l’arborescence complète', en: 'See the full category tree' },
  andMore: { fr: ({ n }) => `et ${n} autre${frPlural(n, '', 's')}`, en: ({ n }) => `and ${n} more` },

  /* Large goods */
  largeTitle: { fr: 'Voitures et maisons, sur demande', en: 'Cars and homes, on request' },
  largeText: {
    fr: 'Les gros biens passent par une demande de devis ou de réservation auprès du vendeur. Dans cette maquette, rien n’est envoyé : aucun acompte ni réservation confirmée.',
    en: 'Large goods go through a quote or reservation request to the seller. In this prototype nothing is sent: no deposit and no confirmed booking.'
  },
  indicativePrice: { fr: 'Prix indicatif', en: 'Indicative price' },
  quoteDelivery: { fr: 'Transport et délai non précisés (démonstration)', en: 'Transport and timing not specified (demonstration)' },
  requestQuote: { fr: 'Demander un devis', en: 'Request a quote' },
  largeMode: { fr: 'Commande', en: 'Ordering' },
  largeModeValue: { fr: 'Devis ou réservation', en: 'Quote or reservation' },
  largeDeposit: { fr: 'Acompte', en: 'Deposit' },
  largeDepositValue: { fr: 'Aucun (démonstration)', en: 'None (demonstration)' },
  largeTransport: { fr: 'Transport et délai', en: 'Transport and timing' },
  largeTransportValue: { fr: 'Non précisés (démonstration)', en: 'Not specified (demonstration)' },
  largeNone: {
    fr: 'Aucun gros bien de démonstration n’est livrable dans ce pays.',
    en: 'No large demonstration goods deliver to this country.'
  },

  /* How ordering works */
  howTitle: { fr: 'Comment commander', en: 'How ordering works' },
  how1Title: { fr: 'Votre pays d’abord', en: 'Your country first' },
  how1Text: {
    fr: 'Le catalogue ne montre que les offres livrables chez vous. La langue se choisit à part.',
    en: 'The catalogue only shows offers that deliver to you. Language is chosen separately.'
  },
  how2Title: { fr: 'Une fiche par vendeur', en: 'One listing per seller' },
  how2Text: {
    fr: 'Un même produit neuf peut avoir plusieurs offres : chaque vendeur a sa fiche, son prix et sa livraison.',
    en: 'The same new product can have several offers: each seller has its own listing, price and delivery.'
  },
  how3Title: { fr: 'Prix et livraison séparés', en: 'Price and delivery apart' },
  how3Text: {
    fr: 'Le prix du produit d’abord, la livraison à côté. Dans cette démonstration, elle est comptée une fois par vendeur.',
    en: 'Product price first, delivery beside it. In this demonstration it is counted once per seller.'
  },
  how4Title: { fr: 'Un seul panier', en: 'One cart' },
  how4Text: {
    fr: 'Plusieurs vendeurs, un seul paiement. Chaque vendeur gère son stock et expédie sa part.',
    en: 'Several sellers, one payment. Each seller manages its stock and ships its part.'
  },

  /* Back cover */
  sellerTitle: { fr: 'Vous vendez des produits neufs ?', en: 'Do you sell new products?' },
  sellerText: {
    fr: 'Particuliers et entreprises peuvent proposer leur catalogue au-delà de leur marché, après vérification.',
    en: 'Individuals and businesses can offer their catalogue beyond their home market, after verification.'
  },
  becomeSeller: { fr: 'Devenir vendeur', en: 'Become a seller' },
  footerBuy: { fr: 'Acheter', en: 'Shop' },
  footerSell: { fr: 'Vendre', en: 'Sell' },
  footerPrototype: { fr: 'Maquette', en: 'Prototype' },
  footerTree: { fr: 'Arborescence des rayons', en: 'Category tree' },
  footerSaved: { fr: 'Mes favoris', en: 'Saved offers' },
  footerSellerSpace: { fr: 'Espace vendeur', en: 'Seller workspace' },
  footerAdmin: { fr: 'Administration', en: 'Administration' },
  footerReset: { fr: 'Réinitialiser la démonstration', en: 'Reset the demonstration' },
  footerResetDone: { fr: 'Démonstration réinitialisée : panier, favoris et demandes vidés.', en: 'Demonstration reset: cart, saved offers and requests cleared.' },
  footerNote: {
    fr: 'DutyFreeDeal, maquette interactive. Prix d’exemple en euros ; pays d’exemple : France, Espagne, États-Unis, Mexique.',
    en: 'DutyFreeDeal, interactive prototype. Example prices in euros; example countries: France, Spain, United States, Mexico.'
  },
  nextStep: { fr: 'Étape suivante', en: 'Next step' },

  /* Cart */
  cartTitle: { fr: 'Panier', en: 'Cart' },
  cartClose: { fr: 'Fermer le panier', en: 'Close cart' },
  cartEmptyTitle: { fr: 'Votre panier est vide', en: 'Your cart is empty' },
  cartEmptyText: {
    fr: 'Ajoutez une offre pour essayer le panier commun à plusieurs vendeurs.',
    en: 'Add an offer to try the shared multi-seller cart.'
  },
  cartIntro: {
    fr: ({ n }) => `${n} vendeur${frPlural(n, '', 's')}, un seul paiement. Chaque vendeur expédie sa part.`,
    en: ({ n }) => `${n} seller${plural(n, '', 's')}, one payment. Each seller ships its part.`
  },
  shippedBy: { fr: ({ name }) => `Expédié par ${name}`, en: ({ name }) => `Shipped by ${name}` },
  shipmentDelivery: { fr: ({ country }) => `Livraison ${country}`, en: ({ country }) => `Delivery ${country}` },
  subtotal: { fr: 'Produits', en: 'Products' },
  delivery: { fr: 'Livraison', en: 'Delivery' },
  total: { fr: 'Total', en: 'Total' },
  deliveryRule: {
    fr: 'Livraison de démonstration comptée une fois par vendeur, pas une règle commerciale.',
    en: 'Demonstration delivery counted once per seller, not a commercial rule.'
  },
  checkout: { fr: 'Passer commande', en: 'Check out' },
  checkoutBlocked: { fr: 'Retirez les offres non livrables pour continuer.', en: 'Remove offers that cannot be delivered to continue.' },
  qtyDecrease: { fr: ({ name }) => `Diminuer la quantité de ${name}`, en: ({ name }) => `Decrease quantity of ${name}` },
  qtyIncrease: { fr: ({ name }) => `Augmenter la quantité de ${name}`, en: ({ name }) => `Increase quantity of ${name}` },
  qtyLabel: { fr: 'Quantité', en: 'Quantity' },
  remove: { fr: 'Retirer', en: 'Remove' },
  removeFor: { fr: ({ name }) => `Retirer ${name} du panier`, en: ({ name }) => `Remove ${name} from cart` },
  issueNotDeliverable: { fr: ({ country }) => `Ne livre pas ${country}`, en: ({ country }) => `Does not deliver ${country}` },
  issueStock: { fr: ({ n }) => `Stock limité à ${n}`, en: ({ n }) => `Only ${n} in stock` },
  added: { fr: ({ name }) => `${name} ajouté au panier.`, en: ({ name }) => `${name} added to cart.` },
  addedMore: { fr: ({ name, qty }) => `${name} : quantité ${qty} dans le panier.`, en: ({ name, qty }) => `${name}: quantity ${qty} in cart.` },
  stockReached: { fr: 'Quantité maximale en stock déjà dans le panier.', en: 'Maximum stock quantity already in cart.' },
  viewCart: { fr: 'Voir le panier', en: 'View cart' },
  removed: { fr: 'Offre retirée du panier.', en: 'Offer removed from cart.' },

  /* Quote dialog */
  quoteTitle: { fr: 'Demande de devis ou de réservation', en: 'Quote or reservation request' },
  quoteType: { fr: 'Type de demande', en: 'Request type' },
  quoteTypeQuote: { fr: 'Devis', en: 'Quote' },
  quoteTypeReservation: { fr: 'Réservation', en: 'Reservation' },
  quoteName: { fr: 'Nom', en: 'Name' },
  quoteEmail: { fr: 'E-mail', en: 'Email' },
  quoteMessage: { fr: 'Message au vendeur (facultatif)', en: 'Message to the seller (optional)' },
  quoteMessageHint: { fr: 'Configuration souhaitée, délais, questions.', en: 'Preferred configuration, timing, questions.' },
  quoteDestination: { fr: 'Pays de livraison', en: 'Delivery country' },
  quoteSend: { fr: 'Enregistrer la demande', en: 'Save request' },
  cancel: { fr: 'Annuler', en: 'Cancel' },
  close: { fr: 'Fermer', en: 'Close' },
  quoteNotice: {
    fr: 'Demande fictive : aucun envoi, aucun acompte et aucune réservation confirmée.',
    en: 'Fictional request: no transmission, no deposit and no confirmed booking.'
  },
  quoteDoneTitle: { fr: 'Demande enregistrée dans la maquette', en: 'Request saved in the prototype' },
  quoteDoneText: {
    fr: ({ ref }) => `Référence ${ref}. Rien n’a été envoyé au vendeur : la demande reste dans ce navigateur.`,
    en: ({ ref }) => `Reference ${ref}. Nothing was sent to the seller: the request stays in this browser.`
  },
  errName: { fr: 'Indiquez votre nom.', en: 'Enter your name.' },
  errEmailMissing: { fr: 'Indiquez une adresse e-mail, par exemple nom@exemple.fr.', en: 'Enter an email address, for example name@example.com.' },
  errEmail: { fr: 'Cette adresse e-mail semble incomplète : vérifiez-la, par exemple nom@exemple.fr.', en: 'This email address looks incomplete: check it, for example name@example.com.' },

  /* Catalogue */
  home: { fr: 'Accueil', en: 'Home' },
  breadcrumb: { fr: 'Fil d’Ariane', en: 'Breadcrumb' },
  catalogueAll: { fr: 'Toutes les offres', en: 'All offers' },
  catalogueSearch: { fr: ({ q }) => `Résultats pour « ${q} »`, en: ({ q }) => `Results for “${q}”` },
  catalogueCount: {
    fr: ({ n, country }) => (n === 0 ? `Aucune offre livrable ${country}` : `${n} offre${frPlural(n, '', 's')} livrable${frPlural(n, '', 's')} ${country}`),
    en: ({ n, country }) => (n === 0 ? `No offers delivering ${country}` : `${n} offer${plural(n, '', 's')} delivering ${country}`)
  },
  demoCatalogue: { fr: 'Catalogue de démonstration', en: 'Demonstration catalogue' },
  refine: { fr: 'Affiner', en: 'Refine' },
  filterDepartment: { fr: 'Rayon', en: 'Department' },
  filterCollection: { fr: 'Sélection', en: 'Selection' },
  filterMode: { fr: 'Mode d’achat', en: 'Buying mode' },
  filterOrigin: { fr: 'Pays du vendeur', en: 'Seller country' },
  all: { fr: 'Tout', en: 'All' },
  modePurchase: { fr: 'Achat direct', en: 'Buy now' },
  modeQuote: { fr: 'Sur demande', en: 'On request' },
  sort: { fr: 'Trier par', en: 'Sort by' },
  sortRelevance: { fr: 'Pertinence', en: 'Relevance' },
  sortPriceAsc: { fr: 'Prix croissant', en: 'Price: low to high' },
  sortPriceDesc: { fr: 'Prix décroissant', en: 'Price: high to low' },
  clearFilters: { fr: 'Effacer les filtres', en: 'Clear filters' },
  catalogueEmptyTitle: { fr: 'Aucune offre ne correspond', en: 'No matching offers' },
  catalogueEmptyText: {
    fr: 'Le catalogue de démonstration ne couvre qu’une partie des rayons. Essayez un autre mot, un autre rayon ou un autre pays de livraison.',
    en: 'The demonstration catalogue only covers some departments. Try another word, department or delivery country.'
  },
  departmentEmptyTitle: { fr: 'Pas encore d’offre dans ce rayon', en: 'No offers in this department yet' },
  departmentEmptyText: {
    fr: ({ country }) => `Le catalogue de démonstration n’a pas d’offre livrable ${country} dans ce rayon. Ses catégories restent consultables ci-dessous.`,
    en: ({ country }) => `The demonstration catalogue has no offer delivering ${country} in this department. Its categories remain listed below.`
  },
  outOfStock: { fr: 'Rupture de stock', en: 'Out of stock' },
  inStock: { fr: ({ n }) => `En stock : ${n}`, en: ({ n }) => `In stock: ${n}` },
  onRequest: { fr: 'Sur demande', en: 'On request' },
  seeOffer: { fr: 'Voir l’offre', en: 'View offer' },
  notDeliverableShort: { fr: ({ country }) => `Non livrable ${country}`, en: ({ country }) => `Does not deliver ${country}` },

  /* Product */
  soldBy: { fr: 'Vendu et expédié par', en: 'Sold and shipped by' },
  business: { fr: 'Entreprise', en: 'Business' },
  individual: { fr: 'Particulier', en: 'Individual' },
  verificationDemo: { fr: ({ kind }) => `Vérification ${kind} de démonstration`, en: ({ kind }) => `Demonstration ${kind} verification` },
  sellerCountryNote: { fr: 'Pays du vendeur, pas lieu de fabrication.', en: 'Seller’s country, not place of manufacture.' },
  deliveryTime: { fr: 'Délai', en: 'Delivery time' },
  deliveryTo: { fr: ({ country }) => `Livraison ${country}`, en: ({ country }) => `Delivery ${country}` },
  otherOffers: { fr: 'Autres offres pour ce produit', en: 'Other offers for this product' },
  otherOffersText: { fr: 'Chaque vendeur a sa propre fiche, son prix et sa livraison.', en: 'Each seller has its own listing, price and delivery.' },
  noOtherOffers: { fr: 'Aucune autre offre livrable pour ce produit.', en: 'No other deliverable offer for this product.' },
  specs: { fr: 'Caractéristiques', en: 'Details' },
  productNotDeliverable: {
    fr: ({ country }) => `Cette offre ne livre pas ${country}. Choisissez un autre pays de livraison pour l’acheter.`,
    en: ({ country }) => `This offer does not deliver ${country}. Choose another delivery country to buy it.`
  },
  productMissing: { fr: 'Cette offre est introuvable', en: 'This offer cannot be found' },
  productMissingText: { fr: 'Elle n’existe pas dans le catalogue de démonstration.', en: 'It does not exist in the demonstration catalogue.' },
  backToCatalogue: { fr: 'Retour au catalogue', en: 'Back to catalogue' },
  pageInProgress: {
    fr: 'Page fonctionnelle simplifiée : sa refonte détaillée suivra la validation de l’accueil.',
    en: 'Simplified working page: its detailed redesign follows the home page review.'
  },

  /* Static pages */
  wishlistTitle: { fr: 'Mes favoris', en: 'Saved offers' },
  wishlistEmptyTitle: { fr: 'Aucun favori pour l’instant', en: 'No saved offers yet' },
  wishlistEmptyText: { fr: 'Le cœur d’une offre l’enregistre ici, dans ce navigateur.', en: 'The heart on an offer saves it here, in this browser.' },
  ordersTitle: { fr: 'Mes commandes', en: 'My orders' },
  ordersEmptyTitle: { fr: 'Aucune commande pour l’instant', en: 'No orders yet' },
  ordersEmptyText: {
    fr: 'Les commandes de démonstration apparaîtront ici avec un suivi par vendeur. Le paiement de démonstration sera repris à l’étape suivante de la refonte.',
    en: 'Demonstration orders will appear here with tracking per seller. The demonstration checkout comes in the next redesign step.'
  },
  requestsTitle: { fr: 'Demandes de devis et de réservation', en: 'Quote and reservation requests' },
  checkoutTitle: { fr: 'Commande', en: 'Checkout' },
  checkoutText: {
    fr: 'Le paiement de démonstration (un seul paiement pour plusieurs vendeurs) sera refondu après validation de l’accueil. Votre panier est conservé.',
    en: 'The demonstration checkout (one payment for several sellers) will be redesigned after the home page review. Your cart is kept.'
  },
  sellTitle: { fr: 'Devenir vendeur', en: 'Become a seller' },
  sellText: {
    fr: 'Particuliers et entreprises pourront s’inscrire après vérification (KYC pour un particulier, KYB pour une entreprise). Les procédures exactes par pays restent à définir. Ce parcours sera refondu après validation de l’accueil.',
    en: 'Individuals and businesses will register after verification (KYC for an individual, KYB for a business). Exact country procedures remain to be defined. This journey will be redesigned after the home page review.'
  },
  sellerSpaceTitle: { fr: 'Espace vendeur', en: 'Seller workspace' },
  sellerSpaceText: {
    fr: 'Stock, offres et expéditions par vendeur. Cette interface sera refondue après validation de l’accueil.',
    en: 'Stock, offers and shipments per seller. This interface will be redesigned after the home page review.'
  },
  adminTitle: { fr: 'Administration', en: 'Administration' },
  adminText: {
    fr: 'Vue sur les vendeurs, les offres, les commandes et les problèmes à traiter. Cette interface sera refondue après validation de l’accueil.',
    en: 'Overview of sellers, offers, orders and issues. This interface will be redesigned after the home page review.'
  },
  backHome: { fr: 'Retour à l’accueil', en: 'Back to home' },
  creditsTitle: { fr: 'Sources et licences', en: 'Sources and licences' },
  creditsIntro: {
    fr: 'Les photographies de produits sont réelles et proviennent de Wikimedia Commons ; elles illustrent des offres fictives et ne désignent pas des références réellement proposées. Les images de rayons, de la voiture et de la maison sont des illustrations générées pour la maquette.',
    en: 'Product photographs are real and come from Wikimedia Commons; they illustrate fictional offers and do not refer to products actually offered. Department, car and house images are illustrations generated for the prototype.'
  },
  creditsReal: { fr: 'Photographies réelles', en: 'Real photographs' },
  creditsGenerated: { fr: 'Illustrations générées', en: 'Generated illustrations' },
  creditsTools: { fr: 'Police et icônes', en: 'Typeface and icons' },
  creditsAuthor: { fr: 'Auteur', en: 'Author' },
  creditsLicence: { fr: 'Licence', en: 'Licence' },
  creditsSource: { fr: 'Source', en: 'Source' },
  creditsFile: { fr: 'Fichier', en: 'File' },
  treeTitle: { fr: 'Arborescence des rayons', en: 'Category tree' },
  treeText: {
    fr: ({ n }) => `Les 15 rayons et leurs ${n} catégories de démonstration. Cette arborescence n’est pas un catalogue final exhaustif.`,
    en: ({ n }) => `The 15 departments and their ${n} demonstration categories. This tree is not a final, exhaustive catalogue.`
  },
  notFoundTitle: { fr: 'Cette page n’existe pas', en: 'This page does not exist' },
  notFoundText: { fr: 'Le lien est peut-être incomplet.', en: 'The link may be incomplete.' }
};
