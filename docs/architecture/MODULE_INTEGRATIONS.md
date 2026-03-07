# Module: Third-Party Integrations & Services

> **Module Type:** Integration Reference Module
> **Extends:** [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) (Core Stack) + [MODULE_ECOMMERCE.md](./MODULE_ECOMMERCE.md) (Commerce Engine)
> **Domain:** Wine e-commerce, marketplace, auction/trading, localized delivery
> **Updated:** March 2026

---

## How This Module Works

This document catalogs **every third-party service, API, and integration** needed to run a production wine e-commerce + trading/bidding platform. Each integration category includes a recommended primary pick, viable alternatives, code-level integration patterns, and environment variable conventions.

**Loading into Claude:** Paste the core `SYSTEM_ARCHITECTURE.md` and `MODULE_ECOMMERCE.md` first for stack context. Then paste relevant sections of this module when you need to implement a specific integration. You don't need to load the entire doc — each section is self-contained.

**Naming convention:** All environment variables follow `NEXT_PUBLIC_` prefix for client-safe values and plain `UPPERCASE_SNAKE_CASE` for server-only secrets. Medusa-specific env vars use `MEDUSA_` prefix.

---

## Table of Contents

1. [Integration Map](#1-integration-map)
2. [Wine Pricing & Market Data](#2-wine-pricing--market-data)
3. [Product Search & Discovery](#3-product-search--discovery)
4. [Age Verification & Identity](#4-age-verification--identity)
5. [Shipping Compliance & Tax](#5-shipping-compliance--tax)
6. [Last-Mile Delivery (On-Demand)](#6-last-mile-delivery-on-demand)
7. [Long-Distance Fulfillment (3PL)](#7-long-distance-fulfillment-3pl)
8. [Order Tracking & Post-Purchase](#8-order-tracking--post-purchase)
9. [Payments, Escrow & Fraud](#9-payments-escrow--fraud)
10. [Transactional Email & SMS](#10-transactional-email--sms)
11. [Analytics & Event Tracking](#11-analytics--event-tracking)
12. [Reviews & User-Generated Content](#12-reviews--user-generated-content)
13. [Wine Label Recognition & Catalog Enrichment](#13-wine-label-recognition--catalog-enrichment)
14. [Recommendation Engine](#14-recommendation-engine)
15. [Shipping Insurance](#15-shipping-insurance)
16. [Integration Architecture Patterns](#16-integration-architecture-patterns)
17. [Environment Variables Reference](#17-environment-variables-reference)
18. [Decision Log](#18-decision-log)

---

## 1. Integration Map

```
┌──────────────────────────────────────────────────────────────────────┐
│                        YOUR PLATFORM                                  │
│   Next.js 15 (Vercel) + Medusa v2 (Railway) + Supabase              │
└───────┬─────────┬──────────┬──────────┬──────────┬───────────────────┘
        │         │          │          │          │
   ┌────┴───┐ ┌──┴────┐ ┌──┴────┐ ┌──┴─────┐ ┌─┴──────────┐
   │COMMERCE│ │DELIVER│ │COMPLY │ │COMMUNIC│ │  DISCOVER  │
   │        │ │       │ │       │ │        │ │            │
   │Stripe  │ │DoorDash│ │Sovos  │ │Resend  │ │Meilisearch │
   │Connect │ │Drive  │ │ShipCo.│ │        │ │            │
   │        │ │       │ │       │ │Twilio  │ │Wine-       │
   │Stripe  │ │Uber   │ │Avalara│ │        │ │Searcher    │
   │Radar   │ │Direct │ │       │ │AfterShip│ │            │
   │        │ │       │ │Veratad│ │        │ │Preferabli  │
   │Cabrella│ │Wine-  │ │       │ │Segment │ │            │
   │(insure)│ │shipping│ │       │ │        │ │API4AI      │
   └────────┘ └───────┘ └───────┘ └────────┘ └────────────┘
```

**Integration Categories at a Glance:**

| Category | Primary Pick | Why | Alternative(s) |
|---|---|---|---|
| Wine Pricing Data | Wine-Searcher API | Largest price database, critic scores, 24-merchant comparisons | Liv-ex (fine wine trading), Bordeaux Index LiveTrade |
| Fine Wine Market Data | Liv-ex API | Institutional-grade indices, trading exchange for investment wines | Bordeaux Index LiveTrade API |
| Product Search | Meilisearch | Open-source, Rust-native, sub-50ms, self-hostable, free | Typesense (also OSS), Algolia (enterprise SaaS) |
| Age Verification | Veratad | 5B+ citizens, KBA + document + biometric, COPPA/GDPR-K | AgeChecker.net |
| Shipping Compliance | Sovos ShipCompliant | 2000+ alcohol customers, real-time DTC compliance, 60+ integrations | Manual rules engine (see MODULE_ECOMMERCE.md) |
| Tax Calculation | Avalara AvaTax | 1400+ integrations, alcohol excise tax support, global | TaxJar (simpler, Stripe-native) |
| Last-Mile Delivery | DoorDash Drive | White-label API, alcohol-certified Dashers, largest network | Uber Direct (no minimums, per-delivery pricing) |
| 3PL / Wine Fulfillment | Wineshipping | Highest-volume wine 3PL in US, temp-controlled, compliance-built | WineCare Logistics (smaller, Napa/Sonoma focused) |
| Order Tracking | AfterShip | 1000+ carriers, webhook-driven, branded tracking pages | Ship24 (faster setup), Narvar (enterprise UX) |
| Transactional Email | Resend | React Email components, Next.js native, TypeScript SDK | Postmark (highest deliverability), SendGrid (highest volume) |
| SMS Notifications | Twilio | 40+ countries, ecommerce templates, programmable messaging | — |
| Analytics Pipeline | Segment | Instrument once, fan out to any destination, CDP | Jitsu (open-source alternative) |
| Product Analytics | Mixpanel | Funnel analysis, cohort analysis, ecommerce events native | Amplitude (larger enterprise), PostHog (self-hostable) |
| Reviews & UGC | Yotpo | API-first, photo/video reviews, loyalty integration | Judge.me (budget), Stamped.io (mid-tier) |
| Wine Label Recognition | API4AI Wine Recognition | 400K+ labels trained, REST API, real-time | TinEye WineEngine (image fingerprint approach) |
| Wine Recommendations | Preferabli | AI taste-profile engine, flavor matching, food pairing API | Custom ML (build-your-own with embeddings) |
| Shipping Insurance | Cabrella | Wine-specific coverage up to $150K/package, API + webhook | InsureShield, Secursus |
| Fraud Detection | Stripe Radar | Included with Stripe, ML-based, custom rules engine | Sift (advanced, 8-12 week setup), Riskified (enterprise) |

---

## 2. Wine Pricing & Market Data

### The Problem

Wine prices vary wildly across retailers, regions, and vintages. Your marketplace needs real-time price intelligence for three reasons: (1) helping sellers set competitive prices, (2) showing buyers fair market value, and (3) powering the trading/bidding floor with reference prices.

### Primary: Wine-Searcher API

Wine-Searcher aggregates pricing from tens of thousands of retailers globally and provides critic scores from Robert Parker, Jancis Robinson, Wine Spectator, and more.

**Key APIs:**
- **Market Price API** — returns lowest 24 retailer prices for a given wine/vintage
- **Wine Check API** — returns aggregated critic scores and tasting notes
- RESTful, returns XML or JSON

**Limitations:** No historical pricing via API (requires PRO subscription for web access). Rate limits apply per plan.

```typescript
// lib/integrations/wine-searcher.ts
const WINE_SEARCHER_BASE = 'https://api.wine-searcher.com/wine-select-api.lml';

interface WineSearcherParams {
  wine: string;       // Wine name + vintage
  Ession: string;     // API session key
  Xformat: 'J' | 'X'; // JSON or XML
  Xlocation?: string;  // Country/state filter
}

export async function getMarketPrice(wineName: string, vintage: number) {
  const params = new URLSearchParams({
    wine: `${wineName} ${vintage}`,
    Ession: process.env.WINE_SEARCHER_API_KEY!,
    Xformat: 'J',
    Xlocation: 'US',
  });

  const res = await fetch(`${WINE_SEARCHER_BASE}?${params}`, {
    next: { revalidate: 3600 }, // Cache 1 hour in Next.js
  });

  if (!res.ok) throw new Error('Wine-Searcher API error');
  return res.json();
}

export async function getCriticScores(wineName: string, vintage: number) {
  const params = new URLSearchParams({
    wine: `${wineName} ${vintage}`,
    Ession: process.env.WINE_SEARCHER_API_KEY!,
    Xformat: 'J',
    Xwinecheck: '1', // Enables critic score data
  });

  const res = await fetch(`${WINE_SEARCHER_BASE}?${params}`, {
    next: { revalidate: 86400 }, // Cache 24 hours — scores don't change often
  });

  return res.json();
}
```

### Fine Wine Trading: Liv-ex API

For the trading/bidding floor, Liv-ex provides institutional-grade market data — the Bloomberg of wine.

**Key APIs:**
- **Indices API** — Liv-ex Fine Wine 1000, Bordeaux 500, regional sub-indices
- **Historical data** — price performance over time for investment-grade wines
- Data used by wine funds, auction houses, and institutional traders

```typescript
// lib/integrations/liv-ex.ts
export async function getWineIndex(indexName: string = 'fine-wine-1000') {
  const res = await fetch(`https://api.liv-ex.com/v1/indices/${indexName}`, {
    headers: {
      'Authorization': `Bearer ${process.env.LIV_EX_API_KEY}`,
      'Accept': 'application/json',
    },
    next: { revalidate: 86400 },
  });

  return res.json();
}
```

### Alternative: Bordeaux Index LiveTrade API

Two-way trading API — merchants can list wines and access buy/sell offers in real-time. No membership costs or API fees for basic access. Particularly valuable if you want to let your platform's traders access the broader fine wine market.

### Caching Strategy

Wine pricing data should be cached aggressively since prices don't change by the second:

| Data Type | Cache TTL | Strategy |
|---|---|---|
| Market prices | 1 hour | `next: { revalidate: 3600 }` in fetch |
| Critic scores | 24 hours | Rarely change; cache in Supabase as denormalized column |
| Liv-ex indices | 24 hours | Daily index updates |
| Trade/bid reference prices | 15 minutes | More dynamic for active trading |

---

## 3. Product Search & Discovery

### The Problem

Wine catalogs have rich, multi-dimensional attributes (region, varietal, vintage, producer, critic score, price range, food pairing). Users need faceted, typo-tolerant, instant search.

### Primary: Meilisearch

Open-source (MIT), written in Rust, sub-50ms search. Self-hostable on Railway alongside Medusa, or use Meilisearch Cloud. Zero licensing cost for self-hosted.

**Why over Algolia:** Free self-hosting, simpler configuration, built-in hybrid search (keyword + semantic), excellent for startup/growth stage. Migrate to Algolia later if you need enterprise SLA.

```typescript
// lib/integrations/search.ts
import { MeiliSearch } from 'meilisearch';

const searchClient = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST!,       // e.g., https://ms.yourdomain.com
  apiKey: process.env.MEILISEARCH_ADMIN_KEY!, // Server-side only
});

// Public search key for client-side (read-only, safe to expose)
export const SEARCH_API_KEY = process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY!;

// Index configuration — run once during setup
export async function configureWineIndex() {
  const index = searchClient.index('wines');

  await index.updateSettings({
    searchableAttributes: [
      'name',
      'producer',
      'region',
      'appellation',
      'varietal',
      'description',
    ],
    filterableAttributes: [
      'varietal',
      'region',
      'vintage',
      'price',
      'critic_score',
      'classification',
      'vendor_handle',
      'auction_active',
    ],
    sortableAttributes: ['price', 'critic_score', 'vintage', 'created_at'],
    rankingRules: [
      'words',
      'typo',
      'proximity',
      'attribute',
      'sort',
      'exactness',
      'critic_score:desc', // Custom ranking: higher-rated wines surface first
    ],
  });
}

// Sync products from Medusa → Meilisearch (via Medusa subscriber)
export async function indexWineProduct(product: MedusaProduct & WineDetails) {
  const index = searchClient.index('wines');

  await index.addDocuments([{
    id: product.id,
    name: product.title,
    producer: product.wine_details?.producer,
    region: product.wine_details?.region,
    appellation: product.wine_details?.appellation,
    varietal: product.wine_details?.varietal,
    vintage: product.wine_details?.vintage,
    price: product.variants?.[0]?.calculated_price?.calculated_amount,
    critic_score: product.wine_details?.critic_score,
    classification: product.wine_details?.classification,
    vendor_handle: product.vendor?.handle,
    thumbnail: product.thumbnail,
    auction_active: product.auction?.status === 'active',
    description: product.description,
    created_at: product.created_at,
  }]);
}
```

**Medusa Subscriber to Keep Search in Sync:**

```typescript
// medusa/src/subscribers/product-search-sync.ts
import { SubscriberArgs, type SubscriberConfig } from '@medusajs/framework';

export default async function productSearchSync({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  // Fetch updated product, index to Meilisearch
  const productService = container.resolve('productModuleService');
  const product = await productService.retrieveProduct(event.data.id, {
    relations: ['variants', 'variants.calculated_price'],
  });

  await indexWineProduct(product);
}

export const config: SubscriberConfig = {
  event: [
    'product.created',
    'product.updated',
  ],
};
```

**Frontend InstantSearch Component:**

```tsx
// components/search/wine-search.tsx
'use client';

import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import { InstantSearch, SearchBox, RefinementList, Hits }
  from 'react-instantsearch';

const { searchClient } = instantMeiliSearch(
  process.env.NEXT_PUBLIC_MEILISEARCH_HOST!,
  process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY!,
);

export function WineSearch() {
  return (
    <InstantSearch indexName="wines" searchClient={searchClient}>
      <SearchBox placeholder="Search wines by name, region, varietal..." />

      <div className="flex gap-8">
        <aside className="w-64 space-y-6">
          <RefinementList attribute="varietal" limit={10} />
          <RefinementList attribute="region" limit={10} />
          <RefinementList attribute="classification" />
        </aside>

        <main className="flex-1">
          <Hits hitComponent={WineHitCard} />
        </main>
      </div>
    </InstantSearch>
  );
}
```

### Alternatives

| Service | Hosting | Cost | Best For |
|---|---|---|---|
| **Meilisearch** | Self-host or Cloud | Free (self-host) / $30+/mo (cloud) | Startups, growth stage |
| **Typesense** | Self-host or Cloud | Free (self-host) / $0.03/search (cloud) | Budget-conscious, high performance |
| **Algolia** | SaaS only | ~$1/1000 searches | Enterprise SLA, AI features |

---

## 4. Age Verification & Identity

### The Problem

Alcohol sales require age verification at multiple points: account creation, checkout, and delivery. Failure to verify is a regulatory and legal liability.

### Primary: Veratad

5B+ citizen database, sub-second verification, multiple methods (data, document, biometric, KBA).

**Three-Layer Verification Strategy** (from MODULE_ECOMMERCE.md):

1. **Layer 1 — Self-declaration** (UI gate, no API call): Date-of-birth input at registration
2. **Layer 2 — Data verification at checkout** (Veratad API): Verify name + DOB + address against credit bureau / DMV records
3. **Layer 3 — Adult signature at delivery** (DoorDash Drive / carrier requirement)

```typescript
// lib/integrations/age-verify.ts
interface VerificationRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

interface VerificationResult {
  verified: boolean;
  confidence: 'high' | 'medium' | 'low';
  method: string;
  transactionId: string;
}

export async function verifyAge(data: VerificationRequest): Promise<VerificationResult> {
  const res = await fetch('https://api.veratad.com/v1/age-verify', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(
        `${process.env.VERATAD_API_USER}:${process.env.VERATAD_API_PASSWORD}`
      ).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      first_name: data.firstName,
      last_name: data.lastName,
      dob: data.dateOfBirth,
      address: {
        street1: data.address.street,
        city: data.address.city,
        state: data.address.state,
        postal_code: data.address.zip,
        country: 'US',
      },
      product: 'AgeMatch', // Veratad product for age verification
    }),
  });

  const result = await res.json();

  return {
    verified: result.action === 'PASS',
    confidence: result.action === 'PASS' ? 'high' : 'low',
    method: 'data_verification',
    transactionId: result.transaction_id,
  };
}
```

**Checkout Integration (Medusa Workflow Step):**

```typescript
// medusa/src/workflows/steps/verify-age-at-checkout.ts
import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';

export const verifyAgeStep = createStep(
  'verify-age-at-checkout',
  async ({ customerId, shippingAddress }, { container }) => {
    // Fetch customer details from Medusa
    const customerService = container.resolve('customerModuleService');
    const customer = await customerService.retrieveCustomer(customerId);

    // Call Veratad
    const result = await verifyAge({
      firstName: customer.first_name,
      lastName: customer.last_name,
      dateOfBirth: customer.metadata?.date_of_birth as string,
      address: shippingAddress,
    });

    if (!result.verified) {
      throw new Error('AGE_VERIFICATION_FAILED');
    }

    // Store verification record (see MODULE_ECOMMERCE.md §10)
    return new StepResponse({ verificationId: result.transactionId });
  }
);
```

### Alternative: AgeChecker.net

Simpler integration, popup-based verification widget. Good for MVP but less flexible than Veratad's API-first approach.

---

## 5. Shipping Compliance & Tax

### Shipping Compliance: Sovos ShipCompliant

The gold standard for alcohol DTC shipping compliance. Used by 2,000+ wineries, breweries, and distilleries.

**What it does:**
- Real-time compliance checks against every US state + county regulation
- License management with expiration alerts
- Tax rate calculation down to the address level (sales tax, excise tax, direct shipper taxes)
- Automated reporting for state filings
- 60+ ecommerce and fulfillment partner integrations

```typescript
// lib/integrations/ship-compliant.ts
interface ComplianceCheckRequest {
  shipFromState: string;
  shipToAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  items: Array<{
    brandKey: string;
    productKey: string;
    volume: number;      // in mL
    quantity: number;
    alcoholPercent: number;
  }>;
  purchaserDob: string;
}

interface ComplianceCheckResult {
  isCompliant: boolean;
  rules: Array<{
    ruleDescription: string;
    status: 'PASS' | 'FAIL' | 'WARNING';
  }>;
  taxes: {
    salesTax: number;
    exciseTax: number;
    totalTax: number;
  };
}

export async function checkShippingCompliance(
  data: ComplianceCheckRequest
): Promise<ComplianceCheckResult> {
  const res = await fetch(`${process.env.SOVOS_API_BASE}/api/compliance/check`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SOVOS_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return res.json();
}
```

**When to call:** During cart validation (before checkout), and again at order confirmation. States change rules frequently — always check in real-time.

### Tax Calculation: Avalara AvaTax

For general sales tax beyond alcohol-specific excise taxes. Avalara handles the complexity of 13,000+ US tax jurisdictions.

**Why Avalara over TaxJar:** Avalara supports alcohol-specific excise tax calculations and has deeper integration with Sovos ShipCompliant. TaxJar is simpler but doesn't handle beverage alcohol excise tax as well.

```typescript
// lib/integrations/tax.ts
import Avatax from 'avatax';

const client = new Avatax({
  appName: 'YourWineMarketplace',
  appVersion: '1.0.0',
  machineName: 'production',
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
}).withSecurity({
  username: process.env.AVALARA_USERNAME!,
  password: process.env.AVALARA_PASSWORD!,
});

export async function calculateTax(order: {
  customerCode: string;
  lines: Array<{
    amount: number;
    taxCode: string; // e.g., 'PA1010100' for wine
    description: string;
  }>;
  shipFrom: { line1: string; city: string; region: string; postalCode: string };
  shipTo: { line1: string; city: string; region: string; postalCode: string };
}) {
  const result = await client.createTransaction({
    type: 'SalesOrder',
    companyCode: process.env.AVALARA_COMPANY_CODE!,
    customerCode: order.customerCode,
    date: new Date().toISOString().split('T')[0],
    lines: order.lines.map((line, i) => ({
      number: String(i + 1),
      amount: line.amount,
      taxCode: line.taxCode,
      description: line.description,
    })),
    addresses: {
      shipFrom: order.shipFrom,
      shipTo: order.shipTo,
    },
  });

  return {
    totalTax: result.totalTax,
    lines: result.lines?.map(l => ({
      lineNumber: l.lineNumber,
      tax: l.tax,
      taxDetails: l.details,
    })),
  };
}
```

**Alcohol Tax Codes:**
| Tax Code | Description |
|---|---|
| `PA1010100` | Wine (still, table) |
| `PA1010200` | Wine (sparkling) |
| `PA1010300` | Wine (fortified/dessert) |
| `PA1020100` | Beer |
| `PA1030100` | Spirits |

---

## 6. Last-Mile Delivery (On-Demand)

### The Problem

Your "localized delivery in select cities" feature needs a white-label delivery fleet without hiring drivers. The fleet must support alcohol delivery compliance (age verification at door, adult signature).

### Primary: DoorDash Drive API

White-label delivery using the Dasher network. Your branding, their fleet.

**Key Features:**
- Single API call to request a delivery
- Alcohol delivery support (requires legal addendum)
- Real-time driver tracking
- Proof of delivery with photo/signature
- Sandbox environment for testing

```typescript
// lib/integrations/doordash-drive.ts
import jwt from 'jsonwebtoken';

function createDoorDashJWT(): string {
  const payload = {
    aud: 'doordash',
    iss: process.env.DOORDASH_DEVELOPER_ID!,
    kid: process.env.DOORDASH_KEY_ID!,
    exp: Math.floor(Date.now() / 1000) + 300, // 5 min expiry
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, process.env.DOORDASH_SIGNING_SECRET!, {
    algorithm: 'HS256',
    header: { 'dd-ver': 'DD-JWT-V1' },
  });
}

interface DeliveryRequest {
  externalDeliveryId: string;
  pickupAddress: string;
  pickupPhoneNumber: string;
  pickupInstructions?: string;
  dropoffAddress: string;
  dropoffPhoneNumber: string;
  dropoffInstructions?: string;
  orderValue: number;         // In cents
  containsAlcohol: boolean;
  tip?: number;               // In cents
}

export async function createDelivery(data: DeliveryRequest) {
  const token = createDoorDashJWT();

  const res = await fetch('https://openapi.doordash.com/drive/v2/deliveries', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      external_delivery_id: data.externalDeliveryId,
      pickup_address: data.pickupAddress,
      pickup_phone_number: data.pickupPhoneNumber,
      pickup_instructions: data.pickupInstructions,
      dropoff_address: data.dropoffAddress,
      dropoff_phone_number: data.dropoffPhoneNumber,
      dropoff_instructions: data.dropoffInstructions,
      order_value: data.orderValue,
      contains_alcohol: data.containsAlcohol,
      tip: data.tip,
      action_if_undeliverable: 'return_to_pickup',
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`DoorDash Drive error: ${error.message}`);
  }

  return res.json();
}

export async function getDeliveryStatus(externalDeliveryId: string) {
  const token = createDoorDashJWT();

  const res = await fetch(
    `https://openapi.doordash.com/drive/v2/deliveries/${externalDeliveryId}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );

  return res.json();
}
```

**Alcohol Delivery Requirements (DoorDash):**
- Your business must be licensed to sell alcohol in the operating state(s)
- Submit support ticket to enable alcohol delivery on your Drive account
- Sign legal addendum
- `contains_alcohol: true` flag triggers age verification at doorstep (Dasher checks ID)

### Alternative: Uber Direct API

Per-delivery pricing, no minimums. Supports alcohol where geographically permitted. Slightly smaller network than DoorDash but zero startup costs.

```typescript
// lib/integrations/uber-direct.ts
export async function createUberDelivery(data: {
  pickupAddress: string;
  dropoffAddress: string;
  items: Array<{ name: string; quantity: number; price: number }>;
}) {
  // OAuth2 token exchange
  const tokenRes = await fetch('https://login.uber.com/oauth/v2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.UBER_CLIENT_ID!,
      client_secret: process.env.UBER_CLIENT_SECRET!,
      grant_type: 'client_credentials',
      scope: 'eats.deliveries',
    }),
  });
  const { access_token } = await tokenRes.json();

  const res = await fetch('https://api.uber.com/v1/deliveries', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pickup: { address: data.pickupAddress },
      dropoff: { address: data.dropoffAddress },
      manifest: { items: data.items },
    }),
  });

  return res.json();
}
```

### Multi-Provider Strategy

Use a delivery aggregation layer so you can route orders to whichever provider has the best coverage/pricing for a given zip code:

```typescript
// lib/integrations/delivery-router.ts
type DeliveryProvider = 'doordash' | 'uber' | 'own_fleet';

interface DeliveryQuote {
  provider: DeliveryProvider;
  estimatedMinutes: number;
  fee: number;       // In cents
  available: boolean;
}

export async function getDeliveryQuotes(
  pickupZip: string,
  dropoffZip: string,
  containsAlcohol: boolean
): Promise<DeliveryQuote[]> {
  const quotes = await Promise.allSettled([
    getDoorDashQuote(pickupZip, dropoffZip, containsAlcohol),
    getUberQuote(pickupZip, dropoffZip, containsAlcohol),
    getOwnFleetAvailability(pickupZip, dropoffZip),
  ]);

  return quotes
    .filter((q): q is PromiseFulfilledResult<DeliveryQuote> =>
      q.status === 'fulfilled' && q.value.available)
    .map(q => q.value)
    .sort((a, b) => a.fee - b.fee); // Cheapest first
}
```

---

## 7. Long-Distance Fulfillment (3PL)

### The Problem

Local delivery handles same-day in your select cities. But many wine orders ship across states or across the country. You need a 3PL that understands alcohol shipping: temperature-controlled warehousing, carrier compliance, adult signature requirements, and state-by-state DTC laws.

### Primary: Wineshipping

The highest-volume wine shipper in the US. 2.6M sq ft of temperature-controlled space across 8 facilities.

**Key Capabilities:**
- Full ecommerce integration APIs
- Temperature-controlled storage and shipping
- Adult signature tracking
- State-by-state compliance enforcement
- Wine club fulfillment support
- Major carrier partnerships (FedEx, UPS, GLS)

**Integration Model:** Wineshipping provides a fulfillment API that accepts orders from your platform, picks/packs from their warehouse inventory, and ships with compliant carriers. Tracking numbers flow back to your order management.

```typescript
// lib/integrations/fulfillment.ts (conceptual — exact API varies by 3PL)
interface FulfillmentOrder {
  orderId: string;
  recipient: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    email: string;
    dateOfBirth: string; // Required for alcohol
  };
  items: Array<{
    sku: string;
    quantity: number;
    description: string;
  }>;
  shippingMethod: 'ground' | '2day' | 'overnight';
  requiresAdultSignature: boolean; // Always true for wine
}

export async function submitToFulfillment(order: FulfillmentOrder) {
  const res = await fetch(`${process.env.FULFILLMENT_API_BASE}/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.FULFILLMENT_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...order,
      requiresAdultSignature: true, // Always enforce for alcohol
    }),
  });

  const result = await res.json();
  return {
    fulfillmentId: result.id,
    trackingNumber: result.tracking_number, // May be null until shipped
    carrier: result.carrier,
    estimatedDelivery: result.estimated_delivery_date,
  };
}
```

### Fulfillment Decision Router

Route orders to the right fulfillment method based on delivery zone:

```typescript
// lib/integrations/fulfillment-router.ts
type FulfillmentMethod = 'local_delivery' | 'wine_3pl' | 'vendor_direct';

export function determineFulfillmentMethod(
  vendorCity: string,
  customerZip: string,
  deliveryZones: DeliveryZone[]
): FulfillmentMethod {
  // Check if customer is in a local delivery zone
  const localZone = deliveryZones.find(z =>
    z.zip_codes.includes(customerZip) && z.is_active
  );

  if (localZone) return 'local_delivery';

  // Check if vendor handles their own shipping
  // (some wineries have their own fulfillment)
  // Default to 3PL
  return 'wine_3pl';
}
```

---

## 8. Order Tracking & Post-Purchase

### Primary: AfterShip

1,000+ carrier integrations, normalized tracking data, webhook-driven updates.

**Key Features:**
- Unified tracking across FedEx, UPS, USPS, DHL, and specialty wine carriers
- Branded tracking page (your domain, your design)
- Webhook notifications on status changes
- Estimated delivery date predictions
- Returns management

```typescript
// lib/integrations/tracking.ts
const AFTERSHIP_BASE = 'https://api.aftership.com/v4';

export async function createTracking(trackingNumber: string, carrier: string) {
  const res = await fetch(`${AFTERSHIP_BASE}/trackings`, {
    method: 'POST',
    headers: {
      'aftership-api-key': process.env.AFTERSHIP_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tracking: {
        tracking_number: trackingNumber,
        slug: carrier.toLowerCase(), // e.g., 'fedex', 'ups'
        title: `Wine Order`, // Display name
        custom_fields: {
          requires_adult_signature: 'true',
        },
      },
    }),
  });

  return res.json();
}

export async function getTracking(trackingNumber: string, carrier: string) {
  const res = await fetch(
    `${AFTERSHIP_BASE}/trackings/${carrier.toLowerCase()}/${trackingNumber}`,
    {
      headers: { 'aftership-api-key': process.env.AFTERSHIP_API_KEY! },
      next: { revalidate: 300 }, // Cache 5 min
    }
  );

  return res.json();
}
```

**Webhook Handler for Real-time Updates:**

```typescript
// app/api/webhooks/aftership/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const event = payload.msg;

  // Map AfterShip status to your internal statuses
  const statusMap: Record<string, string> = {
    'InTransit': 'in_transit',
    'OutForDelivery': 'out_for_delivery',
    'Delivered': 'delivered',
    'AttemptFail': 'delivery_failed',
    'Exception': 'exception',
  };

  const internalStatus = statusMap[event.tag] || 'unknown';

  // Update order in Medusa and broadcast via Supabase Realtime
  const supabase = createAdminClient();

  await supabase.from('order_tracking_events').insert({
    order_id: event.custom_fields?.order_id,
    tracking_number: event.tracking_number,
    status: internalStatus,
    location: event.checkpoints?.[0]?.location,
    message: event.checkpoints?.[0]?.message,
    timestamp: event.checkpoints?.[0]?.checkpoint_time,
  });

  // This insert triggers Supabase Realtime → customer sees live update
  return NextResponse.json({ received: true });
}
```

---

## 9. Payments, Escrow & Fraud

### Stripe Connect (Already in MODULE_ECOMMERCE.md)

Recap of the payment architecture from the commerce module:

- **Destination charges** for marketplace orders (platform takes fee, remainder to vendor)
- **Manual capture** for auction escrow (authorize at bid, capture when auction closes)
- **Express accounts** for vendor onboarding (Stripe handles KYC/tax forms)

### Fraud Detection: Stripe Radar

Included with every Stripe account — no additional cost for basic Radar. ML-based fraud scoring on every charge.

```typescript
// Radar is automatic with Stripe, but you can add custom rules:
// Example: Block orders > $5000 from new accounts with no prior purchases

// In Stripe Dashboard → Radar → Rules:
// Block if :risk_score: > 75 AND :is_new_customer:
// Review if :risk_score: > 50 AND :order_amount: > 50000

// Programmatic rule via metadata:
const paymentIntent = await stripe.paymentIntents.create({
  amount: orderTotal,
  currency: 'usd',
  metadata: {
    order_id: orderId,
    customer_account_age_days: String(accountAgeDays),
    is_first_purchase: String(isFirstPurchase),
    contains_alcohol: 'true',
  },
});
```

**When to upgrade beyond Radar:**
- If chargebacks exceed 0.5% → consider Sift or Riskified
- For P2P trading with high-value bottles ($500+) → add additional manual review rules
- For auction escrow → implement hold patterns with `capture_method: 'manual'`

---

## 10. Transactional Email & SMS

### Email: Resend + React Email

Purpose-built for the modern Next.js stack. Build email templates as React components, send via Resend's API.

```typescript
// lib/integrations/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

// Type-safe email sending
export async function sendOrderConfirmation(to: string, order: {
  id: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  trackingUrl: string;
}) {
  const { data, error } = await resend.emails.send({
    from: 'orders@yourdomain.com',
    to,
    subject: `Order Confirmed: ${order.id}`,
    react: OrderConfirmationEmail(order), // React Email component
  });

  if (error) throw new Error(`Email send failed: ${error.message}`);
  return data;
}

export async function sendBidNotification(to: string, auction: {
  wineName: string;
  currentBid: number;
  status: 'outbid' | 'winning' | 'auction_ended';
  auctionUrl: string;
}) {
  const subjects = {
    outbid: `You've been outbid on ${auction.wineName}`,
    winning: `You're winning the auction for ${auction.wineName}!`,
    auction_ended: `Auction ended: ${auction.wineName}`,
  };

  await resend.emails.send({
    from: 'auctions@yourdomain.com',
    to,
    subject: subjects[auction.status],
    react: BidNotificationEmail(auction),
  });
}
```

**React Email Template Example:**

```tsx
// emails/order-confirmation.tsx
import { Html, Head, Body, Container, Section, Text, Button }
  from '@react-email/components';

export function OrderConfirmationEmail({ id, items, total, trackingUrl }: OrderEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9fafb' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Section style={{ padding: '32px' }}>
            <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>
              Order Confirmed
            </Text>
            <Text>Order #{id}</Text>

            {items.map(item => (
              <Text key={item.name}>
                {item.name} × {item.quantity} — ${(item.price / 100).toFixed(2)}
              </Text>
            ))}

            <Text style={{ fontSize: '18px', fontWeight: 'bold' }}>
              Total: ${(total / 100).toFixed(2)}
            </Text>

            <Button href={trackingUrl} style={{
              backgroundColor: '#7c3aed',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '8px',
            }}>
              Track Your Order
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

### SMS: Twilio

For time-sensitive notifications where email might be missed.

```typescript
// lib/integrations/sms.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!,
);

type NotificationType =
  | 'order_confirmed'
  | 'out_for_delivery'
  | 'delivery_arriving'
  | 'bid_outbid'
  | 'auction_won';

const templates: Record<NotificationType, (data: any) => string> = {
  order_confirmed: (d) =>
    `Your wine order #${d.orderId} is confirmed! Estimated delivery: ${d.eta}`,
  out_for_delivery: (d) =>
    `Your wine delivery is on its way! Track it here: ${d.trackingUrl}`,
  delivery_arriving: (d) =>
    `Your wine delivery arrives in ~${d.minutes} min. Please have ID ready for age verification.`,
  bid_outbid: (d) =>
    `You've been outbid on ${d.wineName}. Current bid: $${d.currentBid}. Bid again: ${d.auctionUrl}`,
  auction_won: (d) =>
    `Congratulations! You won ${d.wineName} for $${d.winningBid}. Complete payment: ${d.paymentUrl}`,
};

export async function sendSMS(
  to: string,
  type: NotificationType,
  data: Record<string, string>
) {
  const body = templates[type](data);

  await client.messages.create({
    to,
    from: process.env.TWILIO_PHONE_NUMBER!,
    body,
  });
}
```

**When to send SMS vs Email:**

| Event | Email | SMS |
|---|---|---|
| Order confirmation | ✅ | Optional |
| Shipping update | ✅ | — |
| Out for delivery | ✅ | ✅ (time-sensitive) |
| "Have ID ready" reminder | — | ✅ (critical) |
| Outbid notification | ✅ | ✅ (time-sensitive) |
| Auction won | ✅ | ✅ |
| Trade offer received | ✅ | Optional |

---

## 11. Analytics & Event Tracking

### Data Pipeline: Segment

Instrument your events once, then route them to any analytics, marketing, or data warehouse tool.

```typescript
// lib/integrations/analytics.ts
import { AnalyticsBrowser } from '@segment/analytics-next';

export const analytics = AnalyticsBrowser.load({
  writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY!,
});

// Ecommerce event helpers
export function trackProductViewed(product: {
  id: string;
  name: string;
  price: number;
  varietal: string;
  region: string;
  vintage: number;
}) {
  analytics.track('Product Viewed', {
    product_id: product.id,
    name: product.name,
    price: product.price / 100,
    category: product.varietal,
    variant: String(product.vintage),
    region: product.region,
  });
}

export function trackBidPlaced(bid: {
  auctionId: string;
  wineName: string;
  bidAmount: number;
  auctionType: string;
}) {
  analytics.track('Bid Placed', {
    auction_id: bid.auctionId,
    product_name: bid.wineName,
    bid_amount: bid.bidAmount / 100,
    auction_type: bid.auctionType,
  });
}

export function trackOrderCompleted(order: {
  orderId: string;
  total: number;
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
}) {
  analytics.track('Order Completed', {
    order_id: order.orderId,
    total: order.total / 100,
    products: order.items.map(i => ({
      product_id: i.id,
      name: i.name,
      price: i.price / 100,
      quantity: i.quantity,
    })),
  });
}
```

**Segment Destinations** (route data to):
- **Mixpanel** — product analytics, funnels, cohorts
- **Google Analytics 4** — traffic, attribution
- **Data warehouse** (BigQuery / Snowflake) — raw event data for custom analysis
- **Intercom / HubSpot** — customer messaging based on behavior

### Product Analytics: Mixpanel

Funnel analysis, cohort analysis, and A/B testing for ecommerce-specific questions like "what % of users who view a product add it to cart?" or "do auction bidders have higher LTV?"

---

## 12. Reviews & User-Generated Content

### Primary: Yotpo

API-first review platform with photo/video reviews, Q&A, and loyalty integration.

```typescript
// lib/integrations/reviews.ts
const YOTPO_BASE = 'https://api.yotpo.com';

export async function getProductReviews(productId: string, page: number = 1) {
  const res = await fetch(
    `${YOTPO_BASE}/v1/widget/${process.env.YOTPO_APP_KEY}/products/${productId}/reviews.json?page=${page}`,
    { next: { revalidate: 300 } } // Cache 5 min
  );

  const data = await res.json();
  return {
    reviews: data.response.reviews,
    averageScore: data.response.bottomline.average_score,
    totalReviews: data.response.bottomline.total_review,
  };
}

export async function submitReview(review: {
  productId: string;
  email: string;
  name: string;
  title: string;
  body: string;
  score: number; // 1-5
}) {
  const res = await fetch(`${YOTPO_BASE}/v1/widget/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      appkey: process.env.YOTPO_APP_KEY,
      sku: review.productId,
      product_title: review.title,
      display_name: review.name,
      email: review.email,
      review_content: review.body,
      review_title: review.title,
      review_score: review.score,
    }),
  });

  return res.json();
}
```

**Wine-Specific Review Extensions:**
Consider adding custom review fields for wine-specific tasting notes:
- Aroma profile (fruity, earthy, floral, oaky)
- Palate notes
- Food pairing suggestions from buyers
- Drinking window recommendation
- Would-buy-again boolean

---

## 13. Wine Label Recognition & Catalog Enrichment

### Primary: API4AI Wine Recognition

ML models trained on 400K+ wine labels. Snap a photo, get wine identification.

**Use Cases:**
- **Seller listing:** Snap a photo of a bottle → auto-fill product details
- **Buyer search:** "What wine is this?" → camera-based search
- **Inventory intake:** Bulk catalog a cellar by photographing bottles

```typescript
// lib/integrations/label-recognition.ts
export async function recognizeWineLabel(imageUrl: string) {
  const res = await fetch('https://api4.ai/api/v1/results', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.API4AI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: imageUrl,
      model: 'wine-recognition',
    }),
  });

  const data = await res.json();

  return {
    wineName: data.results?.[0]?.name,
    producer: data.results?.[0]?.producer,
    vintage: data.results?.[0]?.vintage,
    region: data.results?.[0]?.region,
    confidence: data.results?.[0]?.confidence,
  };
}
```

### Alternative: TinEye WineEngine

Image fingerprint approach — better for exact label matching against a known database. Used by major wine retailers.

---

## 14. Recommendation Engine

### Primary: Preferabli

AI-powered taste-profile engine designed specifically for wine, beer, and spirits. Analyzes flavor profiles, stylistic preferences, and brand affinity.

**Key Features:**
- Taste profile built from user ratings and purchases
- Similar wine recommendations
- Food pairing API
- "Try something new" discovery engine

```typescript
// lib/integrations/recommendations.ts
export async function getWineRecommendations(userId: string, limit: number = 10) {
  const res = await fetch(
    `${process.env.PREFERABLI_API_BASE}/recommendations?user_id=${userId}&limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.PREFERABLI_API_KEY}`,
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 },
    }
  );

  return res.json();
}

export async function getFoodPairings(wineId: string) {
  const res = await fetch(
    `${process.env.PREFERABLI_API_BASE}/pairings?wine_id=${wineId}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.PREFERABLI_API_KEY}`,
      },
      next: { revalidate: 86400 }, // Pairings don't change
    }
  );

  return res.json();
}
```

### Build-Your-Own Alternative

For a custom recommendation engine using embeddings:

```
Wine attributes → Vector embedding (OpenAI / Cohere)
   → Store in Supabase pgvector
   → Query: "Find wines similar to this one"
   → Cosine similarity search over embeddings
```

This is more work but gives you full control and no per-query API costs.

---

## 15. Shipping Insurance

### Primary: Cabrella

Wine-specific transit insurance with API integration. Coverage up to $150,000 per package.

```typescript
// lib/integrations/insurance.ts
export async function insureShipment(shipment: {
  trackingNumber: string;
  carrier: string;
  value: number;         // Declared value in cents
  origin: string;        // Zip code
  destination: string;   // Zip code
  description: string;
}) {
  const res = await fetch(`${process.env.CABRELLA_API_BASE}/insure`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CABRELLA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tracking_number: shipment.trackingNumber,
      carrier: shipment.carrier,
      declared_value: shipment.value / 100,
      origin_zip: shipment.origin,
      destination_zip: shipment.destination,
      commodity: 'wine',
      description: shipment.description,
    }),
  });

  const result = await res.json();
  return {
    policyId: result.policy_id,
    premium: result.premium,       // Cost of insurance
    coverageAmount: result.coverage_amount,
  };
}
```

**When to auto-insure:**
| Order Value | Action |
|---|---|
| < $100 | Skip insurance (carrier default covers it) |
| $100 - $500 | Offer insurance at checkout (optional) |
| > $500 | Auto-insure, build premium into shipping cost |
| Auction/trade items | Always insure — buyer expects protection |

---

## 16. Integration Architecture Patterns

### Service Client Pattern

All integrations follow the same structural pattern:

```
lib/
  integrations/
    wine-searcher.ts    # Wine pricing data
    search.ts           # Meilisearch client
    age-verify.ts       # Veratad age verification
    ship-compliant.ts   # Sovos shipping compliance
    tax.ts              # Avalara tax calculation
    doordash-drive.ts   # DoorDash Drive delivery
    uber-direct.ts      # Uber Direct delivery
    delivery-router.ts  # Multi-provider delivery routing
    fulfillment.ts      # 3PL fulfillment (Wineshipping)
    tracking.ts         # AfterShip order tracking
    email.ts            # Resend transactional email
    sms.ts              # Twilio SMS notifications
    analytics.ts        # Segment event tracking
    reviews.ts          # Yotpo reviews
    label-recognition.ts # API4AI wine label scanning
    recommendations.ts  # Preferabli wine recommendations
    insurance.ts        # Cabrella shipping insurance
```

### Error Handling & Retry Pattern

All third-party API calls should follow this pattern:

```typescript
// lib/integrations/utils.ts
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;     // ms
  maxDelay: number;      // ms
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = { maxRetries: 3, baseDelay: 1000, maxDelay: 10000 }
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < config.maxRetries) {
        const delay = Math.min(
          config.baseDelay * Math.pow(2, attempt), // Exponential backoff
          config.maxDelay,
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

// Usage:
const price = await withRetry(() => getMarketPrice('Opus One', 2020));
```

### Webhook Security Pattern

All incoming webhooks should be verified:

```typescript
// lib/integrations/webhook-verify.ts
import { createHmac } from 'crypto';

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  algorithm: 'sha256' | 'sha1' = 'sha256'
): boolean {
  const expected = createHmac(algorithm, secret)
    .update(payload)
    .digest('hex');

  return expected === signature;
}
```

### Circuit Breaker Pattern

For non-critical integrations (reviews, recommendations) that shouldn't break checkout:

```typescript
// lib/integrations/circuit-breaker.ts
type CircuitState = 'closed' | 'open' | 'half-open';

class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failures = 0;
  private lastFailure = 0;

  constructor(
    private threshold: number = 5,        // Failures before opening
    private resetTimeout: number = 30000, // ms before trying again
  ) {}

  async call<T>(fn: () => Promise<T>, fallback?: T): Promise<T | undefined> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailure > this.resetTimeout) {
        this.state = 'half-open';
      } else {
        return fallback;
      }
    }

    try {
      const result = await fn();
      this.state = 'closed';
      this.failures = 0;
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailure = Date.now();

      if (this.failures >= this.threshold) {
        this.state = 'open';
      }

      return fallback;
    }
  }
}

// Usage: Reviews API is non-critical — return empty if down
const reviewsBreaker = new CircuitBreaker(3, 60000);
const reviews = await reviewsBreaker.call(
  () => getProductReviews(productId),
  { reviews: [], averageScore: 0, totalReviews: 0 } // Fallback
);
```

### Integration Criticality Tiers

| Tier | Services | Behavior on Failure |
|---|---|---|
| **Critical** (blocks checkout) | Stripe, Sovos ShipCompliant, Veratad, Avalara | Retry 3x → fail order → show error |
| **Important** (degrades experience) | DoorDash/Uber, AfterShip, Wineshipping | Retry 3x → fallback to manual process → alert ops |
| **Non-critical** (graceful degradation) | Meilisearch, Yotpo, Preferabli, API4AI, Wine-Searcher | Circuit breaker → return cached/empty → user doesn't notice |

---

## 17. Environment Variables Reference

```bash
# === Wine Pricing & Market Data ===
WINE_SEARCHER_API_KEY=ws_xxxxxxxxxxxx
LIV_EX_API_KEY=lx_xxxxxxxxxxxx

# === Search (Meilisearch) ===
MEILISEARCH_HOST=https://ms.yourdomain.com
MEILISEARCH_ADMIN_KEY=ms_admin_xxxxxxxxxxxx     # Server-side only
NEXT_PUBLIC_MEILISEARCH_HOST=https://ms.yourdomain.com
NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY=ms_search_xxxxxxxxxxxx  # Client-safe

# === Age Verification (Veratad) ===
VERATAD_API_USER=your_username
VERATAD_API_PASSWORD=your_password

# === Shipping Compliance (Sovos ShipCompliant) ===
SOVOS_API_BASE=https://api.shipcompliant.com
SOVOS_API_KEY=sc_xxxxxxxxxxxx

# === Tax (Avalara) ===
AVALARA_USERNAME=your_username
AVALARA_PASSWORD=your_password
AVALARA_COMPANY_CODE=YOUR_COMPANY

# === Delivery (DoorDash Drive) ===
DOORDASH_DEVELOPER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
DOORDASH_KEY_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
DOORDASH_SIGNING_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# === Delivery (Uber Direct) ===
UBER_CLIENT_ID=xxxxxxxxxxxx
UBER_CLIENT_SECRET=xxxxxxxxxxxx

# === Fulfillment (3PL) ===
FULFILLMENT_API_BASE=https://api.wineshipping.com
FULFILLMENT_API_KEY=ws_xxxxxxxxxxxx

# === Order Tracking (AfterShip) ===
AFTERSHIP_API_KEY=atrk_xxxxxxxxxxxx

# === Email (Resend) ===
RESEND_API_KEY=re_xxxxxxxxxxxx

# === SMS (Twilio) ===
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx

# === Analytics (Segment) ===
NEXT_PUBLIC_SEGMENT_WRITE_KEY=xxxxxxxxxxxx

# === Reviews (Yotpo) ===
YOTPO_APP_KEY=xxxxxxxxxxxx
YOTPO_SECRET_KEY=xxxxxxxxxxxx

# === Wine Label Recognition (API4AI) ===
API4AI_API_KEY=xxxxxxxxxxxx

# === Recommendations (Preferabli) ===
PREFERABLI_API_BASE=https://api.preferabli.com
PREFERABLI_API_KEY=xxxxxxxxxxxx

# === Shipping Insurance (Cabrella) ===
CABRELLA_API_BASE=https://api.ecabrella.com
CABRELLA_API_KEY=xxxxxxxxxxxx
```

---

## 18. Decision Log

| # | Decision | Reasoning | Alternatives Considered |
|---|---|---|---|
| 1 | **Meilisearch** over Algolia for search | Free self-hosting, Rust performance, simpler setup. Can migrate to Algolia later if enterprise SLA needed. | Algolia ($$$), Typesense (similar but smaller ecosystem) |
| 2 | **Resend + React Email** over SendGrid for transactional email | Native React component model, TypeScript SDK, Next.js first-class support. Better DX for this stack. | SendGrid (higher volume), Postmark (highest deliverability) |
| 3 | **Segment** as analytics pipeline over direct SDK integration | Instrument once, route to any tool. Prevents vendor lock-in. Swap analytics providers without code changes. | Direct Mixpanel/GA4 SDKs (cheaper but tightly coupled) |
| 4 | **DoorDash Drive** as primary last-mile over Uber Direct | Larger Dasher network, explicit alcohol delivery program with legal addendum, more documentation. | Uber Direct (simpler pricing, no minimums) |
| 5 | **Sovos ShipCompliant** over manual compliance rules | 2000+ alcohol customers prove reliability. State laws change constantly — don't maintain your own rules engine. | Manual rules engine from MODULE_ECOMMERCE.md (fine for MVP, risky at scale) |
| 6 | **Avalara** over TaxJar for tax | Better alcohol excise tax support, deeper Sovos integration, global coverage. | TaxJar (simpler, cheaper, good for non-alcohol) |
| 7 | **AfterShip** over Narvar for tracking | 6-day setup vs 6-8 weeks. 1000+ carrier integrations. Webhook-first architecture matches our event-driven design. | Narvar (better enterprise UX), Ship24 (fastest setup) |
| 8 | **Veratad** over AgeChecker for age verification | API-first with multiple verification methods (data, document, biometric). 5B+ citizen database. | AgeChecker.net (popup widget, simpler but less flexible) |
| 9 | Multi-provider **delivery router** pattern | No single delivery provider covers all cities/scenarios. Aggregation layer lets you add/remove providers without checkout changes. | Single provider lock-in |
| 10 | **Cabrella** for shipping insurance | Wine-specific coverage, API + webhook integration, up to $150K/package for fine wine. | InsureShield (general), carrier default insurance (low limits) |
| 11 | **Preferabli** over custom ML for recommendations | Pre-trained wine taste models, food pairing data, faster time-to-market. Build custom embeddings later for differentiation. | Custom pgvector embeddings (more work, lower ongoing cost) |

---

## Quick Reference: Loading Into Claude

When starting a new Claude prototyping session that involves third-party integrations, paste this prompt:

```
I'm building a wine e-commerce + trading/bidding platform with:
- Stack: Next.js 15 (Vercel) + Medusa v2 (Railway) + Supabase
- Search: Meilisearch (self-hosted or cloud)
- Age verification: Veratad API
- Shipping compliance: Sovos ShipCompliant
- Tax: Avalara AvaTax
- Last-mile delivery: DoorDash Drive API + Uber Direct (multi-provider router)
- 3PL fulfillment: Wineshipping (long-distance, temperature-controlled)
- Order tracking: AfterShip (webhooks → Supabase Realtime)
- Payments: Stripe Connect (marketplace splits, auction escrow via manual capture)
- Fraud: Stripe Radar (included)
- Email: Resend + React Email
- SMS: Twilio (delivery alerts, bid notifications)
- Analytics: Segment → Mixpanel + GA4 + data warehouse
- Reviews: Yotpo (photo/video reviews, wine-specific tasting notes)
- Wine pricing: Wine-Searcher API (retail prices), Liv-ex (fine wine indices)
- Label recognition: API4AI Wine Recognition (400K+ labels)
- Recommendations: Preferabli (AI taste profiles, food pairing)
- Shipping insurance: Cabrella (wine-specific, up to $150K/pkg)

All integration clients live in lib/integrations/*.ts.
All env vars follow UPPERCASE_SNAKE_CASE (server) or NEXT_PUBLIC_ prefix (client).
Use withRetry() for critical APIs, CircuitBreaker for non-critical.
Webhook endpoints go in app/api/webhooks/[provider]/route.ts.
```
