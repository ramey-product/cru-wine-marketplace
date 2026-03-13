# Frontend Work Plan — CP4: All Epics

> **Created**: 2026-03-13
> **Phase**: Checkpoint 4 — Frontend Build
> **Design Authority**: `docs/design/UX_DESIGN_BIBLE.md` (ALL components reference this)
> **Total**: 45 engineering stories, ~235 story points
> **Prerequisite**: All backend (CP3) is complete across Epics 01-09

---

## Design System Setup (Phase 0 — Do First)

Before any component work, the design system from the UX Design Bible must be implemented:

| Task | File | Description |
|------|------|-------------|
| CSS Variables | `app/globals.css` | Implement full Cru color system (Section 2), typography scale (Section 3), spacing tokens (Section 4) from the Bible |
| Tailwind Config | `tailwind.config.ts` | Extend theme with `cru-primary`, `cru-secondary`, wine-inspired accents, custom font stack (Section 13: Design Tokens) |
| Shadcn/ui Theme | `components/ui/` | Customize all Shadcn primitives to match Bible Section 5 (Component Design Language): warm borders, 8px radius, wine-berry focus rings |
| Dark Mode | `app/globals.css` | Implement dark mode tokens (Bible Section 2: Neutral Dark Mode palette) |
| Motion System | Utility classes | Bible Section 7: `duration-150` for micro, `duration-300` for transitions, `ease-out` curves |
| Icon Set | `components/ui/icons` | Bible Section 6: Lucide icons, 20px default, 1.5px stroke |

**Reference**: UX Design Bible Sections 2-7, 13

---

## Build Phases (Dependency-Ordered)

### Phase 1: Foundation (Blocks Everything)
> Auth, navigation shell, core card component

| # | Epic | Story | Title | Points | Agent | Dependencies |
|---|------|-------|-------|--------|-------|-------------|
| 1 | 01 | 06 | Auth pages (signup, login, password reset, OAuth) | 8 | fullstack-1 | None — entry point |
| 2 | 08 | 08* | Navigation shell & app layout | — | fullstack-1 | Bible Section 8 (Nav & IA) |
| 3 | 02 | 06 | Wine Card component | 5 | fullstack-4 | Bible Section 5 + 9 (Wine Card spec) |
| 4 | 02 | 04* | Browse page layout (design implementation) | 5 | ux-designer → fullstack-4 | Bible Section 9 (Browse Page) |

*Stories that involve design specs being translated to code.

**UX Bible Refs**: Section 8 (Navigation — bottom tab bar mobile, sidebar desktop), Section 9 (Page-Level Specs — auth pages, browse layout), Section 5 (Component specs — buttons, inputs, cards)

---

### Phase 2: Discovery & Browse
> Search, browse pages, wine detail — the core consumer experience

