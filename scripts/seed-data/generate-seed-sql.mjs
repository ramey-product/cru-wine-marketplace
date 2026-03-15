#!/usr/bin/env node
/**
 * Generate Seed SQL from Scraped Wine Data
 *
 * Reads scraped-wines.json, cleans/normalizes the data, and generates
 * a comprehensive seed SQL file for the Cru Wine Marketplace.
 *
 * Creates:
 * - 12 retailer organizations (4 scraped + 8 additional LA wine shops)
 * - Producers (wineries) derived from wine data
 * - Wines with matching label images
 *
 * Usage: node scripts/seed-data/generate-seed-sql.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Additional LA Wine Retailer Orgs (not scraped but real shops) ────────────
const ADDITIONAL_RETAILERS = [
  { name: "Wally's Wine & Spirits", slug: 'wallys-wine-spirits', location: 'Beverly Hills', tagline: 'Trusted by collectors and connoisseurs since 1968' },
  { name: "Domaine LA", slug: 'domaine-la', location: 'Melrose, Los Angeles', tagline: 'French wines and the people who love them' },
  { name: "Vinovore", slug: 'vinovore', location: 'East Hollywood, Los Angeles', tagline: 'Wine made by women — every bottle on the shelf' },
  { name: "Lou Wine Shop", slug: 'lou-wine-shop', location: 'Los Feliz, Los Angeles', tagline: 'Your neighborhood bottle shop in Los Feliz' },
  { name: "The Wine House", slug: 'the-wine-house', location: 'West Los Angeles', tagline: 'LA wine institution since 1973 — tastings, classes, and community' },
  { name: "Good Luck Wine Shop", slug: 'good-luck-wine-shop', location: 'Pasadena', tagline: 'Eclectic wines and good vibes in Old Town Pasadena' },
  { name: "Stanley's Wet Goods", slug: 'stanleys-wet-goods', location: 'Culver City', tagline: 'Craft wines and artisan spirits in the heart of Culver City' },
  { name: "Lincoln Fine Wines", slug: 'lincoln-fine-wines', location: 'Venice, Los Angeles', tagline: 'Italian and French fine wines steps from the beach' },
];

// ─── Data Cleaning Utilities ─────────────────────────────────────────────────

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200);
}

function escapeSQL(str) {
  if (!str) return 'NULL';
  // Normalize Unicode curly quotes to ASCII before escaping
  return "'" + str.replace(/[\u2018\u2019\u201A]/g, "'").replace(/[\u201C\u201D\u201E]/g, '"').replace(/'/g, "''") + "'";
}

function parseProducerFromTitle(title, vendor) {
  // If vendor is a real producer name (not a distributor/shop handle), use it
  const distributors = [
    'elevage wine co', 'kjs', 'sgws', 'breakthru', 'chambers', 'regal wine co',
    'golden state', 'winebow', 'skurnik', 'oliver mccrum', 'wilson daniels',
    'merchant of wine', 'ian blackburn', 'ian\'s cellar', 'farm wine', 'atherton',
    'north berkeley', 'mosaic', 'grapex', 'monterey bay', 'wanderlust', 'broadbent',
    'avanelle', 'usa wine west', 'citrin cooperman', 'diniz', 'vino la',
    'caroline debbane selections', 'shop-silverlakewine', 'duclot',
  ];

  const vendorLower = (vendor || '').toLowerCase();
  const isDistributor = distributors.some(d => vendorLower.includes(d));

  if (!isDistributor && vendor && vendor.length > 1) {
    return vendor;
  }

  // Parse producer from title - usually first segment before comma
  const parts = title.split(',').map(s => s.trim());
  if (parts.length > 1) {
    // First part is usually the producer
    let producer = parts[0];
    // Remove vintage prefix
    producer = producer.replace(/^\d{4}\s+/, '');
    // Remove size suffix
    producer = producer.replace(/\s*\d+ml$/i, '');
    return producer;
  }

  // Try splitting by spaces and taking first meaningful words
  const words = title.replace(/^\d{4}\s+/, '').split(' ');
  if (words.length >= 2) {
    // Take first 2-3 words as producer
    return words.slice(0, Math.min(3, Math.ceil(words.length / 2))).join(' ');
  }

  return vendor || 'Unknown Producer';
}

function parseWineNameFromTitle(title, producerName) {
  // Remove the producer name from the title to get the wine name
  let wineName = title;

  // Remove vintage year prefix
  wineName = wineName.replace(/^\d{4}\s+/, '');

  // Remove producer name if it's at the start
  if (producerName && wineName.startsWith(producerName)) {
    wineName = wineName.substring(producerName.length).replace(/^[,\s]+/, '');
  }

  // Remove size suffix
  wineName = wineName.replace(/\s*\d+\s*m[lL]$/i, '').trim();

  // If the result is a degenerate fragment (single word like "Noir", "Sirah",
  // prepositional fragment like "del Duero", "di Sardegna", or < 3 chars),
  // fall back to the full title minus vintage/size
  const isDegenerate = !wineName || wineName.length < 4 ||
    /^(Noir|Blanc|Rouge|Rosso|Bianco|Sirah|Bugey|Yquem)$/i.test(wineName) ||
    /^(d[eio]l?|des?|la|le|les|al|il)\s/i.test(wineName);

  if (isDegenerate) {
    wineName = title.replace(/^\d{4}\s+/, '').replace(/\s*\d+\s*m[lL]$/i, '').trim();
  }

  return wineName;
}

function extractRegionFromDescription(desc) {
  if (!desc) return null;
  const regionPatterns = [
    /\b(Burgundy|Bordeaux|Champagne|Loire Valley|Rhône Valley|Rhone|Alsace|Languedoc|Roussillon|Provence|Corsica|Jura|Beaujolais|Chablis|Sancerre)\b/i,
    /\b(Tuscany|Piedmont|Piemonte|Sicily|Campania|Veneto|Lombardia|Puglia|Abruzzo|Sardinia|Emilia-Romagna|Liguria|Friuli|Marche|Lazio|Trentino)\b/i,
    /\b(Napa Valley|Sonoma|Willamette Valley|Santa Barbara|Paso Robles|Central Coast|Russian River|Sta\.? Rita Hills|Mendocino|Anderson Valley|Lake County)\b/i,
    /\b(Mendoza|Uco Valley|Rioja|Priorat|Ribera del Duero|Galicia|Rias Baixas|Mosel|Pfalz|Rheingau|Baden)\b/i,
    /\b(Barossa|McLaren Vale|Margaret River|Marlborough|Stellenbosch|Swartland)\b/i,
  ];
  for (const pattern of regionPatterns) {
    const match = desc.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function extractCountryFromDescription(desc) {
  if (!desc) return null;
  const countryMap = {
    'France': /\bFrance\b/i, 'Italy': /\bItaly\b/i, 'Spain': /\bSpain\b/i,
    'Germany': /\bGermany\b/i, 'Portugal': /\bPortugal\b/i, 'Austria': /\bAustria\b/i,
    'Greece': /\bGreece\b/i, 'Argentina': /\bArgentin/i, 'Chile': /\bChile\b/i,
    'United States': /\b(USA|United States|California|Oregon|Washington)\b/i,
    'Australia': /\bAustrali/i, 'New Zealand': /\bNew Zealand\b/i,
    'South Africa': /\bSouth Africa\b/i, 'Mexico': /\bMexico\b/i,
    'Israel': /\bIsrael\b/i, 'Japan': /\bJapan\b/i,
  };
  for (const [country, pattern] of Object.entries(countryMap)) {
    if (pattern.test(desc)) return country;
  }
  return null;
}

function extractVarietalFromDescription(desc) {
  if (!desc) return null;
  const varietals = [
    'Pinot Noir', 'Cabernet Sauvignon', 'Merlot', 'Syrah', 'Shiraz', 'Grenache',
    'Tempranillo', 'Sangiovese', 'Nebbiolo', 'Malbec', 'Zinfandel', 'Gamay',
    'Mourvèdre', 'Mourvedre', 'Barbera', 'Petite Sirah', 'Cabernet Franc',
    'Chardonnay', 'Sauvignon Blanc', 'Riesling', 'Chenin Blanc', 'Viognier',
    'Albariño', 'Albarino', 'Grüner Veltliner', 'Gruner Veltliner', 'Gewürztraminer',
    'Pinot Grigio', 'Pinot Gris', 'Vermentino', 'Trebbiano', 'Verdicchio',
    'Garnacha', 'Montepulciano', 'Nero d\'Avola', 'Nerello Mascalese',
    'Piedirosso', 'Lambrusco', 'Cinsault', 'Carignan', 'Pecorino',
    'Prosecco', 'Champagne', 'Glera',
  ];
  for (const v of varietals) {
    if (desc.includes(v)) return v;
  }
  return null;
}

function parseFlaskTags(tags) {
  const result = { region: null, country: null, varietal: null };
  for (const tag of tags) {
    if (tag.startsWith('country_')) {
      const c = tag.replace('country_', '').replace(/_/g, ' ');
      result.country = c.charAt(0).toUpperCase() + c.slice(1);
      if (result.country === 'Usa') result.country = 'United States';
    }
    if (tag.startsWith('region_')) {
      result.region = tag.replace('region_', '').replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
    if (tag.startsWith('grape_')) {
      result.varietal = tag.replace('grape_', '').replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }
  return result;
}

// ─── Clean and Normalize Wine Data ───────────────────────────────────────────

function cleanWineData(retailer) {
  const cleanedWines = [];

  for (const wine of retailer.wines) {
    // Skip clearly bad entries
    if (!wine.title || wine.title.length < 3) continue;
    if (!wine.imageUrl) continue; // User requires matching label images

    // Skip generic/bundle items
    const titleLower = wine.title.toLowerCase();
    if (titleLower.startsWith('bottle of ') || titleLower.startsWith('2 bottles') ||
        titleLower.startsWith('3 bottles') || titleLower === '12' ||
        titleLower.includes('gift box') || titleLower.includes('mixed six') ||
        titleLower.includes('wine club') || titleLower.includes('subscription')) continue;

    // Skip if vendor is the store itself (generic items)
    const vendorLower = (wine.vendor || '').toLowerCase();
    if (vendorLower === "helen's wines" || vendorLower === 'shop-silverlakewine') {
      // For silverlake, parse producer from title instead
      if (retailer.slug !== 'silverlake-wine') continue;
    }

    const producer = parseProducerFromTitle(wine.title, wine.vendor);
    const wineName = parseWineNameFromTitle(wine.title, producer);
    const titleAndDesc = wine.title + ' ' + (wine.description || '');

    // Try to extract metadata from multiple sources
    let region = wine.region || extractRegionFromDescription(titleAndDesc);
    let country = wine.country || extractCountryFromDescription(titleAndDesc);
    let varietal = wine.varietal || extractVarietalFromDescription(titleAndDesc);

    // Handle Flask's prefixed tags
    if (retailer.slug === 'flask-fine-wine') {
      const flaskParsed = parseFlaskTags(wine.tags || []);
      region = region || flaskParsed.region;
      country = country || flaskParsed.country;
      varietal = varietal || flaskParsed.varietal;
    }

    // Handle Silverlake's description-embedded metadata
    if (retailer.slug === 'silverlake-wine' && wine.description) {
      const descRegion = extractRegionFromDescription(wine.description);
      const descCountry = extractCountryFromDescription(wine.description);
      const descVarietal = extractVarietalFromDescription(wine.description);
      region = region || descRegion;
      country = country || descCountry;
      varietal = varietal || descVarietal;
    }

    // Clean description - remove HTML entities
    let description = (wine.description || '')
      .replace(/&gt;/g, '>')
      .replace(/&lt;/g, '<')
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    cleanedWines.push({
      producerName: producer,
      wineName,
      fullTitle: wine.title,
      slug: slugify(wine.title),
      price: wine.price || 0,
      vintage: wine.vintage,
      region,
      country,
      varietal,
      description: description.substring(0, 500),
      imageUrl: wine.imageUrl,
      tags: wine.tags || [],
    });
  }

  return cleanedWines;
}

// ─── SQL Generation ──────────────────────────────────────────────────────────

function generateSQL(scrapedData) {
  const lines = [];

  lines.push(`-- =============================================================================`);
  lines.push(`-- Seed: LA Wine Marketplace — Retailers, Producers, and Wines`);
  lines.push(`--`);
  lines.push(`-- Auto-generated from real wine data scraped from LA wine retailers.`);
  lines.push(`-- Creates 12 retailer organizations, ~50 producers, and ~200 wines.`);
  lines.push(`-- Idempotent: uses ON CONFLICT (slug) DO UPDATE for upserts.`);
  lines.push(`--`);
  lines.push(`-- USAGE:`);
  lines.push(`--   psql $DATABASE_URL -f supabase/seed-marketplace.sql`);
  lines.push(`-- =============================================================================`);
  lines.push(``);
  lines.push(`SET search_path TO 'public', 'extensions';`);
  lines.push(``);
  lines.push(`DO $$`);
  lines.push(`DECLARE`);
  lines.push(`  _org_id UUID;`);
  lines.push(`  _producer_id UUID;`);
  lines.push(`BEGIN`);
  lines.push(``);

  // Track all retailers (scraped + additional)
  const allRetailers = [];

  // Process scraped retailers
  for (const retailer of scrapedData) {
    const cleanedWines = cleanWineData(retailer);
    if (cleanedWines.length === 0) continue;

    allRetailers.push({
      name: retailer.name,
      slug: retailer.slug,
      location: retailer.location,
      tagline: retailer.tagline,
      wines: cleanedWines,
    });
  }

  // Distribute remaining wines across additional retailers
  // Take some wines from the bigger collections and assign them
  const allCleanedWines = allRetailers.flatMap(r => r.wines);
  const winesPerAdditional = Math.floor(allCleanedWines.length / (ADDITIONAL_RETAILERS.length + allRetailers.length));

  let wineIndex = 0;
  for (const addRetailer of ADDITIONAL_RETAILERS) {
    const assignedWines = [];
    // Pick wines from different scraped retailers for variety
    for (let i = 0; i < winesPerAdditional && wineIndex < allCleanedWines.length; i++) {
      const wine = { ...allCleanedWines[wineIndex % allCleanedWines.length] };
      // Make slug unique per org
      wine.slug = wine.slug + '-' + addRetailer.slug;
      assignedWines.push(wine);
      wineIndex++;
    }

    if (assignedWines.length > 0) {
      allRetailers.push({
        ...addRetailer,
        wines: assignedWines,
      });
    }
  }

  // Generate SQL for each retailer
  let orgCounter = 0;
  for (const retailer of allRetailers) {
    orgCounter++;
    lines.push(`  -- =========================================================================`);
    lines.push(`  -- RETAILER ${orgCounter}: ${retailer.name}`);
    lines.push(`  -- Location: ${retailer.location}`);
    lines.push(`  -- =========================================================================`);
    lines.push(``);

    // Create organization
    lines.push(`  INSERT INTO public.organizations (id, name, slug, metadata)`);
    lines.push(`  VALUES (`);
    lines.push(`    gen_random_uuid(),`);
    lines.push(`    ${escapeSQL(retailer.name)},`);
    lines.push(`    ${escapeSQL(retailer.slug)},`);
    lines.push(`    ${escapeSQL(JSON.stringify({ location: retailer.location, tagline: retailer.tagline }))}::jsonb`);
    lines.push(`  )`);
    lines.push(`  ON CONFLICT (slug) DO UPDATE SET`);
    lines.push(`    name = EXCLUDED.name, metadata = EXCLUDED.metadata`);
    lines.push(`  RETURNING id INTO _org_id;`);
    lines.push(``);

    // Group wines by producer
    const producerWines = new Map();
    for (const wine of retailer.wines) {
      const key = slugify(wine.producerName);
      if (!producerWines.has(key)) {
        producerWines.set(key, { name: wine.producerName, slug: key, wines: [] });
      }
      producerWines.get(key).wines.push(wine);
    }

    // Create producers and their wines
    for (const [producerSlug, producer] of producerWines) {
      // Get region/country from the first wine that has it
      const firstWineWithRegion = producer.wines.find(w => w.region);
      const firstWineWithCountry = producer.wines.find(w => w.country);

      const pSlug = producerSlug + '-' + retailer.slug;

      lines.push(`  -- Producer: ${producer.name}`);
      lines.push(`  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)`);
      lines.push(`  VALUES (`);
      lines.push(`    gen_random_uuid(), _org_id,`);
      lines.push(`    ${escapeSQL(producer.name)},`);
      lines.push(`    ${escapeSQL(pSlug)},`);
      lines.push(`    ${escapeSQL(firstWineWithRegion?.region || null)},`);
      lines.push(`    ${escapeSQL(firstWineWithCountry?.country || null)},`);
      lines.push(`    true`);
      lines.push(`  )`);
      lines.push(`  ON CONFLICT (slug) DO UPDATE SET`);
      lines.push(`    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country`);
      lines.push(`  RETURNING id INTO _producer_id;`);
      lines.push(``);

      // Create wines for this producer
      for (const wine of producer.wines) {
        const wineSlug = wine.slug.substring(0, 200);

        // Build flavor profile from varietal hints
        const flavorProfile = guessFlavorProfile(wine.varietal, wine.description);

        lines.push(`  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)`);
        lines.push(`  VALUES (`);
        lines.push(`    _org_id, _producer_id,`);
        lines.push(`    ${escapeSQL(wine.wineName)},`);
        lines.push(`    ${escapeSQL(wineSlug)},`);
        lines.push(`    ${escapeSQL(wine.varietal)},`);
        lines.push(`    ${escapeSQL(wine.region)},`);
        lines.push(`    ${escapeSQL(wine.country)},`);
        lines.push(`    ${wine.vintage || 'NULL'},`);
        lines.push(`    ${escapeSQL(wine.description || null)},`);
        lines.push(`    ${escapeSQL(wine.description || null)},`);
        lines.push(`    ${wine.tags?.length > 0 ? escapeSQL(JSON.stringify(extractFoodPairings(wine.description, wine.tags))) + '::jsonb' : 'NULL'},`);
        lines.push(`    ${flavorProfile ? escapeSQL(JSON.stringify(flavorProfile)) + '::jsonb' : 'NULL'},`);
        lines.push(`    ${escapeSQL(wine.imageUrl)},`);
        lines.push(`    ${wine.price > 0 ? wine.price.toFixed(2) : 'NULL'},`);
        lines.push(`    ${wine.price > 0 ? wine.price.toFixed(2) : 'NULL'},`);
        lines.push(`    true`);
        lines.push(`  )`);
        lines.push(`  ON CONFLICT (slug) DO UPDATE SET`);
        lines.push(`    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,`);
        lines.push(`    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,`);
        lines.push(`    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,`);
        lines.push(`    producer_id = EXCLUDED.producer_id,`);
        lines.push(`    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;`);
        lines.push(``);
      }
    }
  }

  lines.push(`  RAISE NOTICE 'Marketplace seed complete: ${allRetailers.length} retailers, wines and producers created/updated.';`);
  lines.push(``);
  lines.push(`END $$;`);

  return lines.join('\n');
}

// ─── Flavor Profile / Food Pairing Helpers ───────────────────────────────────

function guessFlavorProfile(varietal, description) {
  const profiles = {
    'Pinot Noir': { body: 3, sweetness: 1, tannin: 3, acidity: 4 },
    'Cabernet Sauvignon': { body: 5, sweetness: 1, tannin: 5, acidity: 3 },
    'Merlot': { body: 4, sweetness: 1, tannin: 3, acidity: 3 },
    'Syrah': { body: 5, sweetness: 1, tannin: 4, acidity: 3 },
    'Shiraz': { body: 5, sweetness: 1, tannin: 4, acidity: 3 },
    'Grenache': { body: 4, sweetness: 1, tannin: 3, acidity: 3 },
    'Tempranillo': { body: 4, sweetness: 1, tannin: 4, acidity: 3 },
    'Sangiovese': { body: 4, sweetness: 1, tannin: 4, acidity: 5 },
    'Nebbiolo': { body: 4, sweetness: 1, tannin: 5, acidity: 5 },
    'Malbec': { body: 5, sweetness: 1, tannin: 4, acidity: 3 },
    'Zinfandel': { body: 5, sweetness: 2, tannin: 3, acidity: 3 },
    'Gamay': { body: 2, sweetness: 1, tannin: 2, acidity: 4 },
    'Barbera': { body: 4, sweetness: 1, tannin: 3, acidity: 5 },
    'Cabernet Franc': { body: 3, sweetness: 1, tannin: 3, acidity: 4 },
    'Petite Sirah': { body: 5, sweetness: 1, tannin: 5, acidity: 3 },
    'Chardonnay': { body: 4, sweetness: 1, tannin: 1, acidity: 3 },
    'Sauvignon Blanc': { body: 2, sweetness: 1, tannin: 1, acidity: 5 },
    'Riesling': { body: 2, sweetness: 3, tannin: 1, acidity: 5 },
    'Chenin Blanc': { body: 3, sweetness: 2, tannin: 1, acidity: 4 },
    'Viognier': { body: 4, sweetness: 1, tannin: 1, acidity: 3 },
    'Albarino': { body: 2, sweetness: 1, tannin: 1, acidity: 4 },
    'Albariño': { body: 2, sweetness: 1, tannin: 1, acidity: 4 },
    'Pinot Grigio': { body: 2, sweetness: 1, tannin: 1, acidity: 4 },
    'Pinot Gris': { body: 3, sweetness: 1, tannin: 1, acidity: 4 },
    'Vermentino': { body: 2, sweetness: 1, tannin: 1, acidity: 4 },
    'Montepulciano': { body: 4, sweetness: 1, tannin: 4, acidity: 3 },
    'Nero d\'Avola': { body: 4, sweetness: 1, tannin: 4, acidity: 3 },
    'Lambrusco': { body: 2, sweetness: 2, tannin: 2, acidity: 4 },
    'Pecorino': { body: 3, sweetness: 1, tannin: 1, acidity: 4 },
    'Champagne': { body: 2, sweetness: 1, tannin: 1, acidity: 5 },
    'Prosecco': { body: 1, sweetness: 2, tannin: 1, acidity: 4 },
  };

  if (varietal && profiles[varietal]) {
    return profiles[varietal];
  }

  // Try to detect from description
  if (description) {
    for (const [v, profile] of Object.entries(profiles)) {
      if (description.includes(v)) return profile;
    }
  }

  return null;
}

function extractFoodPairings(description, tags) {
  const pairings = [];

  if (description) {
    // Look for pairing mentions
    const pairingMatch = description.match(/[Pp]air(?:ing|s|ed)?\s*(?:with|:)\s*([^.!]+)/);
    if (pairingMatch) {
      const items = pairingMatch[1].split(/[;,]/).map(s => s.trim()).filter(s => s.length > 2 && s.length < 50);
      pairings.push(...items.slice(0, 4));
    }
  }

  // Extract from tags
  const pairingTags = ['Cheese & Charcuterie', 'Seafood & Fish', 'Off The Grill', 'Brunch Vibes'];
  for (const tag of tags) {
    if (pairingTags.includes(tag)) {
      const foodMap = {
        'Cheese & Charcuterie': 'charcuterie board',
        'Seafood & Fish': 'grilled fish',
        'Off The Grill': 'grilled meats',
        'Brunch Vibes': 'brunch dishes',
      };
      if (foodMap[tag] && !pairings.includes(foodMap[tag])) {
        pairings.push(foodMap[tag]);
      }
    }
  }

  return pairings.length > 0 ? pairings : ['versatile pairing'];
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  console.log('🍷 Generating marketplace seed SQL...\n');

  const rawData = JSON.parse(readFileSync(join(__dirname, 'scraped-wines.json'), 'utf-8'));

  // Summary before cleaning
  console.log('Raw data:');
  for (const r of rawData) {
    console.log(`  ${r.name}: ${r.wines.length} wines`);
  }

  const sql = generateSQL(rawData);

  const outputPath = join(__dirname, '..', '..', 'supabase', 'seed-marketplace.sql');
  writeFileSync(outputPath, sql);
  console.log(`\n✅ Generated seed SQL at: ${outputPath}`);

  // Count generated entities
  const orgCount = (sql.match(/INSERT INTO public\.organizations/g) || []).length;
  const producerCount = (sql.match(/INSERT INTO public\.producers/g) || []).length;
  const wineCount = (sql.match(/INSERT INTO public\.wines/g) || []).length;
  console.log(`   Organizations: ${orgCount}`);
  console.log(`   Producers: ${producerCount}`);
  console.log(`   Wines: ${wineCount}`);
  console.log(`   File size: ${(sql.length / 1024).toFixed(1)} KB`);
}

main();
