// Usage (from anywhere): node explorations/shared/tools/gen-catalog.mjs  — regenerates explorations/shared/catalog.js.
// Builds explorations/shared/catalog.js from the refonte demo data, credits and the cut-out manifest.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = '/Users/ethanlaloum/dev/DutyFreeDeal/dutyfree-refonte';
const { DATA } = await import(pathToFileURL(path.join(ROOT, 'js/data.js')));
const { DEPARTMENT_IMAGES } = await import(pathToFileURL(path.join(ROOT, 'js/departments.js')));
const credits = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/CREDITS.json'), 'utf8'));
const manifestPath = path.join(ROOT, 'explorations/shared/photos/manifest.json');
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : [];

const fr = (l) => l.fr;
const short = { fashion: 'Mode', beauty: 'Beauté', tech: 'High-tech', home: 'Maison', kitchen: 'Cuisine', garden: 'Jardin', construction: 'Bricolage', auto: 'Auto et moto', sports: 'Sports', toys: 'Jouets', baby: 'Bébé', food: 'Épicerie', pets: 'Animaux', books: 'Livres', office: 'Bureau' };
const count = (n) => (n.children || []).reduce((s, c) => s + 1 + count(c), 0);
// assets live in dutyfree-refonte/assets ; pages live in explorations/<dir>/ → '../../assets/...'
const fromPage = (p) => p.replace(/^\.\//, '../../');

const departments = DATA.categories.map((c) => ({
  id: c.id,
  name: fr(c.name),
  short: short[c.id],
  image: fromPage(DEPARTMENT_IMAGES[c.id].src),
  thumb: fromPage(DEPARTMENT_IMAGES[c.id].thumb),
  imageAlt: DEPARTMENT_IMAGES[c.id].alt.fr,
  subcategories: (c.children || []).map((s) => fr(s.name)),
  tree: (c.children || []).map((s) => ({ id: s.id, name: fr(s.name), children: (s.children || []).map((l) => ({ id: l.id, name: fr(l.name) })) })),
  categoryCount: count(c)
}));

const countries = [
  { code: 'FR', iso3: 'FRA', name: 'France' },
  { code: 'ES', iso3: 'ESP', name: 'Espagne' },
  { code: 'US', iso3: 'USA', name: 'États-Unis' },
  { code: 'MX', iso3: 'MEX', name: 'Mexique' }
];

const vendors = DATA.vendors.map((v) => ({ ...v }));

// French alt texts for the photographs inherited from the refonte (credits labels are English).
const altFr = {
  perfume: 'Flacon de parfum ambré à bouchon de verre',
  headphones: 'Casque audio circum-auriculaire noir et argent',
  camera: 'Appareil photo hybride noir avec son objectif',
  bag: 'Sac à main en cuir vert',
  watch: 'Montre en acier à cadran noir',
  sneakers: 'Paire de baskets basses en toile blanche',
  chair: 'Chaise en contreplaqué de bois courbé',
  suitcase: 'Valise rigide argentée à roulettes',
  car: 'Voiture fictive de démonstration, gris anthracite',
  house: 'Maison modulaire en bois avec terrasse'
};
const byKey = Object.fromEntries(manifest.map((m) => [m.key, m]));
const cutouts = { perfume: '../../assets/cutouts/perfume.webp', headphones: '../../assets/cutouts/headphones.webp', camera: '../../assets/cutouts/camera.webp' };
for (const m of manifest) if (m.cutout) cutouts[m.key] = '../shared/photos/' + m.cutout;
const deptName = Object.fromEntries(departments.map((d) => [d.id, d.name]));

const baseOffers = DATA.products.map((p) => {
  const key = path.basename(p.image, '.webp');
  return {
    id: p.id,
    name: fr(p.name),
    rayon: p.category,
    rayonName: deptName[p.category],
    image: fromPage(p.image),
    cutout: cutouts[key] || null,
    imageAlt: altFr[key] || (byKey[key] && byKey[key].label_fr) || fr(p.name),
    vendorId: p.vendorId,
    price: p.price,
    stock: p.stock,
    collections: p.collections,
    delivery: fr(p.delivery),
    mode: p.mode
  };
});

// French credit labels: photographs by file key, generated illustrations by department.
const creditLabelFr = (c) => {
  const key = path.basename(c.path, '.webp');
  if (c.kind === 'generated-illustration') {
    if (c.path.includes('/departments/')) return 'Illustration générée du rayon « ' + (deptName[key] || key) + ' »';
    return key === 'car' ? 'Illustration générée : voiture fictive de démonstration' : 'Illustration générée : maison modulaire fictive de démonstration';
  }
  return altFr[key] || (byKey[key] && byKey[key].label_fr) || c.label;
};
const allCredits = credits.map((c) => ({ label: creditLabelFr(c), author: c.author, license: c.license, licenseUrl: c.license_url || null, source: c.source_page || null, kind: c.kind }));

const out = `/*
 * DutyFreeDeal, explorations de direction : catalogue de démonstration partagé par les explorations.
 * Généré depuis ../../js/data.js et ../../assets/CREDITS.json (refonte), détourages de shared/photos/manifest.json. Ne pas éditer à la main.
 * Vendeurs, noms d’offres, prix en EUR, stocks et délais sont fictifs. Les photos réelles sont illustratives.
 * Le pays affiché est celui du vendeur, pas le lieu de fabrication.
 */
window.DFD = (() => {
  'use strict';
  const data = ${JSON.stringify({
    demoNotice: 'Maquette de démonstration : produits, vendeurs et prix fictifs, aucune transaction réelle.',
    slogan: 'Le duty free, sans passer par l’aéroport',
    pitch: 'Découvrez des bons plans du monde entier et des produits difficiles à trouver, livrables chez vous.',
    nav: ['Tous les rayons', 'Bons plans', 'Introuvables', 'Mes commandes'],
    collections: {
      deals: { name: 'Bons plans', text: 'Des prix avantageux, proposés par des vendeurs du monde entier, avec la livraison affichée à part.' },
      rare: { name: 'Introuvables', text: 'Des produits difficiles à trouver dans votre pays, proposés par des vendeurs du monde entier.' }
    },
    countries, departments, vendors, offers: baseOffers, credits: allCredits
  }, null, 2)};

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
`;
fs.writeFileSync(path.join(ROOT, 'explorations/shared/catalog.js'), out);
console.log('offers', baseOffers.length, 'departments', departments.length, 'credits', allCredits.length);
