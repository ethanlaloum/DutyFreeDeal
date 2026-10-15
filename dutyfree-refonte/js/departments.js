/* Department illustrations (generated, provenance in assets/departments/ASSET_PROMPTS.json). Alt texts from the previous prototype. */
const D = (src, thumb, fr, en) => ({ src, thumb, alt: { fr, en } });

export const DEPARTMENT_IMAGES = Object.freeze({
  fashion: D('./assets/departments/fashion.webp', './assets/departments/fashion-thumb.webp', 'Sac, maille et chaussures pour le rayon mode', 'Bag, knitwear and shoes for the fashion department'),
  beauty: D('./assets/departments/beauty.webp', './assets/departments/beauty-thumb.webp', 'Parfum, soins et maquillage', 'Fragrance, skincare and makeup'),
  tech: D('./assets/departments/tech.webp', './assets/departments/tech-thumb.webp', 'Casque, ordinateur, appareil photo et téléphone', 'Headphones, laptop, camera and phone'),
  home: D('./assets/departments/home.webp', './assets/departments/home-thumb.webp', 'Fauteuil, table et luminaire dans un intérieur', 'Armchair, table and lamp in a home interior'),
  kitchen: D('./assets/departments/kitchen.webp', './assets/departments/kitchen-thumb.webp', 'Électroménager et ustensiles de cuisine', 'Kitchen appliances and utensils'),
  garden: D('./assets/departments/garden.webp', './assets/departments/garden-thumb.webp', 'Mobilier, plantes et outils de jardin', 'Garden furniture, plants and tools'),
  construction: D('./assets/photos/house.webp', './assets/photos/house-thumb.webp', 'Maison préfabriquée pour le rayon construction et habitat', 'Prefab house for the construction and housing department'),
  auto: D('./assets/photos/car.webp', './assets/photos/car-thumb.webp', 'Voiture pour le rayon auto et moto', 'Car for the automotive department'),
  sports: D('./assets/departments/sports.webp', './assets/departments/sports-thumb.webp', 'Équipements de sport et de plein air', 'Sports and outdoor equipment'),
  toys: D('./assets/departments/toys.webp', './assets/departments/toys-thumb.webp', 'Jeux et jouets', 'Games and toys'),
  baby: D('./assets/departments/baby.webp', './assets/departments/baby-thumb.webp', 'Accessoires et équipements pour bébé', 'Baby accessories and equipment'),
  food: D('./assets/departments/food.webp', './assets/departments/food-thumb.webp', 'Sélection de produits alimentaires et de café', 'A selection of food and coffee'),
  pets: D('./assets/departments/pets.webp', './assets/departments/pets-thumb.webp', 'Accessoires et couchage pour animaux', 'Pet accessories and bedding'),
  books: D('./assets/departments/books.webp', './assets/departments/books-thumb.webp', 'Livres et instrument de musique', 'Books and a musical instrument'),
  office: D('./assets/departments/office.webp', './assets/departments/office-thumb.webp', 'Papeterie et accessoires de bureau', 'Stationery and office accessories')
});
