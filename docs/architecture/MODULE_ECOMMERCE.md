# Module: E-Commerce & Marketplace

> **Module Type:** Domain Extension Module
> **Extends:** [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) (Core Stack)
> **Commerce Engine:** Medusa.js v2
> **Domain:** Wine marketplace with auction/bidding, peer-to-peer trading, and localized delivery
> **Updated:** March 2026

---

## How This Module Works

This document is a **composable architecture module** that layers on top of your core stack (Next.js 15 + Supabase + Vercel). It introduces Medusa.js v2 as the commerce engine and defines four custom domain modules for marketplace-specific functionality.

**Loading into Claude:** Paste the core `SYSTEM_ARCHITECTURE.md` first for auth, multi-tenancy, and infrastructure context, then paste the relevant sections of this module for commerce-specific prototyping.

**Separation of concerns:** The core stack handles auth, multi-tenancy, real-time, and file storage. This module handles product catalog, cart/checkout, payments, orders, marketplace vendor isolation, bidding/auctions, trading, and delivery logistics.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [How Medusa Integrates with the Core Stack](#2-how-medusa-integrates-with-the-core-stack)
3. [Project Structure Additions](#3-project-structure-additions)
4. [Medusa Fundamentals for This Stack](#4-medusa-fundamentals-for-this-stack)
5. [Marketplace Module (Multi-Vendor)](#5-marketplace-module-multi-vendor)
6. [Wine Catalog Module](#6-wine-catalog-module)
7. [Auction & Bidding Module](#7-auction--bidding-module)
8. [Trading Module (Peer-to-Peer)](#8-trading-module-peer-to-peer)
9. [Localized Delivery Module](#9-localized-delivery-module)
10. [Age Verification & Compliance](#10-age-verification--compliance)
11. [Payments & Escrow](#11-payments--escrow)
12. [Storefront Integration (Next.js)](#12-storefront-integration-nextjs)
13. [Real-time Features](#13-real-time-features)
14. [Deployment Architecture](#14-deployment-architecture)
15. [Testing Strategy](#15-testing-strategy)
16. [Decision Log](#16-decision-log)

---

## 1. Architecture Overview

```
┌───────────────────────────────────────────────────────────────────┐
│                         VERCEL                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              Next.js 15 (App Router)                        │  │
│  │  ┌──────────────┐  ┌───────────────┐  ┌────────────────┐  │  │
│  │  │  Storefront   │  │ Vendor Portal │  │  Admin Portal  │  │  │
│  │  │  (Buyers)     │  │ (Sellers)     │  │  (Platform)    │  │  │
│  │  └──────┬───────┘  └───────┬───────┘  └───────┬────────┘  │  │
│  │         │                  │                    │           │  │
│  │  ┌──────┴──────────────────┴────────────────────┴────────┐ │  │
│  │  │         Next.js Server Actions + Route Handlers        │ │  │
│  │  │              (Calls Medusa SDK + Supabase DAL)         │ │  │
│  │  └─────────────────┬──────────────────┬──────────────────┘ │  │
│  └────────────────────┼──────────────────┼────────────────────┘  │
└───────────────────────┼──────────────────┼────────────────────────┘
                        │                  │
          ┌─────────────┘                  └──────────────┐
          ▼                                               ▼
┌───────────────────────────────┐    ┌──────────────────────────────┐
│      MEDUSA v2 SERVER         │    │         SUPABASE              │
│      (Railway / Docker)       │    │    (from Core Stack)          │
│                               │    │                              │
│  ┌─────────────────────────┐  │    │  ┌────────────┐             │
│  │    Built-in Commerce     │  │    │  │ PostgreSQL │  Auth       │
│  │  ┌────────┐ ┌─────────┐ │  │    │  │  (+ RLS)   │  Storage   │
│  │  │Product │ │  Cart/   │ │  │    │  └────────────┘  Realtime  │
│  │  │Catalog │ │Checkout  │ │  │    │                            │
│  │  ├────────┤ ├─────────┤ │  │    │  Used for:                 │
│  │  │ Order  │ │Payment  │ │  │    │  - User auth (SSO/SAML)    │
│  │  │Mgmt    │ │(Stripe) │ │  │    │  - Org multi-tenancy       │
│  │  ├────────┤ ├─────────┤ │  │    │  - Real-time bid updates   │
│  │  │Inventory│ │Fulfillment│ │    │  - File storage (images)   │
│  │  └────────┘ └─────────┘ │  │    │  - Platform-level data     │
│  └─────────────────────────┘  │    └──────────────────────────────┘
│                               │
│  ┌─────────────────────────┐  │
│  │   Custom Domain Modules  │  │
│  │  ┌────────┐ ┌─────────┐ │  │
│  │  │Marketplace│ │ Wine   │ │  │
│  │  │(Vendors)│ │Catalog  │ │  │
│  │  ├────────┤ ├─────────┤ │  │
│  │  │Auction │ │Trading  │ │  │
│  │  │/Bidding│ │ (P2P)   │ │  │
│  │  ├────────┤ ├─────────┤ │  │
│  │  │Delivery│ │Compliance│ │  │
│  │  │Zones   │ │(Age/Ship)│ │  │
│  │  └────────┘ └─────────┘ │  │
│  └─────────────────────────┘  │
│                               │
│  PostgreSQL (Medusa's own DB) │
│  Redis (sessions, events,     │
│         workflow engine)      │
└───────────────────────────────┘
```

**Key Principle: Two databases, clear boundaries.** Medusa manages its own PostgreSQL instance for commerce data (products, orders, carts, payments). Supabase manages platform data (users, orgs, memberships, real-time). The Next.js layer bridges both via the Medusa JS SDK and Supabase client.

---

## 2. How Medusa Integrates with the Core Stack

### Responsibility Split

| Domain | Owner | Why |
|---|---|---|
| User authentication (login, SSO, sessions) | Supabase Auth | Already configured in core stack, cookie-based SSR auth |
| Organization/tenant management | Supabase (RLS + org_id) | Core stack multi-tenancy model |
| Product catalog, cart, checkout, orders | Medusa v2 | Battle-tested commerce primitives with workflow engine |
| Payments (Stripe) | Medusa v2 | Built-in Stripe plugin with webhook handling |
| Inventory management | Medusa v2 | Native inventory module with stock location support |
| Vendor/marketplace isolation | Custom Medusa module | Medusa's module link system for vendor ↔ product/order |
| Auction/bidding engine | Custom Medusa module + Supabase Realtime | Medusa for state, Supabase for real-time bid broadcasting |
| Trading (offers/counteroffers) | Custom Medusa module | Workflow engine handles offer state machine |
| Delivery zone management | Custom Medusa module | Custom fulfillment provider with zone logic |
| Real-time updates (bids, notifications) | Supabase Realtime | Already in core stack, purpose-built for live subscriptions |
| File storage (wine labels, images) | Supabase Storage | Already in core stack with RLS-based access |
| Age verification | Custom Medusa middleware + third-party API | Compliance layer before checkout completion |
| Shipping compliance | Custom Medusa module | State-by-state rules engine |

### Identity Bridge Pattern

Medusa has its own customer concept, but your users authenticate via Supabase Auth. Bridge them:

```typescript
// lib/medusa/identity-bridge.ts
// Called when a Supabase user first interacts with commerce features

import { medusaClient } from './client'

export async function ensureMedusaCustomer(supabaseUser: {
  id: string
  email: string
  user_metadata: { full_name?: string }
}) {
  // Check if this Supabase user already has a Medusa customer record
  const existing = await medusaClient.store.customer.list({
    q: supabaseUser.email,
  })

  if (existing.customers.length > 0) {
    return existing.customers[0]
  }

  // Create a Medusa customer linked to the Supabase user
  const { customer } = await medusaClient.admin.customer.create({
    email: supabaseUser.email,
    first_name: supabaseUser.user_metadata.full_name?.split(' ')[0] || '',
    last_name: supabaseUser.user_metadata.full_name?.split(' ').slice(1).join(' ') || '',
    metadata: {
      supabase_user_id: supabaseUser.id,  // Cross-reference
    },
  })

  return customer
}
```

### SDK Setup

```typescript
// lib/medusa/client.ts
import Medusa from '@medusajs/js-sdk'

export const medusaClient = new Medusa({
  baseUrl: process.env.MEDUSA_BACKEND_URL!,       // e.g., https://api.yoursite.com
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
})

// Admin client (server-side only — for vendor portal, admin operations)
export const medusaAdmin = new Medusa({
  baseUrl: process.env.MEDUSA_BACKEND_URL!,
  apiKey: process.env.MEDUSA_API_KEY!,            // Never expose to client
})
```

---

## 3. Project Structure Additions

Layer these onto the core stack's monorepo:

```
/
├── apps/
│   ├── web/                                # From core stack — now also serves storefront
│   │   ├── app/
│   │   │   ├── (app)/[orgSlug]/            # Existing org-scoped routes
│   │   │   ├── (storefront)/               # NEW: Public storefront route group
│   │   │   │   ├── wines/                  # Browse, search, filter wines
│   │   │   │   ├── wines/[handle]/         # Wine detail page (PDP)
│   │   │   │   ├── auctions/              # Active auctions listing
│   │   │   │   ├── auctions/[id]/         # Live auction page (real-time bids)
│   │   │   │   ├── cart/                  # Cart page
│   │   │   │   ├── checkout/              # Checkout flow (age verification gate)
│   │   │   │   └── layout.tsx             # Storefront layout (nav, cart icon)
│   │   │   ├── (vendor)/                   # NEW: Vendor dashboard route group
│   │   │   │   ├── [vendorSlug]/
│   │   │   │   │   ├── dashboard/         # Sales overview, analytics
│   │   │   │   │   ├── products/          # Manage wine listings
│   │   │   │   │   ├── orders/            # View and fulfill orders
│   │   │   │   │   ├── auctions/          # Create and manage auctions
│   │   │   │   │   ├── delivery/          # Delivery zone configuration
│   │   │   │   │   └── settings/          # Vendor profile, payout config
│   │   │   │   └── layout.tsx             # Vendor auth guard + context
│   │   │   ├── (trading)/                  # NEW: Trading / secondary market
│   │   │   │   ├── marketplace/           # Browse active trade listings
│   │   │   │   ├── offers/                # My offers (sent/received)
│   │   │   │   └── layout.tsx
│   │   │   └── api/
│   │   │       ├── webhooks/
│   │   │       │   ├── stripe/            # From core stack
│   │   │       │   └── medusa/            # NEW: Medusa event webhooks
│   │   │       └── v1/                    # Public API
│   │   ├── lib/
│   │   │   ├── supabase/                  # From core stack (unchanged)
│   │   │   ├── medusa/                    # NEW: Medusa integration layer
│   │   │   │   ├── client.ts             # SDK client setup
│   │   │   │   ├── identity-bridge.ts    # Supabase ↔ Medusa customer sync
│   │   │   │   ├── storefront/           # Store API helper functions
│   │   │   │   │   ├── products.ts       # List/get products
│   │   │   │   │   ├── cart.ts           # Cart operations
│   │   │   │   │   ├── checkout.ts       # Checkout flow
│   │   │   │   │   └── orders.ts         # Order history
│   │   │   │   └── vendor/               # Vendor API helper functions
│   │   │   │       ├── products.ts
│   │   │   │       ├── orders.ts
│   │   │   │       └── auctions.ts
│   │   │   ├── dal/                       # From core stack — add commerce DAL
│   │   │   │   ├── organizations.ts      # Existing
│   │   │   │   ├── auctions.ts           # NEW: Supabase-side auction state
│   │   │   │   ├── bids.ts              # NEW: Bid history (Supabase Realtime)
│   │   │   │   ├── trades.ts            # NEW: Trade offers
│   │   │   │   └── delivery-zones.ts    # NEW: Zone configuration
│   │   │   └── actions/                   # Server Actions
│   │   │       ├── auction-actions.ts    # NEW
│   │   │       ├── bid-actions.ts        # NEW
│   │   │       ├── trade-actions.ts      # NEW
│   │   │       └── cart-actions.ts       # NEW
│   │   └── components/
│   │       ├── commerce/                  # NEW: Commerce components
│   │       │   ├── product-card.tsx
│   │       │   ├── cart-drawer.tsx
│   │       │   ├── checkout-form.tsx
│   │       │   ├── age-verification-gate.tsx
│   │       │   └── price-display.tsx
│   │       ├── auction/                   # NEW: Auction components
│   │       │   ├── bid-panel.tsx         # Real-time bidding UI
│   │       │   ├── auction-timer.tsx     # Countdown timer
│   │       │   ├── bid-history.tsx       # Live bid feed
│   │       │   └── auction-card.tsx
│   │       └── trading/                   # NEW: Trading components
│   │           ├── offer-form.tsx
│   │           ├── offer-card.tsx
│   │           └── trade-status.tsx
│
├── medusa/                                # NEW: Medusa backend (separate app)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── marketplace/              # Vendor management module
│   │   │   │   ├── models/
│   │   │   │   │   ├── vendor.ts
│   │   │   │   │   └── vendor-admin.ts
│   │   │   │   ├── service.ts
│   │   │   │   └── index.ts
│   │   │   ├── wine-catalog/             # Wine-specific product extensions
│   │   │   │   ├── models/
│   │   │   │   │   ├── wine-details.ts
│   │   │   │   │   └── wine-review.ts
│   │   │   │   ├── service.ts
│   │   │   │   └── index.ts
│   │   │   ├── auction/                  # Auction & bidding engine
│   │   │   │   ├── models/
│   │   │   │   │   ├── auction.ts
│   │   │   │   │   └── bid.ts
│   │   │   │   ├── service.ts
│   │   │   │   └── index.ts
│   │   │   ├── trading/                  # P2P trading engine
│   │   │   │   ├── models/
│   │   │   │   │   ├── trade-listing.ts
│   │   │   │   │   └── trade-offer.ts
│   │   │   │   ├── service.ts
│   │   │   │   └── index.ts
│   │   │   ├── delivery-zone/            # Localized delivery logic
│   │   │   │   ├── models/
│   │   │   │   │   ├── delivery-zone.ts
│   │   │   │   │   └── delivery-window.ts
│   │   │   │   ├── service.ts
│   │   │   │   └── index.ts
│   │   │   └── compliance/               # Age verification + shipping rules
│   │   │       ├── models/
│   │   │       │   └── verification-record.ts
│   │   │       ├── service.ts
│   │   │       └── index.ts
│   │   ├── workflows/
│   │   │   ├── create-vendor.ts
│   │   │   ├── create-auction.ts
│   │   │   ├── place-bid.ts
│   │   │   ├── complete-auction.ts
│   │   │   ├── create-trade-offer.ts
│   │   │   ├── accept-trade.ts
│   │   │   ├── verify-age.ts
│   │   │   └── validate-delivery-zone.ts
│   │   ├── api/
│   │   │   ├── vendors/                  # Vendor management routes
│   │   │   ├── auctions/                 # Auction routes
│   │   │   ├── trades/                   # Trading routes
│   │   │   └── middlewares.ts
│   │   ├── links/                        # Module link definitions
│   │   │   ├── vendor-product.ts
│   │   │   ├── vendor-order.ts
│   │   │   ├── product-wine-details.ts
│   │   │   └── auction-product.ts
│   │   ├── subscribers/                  # Event subscribers
│   │   │   ├── auction-completed.ts
│   │   │   └── order-placed.ts
│   │   └── jobs/                         # Scheduled jobs
│   │       ├── close-expired-auctions.ts
│   │       └── expire-trade-offers.ts
│   ├── medusa-config.ts
│   ├── package.json
│   └── Dockerfile
│
├── supabase/
│   ├── migrations/
│   │   ├── 00001_core_tables.sql         # From core stack
│   │   ├── 00010_auction_realtime.sql    # NEW: Real-time auction tables
│   │   └── 00011_delivery_zones.sql      # NEW: Delivery zone config
│   └── ...
│
└── turbo.json                             # Updated to include medusa app
```

---

## 4. Medusa Fundamentals for This Stack

Medusa v2 follows a four-layer architecture. Understanding these layers is critical for building custom modules correctly.

### Layer 1: API Routes (HTTP Entry Point)

Custom API routes live in `src/api/` with file-based routing. The directory path becomes the URL.

```typescript
// medusa/src/api/auctions/route.ts
import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { createAuctionWorkflow } from '../../workflows/create-auction'

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { result } = await createAuctionWorkflow(req.scope).run({
    input: req.body,
  })
  res.json({ auction: result })
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const auctionService = req.scope.resolve('auction')
  const auctions = await auctionService.listAuctions(req.query)
  res.json({ auctions })
}
```

### Layer 2: Workflows (Business Logic Orchestration)

Workflows are durable, retryable, and support compensation (rollback). Every multi-step business operation should be a workflow.

```typescript
// medusa/src/workflows/place-bid.ts
import { createWorkflow, createStep, StepResponse, WorkflowResponse } from '@medusajs/framework/workflows-sdk'

const validateBidStep = createStep(
  'validate-bid',
  async ({ auctionId, amount, bidderId }, { container }) => {
    const auctionService = container.resolve('auction')
    const auction = await auctionService.retrieveAuction(auctionId)

    if (auction.status !== 'active') throw new Error('Auction is not active')
    if (auction.ends_at < new Date()) throw new Error('Auction has ended')
    if (amount <= auction.current_price) throw new Error('Bid must exceed current price')
    if (auction.min_increment && amount < auction.current_price + auction.min_increment) {
      throw new Error(`Minimum increment is ${auction.min_increment}`)
    }

    return new StepResponse({ auction })
  }
)

const recordBidStep = createStep(
  'record-bid',
  async ({ auctionId, amount, bidderId }, { container }) => {
    const auctionService = container.resolve('auction')

    const bid = await auctionService.createBids({
      auction_id: auctionId,
      bidder_id: bidderId,
      amount,
    })

    // Update auction current price
    await auctionService.updateAuctions(auctionId, {
      current_price: amount,
      current_bidder_id: bidderId,
    })

    return new StepResponse(bid, { bidId: bid.id, auctionId, previousPrice: amount })
  },
  // Compensation: rollback if a later step fails
  async ({ bidId, auctionId, previousPrice }, { container }) => {
    const auctionService = container.resolve('auction')
    await auctionService.deleteBids(bidId)
    // Restore previous price would need the prior value — store it in StepResponse
  }
)

export const placeBidWorkflow = createWorkflow(
  'place-bid',
  function (input: { auctionId: string; amount: number; bidderId: string }) {
    const { auction } = validateBidStep(input)
    const bid = recordBidStep(input)
    return new WorkflowResponse(bid)
  }
)
```

### Layer 3: Modules (Domain Packages)

Each module encapsulates data models + a service. Medusa registers the service in its container for dependency injection.

```typescript
// Data model definition via DML
import { model } from '@medusajs/framework/utils'

const Auction = model.define('auction', {
  id: model.id().primaryKey(),
  title: model.text(),
  status: model.enum(['draft', 'scheduled', 'active', 'ended', 'cancelled']),
  starting_price: model.bigNumber(),
  current_price: model.bigNumber().nullable(),
  reserve_price: model.bigNumber().nullable(),
  min_increment: model.bigNumber().nullable(),
  starts_at: model.dateTime(),
  ends_at: model.dateTime(),
  current_bidder_id: model.text().nullable(),
})

// Service auto-generates CRUD
import { MedusaService } from '@medusajs/framework/utils'
class AuctionModuleService extends MedusaService({ Auction, Bid }) {}

// Module registration
import { Module } from '@medusajs/framework/utils'
export default Module('auction', { service: AuctionModuleService })
```

### Layer 4: Module Links (Cross-Module Relations)

Links connect data across modules without coupling them:

```typescript
// medusa/src/links/auction-product.ts
import { defineLink } from '@medusajs/framework/utils'
import AuctionModule from '../modules/auction'
import ProductModule from '@medusajs/medusa/product'

export default defineLink(
  AuctionModule.linkable.auction,
  ProductModule.linkable.product
)
```

---

## 5. Marketplace Module (Multi-Vendor)

### Data Models

```typescript
// medusa/src/modules/marketplace/models/vendor.ts
import { model } from '@medusajs/framework/utils'

const Vendor = model.define('vendor', {
  id: model.id().primaryKey(),
  handle: model.text().unique(),         // URL slug: /vendors/napa-valley-wines
  name: model.text(),
  description: model.text().nullable(),
  logo: model.text().nullable(),
  license_number: model.text().nullable(), // Alcohol seller license
  license_state: model.text().nullable(),
  verified: model.boolean().default(false),
  payout_account_id: model.text().nullable(), // Stripe Connect account
  metadata: model.json().nullable(),
  admins: model.hasMany(() => VendorAdmin, { mappedBy: 'vendor' }),
})

export default Vendor
```

```typescript
// medusa/src/modules/marketplace/models/vendor-admin.ts
import { model } from '@medusajs/framework/utils'

const VendorAdmin = model.define('vendor_admin', {
  id: model.id().primaryKey(),
  email: model.text().unique(),
  first_name: model.text().nullable(),
  last_name: model.text().nullable(),
  vendor: model.belongsTo(() => Vendor, { mappedBy: 'admins' }),
})

export default VendorAdmin
```

### Module Links

```typescript
// medusa/src/links/vendor-product.ts
import { defineLink } from '@medusajs/framework/utils'
import MarketplaceModule from '../modules/marketplace'
import ProductModule from '@medusajs/medusa/product'

export default defineLink(
  MarketplaceModule.linkable.vendor,
  { linkable: ProductModule.linkable.product.id, isList: true }
)

// medusa/src/links/vendor-order.ts
import OrderModule from '@medusajs/medusa/order'

export default defineLink(
  MarketplaceModule.linkable.vendor,
  { linkable: OrderModule.linkable.order.id, isList: true }
)
```

### Vendor Authentication

Vendors authenticate as a custom actor type. Use Medusa's auth module:

```typescript
// medusa/src/api/middlewares.ts
import { defineMiddlewares, authenticate } from '@medusajs/framework/http'
import { validateAndTransformBody } from '@medusajs/framework'

export default defineMiddlewares({
  routes: [
    {
      matcher: '/vendors',
      method: ['POST'],
      middlewares: [
        authenticate('vendor', ['session', 'bearer'], { allowUnregistered: true }),
      ],
    },
    {
      matcher: '/vendors/*',
      middlewares: [
        authenticate('vendor', ['session', 'bearer']),
      ],
    },
  ],
})
```

### Order Splitting

When a cart contains products from multiple vendors, the checkout workflow splits into vendor-specific child orders:

```
Customer Cart: [Wine A (Vendor 1), Wine B (Vendor 2), Wine C (Vendor 1)]
                                    │
                         ┌──────────┴──────────┐
                         ▼                      ▼
              Parent Order #100          (splits into)
                         │
              ┌──────────┴──────────┐
              ▼                      ▼
     Child Order #100a        Child Order #100b
     Vendor 1: Wine A, C     Vendor 2: Wine B
     Fulfills separately     Fulfills separately
```

This is implemented via the `createVendorOrdersWorkflow` pattern (see Medusa marketplace recipe for complete implementation).

---

## 6. Wine Catalog Module

Extends Medusa's built-in Product module with wine-specific metadata.

### Data Model

```typescript
// medusa/src/modules/wine-catalog/models/wine-details.ts
import { model } from '@medusajs/framework/utils'

const WineDetails = model.define('wine_details', {
  id: model.id().primaryKey(),
  vintage: model.number().nullable(),           // Year: 2019
  varietal: model.text(),                       // Cabernet Sauvignon, Pinot Noir
  region: model.text().nullable(),              // Napa Valley, Bordeaux
  appellation: model.text().nullable(),         // St. Helena AVA
  producer: model.text().nullable(),            // Opus One
  alcohol_percentage: model.float().nullable(), // 14.5
  bottle_size_ml: model.number().default(750),  // 750, 375, 1500
  tasting_notes: model.text().nullable(),       // "Dark cherry, vanilla..."
  critic_score: model.number().nullable(),      // 0-100 (Robert Parker, etc.)
  drinking_window_start: model.number().nullable(), // Year
  drinking_window_end: model.number().nullable(),   // Year
  classification: model.enum([
    'table', 'premium', 'ultra_premium',
    'luxury', 'icon', 'collectible'
  ]).default('table'),
  is_organic: model.boolean().default(false),
  is_biodynamic: model.boolean().default(false),
})

export default WineDetails
```

### Link to Medusa Product

```typescript
// medusa/src/links/product-wine-details.ts
import { defineLink } from '@medusajs/framework/utils'
import WineCatalogModule from '../modules/wine-catalog'
import ProductModule from '@medusajs/medusa/product'

export default defineLink(
  ProductModule.linkable.product,
  WineCatalogModule.linkable.wineDetails
)
```

### Wine Search & Filtering

For the storefront, build rich filtering using Medusa's query system combined with wine details:

```typescript
// apps/web/lib/medusa/storefront/products.ts
import { medusaClient } from '../client'

export async function searchWines(filters: {
  varietal?: string
  region?: string
  minPrice?: number
  maxPrice?: number
  minScore?: number
  vintage?: number
  classification?: string
}) {
  // Medusa handles product + variant queries
  const { products } = await medusaClient.store.product.list({
    limit: 24,
    fields: '+metadata,+variants.prices',
    // Wine-specific filters passed via metadata or custom API route
  })

  return products
}
```

**Alternative for complex wine queries:** Create a custom Medusa API route that joins product data with wine_details and supports compound filtering with proper indexing.

---

## 7. Auction & Bidding Module

### Data Models

```typescript
// medusa/src/modules/auction/models/auction.ts
import { model } from '@medusajs/framework/utils'

const Auction = model.define('auction', {
  id: model.id().primaryKey(),
  title: model.text(),
  description: model.text().nullable(),
  status: model.enum([
    'draft',        // Vendor creating auction
    'scheduled',    // Approved, waiting for start time
    'active',       // Live, accepting bids
    'ended',        // Time expired, winner determined
    'sold',         // Winner completed payment
    'cancelled',    // Vendor or admin cancelled
    'reserve_not_met' // Ended but reserve price not reached
  ]).default('draft'),
  auction_type: model.enum([
    'english',       // Ascending price, highest bid wins (default)
    'dutch',         // Descending price, first to accept wins
    'sealed',        // Hidden bids, highest wins at close
  ]).default('english'),
  starting_price: model.bigNumber(),
  reserve_price: model.bigNumber().nullable(),    // Minimum acceptable price
  current_price: model.bigNumber().nullable(),
  buy_now_price: model.bigNumber().nullable(),    // Skip bidding, buy immediately
  min_increment: model.bigNumber().nullable(),    // Minimum bid increase
  starts_at: model.dateTime(),
  ends_at: model.dateTime(),
  auto_extend_minutes: model.number().default(5), // Extend if bid in last N minutes
  current_bidder_id: model.text().nullable(),
  winner_id: model.text().nullable(),
  vendor_id: model.text(),                        // Linked via module link
  bid_count: model.number().default(0),
  bids: model.hasMany(() => Bid, { mappedBy: 'auction' }),
})

export default Auction
```

```typescript
// medusa/src/modules/auction/models/bid.ts
import { model } from '@medusajs/framework/utils'

const Bid = model.define('bid', {
  id: model.id().primaryKey(),
  amount: model.bigNumber(),
  bidder_id: model.text(),                // Medusa customer ID
  bidder_supabase_id: model.text(),       // Cross-reference for real-time
  status: model.enum([
    'active',      // Current valid bid
    'outbid',      // Superseded by higher bid
    'winning',     // Auction ended, this bid won
    'lost',        // Auction ended, didn't win
    'retracted'    // Bid retracted (admin action only)
  ]).default('active'),
  auction: model.belongsTo(() => Auction, { mappedBy: 'bids' }),
})

export default Bid
```

### Auction Lifecycle Workflow

```
  ┌─────────┐     ┌───────────┐     ┌────────┐     ┌───────┐
  │  draft   │────▶│ scheduled │────▶│ active │────▶│ ended │
  └─────────┘     └───────────┘     └────────┘     └───┬───┘
       │               │                │               │
       │               │                │          ┌────┴────┐
       ▼               ▼                ▼          ▼         ▼
  ┌──────────┐   ┌──────────┐    ┌──────────┐  ┌──────┐ ┌─────────────┐
  │cancelled │   │cancelled │    │cancelled │  │ sold │ │reserve_not_ │
  └──────────┘   └──────────┘    └──────────┘  └──────┘ │    met      │
                                                         └─────────────┘
```

### Real-Time Bid Broadcasting (Supabase Side)

Medusa handles the auction state machine and bid validation. Supabase handles real-time broadcasting to all connected bidders.

```sql
-- supabase/migrations/00010_auction_realtime.sql
-- Mirror table for real-time bid broadcasting
-- Medusa writes here after successful bid via webhook/event

CREATE TABLE auction_bid_feed (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id  TEXT NOT NULL,         -- Medusa auction ID
  bid_id      TEXT NOT NULL,         -- Medusa bid ID
  bidder_name TEXT,                  -- Display name (no PII)
  amount      NUMERIC NOT NULL,
  bid_number  INTEGER NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Enable Realtime on this table
ALTER PUBLICATION supabase_realtime ADD TABLE auction_bid_feed;

-- No RLS needed — bid feed is public per auction
-- (individual bidder identity is anonymized in the feed)
CREATE INDEX idx_bid_feed_auction ON auction_bid_feed (auction_id, created_at DESC);
```

```typescript
// apps/web/components/auction/bid-panel.tsx
'use client'

import { useEffect, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { placeBid } from '@/lib/actions/bid-actions'

export function BidPanel({ auctionId, currentPrice }: {
  auctionId: string
  currentPrice: number
}) {
  const [bids, setBids] = useState<BidFeedItem[]>([])
  const [livePrice, setLivePrice] = useState(currentPrice)
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()

  // Subscribe to real-time bid updates
  useEffect(() => {
    const channel = supabase
      .channel(`auction-${auctionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'auction_bid_feed',
          filter: `auction_id=eq.${auctionId}`,
        },
        (payload) => {
          const newBid = payload.new as BidFeedItem
          setBids(prev => [newBid, ...prev])
          setLivePrice(Number(newBid.amount))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [auctionId, supabase])

  const handleBid = (amount: number) => {
    startTransition(async () => {
      const result = await placeBid({ auctionId, amount })
      if (result.error) {
        // Show error toast
      }
    })
  }

  return (
    <div>
      <div className="text-3xl font-bold">${livePrice.toLocaleString()}</div>
      <div className="text-sm text-muted">{bids.length} bids</div>
      {/* Bid input + button */}
      {/* Scrollable bid history feed */}
    </div>
  )
}
```

### Scheduled Jobs

```typescript
// medusa/src/jobs/close-expired-auctions.ts
import { MedusaContainer } from '@medusajs/framework'

export default async function closeExpiredAuctions(container: MedusaContainer) {
  const auctionService = container.resolve('auction')

  const expiredAuctions = await auctionService.listAuctions({
    status: 'active',
    ends_at: { $lt: new Date() },
  })

  for (const auction of expiredAuctions) {
    if (auction.reserve_price && auction.current_price < auction.reserve_price) {
      await auctionService.updateAuctions(auction.id, { status: 'reserve_not_met' })
    } else if (auction.current_bidder_id) {
      await auctionService.updateAuctions(auction.id, {
        status: 'ended',
        winner_id: auction.current_bidder_id,
      })
      // Trigger winner notification + payment collection workflow
    } else {
      await auctionService.updateAuctions(auction.id, { status: 'cancelled' })
    }
  }
}

// Register in medusa-config.ts:
// jobs: [{ resolve: './src/jobs/close-expired-auctions', options: { schedule: '* * * * *' } }]
```

---

## 8. Trading Module (Peer-to-Peer)

Enables collectors and enthusiasts to trade wines outside the standard storefront. Uses an offer/counteroffer state machine.

### Data Models

```typescript
// medusa/src/modules/trading/models/trade-listing.ts
import { model } from '@medusajs/framework/utils'

const TradeListing = model.define('trade_listing', {
  id: model.id().primaryKey(),
  seller_id: model.text(),               // Medusa customer ID
  status: model.enum([
    'active', 'pending_trade', 'sold', 'expired', 'cancelled'
  ]).default('active'),
  listing_type: model.enum([
    'fixed_price',    // Set price, buy immediately
    'open_to_offers', // Accepting offers
    'trade_only',     // Wine-for-wine swap
  ]),
  asking_price: model.bigNumber().nullable(),
  description: model.text().nullable(),
  condition: model.enum([
    'perfect', 'excellent', 'good', 'fair'
  ]).default('excellent'),
  provenance_notes: model.text().nullable(), // Storage history
  expires_at: model.dateTime().nullable(),
  offers: model.hasMany(() => TradeOffer, { mappedBy: 'listing' }),
})

export default TradeListing
```

```typescript
// medusa/src/modules/trading/models/trade-offer.ts
import { model } from '@medusajs/framework/utils'

const TradeOffer = model.define('trade_offer', {
  id: model.id().primaryKey(),
  buyer_id: model.text(),
  status: model.enum([
    'pending',        // Waiting for seller response
    'countered',      // Seller made counter-offer
    'accepted',       // Both parties agreed
    'declined',       // Seller declined
    'expired',        // Auto-expired after timeout
    'completed',      // Payment + delivery confirmed
    'cancelled',      // Buyer withdrew
  ]).default('pending'),
  offer_amount: model.bigNumber().nullable(),
  counter_amount: model.bigNumber().nullable(),
  message: model.text().nullable(),
  counter_message: model.text().nullable(),
  expires_at: model.dateTime(),            // 48-hour default expiry
  listing: model.belongsTo(() => TradeListing, { mappedBy: 'offers' }),
})

export default TradeOffer
```

### Trade State Machine

```
Buyer sends offer
       │
       ▼
   ┌─────────┐     Seller declines     ┌──────────┐
   │ pending  │────────────────────────▶│ declined │
   └────┬─────┘                         └──────────┘
        │
   ┌────┴─────────────────────┐
   │                          │
   ▼                          ▼
Seller accepts          Seller counters
   │                          │
   ▼                          ▼
┌──────────┐            ┌───────────┐   Buyer declines  ┌──────────┐
│ accepted │            │ countered │──────────────────▶│ declined │
└────┬─────┘            └─────┬─────┘                   └──────────┘
     │                        │
     │                   Buyer accepts
     │                        │
     ▼                        ▼
┌───────────┐           ┌──────────┐
│ Payment   │           │ accepted │───▶ Payment collection
│ collected │           └──────────┘
└─────┬─────┘
      │
      ▼
┌───────────┐
│ completed │
└───────────┘
```

---

## 9. Localized Delivery Module

Supports delivery only in specific cities/zones with configurable windows.

### Data Models

```typescript
// medusa/src/modules/delivery-zone/models/delivery-zone.ts
import { model } from '@medusajs/framework/utils'

const DeliveryZone = model.define('delivery_zone', {
  id: model.id().primaryKey(),
  name: model.text(),                    // "San Francisco Bay Area"
  slug: model.text().unique(),           // "sf-bay-area"
  city: model.text(),
  state: model.text(),
  zip_codes: model.json(),               // ["94102", "94103", ...]
  is_active: model.boolean().default(true),
  delivery_fee: model.bigNumber(),       // Flat fee per delivery
  free_delivery_minimum: model.bigNumber().nullable(), // Free above $X
  max_delivery_radius_miles: model.float().nullable(),
  vendor_id: model.text().nullable(),    // Vendor-specific zone or platform-wide
  windows: model.hasMany(() => DeliveryWindow, { mappedBy: 'zone' }),
})

export default DeliveryZone
```

```typescript
// medusa/src/modules/delivery-zone/models/delivery-window.ts
import { model } from '@medusajs/framework/utils'

const DeliveryWindow = model.define('delivery_window', {
  id: model.id().primaryKey(),
  day_of_week: model.number(),           // 0=Sunday, 6=Saturday
  start_time: model.text(),              // "09:00" (24h format)
  end_time: model.text(),                // "17:00"
  max_deliveries: model.number(),        // Capacity per window
  zone: model.belongsTo(() => DeliveryZone, { mappedBy: 'windows' }),
})

export default DeliveryWindow
```

### Checkout Integration

During checkout, validate the delivery address against active zones:

```typescript
// medusa/src/workflows/validate-delivery-zone.ts
import { createWorkflow, createStep, StepResponse, WorkflowResponse } from '@medusajs/framework/workflows-sdk'

const validateDeliveryStep = createStep(
  'validate-delivery-zone',
  async ({ shippingAddress }, { container }) => {
    const deliveryZoneService = container.resolve('deliveryZone')

    const zones = await deliveryZoneService.listDeliveryZones({
      zip_codes: { $contains: shippingAddress.postal_code },
      is_active: true,
    })

    if (zones.length === 0) {
      throw new Error(
        `Delivery is not available in ${shippingAddress.postal_code}. ` +
        `We currently deliver to select cities only.`
      )
    }

    const zone = zones[0]
    return new StepResponse({
      zone_id: zone.id,
      delivery_fee: zone.delivery_fee,
      free_delivery: zone.free_delivery_minimum
        ? shippingAddress.cart_total >= zone.free_delivery_minimum
        : false,
    })
  }
)
```

### Custom Fulfillment Provider

Register a custom fulfillment provider in Medusa for local delivery:

```typescript
// medusa/src/modules/delivery-zone/fulfillment-provider.ts
// Implements Medusa's fulfillment provider interface
// Returns available delivery windows for the zone
// Calculates delivery fees
// Tracks delivery status (picked_up, in_transit, delivered)
```

---

## 10. Age Verification & Compliance

### Three-Layer Verification

Wine e-commerce requires verification at multiple points:

```
Layer 1: Account Creation
├── Self-declaration checkbox ("I am 21 or older")
├── Date of birth collection
└── Stored on customer profile

Layer 2: Checkout (Pre-Payment)
├── Third-party age verification API
├── Validates name + DOB + address against public records
├── Services: Veratad AgeMatch, Persona, IDology
└── Blocks checkout if verification fails

Layer 3: Delivery (At Door)
├── Carrier requirement: Adult signature (21+)
├── Government-issued photo ID check
├── FedEx/UPS/local courier with alcohol endorsement
└── Cannot leave at door / unattended
```

### Compliance Data Model

```typescript
// medusa/src/modules/compliance/models/verification-record.ts
import { model } from '@medusajs/framework/utils'

const VerificationRecord = model.define('verification_record', {
  id: model.id().primaryKey(),
  customer_id: model.text(),
  verification_type: model.enum([
    'self_declaration',   // Checkbox
    'dob_check',          // Age calculated from DOB
    'third_party',        // External API verification
    'id_scan',            // Document upload verification
  ]),
  provider: model.text().nullable(),      // "veratad", "persona"
  status: model.enum(['pending', 'verified', 'failed', 'expired']),
  verified_at: model.dateTime().nullable(),
  expires_at: model.dateTime().nullable(), // Re-verify annually
  provider_reference_id: model.text().nullable(),
  metadata: model.json().nullable(),       // Provider response data
})

export default VerificationRecord
```

### Shipping Compliance Rules

US alcohol shipping is regulated state-by-state. The compliance module enforces:

```typescript
// medusa/src/modules/compliance/shipping-rules.ts
// Static rules engine — update as regulations change

type ShippingRule = {
  state: string
  dtc_allowed: boolean             // Direct-to-consumer allowed?
  requires_license: boolean        // Vendor needs state license?
  max_gallons_per_year: number | null
  requires_adult_signature: boolean
  carrier_restrictions: string[]   // Allowed carriers
}

export const SHIPPING_RULES: Record<string, ShippingRule> = {
  CA: {
    state: 'California',
    dtc_allowed: true,
    requires_license: true,
    max_gallons_per_year: null,     // No limit
    requires_adult_signature: true,
    carrier_restrictions: [],
  },
  NY: {
    state: 'New York',
    dtc_allowed: true,
    requires_license: true,
    max_gallons_per_year: 36,       // 36 gallons/year
    requires_adult_signature: true,
    carrier_restrictions: [],
  },
  UT: {
    state: 'Utah',
    dtc_allowed: false,             // Prohibited
    requires_license: false,
    max_gallons_per_year: 0,
    requires_adult_signature: true,
    carrier_restrictions: ['*'],    // All blocked
  },
  // ... all 50 states + DC
}

export function canShipToState(state: string): boolean {
  return SHIPPING_RULES[state]?.dtc_allowed ?? false
}

export function getShippingRestrictions(state: string): ShippingRule | null {
  return SHIPPING_RULES[state] ?? null
}
```

---

## 11. Payments & Escrow

### Standard Purchases: Stripe via Medusa

Medusa's built-in Stripe plugin handles standard storefront purchases. Configure in `medusa-config.ts`:

```typescript
// medusa-config.ts (relevant section)
modules: [
  {
    resolve: '@medusajs/medusa/payment',
    options: {
      providers: [
        {
          resolve: '@medusajs/medusa/payment-stripe',
          id: 'stripe',
          options: {
            apiKey: process.env.STRIPE_SECRET_KEY,
          },
        },
      ],
    },
  },
]
```

### Marketplace Payouts: Stripe Connect

For multi-vendor payouts, use Stripe Connect in "destination charges" mode:

```
Buyer pays $100 for wine
    │
    ▼
Platform Stripe account receives $100
    │
    ├── Platform fee (15%): $15 retained
    └── Vendor payout (85%): $85 → Vendor's Stripe Connect account
```

Each vendor onboards via Stripe Connect Express during vendor registration.

### Auction Escrow Pattern

For auctions, pre-authorize the winning bid amount, then capture after seller confirms shipment:

```
1. Auction ends → Winner determined
2. Create Stripe PaymentIntent with capture_method: 'manual'
3. Authorize the winning bid amount (hold on buyer's card)
4. Seller ships the wine
5. Buyer confirms receipt (or auto-confirm after X days)
6. Capture the payment → Payout to vendor
7. If dispute: hold capture, initiate resolution workflow
```

### Trading Escrow

For P2P trades, use a similar hold-and-release pattern. Both buyer payment and seller item must be confirmed before releasing funds.

---

## 12. Storefront Integration (Next.js)

### Cart Management (Server Actions)

```typescript
// apps/web/lib/actions/cart-actions.ts
'use server'

import { medusaClient } from '@/lib/medusa/client'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addToCart(variantId: string, quantity: number = 1) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Get or create cart (stored in cookies or session)
  const cartId = await getOrCreateCart(user.id)

  const { cart } = await medusaClient.store.cart.addLineItem(cartId, {
    variant_id: variantId,
    quantity,
  })

  revalidatePath('/(storefront)/cart')
  return { data: cart }
}

export async function removeFromCart(lineItemId: string) {
  const cartId = await getCurrentCartId()
  if (!cartId) return { error: 'No cart found' }

  const { cart } = await medusaClient.store.cart.removeLineItem(cartId, lineItemId)

  revalidatePath('/(storefront)/cart')
  return { data: cart }
}
```

### Product Detail Page Pattern

```typescript
// apps/web/app/(storefront)/wines/[handle]/page.tsx
import { medusaClient } from '@/lib/medusa/client'
import { AgeVerificationGate } from '@/components/commerce/age-verification-gate'
import { AddToCartButton } from '@/components/commerce/add-to-cart-button'

export default async function WineDetailPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params

  const { products } = await medusaClient.store.product.list({
    handle,
    fields: '+metadata,+variants,+variants.prices',
  })

  const wine = products[0]
  if (!wine) notFound()

  // Wine details fetched via module link (custom API route)
  const wineDetails = await fetchWineDetails(wine.id)

  return (
    <AgeVerificationGate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Wine images */}
        {/* Wine info: name, vintage, region, varietal */}
        {/* Tasting notes, critic score */}
        {/* Price + variant selector */}
        <AddToCartButton variantId={wine.variants[0].id} />
        {/* Active auctions for this wine (if any) */}
      </div>
    </AgeVerificationGate>
  )
}
```

---

## 13. Real-time Features

### What Uses Supabase Realtime vs. Medusa Events

| Feature | Technology | Why |
|---|---|---|
| Live bid updates on auction page | Supabase Realtime (postgres_changes) | Sub-second latency to all connected browsers |
| Auction countdown sync | Supabase Realtime (broadcast) | Keep all clients in sync |
| Trade offer notifications | Supabase Realtime (postgres_changes) | Instant notification when offer received |
| Order status updates | Medusa event subscriber → Supabase insert | Medusa owns order state, broadcasts via Supabase |
| Inventory changes (sold out) | Medusa event subscriber → Supabase insert | Product availability updates |
| New wine listings | Medusa event subscriber → Supabase insert | Feed of newly listed wines |

### Event Bridge Pattern (Medusa → Supabase)

When Medusa events need to reach the browser in real-time:

```typescript
// medusa/src/subscribers/auction-completed.ts
import { SubscriberArgs } from '@medusajs/framework'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function auctionCompletedHandler({
  event,
  container,
}: SubscriberArgs) {
  const { auction_id, winner_id, final_price } = event.data

  // Insert into Supabase for real-time broadcast to all viewers
  await supabaseAdmin.from('auction_bid_feed').insert({
    auction_id,
    bid_id: 'auction-ended',
    bidder_name: 'Auction Complete',
    amount: final_price,
    bid_number: -1,  // Sentinel value for "auction ended" event
  })
}

export const config = {
  event: 'auction.completed',
}
```

---

## 14. Deployment Architecture

### Production Topology

```
                    ┌─────────────────────────┐
                    │      Cloudflare DNS      │
                    │   yourwinemarket.com     │
                    └────────┬────────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
     ┌────────────┐  ┌────────────┐  ┌────────────┐
     │   Vercel   │  │  Railway   │  │  Supabase  │
     │  Next.js   │  │ Medusa v2  │  │  (Managed) │
     │ Storefront │  │  Commerce  │  │            │
     │ + Vendor   │  │   Server   │  │ PostgreSQL │
     │ + Admin    │  │            │  │ Auth       │
     └────────────┘  ├────────────┤  │ Storage    │
                     │ PostgreSQL │  │ Realtime   │
                     │  (Railway) │  └────────────┘
                     ├────────────┤
                     │   Redis    │
                     │ (Railway)  │
                     └────────────┘
```

### Service Configuration

| Service | Platform | Plan | Est. Monthly Cost |
|---|---|---|---|
| Next.js Storefront | Vercel | Pro ($20/mo) | $20-40 |
| Medusa v2 Server | Railway | Starter ($5/mo + usage) | $15-30 |
| Medusa PostgreSQL | Railway | Managed DB | $5-15 |
| Redis (Medusa) | Railway | Managed Redis | $5-10 |
| Supabase | Supabase | Pro ($25/mo) | $25 |
| **Total (early stage)** | | | **$70-120/mo** |

### Environment Variables (Additional)

```
# Medusa Backend (Railway)
MEDUSA_BACKEND_URL=https://medusa.yoursite.com
DATABASE_URL=postgresql://...                    # Railway PostgreSQL
REDIS_URL=redis://...                            # Railway Redis
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_URL=https://xxx.supabase.co            # For event bridge
SUPABASE_SERVICE_ROLE_KEY=eyJ...                # For event bridge

# Next.js (Vercel) — add to existing env vars
MEDUSA_BACKEND_URL=https://medusa.yoursite.com
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
```

### Medusa Dockerfile

```dockerfile
# medusa/Dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

# Medusa needs 2GB+ RAM in production
EXPOSE 9000

CMD ["npx", "medusa", "start"]
```

---

## 15. Testing Strategy

In addition to the core stack's testing strategy:

| Layer | Tool | What to Test |
|---|---|---|
| Medusa modules | Medusa testing utils + Vitest | Service CRUD, data model validation |
| Workflows | Medusa workflow testing | Step execution, compensation/rollback, error handling |
| Auction logic | Vitest | Bid validation, auto-extend, reserve price, timing edge cases |
| Trade state machine | Vitest | All state transitions, expiry, concurrent offers |
| Delivery zones | Vitest | Zip code matching, window availability, fee calculation |
| Compliance rules | Vitest | State-by-state shipping validation, age verification |
| Storefront integration | Playwright | Full purchase flow, auction bidding flow, trade offer flow |
| Real-time | Playwright + Supabase local | Bid updates appear across multiple browser tabs |

### Critical Test Scenarios

```
Auction Edge Cases:
- Bid placed in final seconds triggers auto-extend
- Two bids at same millisecond (concurrency)
- Reserve price exactly met vs. not met
- Buy-now while active bids exist
- Auction ends with no bids

Trading Edge Cases:
- Counter-offer on expired listing
- Simultaneous offers from different buyers
- Offer accepted while another offer is being submitted
- Payment fails after offer accepted

Compliance Edge Cases:
- Shipping to prohibited state blocked at checkout
- Age verification expires mid-checkout
- Vendor license expired — listings should be hidden
```

---

## 16. Decision Log

| # | Decision | Choice | Rationale |
|---|---|---|---|
| E1 | Commerce engine | Medusa.js v2 | TypeScript-native, modular, marketplace recipe, workflow engine for complex business logic |
| E2 | Database split | Medusa DB + Supabase DB | Clear domain boundaries: commerce data vs. platform data; avoids coupling |
| E3 | Medusa hosting | Railway | Docker support, managed PostgreSQL + Redis, simple scaling, cost-effective |
| E4 | Vendor isolation | Medusa module links | Product/order linked to vendor via module system, not hard FK coupling |
| E5 | Auction real-time | Supabase Realtime + Medusa events | Medusa validates bids; Supabase broadcasts to browsers in real-time |
| E6 | Age verification | Third-party API (Veratad/Persona) | Legal requirement; cannot self-verify; pre-checkout gate |
| E7 | Shipping compliance | Static rules engine + database | State-by-state rules change infrequently; code-level rules with DB override |
| E8 | Marketplace payouts | Stripe Connect (Express) | Standard for marketplace payments; handles 1099s, KYC |
| E9 | Auction types | English (ascending) as default | Most familiar UX; Dutch and sealed as future additions |
| E10 | Trade escrow | Stripe PaymentIntent (manual capture) | Hold funds during trade, release on confirmation |
| E11 | Wine metadata | Custom Medusa module linked to Product | Extends product without forking Medusa's product module |
| E12 | Delivery zones | Custom fulfillment provider | Medusa's fulfillment interface supports custom logic for zone-based delivery |

---

## Quick Reference: Loading This Module Into Claude

When starting a prototyping session that involves commerce features, paste the core stack prompt from `SYSTEM_ARCHITECTURE.md` first, then add:

```
Commerce layer context (extends core stack):

- Commerce engine: Medusa.js v2 (separate server on Railway)
- Storefront talks to Medusa via @medusajs/js-sdk
- Two databases: Medusa PostgreSQL (commerce) + Supabase PostgreSQL (platform)
- Identity bridge: Supabase Auth users are synced to Medusa customers via metadata.supabase_user_id

Custom Medusa modules:
1. Marketplace — Vendor + VendorAdmin models, vendor auth as custom actor type, order splitting
2. Wine Catalog — WineDetails model linked to Medusa Product (vintage, varietal, region, score)
3. Auction — Auction + Bid models, English/Dutch/Sealed types, auto-extend, reserve price
4. Trading — TradeListing + TradeOffer models, offer/counteroffer state machine
5. Delivery Zone — DeliveryZone + DeliveryWindow models, zip-code-based availability
6. Compliance — VerificationRecord model, third-party age verification, state shipping rules

Key patterns:
- Medusa workflows for all multi-step operations (place-bid, create-auction, accept-trade)
- Medusa event subscribers bridge to Supabase for real-time broadcasting
- Supabase Realtime powers live bid feeds and trade notifications
- Stripe Connect for marketplace vendor payouts
- Stripe PaymentIntent manual capture for auction/trade escrow
- Age verification at checkout via third-party API (Veratad/Persona)

Route groups: (storefront)/ for buyers, (vendor)/[vendorSlug]/ for sellers, (trading)/ for P2P
```

Then describe the specific feature you want to build.
