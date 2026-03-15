#!/usr/bin/env node
/**
 * Wine Retailer Scraper
 *
 * Scrapes wine data from LA Shopify-based wine retailers.
 * Fetches product listings then individual product JSONs for images.
 * Outputs a JSON file with all wine data ready for SQL generation.
 *
 * Usage: node scripts/seed-data/scrape-retailers.mjs
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Shopify-based LA wine retailers
const RETAILERS = [
  {
    name: "Helen's Wines",
    slug: 'helens-wines',
    domain: 'helenswines.com',
    location: 'Fairfax, Los Angeles',
    tagline: 'The dopest wine shop in LA — organic, biodynamic, and natural wines',
    logo: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop',
  },
  {
    name: "Merchant of Wine",
    slug: 'merchant-of-wine',
    domain: 'merchantofwine.com',
    location: 'Mid-City, Los Angeles',
    tagline: 'Curated wines delivered to your door across Los Angeles',
    logo: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=400&fit=crop',
  },
  {
    name: "Silverlake Wine",
    slug: 'silverlake-wine',
    domain: 'silverlakewine.com',
    location: 'Silver Lake, Los Angeles',
    tagline: 'Your neighborhood wine shop in the heart of Silver Lake',
    logo: 'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=400&h=400&fit=crop',
  },
  {
    name: "Flask Fine Wine & Whisky",
    slug: 'flask-fine-wine',
    domain: 'flaskfinewines.com',
    location: 'Downtown, Los Angeles',
    tagline: 'Premium rare and vintage wines and whisky',
    logo: 'https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=400&h=400&fit=crop',
  },
];

const DELAY_MS = 250; // Polite delay between requests
const MAX_WINES_PER_RETAILER = 50; // Get more wines per retailer

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchJSON(url) {
  const resp = await fetch(url, {
    headers: {
      'User-Agent': 'CruWineMarketplace/1.0 (seed-data-collection)',
      'Accept': 'application/json',
    }
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${url}`);
  return resp.json();
}

function parseWineTitle(title) {
  // Titles often follow: "Producer, Wine Name, Region, Varietal, Vintage"
  // or "Vintage Producer Wine Name Region Size"
  const parts = title.split(',').map(s => s.trim());

  // Try to extract vintage year
  const vintageMatch = title.match(/\b(19|20)\d{2}\b/);
  const vintage = vintageMatch ? parseInt(vintageMatch[0]) : null;

  return { parts, vintage };
}

function extractRegionFromTags(tags) {
  const regions = [
    'Burgundy', 'Bordeaux', 'Champagne', 'Loire Valley', 'Rhone', 'Alsace', 'Languedoc',
    'Roussillon', 'Provence', 'Corsica', 'Jura', 'Beaujolais', 'Chablis', 'Sancerre',
    'Tuscany', 'Piedmont', 'Sicily', 'Campania', 'Veneto', 'Lombardia', 'Puglia',
    'Abruzzo', 'Sardinia', 'Emilia-Romagna', 'Liguria', 'Friuli', 'Marche', 'Lazio',
    'Napa Valley', 'Sonoma', 'Willamette Valley', 'Santa Barbara', 'Paso Robles',
    'Mendoza', 'Rioja', 'Priorat', 'Galicia', 'Rias Baixas', 'Mosel', 'Pfalz',
    'Burgenland', 'South Australia', 'Stellenbosch', 'Naoussa', 'Bierzo',
  ];
  const tagStr = Array.isArray(tags) ? tags.join(' ') : tags;
  for (const r of regions) {
    if (tagStr.includes(r)) return r;
  }
  return null;
}

function extractCountryFromTags(tags) {
  const countries = {
    'France': 'France', 'Italy': 'Italy', 'Spain': 'Spain', 'Germany': 'Germany',
    'Portugal': 'Portugal', 'Austria': 'Austria', 'Greece': 'Greece', 'Argentina': 'Argentina',
    'Chile': 'Chile', 'South Africa': 'South Africa', 'Australia': 'Australia',
    'New Zealand': 'New Zealand', 'United States': 'United States', 'California': 'United States',
    'Oregon': 'United States', 'Washington': 'United States', 'Mexico': 'Mexico',
    'Israel': 'Israel', 'Japan': 'Japan', 'Hungary': 'Hungary', 'Slovenia': 'Slovenia',
  };
  const tagStr = Array.isArray(tags) ? tags.join(' ') : tags;
  for (const [key, country] of Object.entries(countries)) {
    if (tagStr.includes(key)) return country;
  }
  return null;
}

function extractVarietalFromTags(tags) {
  const varietals = [
    'Pinot Noir', 'Cabernet Sauvignon', 'Merlot', 'Syrah', 'Grenache', 'Tempranillo',
    'Sangiovese', 'Nebbiolo', 'Malbec', 'Zinfandel', 'Gamay', 'Mourvedre', 'Barbera',
    'Chardonnay', 'Sauvignon Blanc', 'Riesling', 'Chenin Blanc', 'Viognier', 'Albarino',
    'Gruner Veltliner', 'Gewurztraminer', 'Pinot Grigio', 'Pinot Gris', 'Vermentino',
    'Trebbiano', 'Verdicchio', 'Garnacha', 'Cabernet Franc', 'Petit Verdot',
    'Montepulciano', 'Nero d\'Avola', 'Nerello Mascalese', 'Piedirosso', 'Lambrusco',
    'Cinsault', 'Carignan', 'Glera', 'Prosecco', 'Champagne',
  ];
  const tagStr = Array.isArray(tags) ? tags.join(' ') : tags;
  for (const v of varietals) {
    if (tagStr.includes(v)) return v;
  }
  return null;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200);
}

async function scrapeShopifyRetailer(retailer) {
  console.log(`\n📦 Scraping ${retailer.name} (${retailer.domain})...`);

  // Step 1: Get all products from collection
  let allProducts = [];
  let page = 1;

  while (true) {
    try {
      const url = `https://${retailer.domain}/collections/all/products.json?limit=250&page=${page}`;
      console.log(`  Fetching page ${page}...`);
      const data = await fetchJSON(url);

      if (!data.products || data.products.length === 0) break;
      allProducts = allProducts.concat(data.products);

      if (data.products.length < 250) break;
      page++;
      await sleep(DELAY_MS);
    } catch (err) {
      console.log(`  ⚠️  Collection API failed: ${err.message}`);
      break;
    }
  }

  console.log(`  Found ${allProducts.length} total products`);

  // Filter to wine products only
  const wineProducts = allProducts.filter(p => {
    const typeStr = (p.product_type || '').toLowerCase();
    const tagStr = Array.isArray(p.tags) ? p.tags.join(' ') : (p.tags || '');
    const title = p.title || '';

    const isWine = typeStr.includes('wine') ||
                   typeStr === 'red' || typeStr === 'white' || typeStr === 'rose' || typeStr === 'rosé' ||
                   typeStr.includes('sparkling') || typeStr.includes('champagne') ||
                   tagStr.includes('Wine') || tagStr.includes('750ml') ||
                   tagStr.includes('Red') || tagStr.includes('White');

    const isSpirit = typeStr.includes('spirit') || typeStr.includes('whisky') || typeStr.includes('whiskey') ||
                     typeStr.includes('tequila') || typeStr.includes('vodka') || typeStr.includes('gin') ||
                     typeStr.includes('rum') || typeStr.includes('bourbon') || typeStr.includes('scotch') ||
                     typeStr.includes('mezcal') || typeStr.includes('cognac') || typeStr.includes('beer') ||
                     typeStr.includes('cider') || typeStr.includes('sake');

    const titleLower = title.toLowerCase();
    const isSpiritByTitle = titleLower.includes('whisky') || titleLower.includes('whiskey') ||
                            titleLower.includes('tequila') || titleLower.includes('vodka') ||
                            titleLower.includes('gin ') || titleLower.includes('rum ') ||
                            titleLower.includes('bourbon') || titleLower.includes('scotch') ||
                            titleLower.includes('mezcal') || titleLower.includes('cognac');

    const isNotAccessory = !title.includes('Gift') && !title.includes('Stopper') &&
                           !title.includes('Corkscrew') && !title.includes('Candle') &&
                           !title.includes('T-Shirt') && !title.includes('Cookie') &&
                           !title.includes('Pasta') && !title.includes('Glass ') &&
                           !title.includes('Bag') && !title.includes('Tote') &&
                           !title.includes('Hat') && !title.includes('Hoodie') &&
                           !title.includes('Tee') && !title.includes('Beanie') &&
                           !title.includes('Coaster') && !title.includes('Strainer') &&
                           !title.includes('Bar Set') && !title.includes('Ice Mold') &&
                           !title.includes('Shipper') && !title.includes('Box');

    return isWine && !isSpirit && !isSpiritByTitle && isNotAccessory;
  });

  console.log(`  Filtered to ${wineProducts.length} wine products`);

  // Step 2: Fetch individual product JSONs for images (batch of first 25)
  const wines = [];
  const maxWines = MAX_WINES_PER_RETAILER;
  const toFetch = wineProducts.slice(0, maxWines);

  for (let i = 0; i < toFetch.length; i++) {
    const product = toFetch[i];
    let imageUrl = null;

    // Try to get image from individual product JSON
    try {
      const prodUrl = `https://${retailer.domain}/products/${product.handle}.json`;
      const prodData = await fetchJSON(prodUrl);
      imageUrl = prodData.product?.image?.src || null;
      if (imageUrl) {
        // Ensure high quality
        imageUrl = imageUrl.replace(/\?.*$/, ''); // Remove query params for cleaner URL
      }
    } catch (err) {
      console.log(`  ⚠️  Failed to fetch image for ${product.handle}`);
    }

    const { vintage } = parseWineTitle(product.title);
    const tags = typeof product.tags === 'string' ? product.tags.split(', ') : (product.tags || []);
    const bodyText = (product.body_html || '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

    wines.push({
      title: product.title,
      handle: product.handle,
      vendor: product.vendor,
      price: parseFloat(product.variants?.[0]?.price || '0'),
      vintage,
      region: extractRegionFromTags(tags) || extractRegionFromTags(product.title),
      country: extractCountryFromTags(tags) || extractCountryFromTags(product.title),
      varietal: extractVarietalFromTags(tags) || extractVarietalFromTags(product.title),
      description: bodyText.substring(0, 500),
      tags,
      imageUrl,
    });

    if (i < toFetch.length - 1) await sleep(DELAY_MS);

    if ((i + 1) % 10 === 0) {
      console.log(`  Fetched ${i + 1}/${toFetch.length} product details...`);
    }
  }

  console.log(`  ✅ Scraped ${wines.length} wines with ${wines.filter(w => w.imageUrl).length} images`);

  return {
    ...retailer,
    wines,
  };
}

async function main() {
  console.log('🍷 Cru Wine Marketplace — Retailer Data Scraper');
  console.log('================================================\n');

  const results = [];

  for (const retailer of RETAILERS) {
    try {
      const data = await scrapeShopifyRetailer(retailer);
      results.push(data);
    } catch (err) {
      console.error(`❌ Failed to scrape ${retailer.name}: ${err.message}`);
    }
  }

  // Save raw scraped data
  const outputPath = join(__dirname, 'scraped-wines.json');
  writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Saved scraped data to ${outputPath}`);

  // Summary
  console.log('\n📊 Summary:');
  let totalWines = 0;
  let totalImages = 0;
  for (const r of results) {
    const withImages = r.wines.filter(w => w.imageUrl).length;
    console.log(`  ${r.name}: ${r.wines.length} wines (${withImages} with images)`);
    totalWines += r.wines.length;
    totalImages += withImages;
  }
  console.log(`\n  Total: ${totalWines} wines, ${totalImages} with matching images`);
}

main().catch(console.error);
