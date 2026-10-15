/*
 * DutyFreeDeal, explorations de direction : catalogue de démonstration partagé par les explorations.
 * Généré depuis ../../js/data.js et ../../assets/CREDITS.json (refonte), détourages de shared/photos/manifest.json. Ne pas éditer à la main.
 * Vendeurs, noms d’offres, prix en EUR, stocks et délais sont fictifs. Les photos réelles sont illustratives.
 * Le pays affiché est celui du vendeur, pas le lieu de fabrication.
 */
window.DFD = (() => {
  'use strict';
  const data = {
  "demoNotice": "Maquette de démonstration : produits, vendeurs et prix fictifs, aucune transaction réelle.",
  "slogan": "Le duty free, sans passer par l’aéroport",
  "pitch": "Découvrez des bons plans du monde entier et des produits difficiles à trouver, livrables chez vous.",
  "nav": [
    "Tous les rayons",
    "Bons plans",
    "Introuvables",
    "Mes commandes"
  ],
  "collections": {
    "deals": {
      "name": "Bons plans",
      "text": "Des prix avantageux, proposés par des vendeurs du monde entier, avec la livraison affichée à part."
    },
    "rare": {
      "name": "Introuvables",
      "text": "Des produits difficiles à trouver dans votre pays, proposés par des vendeurs du monde entier."
    }
  },
  "countries": [
    {
      "code": "FR",
      "iso3": "FRA",
      "name": "France"
    },
    {
      "code": "ES",
      "iso3": "ESP",
      "name": "Espagne"
    },
    {
      "code": "US",
      "iso3": "USA",
      "name": "États-Unis"
    },
    {
      "code": "MX",
      "iso3": "MEX",
      "name": "Mexique"
    }
  ],
  "departments": [
    {
      "id": "fashion",
      "name": "Mode, chaussures et accessoires",
      "short": "Mode",
      "image": "../../assets/departments/fashion.webp",
      "thumb": "../../assets/departments/fashion-thumb.webp",
      "imageAlt": "Sac, maille et chaussures pour le rayon mode",
      "subcategories": [
        "Vêtements",
        "Chaussures",
        "Accessoires"
      ],
      "tree": [
        {
          "id": "fashion-clothing",
          "name": "Vêtements",
          "children": [
            {
              "id": "clothing-tops",
              "name": "Hauts"
            },
            {
              "id": "clothing-bottoms",
              "name": "Pantalons et jupes"
            },
            {
              "id": "clothing-outerwear",
              "name": "Vestes et manteaux"
            }
          ]
        },
        {
          "id": "fashion-shoes",
          "name": "Chaussures",
          "children": [
            {
              "id": "shoes-sneakers",
              "name": "Baskets"
            },
            {
              "id": "shoes-boots",
              "name": "Bottes et bottines"
            },
            {
              "id": "shoes-sandals",
              "name": "Sandales"
            }
          ]
        },
        {
          "id": "fashion-accessories",
          "name": "Accessoires",
          "children": [
            {
              "id": "accessories-bags",
              "name": "Sacs"
            },
            {
              "id": "accessories-luggage",
              "name": "Bagages"
            },
            {
              "id": "accessories-watches",
              "name": "Montres"
            },
            {
              "id": "accessories-jewellery",
              "name": "Bijoux"
            }
          ]
        }
      ],
      "categoryCount": 13
    },
    {
      "id": "beauty",
      "name": "Beauté et parfums",
      "short": "Beauté",
      "image": "../../assets/departments/beauty.webp",
      "thumb": "../../assets/departments/beauty-thumb.webp",
      "imageAlt": "Parfum, soins et maquillage",
      "subcategories": [
        "Parfums",
        "Soins",
        "Maquillage",
        "Cheveux"
      ],
      "tree": [
        {
          "id": "beauty-fragrances",
          "name": "Parfums",
          "children": [
            {
              "id": "fragrances-eau-de-parfum",
              "name": "Eaux de parfum"
            },
            {
              "id": "fragrances-eau-de-toilette",
              "name": "Eaux de toilette"
            },
            {
              "id": "fragrances-sets",
              "name": "Coffrets"
            }
          ]
        },
        {
          "id": "beauty-skincare",
          "name": "Soins",
          "children": [
            {
              "id": "skincare-face",
              "name": "Visage"
            },
            {
              "id": "skincare-body",
              "name": "Corps"
            }
          ]
        },
        {
          "id": "beauty-makeup",
          "name": "Maquillage",
          "children": [
            {
              "id": "makeup-face",
              "name": "Teint"
            },
            {
              "id": "makeup-eyes",
              "name": "Yeux"
            }
          ]
        },
        {
          "id": "beauty-hair",
          "name": "Cheveux",
          "children": [
            {
              "id": "hair-products",
              "name": "Soins capillaires"
            },
            {
              "id": "hair-tools",
              "name": "Appareils et accessoires"
            }
          ]
        }
      ],
      "categoryCount": 13
    },
    {
      "id": "tech",
      "name": "High-tech, informatique et téléphonie",
      "short": "High-tech",
      "image": "../../assets/departments/tech.webp",
      "thumb": "../../assets/departments/tech-thumb.webp",
      "imageAlt": "Casque, ordinateur, appareil photo et téléphone",
      "subcategories": [
        "Audio",
        "Photo et vidéo",
        "Informatique",
        "Téléphonie"
      ],
      "tree": [
        {
          "id": "tech-audio",
          "name": "Audio",
          "children": [
            {
              "id": "audio-headphones",
              "name": "Casques et écouteurs"
            },
            {
              "id": "audio-speakers",
              "name": "Enceintes"
            },
            {
              "id": "audio-hi-fi",
              "name": "Hi-fi"
            }
          ]
        },
        {
          "id": "tech-photo",
          "name": "Photo et vidéo",
          "children": [
            {
              "id": "photo-cameras",
              "name": "Appareils photo"
            },
            {
              "id": "photo-lenses",
              "name": "Objectifs"
            },
            {
              "id": "photo-accessories",
              "name": "Accessoires photo"
            }
          ]
        },
        {
          "id": "tech-computing",
          "name": "Informatique",
          "children": [
            {
              "id": "computing-laptops",
              "name": "Ordinateurs portables"
            },
            {
              "id": "computing-desktops",
              "name": "Ordinateurs de bureau"
            },
            {
              "id": "computing-components",
              "name": "Composants et périphériques"
            }
          ]
        },
        {
          "id": "tech-phones",
          "name": "Téléphonie",
          "children": [
            {
              "id": "phones-smartphones",
              "name": "Smartphones"
            },
            {
              "id": "phones-accessories",
              "name": "Accessoires"
            }
          ]
        }
      ],
      "categoryCount": 15
    },
    {
      "id": "home",
      "name": "Maison, mobilier et décoration",
      "short": "Maison",
      "image": "../../assets/departments/home.webp",
      "thumb": "../../assets/departments/home-thumb.webp",
      "imageAlt": "Fauteuil, table et luminaire dans un intérieur",
      "subcategories": [
        "Mobilier",
        "Décoration",
        "Linge de maison"
      ],
      "tree": [
        {
          "id": "home-furniture",
          "name": "Mobilier",
          "children": [
            {
              "id": "furniture-chairs",
              "name": "Chaises"
            },
            {
              "id": "furniture-tables",
              "name": "Tables"
            },
            {
              "id": "furniture-sofas",
              "name": "Canapés et fauteuils"
            },
            {
              "id": "furniture-storage",
              "name": "Rangements"
            }
          ]
        },
        {
          "id": "home-decor",
          "name": "Décoration",
          "children": [
            {
              "id": "decor-lighting",
              "name": "Luminaires"
            },
            {
              "id": "decor-objects",
              "name": "Objets décoratifs"
            }
          ]
        },
        {
          "id": "home-textiles",
          "name": "Linge de maison",
          "children": [
            {
              "id": "textiles-bedding",
              "name": "Linge de lit"
            },
            {
              "id": "textiles-bath",
              "name": "Linge de bain"
            }
          ]
        }
      ],
      "categoryCount": 11
    },
    {
      "id": "kitchen",
      "name": "Cuisine et électroménager",
      "short": "Cuisine",
      "image": "../../assets/departments/kitchen.webp",
      "thumb": "../../assets/departments/kitchen-thumb.webp",
      "imageAlt": "Électroménager et ustensiles de cuisine",
      "subcategories": [
        "Ustensiles de cuisine",
        "Petit électroménager",
        "Gros électroménager",
        "Arts de la table"
      ],
      "tree": [
        {
          "id": "kitchen-cookware",
          "name": "Ustensiles de cuisine",
          "children": [
            {
              "id": "cookware-pans",
              "name": "Casseroles et poêles"
            },
            {
              "id": "cookware-tools",
              "name": "Ustensiles"
            }
          ]
        },
        {
          "id": "kitchen-small-appliances",
          "name": "Petit électroménager",
          "children": [
            {
              "id": "appliances-coffee",
              "name": "Cafetières"
            },
            {
              "id": "appliances-food-preparation",
              "name": "Robots de cuisine"
            },
            {
              "id": "appliances-kettles",
              "name": "Bouilloires"
            }
          ]
        },
        {
          "id": "kitchen-large-appliances",
          "name": "Gros électroménager",
          "children": [
            {
              "id": "appliances-refrigeration",
              "name": "Réfrigérateurs"
            },
            {
              "id": "appliances-laundry",
              "name": "Lave-linge"
            },
            {
              "id": "appliances-cooking",
              "name": "Fours et cuisinières"
            }
          ]
        },
        {
          "id": "kitchen-tableware",
          "name": "Arts de la table",
          "children": [
            {
              "id": "tableware-dishes",
              "name": "Vaisselle"
            },
            {
              "id": "tableware-glasses",
              "name": "Verres"
            }
          ]
        }
      ],
      "categoryCount": 14
    },
    {
      "id": "garden",
      "name": "Jardin et extérieur",
      "short": "Jardin",
      "image": "../../assets/departments/garden.webp",
      "thumb": "../../assets/departments/garden-thumb.webp",
      "imageAlt": "Mobilier, plantes et outils de jardin",
      "subcategories": [
        "Plantes et jardinage",
        "Mobilier extérieur",
        "Équipement du jardin"
      ],
      "tree": [
        {
          "id": "garden-plants",
          "name": "Plantes et jardinage",
          "children": [
            {
              "id": "garden-live-plants",
              "name": "Plantes"
            },
            {
              "id": "garden-pots",
              "name": "Pots et jardinières"
            }
          ]
        },
        {
          "id": "garden-furniture",
          "name": "Mobilier extérieur",
          "children": [
            {
              "id": "garden-seating",
              "name": "Assises de jardin"
            },
            {
              "id": "garden-tables",
              "name": "Tables de jardin"
            }
          ]
        },
        {
          "id": "garden-equipment",
          "name": "Équipement du jardin",
          "children": [
            {
              "id": "garden-tools",
              "name": "Outils de jardin"
            },
            {
              "id": "garden-watering",
              "name": "Arrosage"
            }
          ]
        }
      ],
      "categoryCount": 9
    },
    {
      "id": "construction",
      "name": "Bricolage, outillage et construction",
      "short": "Bricolage",
      "image": "../../assets/photos/house.webp",
      "thumb": "../../assets/photos/house-thumb.webp",
      "imageAlt": "Maison préfabriquée pour le rayon construction et habitat",
      "subcategories": [
        "Outillage",
        "Matériaux",
        "Habitat préfabriqué"
      ],
      "tree": [
        {
          "id": "construction-tools",
          "name": "Outillage",
          "children": [
            {
              "id": "tools-hand",
              "name": "Outils manuels"
            },
            {
              "id": "tools-power",
              "name": "Outils électriques"
            },
            {
              "id": "tools-workshop",
              "name": "Équipement d’atelier"
            }
          ]
        },
        {
          "id": "construction-materials",
          "name": "Matériaux",
          "children": [
            {
              "id": "materials-timber",
              "name": "Bois et panneaux"
            },
            {
              "id": "materials-flooring",
              "name": "Revêtements"
            },
            {
              "id": "materials-fixtures",
              "name": "Équipements de construction"
            }
          ]
        },
        {
          "id": "construction-prefab",
          "name": "Habitat préfabriqué",
          "children": [
            {
              "id": "prefab-houses",
              "name": "Maisons préfabriquées"
            },
            {
              "id": "prefab-studios",
              "name": "Studios de jardin"
            },
            {
              "id": "prefab-modules",
              "name": "Modules et extensions"
            }
          ]
        }
      ],
      "categoryCount": 12
    },
    {
      "id": "auto",
      "name": "Auto et moto",
      "short": "Auto et moto",
      "image": "../../assets/photos/car.webp",
      "thumb": "../../assets/photos/car-thumb.webp",
      "imageAlt": "Voiture pour le rayon auto et moto",
      "subcategories": [
        "Voitures",
        "Motos et scooters",
        "Véhicules utilitaires",
        "Pièces et accessoires",
        "Entretien et équipement"
      ],
      "tree": [
        {
          "id": "auto-cars",
          "name": "Voitures",
          "children": [
            {
              "id": "cars-passenger",
              "name": "Voitures particulières"
            },
            {
              "id": "cars-suv",
              "name": "SUV et tout-terrain"
            },
            {
              "id": "cars-electric",
              "name": "Voitures électriques"
            }
          ]
        },
        {
          "id": "auto-motorcycles",
          "name": "Motos et scooters",
          "children": [
            {
              "id": "motorcycles-road",
              "name": "Motos"
            },
            {
              "id": "motorcycles-scooters",
              "name": "Scooters"
            }
          ]
        },
        {
          "id": "auto-utility",
          "name": "Véhicules utilitaires",
          "children": [
            {
              "id": "utility-vans",
              "name": "Fourgons"
            },
            {
              "id": "utility-pickups",
              "name": "Pick-up"
            }
          ]
        },
        {
          "id": "auto-parts",
          "name": "Pièces et accessoires",
          "children": [
            {
              "id": "parts-mechanical",
              "name": "Pièces mécaniques"
            },
            {
              "id": "parts-bodywork",
              "name": "Carrosserie"
            },
            {
              "id": "parts-tyres",
              "name": "Pneus et roues"
            },
            {
              "id": "parts-accessories",
              "name": "Accessoires du véhicule"
            }
          ]
        },
        {
          "id": "auto-maintenance",
          "name": "Entretien et équipement",
          "children": [
            {
              "id": "maintenance-products",
              "name": "Produits d’entretien"
            },
            {
              "id": "maintenance-tools",
              "name": "Outils et diagnostic"
            },
            {
              "id": "maintenance-rider",
              "name": "Équipement du conducteur"
            }
          ]
        }
      ],
      "categoryCount": 19
    },
    {
      "id": "sports",
      "name": "Sports et plein air",
      "short": "Sports",
      "image": "../../assets/departments/sports.webp",
      "thumb": "../../assets/departments/sports-thumb.webp",
      "imageAlt": "Équipements de sport et de plein air",
      "subcategories": [
        "Fitness",
        "Plein air",
        "Cyclisme"
      ],
      "tree": [
        {
          "id": "sports-fitness",
          "name": "Fitness",
          "children": [
            {
              "id": "fitness-training",
              "name": "Musculation"
            },
            {
              "id": "fitness-yoga",
              "name": "Yoga et bien-être"
            }
          ]
        },
        {
          "id": "sports-outdoor",
          "name": "Plein air",
          "children": [
            {
              "id": "outdoor-hiking",
              "name": "Randonnée"
            },
            {
              "id": "outdoor-camping",
              "name": "Camping"
            }
          ]
        },
        {
          "id": "sports-cycling",
          "name": "Cyclisme",
          "children": [
            {
              "id": "cycling-bikes",
              "name": "Vélos"
            },
            {
              "id": "cycling-equipment",
              "name": "Équipement cycliste"
            }
          ]
        }
      ],
      "categoryCount": 9
    },
    {
      "id": "toys",
      "name": "Jeux et jouets",
      "short": "Jouets",
      "image": "../../assets/departments/toys.webp",
      "thumb": "../../assets/departments/toys-thumb.webp",
      "imageAlt": "Jeux et jouets",
      "subcategories": [
        "Jeux",
        "Jouets"
      ],
      "tree": [
        {
          "id": "toys-games",
          "name": "Jeux",
          "children": [
            {
              "id": "games-board",
              "name": "Jeux de société"
            },
            {
              "id": "games-puzzles",
              "name": "Puzzles"
            }
          ]
        },
        {
          "id": "toys-play",
          "name": "Jouets",
          "children": [
            {
              "id": "play-building",
              "name": "Jeux de construction"
            },
            {
              "id": "play-figures",
              "name": "Figurines et poupées"
            },
            {
              "id": "play-outdoor",
              "name": "Jouets de plein air"
            }
          ]
        }
      ],
      "categoryCount": 7
    },
    {
      "id": "baby",
      "name": "Bébé et puériculture",
      "short": "Bébé",
      "image": "../../assets/departments/baby.webp",
      "thumb": "../../assets/departments/baby-thumb.webp",
      "imageAlt": "Accessoires et équipements pour bébé",
      "subcategories": [
        "Promenade et transport",
        "Chambre de bébé",
        "Repas et soins"
      ],
      "tree": [
        {
          "id": "baby-travel",
          "name": "Promenade et transport",
          "children": [
            {
              "id": "baby-strollers",
              "name": "Poussettes"
            },
            {
              "id": "baby-car-seats",
              "name": "Sièges auto"
            }
          ]
        },
        {
          "id": "baby-nursery",
          "name": "Chambre de bébé",
          "children": [
            {
              "id": "baby-cots",
              "name": "Lits"
            },
            {
              "id": "baby-mattresses",
              "name": "Matelas"
            }
          ]
        },
        {
          "id": "baby-care",
          "name": "Repas et soins",
          "children": [
            {
              "id": "baby-feeding",
              "name": "Accessoires de repas"
            },
            {
              "id": "baby-bath",
              "name": "Bain et toilette"
            }
          ]
        }
      ],
      "categoryCount": 9
    },
    {
      "id": "food",
      "name": "Épicerie et boissons",
      "short": "Épicerie",
      "image": "../../assets/departments/food.webp",
      "thumb": "../../assets/departments/food-thumb.webp",
      "imageAlt": "Sélection de produits alimentaires et de café",
      "subcategories": [
        "Épicerie salée",
        "Épicerie sucrée",
        "Boissons"
      ],
      "tree": [
        {
          "id": "food-savoury",
          "name": "Épicerie salée",
          "children": [
            {
              "id": "food-pantry",
              "name": "Produits du placard"
            },
            {
              "id": "food-spices",
              "name": "Épices et condiments"
            }
          ]
        },
        {
          "id": "food-sweet",
          "name": "Épicerie sucrée",
          "children": [
            {
              "id": "food-chocolate",
              "name": "Chocolats et confiseries"
            },
            {
              "id": "food-biscuits",
              "name": "Biscuits"
            }
          ]
        },
        {
          "id": "food-drinks",
          "name": "Boissons",
          "children": [
            {
              "id": "drinks-coffee-tea",
              "name": "Café et thé"
            },
            {
              "id": "drinks-juice",
              "name": "Jus et boissons"
            }
          ]
        }
      ],
      "categoryCount": 9
    },
    {
      "id": "pets",
      "name": "Animaux",
      "short": "Animaux",
      "image": "../../assets/departments/pets.webp",
      "thumb": "../../assets/departments/pets-thumb.webp",
      "imageAlt": "Accessoires et couchage pour animaux",
      "subcategories": [
        "Alimentation",
        "Accessoires",
        "Aquariophilie"
      ],
      "tree": [
        {
          "id": "pets-food",
          "name": "Alimentation",
          "children": [
            {
              "id": "pets-dog-food",
              "name": "Chiens"
            },
            {
              "id": "pets-cat-food",
              "name": "Chats"
            }
          ]
        },
        {
          "id": "pets-accessories",
          "name": "Accessoires",
          "children": [
            {
              "id": "pets-beds",
              "name": "Couchages"
            },
            {
              "id": "pets-leads",
              "name": "Laisses et colliers"
            }
          ]
        },
        {
          "id": "pets-aquariums",
          "name": "Aquariophilie",
          "children": [
            {
              "id": "pets-tanks",
              "name": "Aquariums"
            },
            {
              "id": "pets-aquarium-equipment",
              "name": "Équipement"
            }
          ]
        }
      ],
      "categoryCount": 9
    },
    {
      "id": "books",
      "name": "Livres et culture",
      "short": "Livres",
      "image": "../../assets/departments/books.webp",
      "thumb": "../../assets/departments/books-thumb.webp",
      "imageAlt": "Livres et instrument de musique",
      "subcategories": [
        "Livres imprimés",
        "Musique",
        "Loisirs créatifs"
      ],
      "tree": [
        {
          "id": "books-printed",
          "name": "Livres imprimés",
          "children": [
            {
              "id": "books-fiction",
              "name": "Romans et littérature"
            },
            {
              "id": "books-practical",
              "name": "Livres pratiques"
            }
          ]
        },
        {
          "id": "books-music",
          "name": "Musique",
          "children": [
            {
              "id": "music-instruments",
              "name": "Instruments"
            },
            {
              "id": "music-records",
              "name": "Disques"
            }
          ]
        },
        {
          "id": "books-creative",
          "name": "Loisirs créatifs",
          "children": [
            {
              "id": "creative-painting",
              "name": "Dessin et peinture"
            },
            {
              "id": "creative-crafts",
              "name": "Matériel créatif"
            }
          ]
        }
      ],
      "categoryCount": 9
    },
    {
      "id": "office",
      "name": "Bureau et papeterie",
      "short": "Bureau",
      "image": "../../assets/departments/office.webp",
      "thumb": "../../assets/departments/office-thumb.webp",
      "imageAlt": "Papeterie et accessoires de bureau",
      "subcategories": [
        "Papeterie",
        "Organisation du bureau",
        "Équipement de bureau"
      ],
      "tree": [
        {
          "id": "office-stationery",
          "name": "Papeterie",
          "children": [
            {
              "id": "office-writing",
              "name": "Écriture"
            },
            {
              "id": "office-paper",
              "name": "Papier et carnets"
            }
          ]
        },
        {
          "id": "office-organisation",
          "name": "Organisation du bureau",
          "children": [
            {
              "id": "office-filing",
              "name": "Classement"
            },
            {
              "id": "office-desk-accessories",
              "name": "Accessoires de bureau"
            }
          ]
        },
        {
          "id": "office-equipment",
          "name": "Équipement de bureau",
          "children": [
            {
              "id": "office-printers",
              "name": "Imprimantes"
            },
            {
              "id": "office-shredders",
              "name": "Destructeurs de documents"
            }
          ]
        }
      ],
      "categoryCount": 9
    }
  ],
  "vendors": [
    {
      "id": "atelier-demo",
      "name": "Atelier Passage · Démo",
      "country": "FR",
      "type": "business",
      "deliveryTo": [
        "FR",
        "ES",
        "US",
        "MX"
      ],
      "shipping": {
        "FR": 8.9,
        "ES": 12.9,
        "US": 22.9,
        "MX": 25.9
      },
      "verification": "kyb"
    },
    {
      "id": "costa-demo",
      "name": "Costa Collection · Démo",
      "country": "ES",
      "type": "business",
      "deliveryTo": [
        "FR",
        "ES",
        "US"
      ],
      "shipping": {
        "FR": 11.9,
        "ES": 7.9,
        "US": 24.9
      },
      "verification": "kyb"
    },
    {
      "id": "pacific-demo",
      "name": "Pacific Objects · Démo",
      "country": "US",
      "type": "business",
      "deliveryTo": [
        "FR",
        "ES",
        "US",
        "MX"
      ],
      "shipping": {
        "FR": 19.9,
        "ES": 21.9,
        "US": 6.9,
        "MX": 16.9
      },
      "verification": "kyb"
    },
    {
      "id": "mercado-demo",
      "name": "Mercado Horizonte · Démo",
      "country": "MX",
      "type": "business",
      "deliveryTo": [
        "FR",
        "US",
        "MX"
      ],
      "shipping": {
        "FR": 24.9,
        "US": 14.9,
        "MX": 5.9
      },
      "verification": "kyb"
    },
    {
      "id": "individual-fr-demo",
      "name": "Camille Exemple · Démo",
      "country": "FR",
      "type": "individual",
      "deliveryTo": [
        "FR",
        "ES"
      ],
      "shipping": {
        "FR": 5.9,
        "ES": 8.9
      },
      "verification": "kyc"
    },
    {
      "id": "individual-us-demo",
      "name": "Taylor Sample · Démo",
      "country": "US",
      "type": "individual",
      "deliveryTo": [
        "US",
        "MX"
      ],
      "shipping": {
        "US": 7.9,
        "MX": 11.9
      },
      "verification": "kyc"
    },
    {
      "id": "forms-demo",
      "name": "Formes Habitat · Démo",
      "country": "ES",
      "type": "business",
      "deliveryTo": [
        "FR",
        "ES"
      ],
      "shipping": {
        "FR": 29,
        "ES": 19
      },
      "verification": "kyb"
    },
    {
      "id": "mobility-demo",
      "name": "Mobilité Atlas · Démo",
      "country": "ES",
      "type": "business",
      "deliveryTo": [
        "FR",
        "ES"
      ],
      "shipping": {
        "FR": 390,
        "ES": 250
      },
      "verification": "kyb"
    },
    {
      "id": "modular-demo",
      "name": "Module Horizon · Démo",
      "country": "FR",
      "type": "business",
      "deliveryTo": [
        "FR",
        "ES"
      ],
      "shipping": {
        "FR": 1400,
        "ES": 2200
      },
      "verification": "kyb"
    },
    {
      "id": "cargo-demo",
      "name": "Atlas Projects · Démo",
      "country": "US",
      "type": "business",
      "deliveryTo": [
        "US",
        "MX"
      ],
      "shipping": {
        "US": 790,
        "MX": 890
      },
      "verification": "kyb"
    }
  ],
  "offers": [
    {
      "id": "perfume-atelier",
      "name": "Parfum Signature",
      "rayon": "beauty",
      "rayonName": "Beauté et parfums",
      "image": "../../assets/photos/perfume.webp",
      "cutout": "../../assets/cutouts/perfume.webp",
      "imageAlt": "Flacon de parfum ambré à bouchon de verre",
      "vendorId": "atelier-demo",
      "price": 79,
      "stock": 18,
      "collections": [
        "deals"
      ],
      "delivery": "4 à 7 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "headphones-pacific",
      "name": "Casque Studio",
      "rayon": "tech",
      "rayonName": "High-tech, informatique et téléphonie",
      "image": "../../assets/photos/headphones.webp",
      "cutout": "../../assets/cutouts/headphones.webp",
      "imageAlt": "Casque audio circum-auriculaire noir et argent",
      "vendorId": "pacific-demo",
      "price": 129,
      "stock": 16,
      "collections": [
        "deals"
      ],
      "delivery": "6 à 10 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "bag-camille",
      "name": "Sac Botanique",
      "rayon": "fashion",
      "rayonName": "Mode, chaussures et accessoires",
      "image": "../../assets/photos/bag.webp",
      "cutout": null,
      "imageAlt": "Sac à main en cuir vert",
      "vendorId": "individual-fr-demo",
      "price": 98,
      "stock": 3,
      "collections": [
        "rare"
      ],
      "delivery": "3 à 6 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "camera-pacific",
      "name": "Appareil photo Horizon",
      "rayon": "tech",
      "rayonName": "High-tech, informatique et téléphonie",
      "image": "../../assets/photos/camera.webp",
      "cutout": "../../assets/cutouts/camera.webp",
      "imageAlt": "Appareil photo hybride noir avec son objectif",
      "vendorId": "pacific-demo",
      "price": 649,
      "stock": 6,
      "collections": [
        "rare"
      ],
      "delivery": "6 à 10 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "sneakers-costa",
      "name": "Baskets Canvas",
      "rayon": "fashion",
      "rayonName": "Mode, chaussures et accessoires",
      "image": "../../assets/photos/sneakers.webp",
      "cutout": null,
      "imageAlt": "Paire de baskets basses en toile blanche",
      "vendorId": "costa-demo",
      "price": 69,
      "stock": 20,
      "collections": [
        "deals"
      ],
      "delivery": "4 à 8 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "chair-formes",
      "name": "Chaise Courbe",
      "rayon": "home",
      "rayonName": "Maison, mobilier et décoration",
      "image": "../../assets/photos/chair.webp",
      "cutout": null,
      "imageAlt": "Chaise en contreplaqué de bois courbé",
      "vendorId": "forms-demo",
      "price": 189,
      "stock": 10,
      "collections": [
        "rare"
      ],
      "delivery": "7 à 12 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "watch-atelier",
      "name": "Montre Ligne",
      "rayon": "fashion",
      "rayonName": "Mode, chaussures et accessoires",
      "image": "../../assets/photos/watch.webp",
      "cutout": null,
      "imageAlt": "Montre en acier à cadran noir",
      "vendorId": "atelier-demo",
      "price": 149,
      "stock": 9,
      "collections": [
        "deals"
      ],
      "delivery": "4 à 7 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "suitcase-pacific",
      "name": "Valise Métal",
      "rayon": "fashion",
      "rayonName": "Mode, chaussures et accessoires",
      "image": "../../assets/photos/suitcase.webp",
      "cutout": null,
      "imageAlt": "Valise rigide argentée à roulettes",
      "vendorId": "pacific-demo",
      "price": 229,
      "stock": 8,
      "collections": [
        "deals"
      ],
      "delivery": "6 à 10 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "car-mobility",
      "name": "Voiture Touring",
      "rayon": "auto",
      "rayonName": "Auto et moto",
      "image": "../../assets/photos/car.webp",
      "cutout": null,
      "imageAlt": "Voiture fictive de démonstration, gris anthracite",
      "vendorId": "mobility-demo",
      "price": 24900,
      "stock": 2,
      "collections": [
        "rare"
      ],
      "delivery": "Transport et délai à préciser dans le devis · exemple",
      "mode": "quote"
    },
    {
      "id": "house-module",
      "name": "Maison modulaire",
      "rayon": "construction",
      "rayonName": "Bricolage, outillage et construction",
      "image": "../../assets/photos/house.webp",
      "cutout": null,
      "imageAlt": "Maison modulaire en bois avec terrasse",
      "vendorId": "modular-demo",
      "price": 68900,
      "stock": 1,
      "collections": [
        "rare"
      ],
      "delivery": "Transport et délai à préciser dans le devis · exemple",
      "mode": "quote"
    },
    {
      "id": "perfume-costa",
      "name": "Parfum Signature",
      "rayon": "beauty",
      "rayonName": "Beauté et parfums",
      "image": "../../assets/photos/perfume.webp",
      "cutout": "../../assets/cutouts/perfume.webp",
      "imageAlt": "Flacon de parfum ambré à bouchon de verre",
      "vendorId": "costa-demo",
      "price": 84,
      "stock": 12,
      "collections": [
        "deals"
      ],
      "delivery": "4 à 8 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "headphones-atelier",
      "name": "Casque Studio",
      "rayon": "tech",
      "rayonName": "High-tech, informatique et téléphonie",
      "image": "../../assets/photos/headphones.webp",
      "cutout": "../../assets/cutouts/headphones.webp",
      "imageAlt": "Casque audio circum-auriculaire noir et argent",
      "vendorId": "atelier-demo",
      "price": 139,
      "stock": 8,
      "collections": [
        "deals"
      ],
      "delivery": "4 à 7 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "perfume-mercado",
      "name": "Parfum Signature",
      "rayon": "beauty",
      "rayonName": "Beauté et parfums",
      "image": "../../assets/photos/perfume.webp",
      "cutout": "../../assets/cutouts/perfume.webp",
      "imageAlt": "Flacon de parfum ambré à bouchon de verre",
      "vendorId": "mercado-demo",
      "price": 82,
      "stock": 9,
      "collections": [
        "rare"
      ],
      "delivery": "7 à 12 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "headphones-costa",
      "name": "Casque Studio",
      "rayon": "tech",
      "rayonName": "High-tech, informatique et téléphonie",
      "image": "../../assets/photos/headphones.webp",
      "cutout": "../../assets/cutouts/headphones.webp",
      "imageAlt": "Casque audio circum-auriculaire noir et argent",
      "vendorId": "costa-demo",
      "price": 135,
      "stock": 7,
      "collections": [
        "rare"
      ],
      "delivery": "4 à 8 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "camera-costa",
      "name": "Appareil photo Horizon",
      "rayon": "tech",
      "rayonName": "High-tech, informatique et téléphonie",
      "image": "../../assets/photos/camera.webp",
      "cutout": "../../assets/cutouts/camera.webp",
      "imageAlt": "Appareil photo hybride noir avec son objectif",
      "vendorId": "costa-demo",
      "price": 675,
      "stock": 4,
      "collections": [
        "deals"
      ],
      "delivery": "4 à 8 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "bag-mercado",
      "name": "Sac Botanique",
      "rayon": "fashion",
      "rayonName": "Mode, chaussures et accessoires",
      "image": "../../assets/photos/bag.webp",
      "cutout": null,
      "imageAlt": "Sac à main en cuir vert",
      "vendorId": "mercado-demo",
      "price": 105,
      "stock": 5,
      "collections": [
        "rare"
      ],
      "delivery": "7 à 12 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "watch-taylor",
      "name": "Montre Ligne",
      "rayon": "fashion",
      "rayonName": "Mode, chaussures et accessoires",
      "image": "../../assets/photos/watch.webp",
      "cutout": null,
      "imageAlt": "Montre en acier à cadran noir",
      "vendorId": "individual-us-demo",
      "price": 155,
      "stock": 2,
      "collections": [
        "rare"
      ],
      "delivery": "4 à 8 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "sneakers-mercado",
      "name": "Baskets Canvas",
      "rayon": "fashion",
      "rayonName": "Mode, chaussures et accessoires",
      "image": "../../assets/photos/sneakers.webp",
      "cutout": null,
      "imageAlt": "Paire de baskets basses en toile blanche",
      "vendorId": "mercado-demo",
      "price": 72,
      "stock": 12,
      "collections": [
        "deals"
      ],
      "delivery": "7 à 12 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "chair-camille",
      "name": "Chaise Courbe",
      "rayon": "home",
      "rayonName": "Maison, mobilier et décoration",
      "image": "../../assets/photos/chair.webp",
      "cutout": null,
      "imageAlt": "Chaise en contreplaqué de bois courbé",
      "vendorId": "individual-fr-demo",
      "price": 199,
      "stock": 2,
      "collections": [
        "rare"
      ],
      "delivery": "3 à 6 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "suitcase-costa",
      "name": "Valise Métal",
      "rayon": "fashion",
      "rayonName": "Mode, chaussures et accessoires",
      "image": "../../assets/photos/suitcase.webp",
      "cutout": null,
      "imageAlt": "Valise rigide argentée à roulettes",
      "vendorId": "costa-demo",
      "price": 245,
      "stock": 6,
      "collections": [
        "rare"
      ],
      "delivery": "4 à 8 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "car-atlas",
      "name": "Voiture Touring",
      "rayon": "auto",
      "rayonName": "Auto et moto",
      "image": "../../assets/photos/car.webp",
      "cutout": null,
      "imageAlt": "Voiture fictive de démonstration, gris anthracite",
      "vendorId": "cargo-demo",
      "price": 25900,
      "stock": 3,
      "collections": [
        "rare"
      ],
      "delivery": "Transport et délai à préciser dans le devis · exemple",
      "mode": "quote"
    },
    {
      "id": "house-atlas",
      "name": "Maison modulaire",
      "rayon": "construction",
      "rayonName": "Bricolage, outillage et construction",
      "image": "../../assets/photos/house.webp",
      "cutout": null,
      "imageAlt": "Maison modulaire en bois avec terrasse",
      "vendorId": "cargo-demo",
      "price": 72500,
      "stock": 1,
      "collections": [
        "rare"
      ],
      "delivery": "Transport et délai à préciser dans le devis · exemple",
      "mode": "quote"
    },
    {
      "id": "turntable-pacific",
      "name": "Platine vinyle Studio",
      "rayon": "tech",
      "rayonName": "High-tech, informatique et téléphonie",
      "image": "../../assets/photos/turntable.webp",
      "cutout": null,
      "imageAlt": "Platine vinyle",
      "vendorId": "pacific-demo",
      "price": 289,
      "stock": 5,
      "collections": [
        "rare"
      ],
      "delivery": "6 à 10 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "mechanical-keyboard-costa",
      "name": "Clavier mécanique Néon",
      "rayon": "tech",
      "rayonName": "High-tech, informatique et téléphonie",
      "image": "../../assets/photos/mechanical-keyboard.webp",
      "cutout": null,
      "imageAlt": "Clavier mécanique",
      "vendorId": "costa-demo",
      "price": 139,
      "stock": 8,
      "collections": [
        "deals"
      ],
      "delivery": "4 à 8 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "portable-speaker-mercado",
      "name": "Enceinte Nomade",
      "rayon": "tech",
      "rayonName": "High-tech, informatique et téléphonie",
      "image": "../../assets/photos/portable-speaker.webp",
      "cutout": "../shared/photos/portable-speaker-cutout.webp",
      "imageAlt": "Enceinte portable",
      "vendorId": "mercado-demo",
      "price": 89,
      "stock": 14,
      "collections": [
        "deals"
      ],
      "delivery": "7 à 12 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "eyeshadow-palette-atelier",
      "name": "Palette de fards Prisme",
      "rayon": "beauty",
      "rayonName": "Beauté et parfums",
      "image": "../../assets/photos/eyeshadow-palette.webp",
      "cutout": null,
      "imageAlt": "Palette de fards à paupières",
      "vendorId": "atelier-demo",
      "price": 34,
      "stock": 22,
      "collections": [
        "deals"
      ],
      "delivery": "4 à 7 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "powder-box-mercado",
      "name": "Boîte à poudre émaillée",
      "rayon": "beauty",
      "rayonName": "Beauté et parfums",
      "image": "../../assets/photos/powder-box.webp",
      "cutout": "../shared/photos/powder-box-cutout.webp",
      "imageAlt": "Boîte à poudre émaillée",
      "vendorId": "mercado-demo",
      "price": 58,
      "stock": 4,
      "collections": [
        "rare"
      ],
      "delivery": "7 à 12 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "sunglasses-pacific",
      "name": "Lunettes aviateur Miroir",
      "rayon": "fashion",
      "rayonName": "Mode, chaussures et accessoires",
      "image": "../../assets/photos/sunglasses.webp",
      "cutout": null,
      "imageAlt": "Lunettes de soleil",
      "vendorId": "pacific-demo",
      "price": 79,
      "stock": 12,
      "collections": [
        "deals"
      ],
      "delivery": "6 à 10 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "leather-boots-costa",
      "name": "Bottines cuir Atelier",
      "rayon": "fashion",
      "rayonName": "Mode, chaussures et accessoires",
      "image": "../../assets/photos/leather-boots.webp",
      "cutout": null,
      "imageAlt": "Bottines en cuir",
      "vendorId": "costa-demo",
      "price": 165,
      "stock": 6,
      "collections": [
        "rare"
      ],
      "delivery": "4 à 8 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "felt-hat-mercado",
      "name": "Chapeau en feutre",
      "rayon": "fashion",
      "rayonName": "Mode, chaussures et accessoires",
      "image": "../../assets/photos/felt-hat.webp",
      "cutout": "../shared/photos/felt-hat-cutout.webp",
      "imageAlt": "Chapeau en feutre",
      "vendorId": "mercado-demo",
      "price": 72,
      "stock": 7,
      "collections": [
        "rare"
      ],
      "delivery": "7 à 12 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "ceramic-vase-mercado",
      "name": "Vase en céramique peint",
      "rayon": "home",
      "rayonName": "Maison, mobilier et décoration",
      "image": "../../assets/photos/ceramic-vase.webp",
      "cutout": null,
      "imageAlt": "Vase en céramique",
      "vendorId": "mercado-demo",
      "price": 64,
      "stock": 3,
      "collections": [
        "rare"
      ],
      "delivery": "7 à 12 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "moka-pot-costa",
      "name": "Cafetière italienne Azur",
      "rayon": "kitchen",
      "rayonName": "Cuisine et électroménager",
      "image": "../../assets/photos/moka-pot.webp",
      "cutout": null,
      "imageAlt": "Cafetière italienne",
      "vendorId": "costa-demo",
      "price": 36,
      "stock": 18,
      "collections": [
        "deals"
      ],
      "delivery": "4 à 8 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "cast-iron-skillet-pacific",
      "name": "Poêle en fonte",
      "rayon": "kitchen",
      "rayonName": "Cuisine et électroménager",
      "image": "../../assets/photos/cast-iron-skillet.webp",
      "cutout": "../shared/photos/cast-iron-skillet-cutout.webp",
      "imageAlt": "Poêle en fonte",
      "vendorId": "pacific-demo",
      "price": 49,
      "stock": 15,
      "collections": [
        "deals"
      ],
      "delivery": "6 à 10 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "chef-knife-atelier",
      "name": "Couteau de chef Ronce",
      "rayon": "kitchen",
      "rayonName": "Cuisine et électroménager",
      "image": "../../assets/photos/chef-knife.webp",
      "cutout": null,
      "imageAlt": "Couteau de chef",
      "vendorId": "atelier-demo",
      "price": 119,
      "stock": 6,
      "collections": [
        "rare"
      ],
      "delivery": "4 à 7 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "watering-can-formes",
      "name": "Arrosoir en métal",
      "rayon": "garden",
      "rayonName": "Jardin et extérieur",
      "image": "../../assets/photos/watering-can.webp",
      "cutout": null,
      "imageAlt": "Arrosoir en métal",
      "vendorId": "forms-demo",
      "price": 39,
      "stock": 10,
      "collections": [
        "deals"
      ],
      "delivery": "7 à 12 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "pruning-shears-atelier",
      "name": "Sécateur de jardin",
      "rayon": "garden",
      "rayonName": "Jardin et extérieur",
      "image": "../../assets/photos/pruning-shears.webp",
      "cutout": null,
      "imageAlt": "Sécateur",
      "vendorId": "atelier-demo",
      "price": 32,
      "stock": 20,
      "collections": [
        "deals"
      ],
      "delivery": "4 à 7 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "claw-hammer-pacific",
      "name": "Marteau arrache-clou",
      "rayon": "construction",
      "rayonName": "Bricolage, outillage et construction",
      "image": "../../assets/photos/claw-hammer.webp",
      "cutout": "../shared/photos/claw-hammer-cutout.webp",
      "imageAlt": "Marteau",
      "vendorId": "pacific-demo",
      "price": 24,
      "stock": 25,
      "collections": [
        "deals"
      ],
      "delivery": "6 à 10 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "cordless-drill-costa",
      "name": "Perceuse sans fil",
      "rayon": "construction",
      "rayonName": "Bricolage, outillage et construction",
      "image": "../../assets/photos/cordless-drill.webp",
      "cutout": "../shared/photos/cordless-drill-cutout.webp",
      "imageAlt": "Perceuse sans fil",
      "vendorId": "costa-demo",
      "price": 89,
      "stock": 9,
      "collections": [
        "deals"
      ],
      "delivery": "4 à 8 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "bicycle-costa",
      "name": "Vélo urbain monovitesse",
      "rayon": "sports",
      "rayonName": "Sports et plein air",
      "image": "../../assets/photos/bicycle.webp",
      "cutout": null,
      "imageAlt": "Vélo urbain",
      "vendorId": "costa-demo",
      "price": 449,
      "stock": 5,
      "collections": [
        "deals"
      ],
      "delivery": "4 à 8 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "tennis-racket-pacific",
      "name": "Raquette de tennis",
      "rayon": "sports",
      "rayonName": "Sports et plein air",
      "image": "../../assets/photos/tennis-racket.webp",
      "cutout": null,
      "imageAlt": "Raquette de tennis",
      "vendorId": "pacific-demo",
      "price": 129,
      "stock": 9,
      "collections": [
        "deals"
      ],
      "delivery": "6 à 10 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "teddy-bear-camille",
      "name": "Ours en peluche Hiver",
      "rayon": "toys",
      "rayonName": "Jeux et jouets",
      "image": "../../assets/photos/teddy-bear.webp",
      "cutout": null,
      "imageAlt": "Ours en peluche",
      "vendorId": "individual-fr-demo",
      "price": 29,
      "stock": 4,
      "collections": [
        "rare"
      ],
      "delivery": "3 à 6 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "wooden-blocks-atelier",
      "name": "Jeu de construction en bois",
      "rayon": "toys",
      "rayonName": "Jeux et jouets",
      "image": "../../assets/photos/wooden-blocks.webp",
      "cutout": null,
      "imageAlt": "Jeu de construction en bois",
      "vendorId": "atelier-demo",
      "price": 42,
      "stock": 11,
      "collections": [
        "deals"
      ],
      "delivery": "4 à 7 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "baby-bottles-pacific",
      "name": "Biberons en silicone",
      "rayon": "baby",
      "rayonName": "Bébé et puériculture",
      "image": "../../assets/photos/baby-bottles.webp",
      "cutout": null,
      "imageAlt": "Biberons",
      "vendorId": "pacific-demo",
      "price": 26,
      "stock": 30,
      "collections": [
        "deals"
      ],
      "delivery": "6 à 10 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "baby-rattle-mercado",
      "name": "Hochet Couleurs",
      "rayon": "baby",
      "rayonName": "Bébé et puériculture",
      "image": "../../assets/photos/baby-rattle.webp",
      "cutout": null,
      "imageAlt": "Hochet",
      "vendorId": "mercado-demo",
      "price": 14,
      "stock": 12,
      "collections": [
        "rare"
      ],
      "delivery": "7 à 12 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "olive-oil-costa",
      "name": "Huile d’olive vierge extra",
      "rayon": "food",
      "rayonName": "Épicerie et boissons",
      "image": "../../assets/photos/olive-oil.webp",
      "cutout": null,
      "imageAlt": "Huile d'olive",
      "vendorId": "costa-demo",
      "price": 18,
      "stock": 40,
      "collections": [
        "deals"
      ],
      "delivery": "4 à 8 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "coffee-beans-mercado",
      "name": "Café en grains",
      "rayon": "food",
      "rayonName": "Épicerie et boissons",
      "image": "../../assets/photos/coffee-beans.webp",
      "cutout": null,
      "imageAlt": "Café en grains",
      "vendorId": "mercado-demo",
      "price": 16,
      "stock": 25,
      "collections": [
        "rare"
      ],
      "delivery": "7 à 12 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "spices-taylor",
      "name": "Boîte à épices garnie",
      "rayon": "food",
      "rayonName": "Épicerie et boissons",
      "image": "../../assets/photos/spices.webp",
      "cutout": null,
      "imageAlt": "Épices",
      "vendorId": "individual-us-demo",
      "price": 24,
      "stock": 6,
      "collections": [
        "rare"
      ],
      "delivery": "4 à 8 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "chocolate-atelier",
      "name": "Assortiment de chocolats",
      "rayon": "food",
      "rayonName": "Épicerie et boissons",
      "image": "../../assets/photos/chocolate.webp",
      "cutout": "../shared/photos/chocolate-cutout.webp",
      "imageAlt": "Chocolat en tablette",
      "vendorId": "atelier-demo",
      "price": 12,
      "stock": 50,
      "collections": [
        "deals"
      ],
      "delivery": "4 à 7 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "dog-bowl-pacific",
      "name": "Gamelle anti-glouton",
      "rayon": "pets",
      "rayonName": "Animaux",
      "image": "../../assets/photos/dog-bowl.webp",
      "cutout": null,
      "imageAlt": "Gamelle pour chien",
      "vendorId": "pacific-demo",
      "price": 19,
      "stock": 22,
      "collections": [
        "deals"
      ],
      "delivery": "6 à 10 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "dog-collar-costa",
      "name": "Collier en cuir vert",
      "rayon": "pets",
      "rayonName": "Animaux",
      "image": "../../assets/photos/dog-collar.webp",
      "cutout": null,
      "imageAlt": "Collier pour chien",
      "vendorId": "costa-demo",
      "price": 34,
      "stock": 8,
      "collections": [
        "rare"
      ],
      "delivery": "4 à 8 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "books-camille",
      "name": "Coffret de livres reliés",
      "rayon": "books",
      "rayonName": "Livres et culture",
      "image": "../../assets/photos/books.webp",
      "cutout": null,
      "imageAlt": "Pile de livres",
      "vendorId": "individual-fr-demo",
      "price": 24,
      "stock": 3,
      "collections": [
        "rare"
      ],
      "delivery": "3 à 6 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "fountain-pen-pacific",
      "name": "Stylo plume transparent",
      "rayon": "office",
      "rayonName": "Bureau et papeterie",
      "image": "../../assets/photos/fountain-pen.webp",
      "cutout": "../shared/photos/fountain-pen-cutout.webp",
      "imageAlt": "Stylo plume",
      "vendorId": "pacific-demo",
      "price": 69,
      "stock": 7,
      "collections": [
        "rare"
      ],
      "delivery": "6 à 10 jours · exemple",
      "mode": "purchase"
    },
    {
      "id": "notebooks-atelier",
      "name": "Carnets toilés",
      "rayon": "office",
      "rayonName": "Bureau et papeterie",
      "image": "../../assets/photos/notebooks.webp",
      "cutout": null,
      "imageAlt": "Carnets",
      "vendorId": "atelier-demo",
      "price": 19,
      "stock": 30,
      "collections": [
        "deals"
      ],
      "delivery": "4 à 7 jours · exemple",
      "mode": "purchase"
    }
  ],
  "credits": [
    {
      "label": "Casque audio circum-auriculaire noir et argent",
      "author": "Evan-Amos",
      "license": "Public domain",
      "licenseUrl": null,
      "source": "https://commons.wikimedia.org/wiki/File:Sony-MDR-CD580-Headphones.jpg",
      "kind": "real-photograph"
    },
    {
      "label": "Flacon de parfum ambré à bouchon de verre",
      "author": "Arz",
      "license": "Public domain",
      "licenseUrl": null,
      "source": "https://commons.wikimedia.org/wiki/File:CHANEL_No5_parfum.jpg",
      "kind": "real-photograph"
    },
    {
      "label": "Sac à main en cuir vert",
      "author": "LeatherLuxe",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "source": "https://commons.wikimedia.org/wiki/File:LeatherLuxe_Handbag.jpg",
      "kind": "real-photograph"
    },
    {
      "label": "Montre en acier à cadran noir",
      "author": "Buehl106",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
      "source": "https://commons.wikimedia.org/wiki/File:SEIKO_Watch_SBTM323.jpg",
      "kind": "real-photograph"
    },
    {
      "label": "Appareil photo hybride noir avec son objectif",
      "author": "Jürgen Matern",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "source": "https://commons.wikimedia.org/wiki/File:Sony_Alpha_ILCE-7RM3_full_frame_camera_with_lens.jpeg",
      "kind": "real-photograph"
    },
    {
      "label": "Paire de baskets basses en toile blanche",
      "author": "Mizael Contreras",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "source": "https://commons.wikimedia.org/wiki/File:Converse_Jack_Purcell_sneakers_on_white_canvas.jpg",
      "kind": "real-photograph"
    },
    {
      "label": "Chaise en contreplaqué de bois courbé",
      "author": "Daniel Hartwig",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0/",
      "source": "https://commons.wikimedia.org/wiki/File:Chair_%2834222120571%29.jpg",
      "kind": "real-photograph"
    },
    {
      "label": "Valise rigide argentée à roulettes",
      "author": "Andermann",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "source": "https://commons.wikimedia.org/wiki/File:RIMOWA_Photo.jpg",
      "kind": "real-photograph"
    },
    {
      "label": "Illustration générée : voiture fictive de démonstration",
      "author": "OpenAI ImageGen",
      "license": "Generated for this prototype",
      "licenseUrl": null,
      "source": null,
      "kind": "generated-illustration"
    },
    {
      "label": "Illustration générée : maison modulaire fictive de démonstration",
      "author": "OpenAI ImageGen",
      "license": "Generated for this prototype",
      "licenseUrl": null,
      "source": null,
      "kind": "generated-illustration"
    },
    {
      "label": "Illustration générée du rayon « Mode, chaussures et accessoires »",
      "author": "OpenAI ImageGen",
      "license": "Generated for this prototype",
      "licenseUrl": null,
      "source": null,
      "kind": "generated-illustration"
    },
    {
      "label": "Illustration générée du rayon « Beauté et parfums »",
      "author": "OpenAI ImageGen",
      "license": "Generated for this prototype",
      "licenseUrl": null,
      "source": null,
      "kind": "generated-illustration"
    },
    {
      "label": "Illustration générée du rayon « High-tech, informatique et téléphonie »",
      "author": "OpenAI ImageGen",
      "license": "Generated for this prototype",
      "licenseUrl": null,
      "source": null,
      "kind": "generated-illustration"
    },
    {
      "label": "Illustration générée du rayon « Maison, mobilier et décoration »",
      "author": "OpenAI ImageGen",
      "license": "Generated for this prototype",
      "licenseUrl": null,
      "source": null,
      "kind": "generated-illustration"
    },
    {
      "label": "Illustration générée du rayon « Cuisine et électroménager »",
      "author": "OpenAI ImageGen",
      "license": "Generated for this prototype",
      "licenseUrl": null,
      "source": null,
      "kind": "generated-illustration"
    },
    {
      "label": "Illustration générée du rayon « Jardin et extérieur »",
      "author": "OpenAI ImageGen",
      "license": "Generated for this prototype",
      "licenseUrl": null,
      "source": null,
      "kind": "generated-illustration"
    },
    {
      "label": "Illustration générée du rayon « Sports et plein air »",
      "author": "OpenAI ImageGen",
      "license": "Generated for this prototype",
      "licenseUrl": null,
      "source": null,
      "kind": "generated-illustration"
    },
    {
      "label": "Illustration générée du rayon « Jeux et jouets »",
      "author": "OpenAI ImageGen",
      "license": "Generated for this prototype",
      "licenseUrl": null,
      "source": null,
      "kind": "generated-illustration"
    },
    {
      "label": "Illustration générée du rayon « Bébé et puériculture »",
      "author": "OpenAI ImageGen",
      "license": "Generated for this prototype",
      "licenseUrl": null,
      "source": null,
      "kind": "generated-illustration"
    },
    {
      "label": "Illustration générée du rayon « Épicerie et boissons »",
      "author": "OpenAI ImageGen",
      "license": "Generated for this prototype",
      "licenseUrl": null,
      "source": null,
      "kind": "generated-illustration"
    },
    {
      "label": "Illustration générée du rayon « Animaux »",
      "author": "OpenAI ImageGen",
      "license": "Generated for this prototype",
      "licenseUrl": null,
      "source": null,
      "kind": "generated-illustration"
    },
    {
      "label": "Illustration générée du rayon « Livres et culture »",
      "author": "OpenAI ImageGen",
      "license": "Generated for this prototype",
      "licenseUrl": null,
      "source": null,
      "kind": "generated-illustration"
    },
    {
      "label": "Illustration générée du rayon « Bureau et papeterie »",
      "author": "OpenAI ImageGen",
      "license": "Generated for this prototype",
      "licenseUrl": null,
      "source": null,
      "kind": "generated-illustration"
    },
    {
      "label": "Platine vinyle",
      "author": "Lee Campbell",
      "license": "CC0",
      "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      "source": "https://commons.wikimedia.org/wiki/File:Playing_a_new_vinyl_(Unsplash).jpg",
      "kind": "real-photograph"
    },
    {
      "label": "Clavier mécanique",
      "author": "Patrick Breen",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
      "source": "https://commons.wikimedia.org/wiki/File:2018_Bay_Area_Mechanical_Keyboard_Meetup_(45945702751).jpg",
      "kind": "real-photograph"
    },
    {
      "label": "Enceinte portable",
      "author": "Brion Vega",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "source": "https://commons.wikimedia.org/wiki/File:Brionvega_WearIT_TS217_bluetooth_speaker.jpg",
      "kind": "real-photograph"
    },
    {
      "label": "Palette de fards à paupières",
      "author": "geehairimages",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
      "source": "https://commons.wikimedia.org/wiki/File:Eyeshadow_Palette_%26_Eyeshadow_Brushes_-_50922168141.jpg",
      "kind": "real-photograph"
    },
    {
      "label": "Boîte à poudre émaillée",
      "author": "Coyau",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "source": "https://commons.wikimedia.org/wiki/File:Bo%C3%AEte_%C3%A0_poudre_en_%C3%A9mail_de_Longwy_02.jpg",
      "kind": "real-photograph"
    },
    {
      "label": "Lunettes de soleil",
      "author": "David Lezcano",
      "license": "CC0",
      "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      "source": "https://commons.wikimedia.org/wiki/File:Reflective_sunglasses_(Unsplash).jpg",
      "kind": "real-photograph"
    },
    {
      "label": "Bottines en cuir",
      "author": "ajay_suresh",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
      "source": "https://commons.wikimedia.org/wiki/File:Leather_Boots_(51011160965).jpg",
      "kind": "real-photograph"
    },
    {
      "label": "Chapeau en feutre",
      "author": "Frank C. Müller (photo), Rainer Zenz (edit)",
      "license": "CC BY-SA 2.5",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.5",
      "source": "https://commons.wikimedia.org/wiki/File:Herrenhut_breitkrempig_03_(fcm).jpg",
      "kind": "real-photograph"
    },
    {
      "label": "Vase en céramique",
      "author": "AIDEPCUL",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0",
      "source": "https://commons.wikimedia.org/wiki/File:Naqshli_sopol_guldon.png",
      "kind": "real-photograph"
    },
    {
      "label": "Cafetière italienne",
      "author": "ajay_suresh",
      "license": "CC0",
      "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      "source": "https://commons.wikimedia.org/wiki/File:Moka_Pot_(55013301353).jpg",
      "kind": "real-photograph"
    },
    {
      "label": "Poêle en fonte",
      "author": "Evan-Amos",
      "license": "Public domain",
      "licenseUrl": null,
      "source": "https://commons.wikimedia.org/wiki/File:Cast-Iron-Pan.jpg",
      "kind": "real-photograph"
    },
    {
      "label": "Couteau de chef",
      "author": "Frank Schulenburg",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "source": "https://commons.wikimedia.org/wiki/File:Steelport_6-Inch_Chef_Knife_(2026)-104A6580.jpg",
      "kind": "real-photograph"
    },
    {
      "label": "Arrosoir en métal",
      "author": "Diego Delso",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "source": "https://commons.wikimedia.org/wiki/File:Regadera,_jard%C3%ADn_del_molino,_Sierra_de_San_Felipe,_Set%C3%BAbal,_Portugal,_2012-05-11,_DD_01.JPG",
      "kind": "real-photograph"
    },
    {
      "label": "Sécateur",
      "author": "KoS",
      "license": "Public domain",
      "licenseUrl": null,
      "source": "https://commons.wikimedia.org/wiki/File:Secateur_ouvert.jpg",
      "kind": "real-photograph"
    },
    {
      "label": "Marteau",
      "author": "Evan-Amos",
      "license": "Public domain",
      "licenseUrl": null,
      "source": "https://commons.wikimedia.org/wiki/File:Claw-hammer.jpg",
      "kind": "real-photograph"
    },
    {
      "label": "Perceuse sans fil",
      "author": "Tool Dude8mm",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
      "source": "https://commons.wikimedia.org/wiki/File:Battery_Construction_Cordless_Drill_Edited_2020_(49916988798).jpg",
      "kind": "real-photograph"
    },
    {
      "label": "Vélo urbain",
      "author": "Shisma & Alorin",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "source": "https://commons.wikimedia.org/wiki/File:White_single-speed_bicycle_on_yellow_background.png",
      "kind": "real-photograph"
    },
    {
      "label": "Raquette de tennis",
      "author": "Timothy Takemoto",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
      "source": "https://commons.wikimedia.org/wiki/File:Tennis_racket.jpg",
      "kind": "real-photograph"
    },
    {
      "label": "Ours en peluche",
      "author": "Jacek Halicki",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "source": "https://commons.wikimedia.org/wiki/File:2023_Pluszowy_mi%C5%9B.jpg",
      "kind": "real-photograph"
    },
    {
      "label": "Jeu de construction en bois",
      "author": "Welt-der-Form",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "source": "https://commons.wikimedia.org/wiki/File:Holzspielzeug_7225_easyHDR.jpg",
      "kind": "real-photograph"
    },
    {
      "label": "Biberons",
      "author": "TheUnaverageJoe",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "source": "https://commons.wikimedia.org/wiki/File:Silicone_Baby_Bottles.jpg",
      "kind": "real-photograph"
    },
    {
      "label": "Hochet",
      "author": "Zeromonk",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "source": "https://commons.wikimedia.org/wiki/File:Plastic_baby_rattle_toy.jpg",
      "kind": "real-photograph"
    },
    {
      "label": "Huile d'olive",
      "author": "margenauer (Pixabay)",
      "license": "CC0",
      "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      "source": "https://commons.wikimedia.org/wiki/File:Bottle_of_olive_oil.jpg",
      "kind": "real-photograph"
    },
    {
      "label": "Café en grains",
      "author": "Alorin",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0",
      "source": "https://commons.wikimedia.org/wiki/File:Roasted_coffee_beans_in_white_bowl.png",
      "kind": "real-photograph"
    },
    {
      "label": "Épices",
      "author": "Ketandelhiwala",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "source": "https://commons.wikimedia.org/wiki/File:Spices_container.jpg",
      "kind": "real-photograph"
    },
    {
      "label": "Chocolat en tablette",
      "author": "Aka",
      "license": "CC BY-SA 3.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
      "source": "https://commons.wikimedia.org/wiki/File:Chocolate(bgFFF).jpg",
      "kind": "real-photograph"
    },
    {
      "label": "Gamelle pour chien",
      "author": "ELTORO.VET",
      "license": "CC0",
      "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      "source": "https://commons.wikimedia.org/wiki/File:Blue_Slow_Feeder_Dog_Bowl_with_Raised_Studs_and_Ridges.jpg",
      "kind": "real-photograph"
    },
    {
      "label": "Collier pour chien",
      "author": "Trougnouf (Benoit Brummer); collar by Les cuirs d'Agathe",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0",
      "source": "https://commons.wikimedia.org/wiki/File:Leather_dog_collar_made_by_Les_cuirs_d%27Agathe_(DSC07529).jpg",
      "kind": "real-photograph"
    },
    {
      "label": "Pile de livres",
      "author": "Alexander Grey",
      "license": "CC0",
      "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      "source": "https://commons.wikimedia.org/wiki/File:Stack_of_multicolored_books_on_a_table.jpg",
      "kind": "real-photograph"
    },
    {
      "label": "Stylo plume",
      "author": "August Geyler",
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "source": "https://commons.wikimedia.org/wiki/File:TWSBI_Eco_F%C3%BCllhalter_Orange_M_mit_Kappe.jpg",
      "kind": "real-photograph"
    },
    {
      "label": "Carnets",
      "author": "Hope House Press",
      "license": "CC0",
      "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
      "source": "https://commons.wikimedia.org/wiki/File:Notebooks-cambridge_(Unsplash).jpg",
      "kind": "real-photograph"
    }
  ]
};

  const fmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
  const vendor = (id) => data.vendors.find((v) => v.id === id);
  const country = (code) => data.countries.find((c) => c.code === code);
  const department = (id) => data.departments.find((d) => d.id === id);

  /** Offers deliverable to a destination, each enriched with vendor, seller country and shipping for that destination. */
  function offersFor(dest) {
    return data.offers
      .filter((o) => vendor(o.vendorId).deliveryTo.includes(dest))
      .map((o) => {
        const v = vendor(o.vendorId);
        return { ...o, vendor: v, from: country(v.country), to: country(dest), shipping: v.shipping[dest] };
      });
  }

  /** Three purchasable hero offers for a destination: preferred picks, else replacements from other seller countries. */
  function showcaseFor(dest) {
    const list = offersFor(dest).filter((o) => o.mode === 'purchase' && o.stock > 0);
    const preferred = ['perfume-mercado', 'headphones-pacific', 'camera-costa'];
    const models = ['perfume', 'headphones', 'camera'];
    const picked = [];
    models.forEach((m, i) => {
      const exact = list.find((o) => o.id === preferred[i]);
      const sameModel = list.filter((o) => o.id.startsWith(m + '-') && !picked.includes(o))
        .sort((a, b) => (a.from.code === dest) - (b.from.code === dest));
      const pick = exact || sameModel[0];
      if (pick) picked.push(pick);
    });
    for (const o of list) {
      if (picked.length >= 3) break;
      if (!picked.includes(o) && !picked.some((p) => p.from.code === o.from.code)) picked.push(o);
    }
    return picked.slice(0, 3);
  }

  const price = (n) => fmt.format(n);
  /** Splits a price into whole part and cents for typographic treatment: { whole: '82', cents: '00', currency: '€' }. */
  function priceParts(n) {
    const [whole, cents] = n.toFixed(2).split('.');
    return { whole: Number(whole).toLocaleString('fr-FR'), cents, currency: '€' };
  }

  return { ...data, vendor, country, department, offersFor, showcaseFor, price, priceParts };
})();