| # | Epic | Story | Title | Points | Agent | Dependencies |
|---|------|-------|-------|--------|-------|-------------|
| 5 | 02 | 07 | Search bar with autocomplete | 5 | fullstack-1 | Phase 1 (nav shell) |
| 6 | 02 | 08 | Browse pages (region, varietal, occasion, producer, new) | 8 | fullstack-4 | Wine Card (#3) |
| 7 | 02 | 09 | Wine Detail page | 5 | fullstack-1 | Wine Card, Bible Section 9 |
| 8 | 04 | 05 | Producer Profile page | 8 | fullstack-1 | Wine Card, Bible Section 9 |
| 9 | 04 | 06 | Wine Detail page (producer storytelling enhancements) | 8 | fullstack-4 | Wine Detail (#7) |
| 10 | 02 | 10 | SEO metadata & sitemap | 3 | fullstack-1 | Browse + Detail pages |

**UX Bible Refs**: Section 9 (Browse Page, Wine Detail Page, Producer Profile Page), Section 10 (Interactive Patterns — search, filters, infinite scroll)

---

### Phase 3: Personalization & Onboarding
> Taste profile, recommendations, curated collections

| # | Epic | Story | Title | Points | Agent | Dependencies |
|---|------|-------|-------|--------|-------|-------------|
| 11 | 03 | 06 | Taste profile onboarding flow | 8 | fullstack-2 | Auth (#1), Bible Section 9 (Onboarding) |
| 12 | 03 | 07 | "Wines I've Loved" quick-add feature | 5 | fullstack-2 | Wine Card (#3), Taste Profile (#11) |
| 13 | 03 | 09 | Taste profile settings/edit page | 3 | fullstack-2 | Taste Profile (#11) |
| 14 | 07 | 10 | Recommendation Card with dismiss action | 5 | fullstack-4 | Wine Card (#3), Bible Section 5 |
| 15 | 07 | 08 | Home screen curation sections | 8 | fullstack-2 | Rec Card (#14), Bible Section 9 (Home) |
| 16 | 07 | 09 | Collection Detail page | 5 | fullstack-4 | Wine Card (#3), Browse layout (#6) |

**UX Bible Refs**: Section 9 (Taste Profile Onboarding, Home Screen, Collection Page), Section 10 (Progressive Disclosure, Swipeable Cards)

---

### Phase 4: User Features
> Wishlists, social, user profiles, settings

| # | Epic | Story | Title | Points | Agent | Dependencies |
|---|------|-------|-------|--------|-------|-------------|
| 17 | 01 | 07 | Wishlist page & toggle button | 5 | fullstack-2 | Wine Card (#3), Auth (#1) |
| 18 | 01 | 08 | Settings & preferences pages | 5 | fullstack-2 | Auth (#1), Bible Section 9 |
| 19 | 08 | 06 | Share Button component | 5 | fullstack-2 | Wine Detail (#7), Bible Section 5 |
| 20 | 08 | 07 | Follow/Unfollow Button (optimistic UI) | 3 | fullstack-2 | Auth (#1), Bible Section 7 (Motion) |
| 21 | 08 | 08 | User Profile page (public view) | 5 | fullstack-1 | Follow Button (#20), Bible Section 9 |
| 22 | 08 | 09 | Following & Followers list pages | 3 | fullstack-4 | User Profile (#21) |
| 23 | 08 | 05 | Open Graph metadata for shareable pages | 3 | fullstack-1 | Wine Detail, Producer Profile |

**UX Bible Refs**: Section 9 (Profile Page, Wishlist Page, Settings Page), Section 10 (Optimistic Updates, Share Sheet)

---

### Phase 5: Commerce
> Cart, checkout, order history — the revenue path

| # | Epic | Story | Title | Points | Agent | Dependencies |
|---|------|-------|-------|--------|-------|-------------|
| 24 | 05 | 07 | Retailer selection & cart UI | 8 | fullstack-1 | Wine Detail (#7), Bible Section 9 (Cart) |
| 25 | 05 | 08 | Checkout flow & order confirmation | 8 | fullstack-4 | Cart (#24), Stripe integration |
| 26 | 05 | 09 | Order history & detail pages | 5 | fullstack-4 | Auth (#1), Bible Section 9 |
| 27 | 05 | 05 | Stripe webhook handler & order finalization | 8 | fullstack-3 | Checkout (#25) |
| 28 | 05 | 10 | Order notification emails | 3 | fullstack-3 | Order finalization (#27) |

**UX Bible Refs**: Section 9 (Cart, Checkout, Order Confirmation, Order History), Section 10 (Cart Interactions, Payment Flow)

---

### Phase 6: Retailer Dashboard
> Retailer-facing management interface

| # | Epic | Story | Title | Points | Agent | Dependencies |
|---|------|-------|-------|--------|-------|-------------|
| 29 | 09 | 06 | Dashboard layout & order queue UI | 8 | fullstack-1 | Auth (#1), Bible Section 9 (Dashboard) |
| 30 | 09 | 07 | Inventory health monitor UI | 5 | fullstack-4 | Dashboard (#29) |
| 31 | 09 | 08 | Basic analytics UI | 3 | fullstack-4 | Dashboard (#29), Bible Section 9 |
| 32 | 09 | 09 | Retailer settings pages | 5 | fullstack-2 | Dashboard (#29) |
| 33 | 09 | 10 | Customer email notifications (order status) | 3 | fullstack-3 | Order management actions |

**UX Bible Refs**: Section 9 (Retailer Dashboard, Analytics), Section 12 (Responsive — dashboard is desktop-first)

---

### Phase 7: Admin & Retailer Tools
> Admin interfaces for content management and retailer onboarding

| # | Epic | Story | Title | Points | Agent | Dependencies |
|---|------|-------|-------|--------|-------|-------------|
| 34 | 07 | 07 | Curated Collections admin interface | 8 | fullstack-1 | Browse pages (#6) |
| 35 | 04 | 07 | Admin content management UI (producers/wines) | 8 | fullstack-4 | Producer Profile (#8) |
| 36 | 06 | 10 | Retailer onboarding form & CSV upload UI | 5 | fullstack-2 | Existing components (partial) |
| 37 | 06 | 11 | CSV column mapping & import preview UI | 8 | fullstack-1 | CSV Upload (#36) |
| 38 | 06 | 12 | Admin wine matching review interface | 5 | fullstack-4 | Wine Card (#3) |

**UX Bible Refs**: Section 9 (Admin Pages), Section 5 (Data Tables, Forms)

---

### Phase 8: Design & Copy (Parallel with Engineering)
> UX design specs and marketing copy — can run alongside any phase

| # | Epic | Story | Title | Points | Agent |
|---|------|-------|-------|--------|-------|
| 39 | 02 | 04 | Browse page layout design spec | 5 | ux-designer |
| 40 | 03 | 05 | Taste profile onboarding UX design | 5 | ux-designer |
| 41 | 04 | 08 | Producer storytelling UX & copy | 5 | ux-designer |
| 42 | 06 | 13 | Retailer integration UX & copy | 5 | ux-designer |
| 43 | 07 | 11 | Curation UX & copy | 5 | ux-designer |
| 44 | 08 | 10 | Social layer UX & copy | 3 | ux-designer |
| 45 | 09 | 11 | Retailer dashboard UX & copy | 3 | ux-designer |

**Note**: Design stories should be completed BEFORE their corresponding engineering phase begins. Marketing copy stories (not listed — handled by marketing-writer agent) deliver microcopy, error messages, and onboarding text.

---

## Agent Workload Summary

| Agent | Stories | Points | Primary Domain |
|-------|---------|--------|----------------|
| **fullstack-1** | 12 | ~85 | Complex pages, search, cart, admin, code review lead |
| **fullstack-2** | 10 | ~55 | Forms, onboarding, settings, social, real-time |
| **fullstack-3** | 3 | ~14 | Webhooks, email notifications, Stripe |
| **fullstack-4** | 12 | ~70 | Data tables, dashboards, catalogs, browse, analytics |
| **ux-designer** | 7 | ~31 | Design specs (deliver before engineering starts) |

---

## UX Design Bible Quick Reference for Frontend Agents

Every frontend agent MUST read the relevant Bible sections before building. Key references:

| Bible Section | What It Covers | When to Read |
|---------------|---------------|-------------|
| **Section 2: Color System** | All tokens, dark mode, wine accents | Phase 0 setup |
| **Section 3: Typography** | Font stack, scale, line heights | Phase 0 setup |
| **Section 4: Spacing** | 4px grid, section spacing, padding | Phase 0 setup |
| **Section 5: Components** | Button specs, card specs, input specs, badges, modals | Every component |
| **Section 6: Iconography** | Lucide icons, sizes, stroke | Every component |
| **Section 7: Motion** | Transition durations, easing, skeleton states | Interactive components |
| **Section 8: Navigation** | Bottom tabs (mobile), sidebar (desktop), command palette | Phase 1 |
| **Section 9: Page Specs** | Full page layouts for every page type | Matching phase |
| **Section 10: Patterns** | Search, filters, infinite scroll, optimistic UI, share | Interactive features |
| **Section 11: Accessibility** | ARIA, keyboard nav, screen reader, focus management | Every component |
| **Section 12: Responsive** | Mobile-first breakpoints, touch targets, grid system | Every page |
| **Section 13: Design Tokens** | CSS variable reference, Tailwind mappings | Phase 0 setup |

---

## Critical Path

```
Phase 0 (Design System Setup)
  └── Phase 1 (Auth + Nav + Wine Card)
        ├── Phase 2 (Browse + Detail Pages)
        │     ├── Phase 3 (Personalization)
        │     ├── Phase 4 (Social + Wishlist)
        │     └── Phase 5 (Commerce)
        ├── Phase 6 (Retailer Dashboard)
        └── Phase 7 (Admin Tools)
```

**Phases 2-5 can partially overlap** once their shared dependencies from Phase 1 are complete. Phase 6 and 7 are independent of Phases 3-5.

**Phase 8 (Design/Copy)** runs in parallel — design specs should lead engineering by at least one phase.

---

## How to Start

1. **Phase 0**: Implement design tokens from UX Design Bible Sections 2-4, 13 into `globals.css` and `tailwind.config.ts`
2. **Phase 1**: Build auth pages (EPIC-01/STORY-06), app shell/nav (Bible Section 8), Wine Card (EPIC-02/STORY-06)
3. **Continue sequentially** through phases, parallelizing within each phase across agents
4. **QA + Code Review** at the end of each phase (same pattern as CP3 epics)
5. **After all phases**: Full E2E test suite with Playwright, accessibility audit with axe-core
