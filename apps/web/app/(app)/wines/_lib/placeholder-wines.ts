/**
 * Placeholder wine data matching the WineCard props interface.
 * Populated from real scraped LA wine retailer data (seed-marketplace.sql).
 * TODO: Replace with real DAL queries once auth + curation DAL is wired up (Epic 14).
 */

export interface PlaceholderWine {
  id: string
  name: string
  slug: string
  varietal: string | null
  region: string | null
  country: string | null
  vintage: number | null
  image_url: string | null
  price_min: number | null
  price_max: number | null
  producer: { name: string; slug: string }
  description: string | null
  created_at?: string
}

export const PLACEHOLDER_WINES: PlaceholderWine[] = [
  {
    id: '015b0fe3-1557-4e5e-9eb3-07367d741f87',
    name: 'Veraton, Garnacha, Campo de Borja',
    slug: 'alto-moncayo-veraton-garnacha-campo-de-borja-spain-2021-good-luck-wine-shop',
    varietal: 'Grenache',
    region: 'Campo de Borja',
    country: 'Spain',
    vintage: 2021,
    image_url: 'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Alto_Moncayo_Veraton_Garnacha_Campo_de_Borja_Spain_2021.jpg',
    price_min: 36.79,
    price_max: 36.79,
    producer: { name: 'Alto Moncayo', slug: 'alto-moncayo' },
    description: 'Old-vine Garnacha from Campo de Borja, crafted by one of Spain\'s most celebrated producers.',
  },
  {
    id: '21483fcd-e961-4a3b-9a99-37d959a2a9cc',
    name: 'Emilien, Cotes de Bordeaux',
    slug: 'chateau-le-puy-emilien-cotes-de-bordeaux-merlot-cabernet-sauv-carmenere-2022',
    varietal: 'Cabernet Sauvignon',
    region: 'Bordeaux',
    country: 'France',
    vintage: 2022,
    image_url: 'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/lepuyemilien2017.jpg',
    price_min: 87,
    price_max: 87,
    producer: { name: 'Chateau le Puy', slug: 'chateau-le-puy' },
    description: 'Full-bodied and silky, with aromatic notes of ripe red fruit and hints of wild undergrowth.',
  },
  {
    id: 'f35c4360-2ab2-4569-9e6c-5db822938f11',
    name: 'Barolo Bussia',
    slug: 'aldo-conterno-barolo-bussia-piedmont-italy-2008',
    varietal: 'Nebbiolo',
    region: 'Piedmont',
    country: 'Italy',
    vintage: 2008,
    image_url: 'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Aldo_Conterno_Barolo_Bussia_Piedmont_Italy_2008.jpg',
    price_min: 129.95,
    price_max: 129.95,
    producer: { name: 'Aldo Conterno', slug: 'aldo-conterno' },
    description: 'Elite, historic Barolo producer. Traditionalist aging in large Slavonian-oak botte.',
  },
  {
    id: 'ea66b27d-8402-498c-ae3d-761636b4240c',
    name: 'Chardonnay, Sta. Rita Hills',
    slug: 'alma-rosa-chardonnay-sta-rita-hills-santa-barbara-california-2023-the-wine-house',
    varietal: 'Chardonnay',
    region: 'Santa Barbara',
    country: 'United States',
    vintage: 2023,
    image_url: 'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Alma_Rosa_Chardonnay_Sta._Rita_Hills_Santa_Barbara_California_2023.jpg',
    price_min: 29.90,
    price_max: 29.90,
    producer: { name: 'Alma Rosa', slug: 'alma-rosa' },
    description: 'From California wine pioneer Richard Sanford\'s estate vineyard El Jabali in the Santa Rita Hills.',
  },
  {
    id: '8378cf58-acf7-4e58-ac0f-82dce6d6aa61',
    name: 'Crozes Hermitage Rouge',
    slug: 'alain-graillot-crozes-hermitage-rouge-rhone-valley-france-2020',
    varietal: 'Syrah',
    region: 'Rhone',
    country: 'France',
    vintage: 2020,
    image_url: 'https://cdn.shopify.com/s/files/1/0275/0441/0666/products/Alain-Graillot-Crozes-Hermitage-Rouge-Rhone-Valley-France-2020.jpg',
    price_min: 44.95,
    price_max: 44.95,
    producer: { name: 'Alain Graillot', slug: 'alain-graillot' },
    description: 'Exuberant, robust Syrah from one of the Northern Rhone\'s most sought-after producers.',
  },
  {
    id: 'd6b88765-49a9-407f-92d5-7f17845ba3e3',
    name: 'Cabernet Sauvignon, Napa Valley',
    slug: 'addax-cabernet-sauvignon-napa-valley-california-2019-lou-wine-shop',
    varietal: 'Cabernet Sauvignon',
    region: 'Napa Valley',
    country: 'United States',
    vintage: 2019,
    image_url: 'https://cdn.shopify.com/s/files/1/0275/0441/0666/products/Addax-Cabernet-Sauvignon-Napa-Valley-California-2019.jpg',
    price_min: 129.95,
    price_max: 129.95,
    producer: { name: 'Addax', slug: 'addax' },
    description: 'Crafted by Russell Bevan, one of the most sought-after winemakers in California.',
  },
  {
    id: '217dc5c4-5b26-40ca-b19f-4c6524d0d011',
    name: '1er Cru, La Piece Sous Le Bois, Meursault',
    slug: 'benjamin-leroux-1er-cru-la-piece-sous-le-bois-meursault-chardonnay-2021-wallys-wine-spirits',
    varietal: 'Chardonnay',
    region: 'Burgundy',
    country: 'France',
    vintage: 2021,
    image_url: 'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/IMG-6948.jpg',
    price_min: 280,
    price_max: 280,
    producer: { name: 'Benjamin Leroux', slug: 'benjamin-leroux' },
    description: 'Crisp and lively with notes of bright citrus and pear, from the heart of Burgundy.',
  },
  {
    id: 'e65ad227-7411-4e31-a20c-30db864b4027',
    name: 'Tinto, Rioja',
    slug: 'artuke-tinto-rioja-spain-tempranillo-viura-2024-wallys-wine-spirits',
    varietal: 'Tempranillo',
    region: 'Rioja',
    country: 'Spain',
    vintage: 2024,
    image_url: 'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/IMG_1071.jpg',
    price_min: 20,
    price_max: 20,
    producer: { name: 'Artuke', slug: 'artuke' },
    description: 'Young, fresh Tempranillo-Viura blend from one of Rioja\'s rising star producers.',
  },
  {
    id: 'c66c4349-840e-465e-a241-72a2850c3567',
    name: 'Cote Chalonnaise, Chardonnay',
    slug: 'caroline-bellavoine-cote-chalonnaise-france-chardonnay-2022',
    varietal: 'Chardonnay',
    region: 'Burgundy',
    country: 'France',
    vintage: 2022,
    image_url: 'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/298DD1A6-DE16-4832-9216-4505DE1DD54C_1_201_a.jpg',
    price_min: 36,
    price_max: 36,
    producer: { name: 'Caroline Bellavoine', slug: 'caroline-bellavoine' },
    description: 'Elegant and mineral. Pairs with grilled lobster and asparagus with lemon and sea salt.',
  },
  {
    id: 'aefeb8f2-fb74-4b2f-9cc4-241fb3094d29',
    name: '1er Cru, Gevrey-Chambertin Vieille Vigne',
    slug: 'domaine-fourrier-1er-cru-la-combe-aux-moines-gevrey-chambertin-vieille-vigne-burgundy-pinot-noir-2023-vinovore',
    varietal: 'Pinot Noir',
    region: 'Burgundy',
    country: 'France',
    vintage: 2023,
    image_url: 'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/IMG_7417.jpg',
    price_min: 398,
    price_max: 398,
    producer: { name: 'Domaine Fourrier', slug: 'domaine-fourrier' },
    description: 'Old-vine Pinot Noir Premier Cru from one of Burgundy\'s most revered domaines.',
  },
  {
    id: 'f75dcac6-2964-443c-bbcf-c8ca06f8080d',
    name: 'Pago Negralada, Castilla y Leon',
    slug: 'abadia-retuerta-pago-negralada-tempranillo-castilla-y-leon-spain-2015',
    varietal: 'Tempranillo',
    region: 'Castilla y Leon',
    country: 'Spain',
    vintage: 2015,
    image_url: 'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Abadia_Retuerta_Pago_Negralada_Tempranillo_Castilla_y_Leon_Spain_2015.jpg',
    price_min: 94.95,
    price_max: 94.95,
    producer: { name: 'Abadia Retuerta', slug: 'abadia-retuerta' },
    description: 'Single-vineyard Tempranillo from a 700-hectare estate on the banks of the Duero River.',
  },
  {
    id: 'de38ea1f-1011-4fe8-b5da-8946fb863000',
    name: 'Les Clos, Fixin, Cotes de Nuits',
    slug: 'berthaut-gerbet-les-clos-fixin-cotes-de-nuits-burgundy-france-pinot-noir-2023-wallys-wine-spirits',
    varietal: 'Pinot Noir',
    region: 'Burgundy',
    country: 'France',
    vintage: 2023,
    image_url: 'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/berthautlesclos18.jpg',
    price_min: 92,
    price_max: 92,
    producer: { name: 'Amelie Berthaut', slug: 'amelie-berthaut' },
    description: 'Elegant Pinot Noir from the Cotes de Nuits appellation in Burgundy.',
  },
]

