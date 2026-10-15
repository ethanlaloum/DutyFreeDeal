/*
 * DutyFreeDeal demonstration catalogue.
 * Sellers, offer names, EUR prices, stock and fulfilment figures are fictional.
 * Existing photographs are illustrations, not assertions about a real model.
 * Collections do not assert verified savings, exclusivity or market scarcity.
 */
(function () {
  'use strict';

  const L = (fr, en) => ({ fr, en });
  const node = (id, fr, en, children) => ({
    id,
    name: L(fr, en),
    ...(children ? { children } : {})
  });

  const countries = [
    { code: 'FR', name: L('France', 'France') },
    { code: 'ES', name: L('Espagne', 'Spain') },
    { code: 'US', name: L('États-Unis', 'United States') },
    { code: 'MX', name: L('Mexique', 'Mexico') }
  ];

  const categories = [
    node('fashion', 'Mode, chaussures et accessoires', 'Fashion, shoes and accessories', [
      node('fashion-clothing', 'Vêtements', 'Clothing', [
        node('clothing-tops', 'Hauts', 'Tops'),
        node('clothing-bottoms', 'Pantalons et jupes', 'Trousers and skirts'),
        node('clothing-outerwear', 'Vestes et manteaux', 'Jackets and coats')
      ]),
      node('fashion-shoes', 'Chaussures', 'Shoes', [
        node('shoes-sneakers', 'Baskets', 'Sneakers'),
        node('shoes-boots', 'Bottes et bottines', 'Boots'),
        node('shoes-sandals', 'Sandales', 'Sandals')
      ]),
      node('fashion-accessories', 'Accessoires', 'Accessories', [
        node('accessories-bags', 'Sacs', 'Bags'),
        node('accessories-luggage', 'Bagages', 'Luggage'),
        node('accessories-watches', 'Montres', 'Watches'),
        node('accessories-jewellery', 'Bijoux', 'Jewellery')
      ])
    ]),
    node('beauty', 'Beauté et parfums', 'Beauty and fragrances', [
      node('beauty-fragrances', 'Parfums', 'Fragrances', [
        node('fragrances-eau-de-parfum', 'Eaux de parfum', 'Eau de parfum'),
        node('fragrances-eau-de-toilette', 'Eaux de toilette', 'Eau de toilette'),
        node('fragrances-sets', 'Coffrets', 'Fragrance sets')
      ]),
      node('beauty-skincare', 'Soins', 'Skincare', [
        node('skincare-face', 'Visage', 'Face care'),
        node('skincare-body', 'Corps', 'Body care')
      ]),
      node('beauty-makeup', 'Maquillage', 'Makeup', [
        node('makeup-face', 'Teint', 'Face makeup'),
        node('makeup-eyes', 'Yeux', 'Eye makeup')
      ]),
      node('beauty-hair', 'Cheveux', 'Hair care', [
        node('hair-products', 'Soins capillaires', 'Hair products'),
        node('hair-tools', 'Appareils et accessoires', 'Hair tools and accessories')
      ])
    ]),
    node('tech', 'High-tech, informatique et téléphonie', 'Electronics, computing and phones', [
      node('tech-audio', 'Audio', 'Audio', [
        node('audio-headphones', 'Casques et écouteurs', 'Headphones and earphones'),
        node('audio-speakers', 'Enceintes', 'Speakers'),
        node('audio-hi-fi', 'Hi-fi', 'Hi-fi equipment')
      ]),
      node('tech-photo', 'Photo et vidéo', 'Photography and video', [
        node('photo-cameras', 'Appareils photo', 'Cameras'),
        node('photo-lenses', 'Objectifs', 'Lenses'),
        node('photo-accessories', 'Accessoires photo', 'Camera accessories')
      ]),
      node('tech-computing', 'Informatique', 'Computing', [
        node('computing-laptops', 'Ordinateurs portables', 'Laptops'),
        node('computing-desktops', 'Ordinateurs de bureau', 'Desktop computers'),
        node('computing-components', 'Composants et périphériques', 'Components and peripherals')
      ]),
      node('tech-phones', 'Téléphonie', 'Phones', [
        node('phones-smartphones', 'Smartphones', 'Smartphones'),
        node('phones-accessories', 'Accessoires', 'Phone accessories')
      ])
    ]),
    node('home', 'Maison, mobilier et décoration', 'Home, furniture and decor', [
      node('home-furniture', 'Mobilier', 'Furniture', [
        node('furniture-chairs', 'Chaises', 'Chairs'),
        node('furniture-tables', 'Tables', 'Tables'),
        node('furniture-sofas', 'Canapés et fauteuils', 'Sofas and armchairs'),
        node('furniture-storage', 'Rangements', 'Storage furniture')
      ]),
      node('home-decor', 'Décoration', 'Decor', [
        node('decor-lighting', 'Luminaires', 'Lighting'),
        node('decor-objects', 'Objets décoratifs', 'Decorative objects')
      ]),
      node('home-textiles', 'Linge de maison', 'Home textiles', [
        node('textiles-bedding', 'Linge de lit', 'Bed linen'),
        node('textiles-bath', 'Linge de bain', 'Bath linen')
      ])
    ]),
    node('kitchen', 'Cuisine et électroménager', 'Kitchen and appliances', [
      node('kitchen-cookware', 'Ustensiles de cuisine', 'Cookware', [
        node('cookware-pans', 'Casseroles et poêles', 'Pots and pans'),
        node('cookware-tools', 'Ustensiles', 'Kitchen tools')
      ]),
      node('kitchen-small-appliances', 'Petit électroménager', 'Small appliances', [
        node('appliances-coffee', 'Cafetières', 'Coffee makers'),
        node('appliances-food-preparation', 'Robots de cuisine', 'Food processors'),
        node('appliances-kettles', 'Bouilloires', 'Kettles')
      ]),
      node('kitchen-large-appliances', 'Gros électroménager', 'Large appliances', [
        node('appliances-refrigeration', 'Réfrigérateurs', 'Refrigerators'),
        node('appliances-laundry', 'Lave-linge', 'Washing machines'),
        node('appliances-cooking', 'Fours et cuisinières', 'Ovens and cookers')
      ]),
      node('kitchen-tableware', 'Arts de la table', 'Tableware', [
        node('tableware-dishes', 'Vaisselle', 'Dishes'),
        node('tableware-glasses', 'Verres', 'Glassware')
      ])
    ]),
    node('garden', 'Jardin et extérieur', 'Garden and outdoors', [
      node('garden-plants', 'Plantes et jardinage', 'Plants and gardening', [
        node('garden-live-plants', 'Plantes', 'Plants'),
        node('garden-pots', 'Pots et jardinières', 'Pots and planters')
      ]),
      node('garden-furniture', 'Mobilier extérieur', 'Outdoor furniture', [
        node('garden-seating', 'Assises de jardin', 'Garden seating'),
        node('garden-tables', 'Tables de jardin', 'Garden tables')
      ]),
      node('garden-equipment', 'Équipement du jardin', 'Garden equipment', [
        node('garden-tools', 'Outils de jardin', 'Garden tools'),
        node('garden-watering', 'Arrosage', 'Watering equipment')
      ])
    ]),
    node('construction', 'Bricolage, outillage et construction', 'DIY, tools and construction', [
      node('construction-tools', 'Outillage', 'Tools', [
        node('tools-hand', 'Outils manuels', 'Hand tools'),
        node('tools-power', 'Outils électriques', 'Power tools'),
        node('tools-workshop', 'Équipement d’atelier', 'Workshop equipment')
      ]),
      node('construction-materials', 'Matériaux', 'Building materials', [
        node('materials-timber', 'Bois et panneaux', 'Timber and panels'),
        node('materials-flooring', 'Revêtements', 'Flooring and finishes'),
        node('materials-fixtures', 'Équipements de construction', 'Building fixtures')
      ]),
      node('construction-prefab', 'Habitat préfabriqué', 'Prefabricated housing', [
        node('prefab-houses', 'Maisons préfabriquées', 'Prefabricated houses'),
        node('prefab-studios', 'Studios de jardin', 'Garden studios'),
        node('prefab-modules', 'Modules et extensions', 'Modules and extensions')
      ])
    ]),
    node('auto', 'Auto et moto', 'Cars and motorcycles', [
      node('auto-cars', 'Voitures', 'Cars', [
        node('cars-passenger', 'Voitures particulières', 'Passenger cars'),
        node('cars-suv', 'SUV et tout-terrain', 'SUVs and off-road vehicles'),
        node('cars-electric', 'Voitures électriques', 'Electric cars')
      ]),
      node('auto-motorcycles', 'Motos et scooters', 'Motorcycles and scooters', [
        node('motorcycles-road', 'Motos', 'Motorcycles'),
        node('motorcycles-scooters', 'Scooters', 'Scooters')
      ]),
      node('auto-utility', 'Véhicules utilitaires', 'Commercial vehicles', [
        node('utility-vans', 'Fourgons', 'Vans'),
        node('utility-pickups', 'Pick-up', 'Pickup trucks')
      ]),
      node('auto-parts', 'Pièces et accessoires', 'Parts and accessories', [
        node('parts-mechanical', 'Pièces mécaniques', 'Mechanical parts'),
        node('parts-bodywork', 'Carrosserie', 'Bodywork'),
        node('parts-tyres', 'Pneus et roues', 'Tyres and wheels'),
        node('parts-accessories', 'Accessoires du véhicule', 'Vehicle accessories')
      ]),
      node('auto-maintenance', 'Entretien et équipement', 'Maintenance and equipment', [
        node('maintenance-products', 'Produits d’entretien', 'Care products'),
        node('maintenance-tools', 'Outils et diagnostic', 'Tools and diagnostics'),
        node('maintenance-rider', 'Équipement du conducteur', 'Rider equipment')
      ])
    ]),
    node('sports', 'Sports et plein air', 'Sports and outdoor activities', [
      node('sports-fitness', 'Fitness', 'Fitness', [
        node('fitness-training', 'Musculation', 'Strength training'),
        node('fitness-yoga', 'Yoga et bien-être', 'Yoga and wellness')
      ]),
      node('sports-outdoor', 'Plein air', 'Outdoor activities', [
        node('outdoor-hiking', 'Randonnée', 'Hiking'),
        node('outdoor-camping', 'Camping', 'Camping')
      ]),
      node('sports-cycling', 'Cyclisme', 'Cycling', [
        node('cycling-bikes', 'Vélos', 'Bicycles'),
        node('cycling-equipment', 'Équipement cycliste', 'Cycling equipment')
      ])
    ]),
    node('toys', 'Jeux et jouets', 'Games and toys', [
      node('toys-games', 'Jeux', 'Games', [
        node('games-board', 'Jeux de société', 'Board games'),
        node('games-puzzles', 'Puzzles', 'Puzzles')
      ]),
      node('toys-play', 'Jouets', 'Toys', [
        node('play-building', 'Jeux de construction', 'Building toys'),
        node('play-figures', 'Figurines et poupées', 'Figures and dolls'),
        node('play-outdoor', 'Jouets de plein air', 'Outdoor toys')
      ])
    ]),
    node('baby', 'Bébé et puériculture', 'Baby and nursery', [
      node('baby-travel', 'Promenade et transport', 'Travel and transport', [
        node('baby-strollers', 'Poussettes', 'Strollers'),
        node('baby-car-seats', 'Sièges auto', 'Car seats')
      ]),
      node('baby-nursery', 'Chambre de bébé', 'Nursery', [
        node('baby-cots', 'Lits', 'Cots'),
        node('baby-mattresses', 'Matelas', 'Mattresses')
      ]),
      node('baby-care', 'Repas et soins', 'Feeding and care', [
        node('baby-feeding', 'Accessoires de repas', 'Feeding accessories'),
        node('baby-bath', 'Bain et toilette', 'Bath and care')
      ])
    ]),
    node('food', 'Épicerie et boissons', 'Groceries and drinks', [
      node('food-savoury', 'Épicerie salée', 'Savoury groceries', [
        node('food-pantry', 'Produits du placard', 'Pantry staples'),
        node('food-spices', 'Épices et condiments', 'Spices and condiments')
      ]),
      node('food-sweet', 'Épicerie sucrée', 'Sweet groceries', [
        node('food-chocolate', 'Chocolats et confiseries', 'Chocolate and sweets'),
        node('food-biscuits', 'Biscuits', 'Biscuits')
      ]),
      node('food-drinks', 'Boissons', 'Drinks', [
        node('drinks-coffee-tea', 'Café et thé', 'Coffee and tea'),
        node('drinks-juice', 'Jus et boissons', 'Juice and drinks')
      ])
    ]),
    node('pets', 'Animaux', 'Pets', [
      node('pets-food', 'Alimentation', 'Pet food', [
        node('pets-dog-food', 'Chiens', 'Dog food'),
        node('pets-cat-food', 'Chats', 'Cat food')
      ]),
      node('pets-accessories', 'Accessoires', 'Pet accessories', [
        node('pets-beds', 'Couchages', 'Pet beds'),
        node('pets-leads', 'Laisses et colliers', 'Leads and collars')
      ]),
      node('pets-aquariums', 'Aquariophilie', 'Aquariums', [
        node('pets-tanks', 'Aquariums', 'Fish tanks'),
        node('pets-aquarium-equipment', 'Équipement', 'Aquarium equipment')
      ])
    ]),
    node('books', 'Livres et culture', 'Books and culture', [
      node('books-printed', 'Livres imprimés', 'Printed books', [
        node('books-fiction', 'Romans et littérature', 'Fiction and literature'),
        node('books-practical', 'Livres pratiques', 'Practical books')
      ]),
      node('books-music', 'Musique', 'Music', [
        node('music-instruments', 'Instruments', 'Musical instruments'),
        node('music-records', 'Disques', 'Records')
      ]),
      node('books-creative', 'Loisirs créatifs', 'Arts and crafts', [
        node('creative-painting', 'Dessin et peinture', 'Drawing and painting'),
        node('creative-crafts', 'Matériel créatif', 'Craft supplies')
      ])
    ]),
    node('office', 'Bureau et papeterie', 'Office and stationery', [
      node('office-stationery', 'Papeterie', 'Stationery', [
        node('office-writing', 'Écriture', 'Writing supplies'),
        node('office-paper', 'Papier et carnets', 'Paper and notebooks')
      ]),
      node('office-organisation', 'Organisation du bureau', 'Office organisation', [
        node('office-filing', 'Classement', 'Filing'),
        node('office-desk-accessories', 'Accessoires de bureau', 'Desk accessories')
      ]),
      node('office-equipment', 'Équipement de bureau', 'Office equipment', [
        node('office-printers', 'Imprimantes', 'Printers'),
        node('office-shredders', 'Destructeurs de documents', 'Paper shredders')
      ])
    ])
  ];

  const vendors = [
    {
      id: 'atelier-demo', name: 'Atelier Passage · Démo', country: 'FR', type: 'business',
      deliveryTo: ['FR', 'ES', 'US', 'MX'], shipping: { FR: 8.9, ES: 12.9, US: 22.9, MX: 25.9 }, verification: 'kyb'
    },
    {
      id: 'costa-demo', name: 'Costa Collection · Démo', country: 'ES', type: 'business',
      deliveryTo: ['FR', 'ES', 'US'], shipping: { FR: 11.9, ES: 7.9, US: 24.9 }, verification: 'kyb'
    },
    {
      id: 'pacific-demo', name: 'Pacific Objects · Démo', country: 'US', type: 'business',
      deliveryTo: ['FR', 'ES', 'US', 'MX'], shipping: { FR: 19.9, ES: 21.9, US: 6.9, MX: 16.9 }, verification: 'kyb'
    },
    {
      id: 'mercado-demo', name: 'Mercado Horizonte · Démo', country: 'MX', type: 'business',
      deliveryTo: ['FR', 'US', 'MX'], shipping: { FR: 24.9, US: 14.9, MX: 5.9 }, verification: 'kyb'
    },
    {
      id: 'individual-fr-demo', name: 'Camille Exemple · Démo', country: 'FR', type: 'individual',
      deliveryTo: ['FR', 'ES'], shipping: { FR: 5.9, ES: 8.9 }, verification: 'kyc'
    },
    {
      id: 'individual-us-demo', name: 'Taylor Sample · Démo', country: 'US', type: 'individual',
      deliveryTo: ['US', 'MX'], shipping: { US: 7.9, MX: 11.9 }, verification: 'kyc'
    },
    {
      id: 'forms-demo', name: 'Formes Habitat · Démo', country: 'ES', type: 'business',
      deliveryTo: ['FR', 'ES'], shipping: { FR: 29, ES: 19 }, verification: 'kyb'
    },
    {
      id: 'mobility-demo', name: 'Mobilité Atlas · Démo', country: 'ES', type: 'business',
      deliveryTo: ['FR', 'ES'], shipping: { FR: 390, ES: 250 }, verification: 'kyb'
    },
    {
      id: 'modular-demo', name: 'Module Horizon · Démo', country: 'FR', type: 'business',
      deliveryTo: ['FR', 'ES'], shipping: { FR: 1400, ES: 2200 }, verification: 'kyb'
    },
    {
      id: 'cargo-demo', name: 'Atlas Projects · Démo', country: 'US', type: 'business',
      deliveryTo: ['US', 'MX'], shipping: { US: 790, MX: 890 }, verification: 'kyb'
    }
  ];

  const spec = (frName, enName, frValue, enValue) => ({
    name: L(frName, enName), value: L(frValue, enValue)
  });
  const condition = spec('État', 'Condition', 'Neuf · démonstration', 'New · demonstration');
  const illustration = spec('Visuel', 'Image', 'Photo illustrative', 'Illustrative photograph');
  const fictionalOffer = L(
    'Offre fictive de démonstration. La photo est illustrative ; le prix, le vendeur, le stock et le délai sont des exemples. Les caractéristiques d’un modèle réel ne sont pas affirmées.',
    'Fictional demonstration offer. The photograph is illustrative; the price, seller, stock and delivery time are examples. No specifications of a real model are asserted.'
  );
  const fictionalQuote = L(
    'Offre fictive pour illustrer les grands biens. Demande de devis ou de réservation simulée, sans paiement ni réservation confirmée. Configuration, transport et délai restent à préciser dans le devis.',
    'Fictional offer illustrating large goods. Simulated quotation or reservation enquiry, with no payment or confirmed reservation. Configuration, transport and timing are to be specified in the quotation.'
  );

  const models = {
    perfume: {
      name: L('Parfum Signature 01', 'Signature 01 fragrance'),
      category: 'beauty', path: ['beauty', 'beauty-fragrances', 'fragrances-eau-de-parfum'],
      image: './assets/perfume.jpg', mode: 'purchase', description: fictionalOffer,
      specs: [condition, illustration, spec('Présentation', 'Presentation', 'Flacon en verre · illustration', 'Glass bottle · illustration')]
    },
    headphones: {
      name: L('Casque Studio 01', 'Studio 01 headphones'),
      category: 'tech', path: ['tech', 'tech-audio', 'audio-headphones'],
      image: './assets/headphones.jpg', mode: 'purchase', description: fictionalOffer,
      specs: [condition, illustration, spec('Présentation', 'Presentation', 'Casque audio · illustration', 'Over-ear headphones · illustration'), spec('Couleur du visuel', 'Image colour', 'Noir et argent', 'Black and silver')]
    },
    camera: {
      name: L('Appareil photo Horizon 01', 'Horizon 01 camera'),
      category: 'tech', path: ['tech', 'tech-photo', 'photo-cameras'],
      image: './assets/camera.jpg', mode: 'purchase', description: fictionalOffer,
      specs: [condition, illustration, spec('Présentation', 'Presentation', 'Boîtier avec objectif · illustration', 'Camera body with lens · illustration')]
    },
    bag: {
      name: L('Sac Botanique 01', 'Botanique 01 handbag'),
      category: 'fashion', path: ['fashion', 'fashion-accessories', 'accessories-bags'],
      image: './assets/bag.jpg', mode: 'purchase', description: fictionalOffer,
      specs: [condition, illustration, spec('Présentation', 'Presentation', 'Sac à main · illustration', 'Handbag · illustration'), spec('Couleur du visuel', 'Image colour', 'Vert', 'Green')]
    },
    watch: {
      name: L('Montre Ligne 01', 'Ligne 01 watch'),
      category: 'fashion', path: ['fashion', 'fashion-accessories', 'accessories-watches'],
      image: './assets/watch.jpg', mode: 'purchase', description: fictionalOffer,
      specs: [condition, illustration, spec('Présentation', 'Presentation', 'Cadran analogique · illustration', 'Analogue dial · illustration'), spec('Couleur du visuel', 'Image colour', 'Noir et argent', 'Black and silver')]
    },
    sneakers: {
      name: L('Baskets Canvas 01', 'Canvas 01 sneakers'),
      category: 'fashion', path: ['fashion', 'fashion-shoes', 'shoes-sneakers'],
      image: './assets/sneakers.jpg', mode: 'purchase', description: fictionalOffer,
      specs: [condition, illustration, spec('Présentation', 'Presentation', 'Baskets basses · illustration', 'Low-top sneakers · illustration'), spec('Couleur du visuel', 'Image colour', 'Blanc', 'White')]
    },
    chair: {
      name: L('Chaise Courbe 01', 'Courbe 01 chair'),
      category: 'home', path: ['home', 'home-furniture', 'furniture-chairs'],
      image: './assets/chair.jpg', mode: 'purchase', description: fictionalOffer,
      specs: [condition, illustration, spec('Présentation', 'Presentation', 'Chaise · illustration', 'Chair · illustration'), spec('Aspect du visuel', 'Image appearance', 'Bois courbé', 'Curved wood')]
    },
    suitcase: {
      name: L('Valise Métal 01', 'Metal 01 suitcase'),
      category: 'fashion', path: ['fashion', 'fashion-accessories', 'accessories-luggage'],
      image: './assets/suitcase.jpg', mode: 'purchase', description: fictionalOffer,
      specs: [condition, illustration, spec('Présentation', 'Presentation', 'Valise à roulettes · illustration', 'Wheeled suitcase · illustration'), spec('Aspect du visuel', 'Image appearance', 'Métal argenté', 'Silver metal')]
    },
    car: {
      name: L('Voiture Touring 01', 'Touring 01 car'),
      category: 'auto', path: ['auto', 'auto-cars', 'cars-passenger'],
      image: './assets/car.png', mode: 'quote', description: fictionalQuote,
      specs: [condition, spec('Modèle', 'Model', 'Véhicule fictif de démonstration', 'Fictional demonstration vehicle'), spec('Configuration', 'Configuration', 'À préciser dans le devis', 'To be specified in the quotation')]
    },
    house: {
      name: L('Maison Modulaire 01', 'Modulaire 01 prefab house'),
      category: 'construction', path: ['construction', 'construction-prefab', 'prefab-houses'],
      image: './assets/house.png', mode: 'quote', description: fictionalQuote,
      specs: [condition, spec('Modèle', 'Model', 'Habitat fictif de démonstration', 'Fictional demonstration home'), spec('Configuration', 'Configuration', 'À préciser dans le devis', 'To be specified in the quotation')]
    }
  };

  const offer = (id, modelKey, vendorId, price, stock, collections, frDelivery, enDelivery) => ({
    id,
    ...models[modelKey],
    brand: 'Illustration démo',
    vendorId,
    price,
    stock,
    collections,
    delivery: L(frDelivery, enDelivery)
  });

  const products = [
    offer('perfume-atelier', 'perfume', 'atelier-demo', 79, 18, ['deals'], '4–7 jours · exemple', '4–7 days · example'),
    offer('headphones-pacific', 'headphones', 'pacific-demo', 129, 16, ['deals'], '6–10 jours · exemple', '6–10 days · example'),
    offer('bag-camille', 'bag', 'individual-fr-demo', 98, 3, ['rare'], '3–6 jours · exemple', '3–6 days · example'),
    offer('camera-pacific', 'camera', 'pacific-demo', 649, 6, ['rare'], '6–10 jours · exemple', '6–10 days · example'),
    offer('sneakers-costa', 'sneakers', 'costa-demo', 69, 20, ['deals'], '4–8 jours · exemple', '4–8 days · example'),
    offer('chair-formes', 'chair', 'forms-demo', 189, 10, ['rare'], '7–12 jours · exemple', '7–12 days · example'),
    offer('watch-atelier', 'watch', 'atelier-demo', 149, 9, ['deals'], '4–7 jours · exemple', '4–7 days · example'),
    offer('suitcase-pacific', 'suitcase', 'pacific-demo', 229, 8, ['deals'], '6–10 jours · exemple', '6–10 days · example'),
    offer('car-mobility', 'car', 'mobility-demo', 24900, 2, ['rare'], 'Transport et délai à préciser dans le devis · exemple', 'Transport and timing to be specified in the quotation · example'),
    offer('house-module', 'house', 'modular-demo', 68900, 1, ['rare'], 'Transport et délai à préciser dans le devis · exemple', 'Transport and timing to be specified in the quotation · example'),
    offer('perfume-costa', 'perfume', 'costa-demo', 84, 12, ['deals'], '4–8 jours · exemple', '4–8 days · example'),
    offer('headphones-atelier', 'headphones', 'atelier-demo', 139, 8, ['deals'], '4–7 jours · exemple', '4–7 days · example'),
    offer('perfume-mercado', 'perfume', 'mercado-demo', 82, 9, ['rare'], '7–12 jours · exemple', '7–12 days · example'),
    offer('headphones-costa', 'headphones', 'costa-demo', 135, 7, ['rare'], '4–8 jours · exemple', '4–8 days · example'),
    offer('camera-costa', 'camera', 'costa-demo', 675, 4, ['deals'], '4–8 jours · exemple', '4–8 days · example'),
    offer('bag-mercado', 'bag', 'mercado-demo', 105, 5, ['rare'], '7–12 jours · exemple', '7–12 days · example'),
    offer('watch-taylor', 'watch', 'individual-us-demo', 155, 2, ['rare'], '4–8 jours · exemple', '4–8 days · example'),
    offer('sneakers-mercado', 'sneakers', 'mercado-demo', 72, 12, ['deals'], '7–12 jours · exemple', '7–12 days · example'),
    offer('chair-camille', 'chair', 'individual-fr-demo', 199, 2, ['rare'], '3–6 jours · exemple', '3–6 days · example'),
    offer('suitcase-costa', 'suitcase', 'costa-demo', 245, 6, ['rare'], '4–8 jours · exemple', '4–8 days · example'),
    offer('car-atlas', 'car', 'cargo-demo', 25900, 3, ['rare'], 'Transport et délai à préciser dans le devis · exemple', 'Transport and timing to be specified in the quotation · example'),
    offer('house-atlas', 'house', 'cargo-demo', 72500, 1, ['rare'], 'Transport et délai à préciser dans le devis · exemple', 'Transport and timing to be specified in the quotation · example')
  ];

  window.DFD_DATA = { countries, categories, vendors, products };
})();
