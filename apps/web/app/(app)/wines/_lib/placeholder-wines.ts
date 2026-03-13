/**
 * Placeholder wine data matching the WineCard props interface.
 * TODO: Replace with real DAL queries once the database is connected.
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
    id: '1',
    name: 'Estate Reserve',
    slug: 'opus-one-estate-reserve',
    varietal: 'Cabernet Sauvignon',
    region: 'Napa Valley',
    country: 'USA',
    vintage: 2021,
    image_url: null,
    price_min: 85,
    price_max: 95,
    producer: { name: 'Opus One', slug: 'opus-one' },
    description: 'A bold, full-bodied Cabernet with notes of dark cherry and cedar.',
    created_at: '2025-12-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Les Forts',
    slug: 'chateau-latour-les-forts',
    varietal: 'Merlot',
    region: 'Bordeaux',
    country: 'France',
    vintage: 2019,
    image_url: null,
    price_min: 120,
    price_max: 145,
    producer: { name: 'Chateau Latour', slug: 'chateau-latour' },
    description: 'Elegant and complex with silky tannins and a long finish.',
    created_at: '2025-11-15T00:00:00Z',
  },
  {
    id: '3',
    name: 'Barbaresco DOCG',
    slug: 'gaja-barbaresco-docg',
    varietal: 'Nebbiolo',
    region: 'Piedmont',
    country: 'Italy',
    vintage: 2020,
    image_url: null,
    price_min: 200,
    price_max: 250,
    producer: { name: 'Gaja', slug: 'gaja' },
    description: 'Iconic Nebbiolo from one of Piedmont\'s most celebrated estates.',
    created_at: '2025-11-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Cloudy Bay Sauvignon Blanc',
    slug: 'cloudy-bay-sauvignon-blanc',
    varietal: 'Sauvignon Blanc',
    region: 'Marlborough',
    country: 'New Zealand',
    vintage: 2023,
    image_url: null,
    price_min: 22,
    price_max: 28,
    producer: { name: 'Cloudy Bay', slug: 'cloudy-bay' },
    description: 'Crisp and vibrant with tropical fruit and citrus notes.',
    created_at: '2026-01-10T00:00:00Z',
  },
  {
    id: '5',
    name: 'Willamette Valley Pinot Noir',
    slug: 'domaine-drouhin-willamette-pinot',
    varietal: 'Pinot Noir',
    region: 'Willamette Valley',
    country: 'USA',
    vintage: 2022,
    image_url: null,
    price_min: 45,
    price_max: 55,
    producer: { name: 'Domaine Drouhin', slug: 'domaine-drouhin' },
    description: 'Oregon Pinot at its finest — bright cherry, earthy undertones, silky texture.',
    created_at: '2026-01-20T00:00:00Z',
  },
  {
    id: '6',
    name: 'Hill of Grace',
    slug: 'henschke-hill-of-grace',
    varietal: 'Shiraz',
    region: 'Eden Valley',
    country: 'Australia',
    vintage: 2018,
    image_url: null,
    price_min: 550,
    price_max: 700,
    producer: { name: 'Henschke', slug: 'henschke' },
    description: 'One of Australia\'s most revered single-vineyard Shiraz wines.',
    created_at: '2025-10-05T00:00:00Z',
  },
  {
    id: '7',
    name: 'Sassicaia',
    slug: 'tenuta-san-guido-sassicaia',
    varietal: 'Cabernet Sauvignon',
    region: 'Tuscany',
    country: 'Italy',
    vintage: 2019,
    image_url: null,
    price_min: 180,
    price_max: 220,
    producer: { name: 'Tenuta San Guido', slug: 'tenuta-san-guido' },
    description: 'The original Super Tuscan — structured, aromatic, and age-worthy.',
    created_at: '2025-09-20T00:00:00Z',
  },
  {
    id: '8',
    name: 'Chablis Grand Cru Les Clos',
    slug: 'dauvissat-chablis-les-clos',
    varietal: 'Chardonnay',
    region: 'Burgundy',
    country: 'France',
    vintage: 2020,
    image_url: null,
    price_min: 95,
    price_max: 120,
    producer: { name: 'Domaine Dauvissat', slug: 'domaine-dauvissat' },
    description: 'Pure mineral-driven Chardonnay from the finest Grand Cru vineyard.',
    created_at: '2026-02-01T00:00:00Z',
  },
]

export const PLACEHOLDER_REGIONS = [
  'Napa Valley',
  'Bordeaux',
  'Piedmont',
  'Marlborough',
  'Willamette Valley',
  'Eden Valley',
  'Tuscany',
  'Burgundy',
]

export const PLACEHOLDER_VARIETALS = [
  'Cabernet Sauvignon',
  'Chardonnay',
  'Merlot',
  'Nebbiolo',
  'Pinot Noir',
  'Sauvignon Blanc',
  'Shiraz',
]