// ---------------------------------------------------------------------------
// Mock availability data — keyed by wine ID
// Simulates what the DAL would return from spatial retailer queries.
// ---------------------------------------------------------------------------

import type { WineAvailability } from '@/components/features/wines/WineCard'

export const MOCK_AVAILABILITY: Record<string, WineAvailability> = {
  '015b0fe3-1557-4e5e-9eb3-07367d741f87': {
    nearbyRetailerCount: 2,
    lowestPrice: 3679,
    closestRetailer: { name: 'Good Luck Wine Shop', distanceMiles: 1.8 },
  },
  '21483fcd-e961-4a3b-9a99-37d959a2a9cc': {
    nearbyRetailerCount: 3,
    lowestPrice: 8700,
    closestRetailer: { name: 'Helen\'s Wines', distanceMiles: 2.1 },
  },
  'f35c4360-2ab2-4569-9e6c-5db822938f11': {
    nearbyRetailerCount: 1,
    lowestPrice: 12995,
    closestRetailer: { name: 'Merchant of Wine', distanceMiles: 3.4 },
  },
  'ea66b27d-8402-498c-ae3d-761636b4240c': {
    nearbyRetailerCount: 4,
    lowestPrice: 2990,
    closestRetailer: { name: 'The Wine House', distanceMiles: 0.9 },
  },
  '8378cf58-acf7-4e58-ac0f-82dce6d6aa61': {
    nearbyRetailerCount: 2,
    lowestPrice: 4495,
    closestRetailer: { name: 'Merchant of Wine', distanceMiles: 3.4 },
  },
  'd6b88765-49a9-407f-92d5-7f17845ba3e3': {
    nearbyRetailerCount: 1,
    lowestPrice: 12995,
    closestRetailer: { name: 'Lou Wine Shop', distanceMiles: 4.2 },
  },
  '217dc5c4-5b26-40ca-b19f-4c6524d0d011': {
    nearbyRetailerCount: 1,
    lowestPrice: 28000,
    closestRetailer: { name: 'Wally\'s Wine & Spirits', distanceMiles: 5.1 },
  },
  'e65ad227-7411-4e31-a20c-30db864b4027': {
    nearbyRetailerCount: 3,
    lowestPrice: 2000,
    closestRetailer: { name: 'Wally\'s Wine & Spirits', distanceMiles: 5.1 },
  },
  'c66c4349-840e-465e-a241-72a2850c3567': {
    nearbyRetailerCount: 2,
    lowestPrice: 3600,
    closestRetailer: { name: 'Helen\'s Wines', distanceMiles: 2.1 },
  },
  'aefeb8f2-fb74-4b2f-9cc4-241fb3094d29': {
    nearbyRetailerCount: 1,
    lowestPrice: 39800,
    closestRetailer: { name: 'Vinovore', distanceMiles: 1.5 },
  },
  'f75dcac6-2964-443c-bbcf-c8ca06f8080d': {
    nearbyRetailerCount: 2,
    lowestPrice: 9495,
    closestRetailer: { name: 'Merchant of Wine', distanceMiles: 3.4 },
  },
  'de38ea1f-1011-4fe8-b5da-8946fb863000': {
    nearbyRetailerCount: 1,
    lowestPrice: 9200,
    closestRetailer: { name: 'Wally\'s Wine & Spirits', distanceMiles: 5.1 },
  },
}

export const PLACEHOLDER_REGIONS = [
  'Bordeaux',
  'Burgundy',
  'Campo de Borja',
  'Castilla y Leon',
  'Napa Valley',
  'Piedmont',
  'Rhone',
  'Rioja',
  'Santa Barbara',
]

export const PLACEHOLDER_VARIETALS = [
  'Cabernet Sauvignon',
  'Chardonnay',
  'Grenache',
  'Nebbiolo',
  'Pinot Noir',
  'Syrah',
  'Tempranillo',
]
