# Cru -- UX Design Bible

> **The definitive design system and UX specification for Cru Wine Marketplace.**
> Every component, page, and interaction in the product references this document.
> When in doubt, this bible is the source of truth.
>
> Version: 1.0
> Date: March 8, 2026
> Author: UX/UI Design Lead
> Status: Active

---

## Table of Contents

1. [Design Philosophy and Identity](#1-design-philosophy--identity)
2. [Color System](#2-color-system)
3. [Typography System](#3-typography-system)
4. [Spacing and Layout System](#4-spacing--layout-system)
5. [Component Design Language](#5-component-design-language)
6. [Iconography and Imagery](#6-iconography--imagery)
7. [Motion and Animation System](#7-motion--animation-system)
8. [Navigation and Information Architecture](#8-navigation--information-architecture)
9. [Page-Level Design Specs](#9-page-level-design-specs)
10. [Interactive Patterns](#10-interactive-patterns)
11. [Accessibility Standards](#11-accessibility-standards)
12. [Responsive Design Strategy](#12-responsive-design-strategy)
13. [Design Tokens Reference](#13-design-tokens-reference)

---

## 1. Design Philosophy and Identity

### The Anti-Elitist Luxury Position

Cru occupies a rare design space: **premium without pretension**. The visual language must communicate that this platform takes wine seriously -- seriously enough to make it accessible to everyone. Think of a thoughtfully designed natural wine bar in Silver Lake -- exposed brick, warm lighting, handwritten chalkboard menus -- not a Michelin-starred dining room with white tablecloths and intimidating sommeliers.

The interface should feel like a conversation with a knowledgeable friend, not a lecture from an expert.

### Core Design Principles

**1. Warmth Over Coldness**
Every design decision prioritizes warmth. Warm neutrals over cool grays. Rounded corners over sharp edges. Organic photography over sterile product shots. The UI should feel like it was made by humans who love wine, not by an algorithm that categorizes it.

**2. Curiosity as the Default State**
The interface should constantly invite exploration. Every dead end is a design failure. When a user runs out of wines in a filter, show them adjacent territory. When a search returns nothing, open a door to discovery. The product treats the user's attention as a gift and rewards it.

**3. Density Without Overwhelm**
Cru serves Explorers (who want simplicity) and Enthusiasts/Retailers (who need density). The solution is progressive disclosure -- not dumbing down. Surface-level views are clean and spacious. Drill-downs reveal depth. The same data, layered thoughtfully.

**4. Stories Over Chrome**
UI chrome should recede. The content -- producer stories, wine imagery, tasting descriptions -- is the design. Every pixel of interface that isn't serving content or guiding action needs to justify its existence.

**5. Speed Is a Feature**
Perceived performance matters as much as actual performance. Skeleton states that match content shape. Optimistic updates on every interaction. Page transitions that feel instantaneous. The interface should never make the user wait without visual feedback.

### Design Inspirations

| Reference | What We Take | What We Leave |
|-----------|-------------|---------------|
| **Linear** | Speed-obsessed interactions. Keyboard-first navigation. The feeling that the interface disappears and you're just *doing*. Command palette as primary navigation. | The developer-centric density. The monochrome austerity. |
| **Notion** | Progressive disclosure mastery. How they make complex content feel approachable. Block-based content flexibility. | The blank-page anxiety. The "build your own tool" complexity. |
| **Stripe Dashboard** | How they make dense financial data scannable. Empty state design. Developer documentation quality applied to UI. | The corporate neutrality. |
| **Vercel** | Dark mode execution. How they use whitespace to create drama. Their deployment status patterns. | The developer-tool aesthetic. |
| **Aesop (aesop.com)** | Premium brand that feels warm, not cold. Earth tones. Photography that feels human. | The minimal product information. |
| **Arc Browser** | Spatial organization. How they use color as a functional tool, not decoration. The playful confidence. | The learning curve. |
| **Vivino** | What NOT to do -- the ratings-first, score-driven approach that makes wine feel like a spreadsheet. We explicitly reject this. | Everything. |

### Brand Voice in UI

The interface copy follows these rules:

- **Never use wine jargon without translation.** If you must say "terroir," follow it with what it means.
- **Second person, present tense.** "You might love this" not "Customers who purchased this also purchased."
- **Specificity over generality.** "This has the same earthy warmth as your favorite Rhone red" not "Recommended for you."
- **Confidence without arrogance.** "We think you'll love this" not "The algorithm has determined optimal compatibility."
- **Humor is welcome, but never at the user's expense.** Wine already has too much gatekeeping. We never make the user feel dumb.

---

## 2. Color System

### Design Rationale

Cru's palette draws from the wine world itself -- vineyard earth, aged oak, grape-skin purples, golden hour light -- but rendered with the crispness and contrast ratios demanded by a modern digital product. The palette is warm by default. Cool tones are used only for functional contrast (links, info states).

### Core Palette

#### Primary

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| `--cru-primary` | `#8B2252` | `cru-primary` | Primary actions, active states, brand moments. A deep wine-berry that reads as confident without being loud. |
| `--cru-primary-foreground` | `#FFF7ED` | `cru-primary-foreground` | Text on primary backgrounds. |
| `--cru-primary-hover` | `#6E1A41` | `cru-primary/90` | Hover state for primary buttons and links. |
| `--cru-primary-muted` | `#8B225220` | `cru-primary/10` | Subtle primary tint for selected states, active tabs, badges. |

#### Secondary

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| `--cru-secondary` | `#D4A574` | `cru-secondary` | Warm gold. Accent for highlights, curator picks, premium indicators. |
| `--cru-secondary-foreground` | `#1C1917` | `cru-secondary-foreground` | Text on secondary backgrounds. |
| `--cru-secondary-hover` | `#C4956A` | `cru-secondary/90` | Hover state. |
| `--cru-secondary-muted` | `#D4A57420` | `cru-secondary/10` | Subtle secondary tint for badges, tags. |

#### Neutral (Light Mode)

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| `--cru-background` | `#FAFAF8` | `background` | Page background. Warm off-white, never pure white. |
| `--cru-surface` | `#FFFFFF` | `card` | Card surfaces, elevated elements. |
| `--cru-surface-secondary` | `#F5F3F0` | `muted` | Secondary surfaces, sidebar backgrounds, input fields. |
| `--cru-border` | `#E7E3DF` | `border` | Borders and dividers. Warm, not cold gray. |
| `--cru-border-strong` | `#D1CBC4` | `border/80` | Stronger borders for focused inputs, active cards. |
| `--cru-text-primary` | `#1C1917` | `foreground` | Primary text. Near-black with warm undertone. |
| `--cru-text-secondary` | `#78716C` | `muted-foreground` | Secondary text, labels, timestamps. |
| `--cru-text-tertiary` | `#A8A29E` | `muted-foreground/70` | Placeholder text, disabled states. |

#### Neutral (Dark Mode)

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| `--cru-background` | `#0C0A09` | `dark:background` | Page background. Warm near-black. |
| `--cru-surface` | `#1C1917` | `dark:card` | Card surfaces. Warm charcoal. |
| `--cru-surface-secondary` | `#292524` | `dark:muted` | Secondary surfaces. |
| `--cru-border` | `#44403C` | `dark:border` | Borders. |
| `--cru-border-strong` | `#57534E` | `dark:border/80` | Stronger borders. |
| `--cru-text-primary` | `#FAFAF9` | `dark:foreground` | Primary text. Warm white. |
| `--cru-text-secondary` | `#A8A29E` | `dark:muted-foreground` | Secondary text. |
| `--cru-text-tertiary` | `#78716C` | `dark:muted-foreground/70` | Placeholder text, disabled states. |

### Semantic Colors

| Token | Light Hex | Dark Hex | Usage |
|-------|-----------|----------|-------|
| `--cru-success` | `#16A34A` | `#22C55E` | In-stock indicators, successful actions, order confirmed. |
| `--cru-success-bg` | `#F0FDF4` | `#14532D20` | Success background tint. |
| `--cru-warning` | `#D97706` | `#F59E0B` | Low stock, SLA warnings, pending states. |
| `--cru-warning-bg` | `#FFFBEB` | `#78350F20` | Warning background tint. |
| `--cru-error` | `#DC2626` | `#EF4444` | Errors, out of stock, failed syncs, destructive actions. |
| `--cru-error-bg` | `#FEF2F2` | `#7F1D1D20` | Error background tint. |
| `--cru-info` | `#2563EB` | `#60A5FA` | Informational alerts, links, help text. |
| `--cru-info-bg` | `#EFF6FF` | `#1E3A5F20` | Info background tint. |

### Wine-Inspired Accent Palette

Used for varietal and region color-coding in browse, tags, and category indicators. These are functional colors, not decorative.

| Token | Hex | Usage |
|-------|-----|-------|
| `--cru-wine-red` | `#8B2252` | Red wine category, bold/full-bodied tags. |
| `--cru-wine-rose` | `#E8919A` | Rose category. |
| `--cru-wine-white` | `#E8D5B0` | White wine category. |
| `--cru-wine-sparkling` | `#F0E68C` | Sparkling/champagne category. |
| `--cru-wine-orange` | `#CC7722` | Orange/skin-contact wine category. |
| `--cru-wine-dessert` | `#C9A86C` | Dessert/fortified wine category. |
| `--cru-region-france` | `#3B4CCA` | France region accent. |
| `--cru-region-italy` | `#2E8B57` | Italy region accent. |
| `--cru-region-california` | `#D2691E` | California region accent. |
| `--cru-region-spain` | `#CD5C5C` | Spain region accent. |
| `--cru-region-other` | `#708090` | Other regions. |

### Color Accessibility Matrix

All text/background combinations must meet WCAG 2.1 AA contrast requirements.

| Combination | Contrast Ratio | WCAG AA | WCAG AAA |
|-------------|---------------|---------|----------|
| `text-primary` on `background` (light) | 15.4:1 | Pass | Pass |
| `text-secondary` on `background` (light) | 4.9:1 | Pass | Fail |
| `text-primary` on `surface` (light) | 16.1:1 | Pass | Pass |
| `text-primary` on `background` (dark) | 15.8:1 | Pass | Pass |
| `text-secondary` on `background` (dark) | 5.2:1 | Pass | Fail |
| `primary` on `background` (light) | 7.1:1 | Pass | Pass |
| `primary` on `surface` (dark) | 4.7:1 | Pass | Fail |
| `success` on `background` (light) | 4.6:1 | Pass | Fail |
| `error` on `background` (light) | 5.2:1 | Pass | Fail |

### CSS Variable Implementation

```css
/* app/globals.css */
@layer base {
  :root {
    --background: 40 20% 98%;
    --foreground: 20 14% 10%;
    --card: 0 0% 100%;
    --card-foreground: 20 14% 10%;
    --popover: 0 0% 100%;
    --popover-foreground: 20 14% 10%;
    --primary: 333 62% 34%;
    --primary-foreground: 30 100% 97%;
    --secondary: 27 50% 64%;
    --secondary-foreground: 20 14% 10%;
    --muted: 30 14% 95%;
    --muted-foreground: 25 6% 45%;
    --accent: 27 50% 64%;
    --accent-foreground: 20 14% 10%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;
    --border: 30 12% 89%;
    --input: 30 12% 89%;
    --ring: 333 62% 34%;
    --radius: 0.5rem;

    /* Cru-specific tokens */
    --cru-success: 142 71% 37%;
    --cru-warning: 38 92% 44%;
    --cru-info: 217 91% 53%;
    --cru-wine-red: 333 62% 34%;
    --cru-wine-rose: 354 60% 75%;
    --cru-wine-white: 40 50% 80%;
    --cru-wine-sparkling: 54 74% 75%;
    --cru-wine-orange: 30 72% 47%;
  }

  .dark {
    --background: 20 14% 4%;
    --foreground: 40 20% 98%;
    --card: 20 14% 10%;
    --card-foreground: 40 20% 98%;
    --popover: 20 14% 10%;
    --popover-foreground: 40 20% 98%;
    --primary: 333 62% 34%;
    --primary-foreground: 30 100% 97%;
    --secondary: 27 50% 64%;
    --secondary-foreground: 20 14% 10%;
    --muted: 20 10% 15%;
    --muted-foreground: 25 6% 63%;
    --accent: 27 50% 64%;
    --accent-foreground: 20 14% 10%;
    --destructive: 0 63% 31%;
    --destructive-foreground: 0 0% 100%;
    --border: 20 6% 26%;
    --input: 20 6% 26%;
    --ring: 333 62% 34%;

    /* Dark mode Cru tokens */
    --cru-success: 142 71% 45%;
    --cru-warning: 43 96% 56%;
    --cru-info: 217 91% 68%;
  }
}
```

---

## 3. Typography System

### Font Selection

**Primary -- Inter**
The system font stack with Inter as the preferred face. Inter was designed for screens, has excellent readability at small sizes, and its open apertures and tall x-height make it ideal for the dense data views in the Retailer Dashboard while remaining warm enough for consumer-facing content.

**Display -- Playfair Display**
A modern serif used exclusively for display headings (hero text, producer names on profile pages, wine names on detail pages). It adds editorial warmth and the premium quality of a wine label without the stuffiness of a traditional serif. Used sparingly -- body copy is always Inter.

**Monospace -- JetBrains Mono**
Used only for data labels, prices, order numbers, and the command palette. Never for body copy.

```css
/* app/layout.tsx font setup */
/* Import via next/font/google for optimal loading */

--font-sans: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
--font-display: 'Playfair Display', ui-serif, Georgia, serif;
--font-mono: 'JetBrains Mono', ui-monospace, monospace;
```

### Type Scale

| Level | Size (rem/px) | Line Height | Weight | Letter Spacing | Tailwind | Usage |
|-------|--------------|-------------|--------|----------------|----------|-------|
| Display XL | 3rem / 48px | 1.1 | 700 | -0.02em | `text-5xl font-bold tracking-tight` | Hero headlines only. Landing page, onboarding screen titles. |
| Display L | 2.25rem / 36px | 1.15 | 700 | -0.02em | `text-4xl font-bold tracking-tight` | Page titles (Producer name, Wine name on detail page). |
| Display M | 1.875rem / 30px | 1.2 | 600 | -0.01em | `text-3xl font-semibold` | Section headings ("Picked for You," "Browse by Region"). |
| Heading L | 1.5rem / 24px | 1.3 | 600 | -0.01em | `text-2xl font-semibold` | Card titles, dialog titles, major section labels. |
| Heading M | 1.25rem / 20px | 1.4 | 600 | 0 | `text-xl font-semibold` | Subsection headings, sidebar group labels. |
| Heading S | 1.125rem / 18px | 1.4 | 500 | 0 | `text-lg font-medium` | Wine card title, list item headings. |
| Body L | 1rem / 16px | 1.6 | 400 | 0 | `text-base` | Primary body copy, producer stories, tasting descriptions. |
| Body M | 0.875rem / 14px | 1.5 | 400 | 0 | `text-sm` | Secondary body, form labels, card metadata. |
| Body S | 0.75rem / 12px | 1.5 | 400 | 0.01em | `text-xs` | Captions, timestamps, helper text, fine print. |
| Overline | 0.75rem / 12px | 1.5 | 600 | 0.08em | `text-xs font-semibold uppercase tracking-widest` | Category labels, section overlines ("PICKED FOR YOU"). |
| Price | 1.125rem / 18px | 1 | 600 | 0 | `text-lg font-semibold font-mono` | Wine prices. Monospace for alignment in lists. |
| Data | 0.8125rem / 13px | 1.4 | 500 | 0 | `text-[13px] font-medium font-mono` | Order numbers, inventory counts, analytics values. |

### Display Font Usage Rules

Playfair Display is used ONLY in these contexts:
- Hero text on the landing/marketing page
- Producer name on the Producer Profile page hero
- Wine name on the Wine Detail page hero
- Collection title on the Curated Collection page
- The Cru wordmark/logo

It is NEVER used for:
- Navigation labels
- Button text
- Form fields
- Sidebar content
- Dashboard data
- Any text under 24px

### Responsive Type Scaling

```
Mobile (< 640px):    Display XL = 2rem,  Display L = 1.75rem, Display M = 1.5rem
Tablet (640-1024px): Display XL = 2.5rem, Display L = 2rem,   Display M = 1.75rem
Desktop (> 1024px):  Display XL = 3rem,  Display L = 2.25rem, Display M = 1.875rem
```

Tailwind implementation:
```html
<h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-display">
  Producer Name
</h1>
```

---

## 4. Spacing and Layout System

### Spacing Scale

Cru uses Tailwind's default 4px-based spacing scale. We standardize on these specific values for consistency.

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `space-xs` | 4px | `1` | Icon gaps, inline element spacing. |
| `space-sm` | 8px | `2` | Tight element groups (tag gaps, badge padding). |
| `space-md` | 12px | `3` | Default internal padding (buttons, inputs, card content). |
| `space-lg` | 16px | `4` | Standard gap between related elements. |
| `space-xl` | 24px | `6` | Section internal padding, card padding. |
| `space-2xl` | 32px | `8` | Gap between major sections on a page. |
| `space-3xl` | 48px | `12` | Page-level section separation. |
| `space-4xl` | 64px | `16` | Hero section padding, major layout gaps. |
| `space-5xl` | 96px | `24` | Landing page section separation. |

### Grid System

**12-column grid** using Tailwind's grid utility:

```html
<div class="grid grid-cols-12 gap-6">
  <!-- Content spans columns as needed -->
</div>
```

| Layout | Columns | Tailwind | Usage |
|--------|---------|----------|-------|
| Full-width content | 12 | `col-span-12` | Hero sections, full-bleed images. |
| Primary + sidebar | 8 + 4 | `col-span-8` + `col-span-4` | Wine detail (content + purchase sidebar). |
| Three-column | 4 + 4 + 4 | `col-span-4` | Wine card grid on desktop. |
| Four-column | 3 + 3 + 3 + 3 | `col-span-3` | Browse grid, dense wine listing. |
| Two-column | 6 + 6 | `col-span-6` | Producer profile (story + facts). |

### Content Width Constraints

| Container | Max Width | Tailwind | Usage |
|-----------|-----------|----------|-------|
| Page content | 1280px | `max-w-7xl mx-auto` | Standard page content area. |
| Narrow content | 768px | `max-w-3xl mx-auto` | Articles, producer stories, long-form text. |
| Wide content | 1536px | `max-w-screen-2xl mx-auto` | Dashboard layouts, wide data views. |
| Dialog content | 560px | `max-w-lg` | Standard dialog width. |
| Sheet content | 480px | `max-w-md` (or `w-[480px]`) | Side panel / sheet width. |

### Page Layout Templates

#### Template A: Consumer Browse (Sidebar + Content)

```
+--------------------------------------------------+
|  Top Navigation Bar (56px)                        |
+--------+-----------------------------------------+
|        |                                         |
| Side   |  Content Area                           |
| bar    |  (Scrollable)                           |
| 240px  |                                         |
| (lg+)  |  +---+ +---+ +---+                     |
|        |  |   | |   | |   |  <-- Wine cards     |
| Filters|  +---+ +---+ +---+                     |
| Nav    |  +---+ +---+ +---+                     |
|        |  |   | |   | |   |                     |
|        |  +---+ +---+ +---+                     |
+--------+-----------------------------------------+
```

Tailwind:
```html
<div class="flex min-h-screen">
  <aside class="hidden lg:block w-60 border-r border-border p-6">
    <!-- Sidebar: filters, navigation -->
  </aside>
  <main class="flex-1 p-6 lg:p-8">
    <!-- Content area -->
  </main>
</div>
```

On mobile, the sidebar collapses into a bottom sheet filter drawer.

#### Template B: Detail Page (Content + Action Sidebar)

```
+--------------------------------------------------+
|  Top Navigation Bar                               |
+--------------------------------------------------+
|  Breadcrumbs                                      |
+------------------------------+-------------------+
|                              |                   |
|  Hero Image / Gallery        |  Purchase Card    |
|                              |  (Sticky on       |
|  Wine/Producer Title         |   scroll)         |
|  Story / Description         |  - Price          |
|  Tasting Notes               |  - Availability   |
|  Food Pairings               |  - Buy Button     |
|                              |  - Wishlist       |
|                              |  - Share          |
+------------------------------+-------------------+
|  Related Wines Section                            |
+--------------------------------------------------+
```

Tailwind:
```html
<div class="max-w-7xl mx-auto px-4 lg:px-8">
  <div class="lg:grid lg:grid-cols-12 lg:gap-8">
    <div class="lg:col-span-8">
      <!-- Main content -->
    </div>
    <div class="lg:col-span-4">
      <div class="sticky top-20">
        <!-- Purchase/action card -->
      </div>
    </div>
  </div>
</div>
```

On mobile, the purchase card becomes a sticky bottom bar.

#### Template C: Dashboard (Dense Data View)

```
+--------------------------------------------------+
|  Top Bar: Org Name, Search, Notifications, Avatar |
+--------+-----------------------------------------+
|        |                                         |
| Nav    |  Dashboard Header (title + actions)     |
| Rail   |  +-----------------------------------+  |
| 64px   |  |  Stat Card  |  Stat  |  Stat     |  |
| (icons)|  +-----------------------------------+  |
|        |  +-----------------------------------+  |
|        |  |                                   |  |
|        |  |  Data Table / Order Queue         |  |
|        |  |                                   |  |
|        |  +-----------------------------------+  |
+--------+-----------------------------------------+
```

Used for the Retailer Dashboard. Higher information density. Navigation rail (icons only) on desktop, bottom tabs on mobile.

#### Template D: Onboarding Flow (Centered Single-Task)

```
+--------------------------------------------------+
|  Progress Indicator (dots or bar)                 |
+--------------------------------------------------+
|                                                   |
|         +---------------------------+             |
|         |                           |             |
|         |  Question / Input Area    |             |
|         |  (max-w-lg centered)      |             |
|         |                           |             |
|         |  [Action Buttons]         |             |
|         |                           |             |
|         +---------------------------+             |
|                                                   |
+--------------------------------------------------+
```

Used for Taste Profile Onboarding. Minimal chrome, focused attention, single task per screen.

### Content Density Guidelines

| Context | Density | Card Padding | Gap Between Elements | Grid Columns |
|---------|---------|-------------|---------------------|-------------|
| Explorer browse | Comfortable | `p-6` | `gap-6` | 2 (mobile) / 3 (desktop) |
| Enthusiast lists | Standard | `p-4` | `gap-4` | 2 (mobile) / 4 (desktop) |
| Retailer dashboard | Compact | `p-3` | `gap-3` | Table layout |
| Admin views | Compact | `p-3` | `gap-2` | Table layout |

---

## 5. Component Design Language

### Global Component Tokens

These values apply to ALL Shadcn/ui components across the application.

| Property | Value | Tailwind | Notes |
|----------|-------|----------|-------|
| Border radius (default) | 8px | `rounded-lg` | Cards, inputs, buttons. |
| Border radius (small) | 6px | `rounded-md` | Tags, badges, chips. |
| Border radius (full) | 9999px | `rounded-full` | Avatars, toggle pills. |
| Border width | 1px | `border` | All borders. Never 2px. |
| Shadow (elevation-1) | `0 1px 2px rgba(0,0,0,0.05)` | `shadow-sm` | Cards, dropdowns. |
| Shadow (elevation-2) | `0 4px 6px rgba(0,0,0,0.07)` | `shadow-md` | Popovers, floating elements. |
| Shadow (elevation-3) | `0 10px 15px rgba(0,0,0,0.1)` | `shadow-lg` | Modals, command palette. |
| Focus ring | 2px offset, primary color | `ring-2 ring-ring ring-offset-2` | All focusable elements. |
| Transition (default) | 150ms ease | `transition-all duration-150` | Hover states, color changes. |
| Transition (movement) | 250ms spring | Custom Framer Motion | Element entry/exit, layout shifts. |

### Buttons

#### Variants

| Variant | Tailwind Classes | Usage |
|---------|-----------------|-------|
| **Primary** | `bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm` | Main CTAs: "Buy," "Save Profile," "Confirm Order." One per viewport section. |
| **Secondary** | `bg-secondary text-secondary-foreground hover:bg-secondary/80` | Secondary actions: "Add to Wishlist," "Share." |
| **Outline** | `border border-border bg-transparent hover:bg-muted` | Tertiary actions: "Cancel," filter toggles. |
| **Ghost** | `bg-transparent hover:bg-muted` | Low-emphasis actions: navigation, "Read more." |
| **Destructive** | `bg-destructive text-destructive-foreground hover:bg-destructive/90` | Destructive actions only: "Delete Account," "Cancel Order." Always behind a confirmation dialog. |
| **Link** | `text-primary underline-offset-4 hover:underline` | Inline text links. |

#### Sizes

| Size | Height | Padding | Font Size | Tailwind |
|------|--------|---------|-----------|----------|
| Small | 32px | `px-3` | 13px | `h-8 px-3 text-[13px]` |
| Default | 40px | `px-4` | 14px | `h-10 px-4 text-sm` |
| Large | 48px | `px-6` | 16px | `h-12 px-6 text-base` |
| Icon | 40px | `p-0` | -- | `h-10 w-10` |

#### States

| State | Visual Treatment |
|-------|-----------------|
| Default | Base variant styles. |
| Hover | Background opacity shift (`/90` or `/80`). 150ms transition. Cursor pointer. |
| Active/Pressed | Scale to 0.98 (`active:scale-[0.98]`). Slightly darker background. |
| Focus | Focus ring visible (`ring-2 ring-ring ring-offset-2`). |
| Disabled | Opacity 50% (`opacity-50`). Cursor not-allowed. No hover effect. |
| Loading | Content replaced with spinner + "Loading..." text. Disabled state applied. |

#### Button Loading Pattern

```tsx
<Button disabled={isPending}>
  {isPending ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Saving...
    </>
  ) : (
    'Save Profile'
  )}
</Button>
```

### Cards

#### Wine Card (Browse Result)

The wine card is the most important component in the entire product. It is the primary unit of discovery.

```
+-----------------------------------+
|  [Wine Image]                     |
|  aspect-[3/4] object-cover        |
+-----------------------------------+
|  PRODUCER NAME (overline)         |
|  Wine Name, Vintage (heading-s)   |
|  Varietal -- Region (body-m muted)|
|  $28 (price, mono)               |
|                                   |
|  "A family vineyard in..."        |
|  (story hook, body-s, 2 lines)    |
|                                   |
|  [green dot] In stock nearby      |
+-----------------------------------+
```

Key design decisions:
- **Image first.** The bottle shot or vineyard image is the visual anchor. Aspect ratio 3:4, `object-cover`.
- **Producer name above wine name.** Reinforces Product Principle 5 (the farmer earns the spotlight). Set as an overline in `text-xs uppercase tracking-widest text-muted-foreground`.
- **Story hook is mandatory.** Every card shows 1-2 lines of the producer's story. This is the differentiator from every other wine platform. Truncated with `line-clamp-2`.
- **No ratings or scores.** Ever. This is non-negotiable per Product Principle 2.
- **Availability indicator.** Small green dot (`bg-cru-success`) with "In stock nearby" text when available. Gray dot when not. This drives conversion per Product Principle 4 (local first).
- **Price in monospace.** For scanability across a grid of cards.

Hover state: Card lifts slightly (`hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`). Image slightly scales (`group-hover:scale-105 transition-transform duration-300`).

Tailwind implementation:
```html
<div class="group cursor-pointer rounded-lg border border-border bg-card overflow-hidden
            hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
  <div class="aspect-[3/4] overflow-hidden bg-muted">
    <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
         src="..." alt="..." loading="lazy" />
  </div>
  <div class="p-4 space-y-2">
    <p class="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      Producer Name
    </p>
    <h3 class="text-lg font-medium leading-tight">Wine Name 2023</h3>
    <p class="text-sm text-muted-foreground">Grenache -- Bandol, France</p>
    <p class="text-lg font-semibold font-mono">$28</p>
    <p class="text-sm text-muted-foreground line-clamp-2">
      A third-generation family vineyard where old-vine Grenache...
    </p>
    <div class="flex items-center gap-1.5 text-xs">
      <span class="h-2 w-2 rounded-full bg-cru-success" />
      <span class="text-muted-foreground">In stock nearby</span>
    </div>
  </div>
</div>
```

#### Producer Card

```
+-----------------------------------+
|  [Hero Photo]                     |
|  aspect-[16/9] object-cover       |
+-----------------------------------+
|  Producer Name (heading-m)        |
|  Region, Country (body-m muted)   |
|                                   |
|  Tagline (body-m italic)          |
|                                   |
|  [badge] Natural  [badge] Organic |
|  12 wines on Cru                  |
+-----------------------------------+
```

Same hover behavior as wine cards. Producer cards are wider (16:9 hero image) and show farming practice badges.

#### Order Card (Retailer Dashboard)

```
+-----------------------------------+
|  #CRU-4821           2 mins ago   |
|  [status badge: Pending]          |
+-----------------------------------+
|  John S. -- Pickup                |
|  2x Domaine Tempier Bandol Rose   |
|  1x Clos Cibonne Tibouren         |
|  Total: $87.00                    |
+-----------------------------------+
|  [Confirm]  [View Details]        |
+-----------------------------------+
```

Compact layout. Status badge color-coded (pending = warning, confirmed = info, ready = success, cancelled = error). Primary action button prominent.

#### Stats Card (Dashboard)

```
+-----------------------------------+
|  TOTAL ORDERS                     |
|  47                               |
|  +12% from last week              |
+-----------------------------------+
```

Overline label, large number in `text-3xl font-semibold font-mono`, trend indicator in green (up) or red (down) with arrow icon.

### Navigation Components

#### Top Navigation Bar (Consumer)

Height: 56px (`h-14`). Sticky top. Glass effect background (`bg-background/80 backdrop-blur-md`).

```
+--------------------------------------------------+
|  [Logo]    Browse  Discover  Community    [Cmd+K] [Avatar] |
+--------------------------------------------------+
```

- Logo: Cru wordmark in Playfair Display. Links to home.
- Primary nav links: `text-sm font-medium text-muted-foreground hover:text-foreground`. Active state: `text-foreground` with underline accent.
- Command palette trigger: `Cmd+K` shortcut shown. Icon button with keyboard shortcut badge.
- User avatar: Opens dropdown with profile, settings, logout.
- Mobile: Hamburger menu icon replaces nav links. Opens a full-screen mobile menu.

#### Sidebar Navigation (Browse/Filter)

Width: 240px on desktop. Hidden on mobile (replaced by filter sheet).

```
Filters
-------
Price Range
  [========o=====]
  $12 - $50

Wine Type
  [x] Red
  [ ] White
  [ ] Rose
  [ ] Sparkling

Region
  [x] France
  [ ] Italy
  [x] California

Available Nearby
  [toggle: ON]

Producer Values
  [ ] Natural
  [ ] Organic
  [ ] Women-owned
  [ ] BIPOC-owned

[Clear All Filters]
```

Each filter section is collapsible (`<Collapsible>` from Shadcn). Active filters show a count badge. "Clear All Filters" appears only when filters are active.

#### Breadcrumbs

```
Home / Wines / France / Burgundy / Domaine Tempier
```

Use Shadcn `<Breadcrumb>` component. Truncate middle segments on mobile with `...` and show only current + parent.

#### Tabs

Underline style for in-page navigation. No background tabs -- they look dated.

```html
<Tabs defaultValue="overview" class="w-full">
  <TabsList class="border-b border-border w-full justify-start rounded-none bg-transparent p-0">
    <TabsTrigger value="overview"
      class="rounded-none border-b-2 border-transparent data-[state=active]:border-primary
             data-[state=active]:text-foreground text-muted-foreground px-4 pb-3 pt-2">
      Overview
    </TabsTrigger>
    <!-- More tabs -->
  </TabsList>
</Tabs>
```

### Form Components

#### Text Input

```html
<div class="space-y-2">
  <Label htmlFor="email" class="text-sm font-medium">Email address</Label>
  <Input
    id="email"
    type="email"
    placeholder="you@example.com"
    class="h-10 rounded-lg border-border bg-muted/50 focus:bg-background
           transition-colors duration-150"
  />
  <p class="text-xs text-muted-foreground">We will never share your email.</p>
</div>
```

Key decisions:
- Inputs have a subtle muted background (`bg-muted/50`) that clears to white on focus. This makes them visible without harsh borders.
- Labels are always visible (no floating labels -- they cause accessibility issues).
- Helper text below the field in `text-xs text-muted-foreground`.
- Error state: border turns `border-destructive`, helper text turns `text-destructive` with error icon.

#### Select / Multi-Select

Use Shadcn `<Select>` for single selection. For multi-select (varietal picker, region picker), use `<Command>` with checkboxes inside a `<Popover>`:

```html
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" class="justify-between">
      {selected.length > 0 ? `${selected.length} selected` : "Select varietals..."}
      <ChevronsUpDown class="ml-2 h-4 w-4 opacity-50" />
    </Button>
  </PopoverTrigger>
  <PopoverContent class="w-[300px] p-0">
    <Command>
      <CommandInput placeholder="Search varietals..." />
      <CommandList>
        {/* Varietal options with checkboxes */}
      </CommandList>
    </Command>
  </PopoverContent>
</Popover>
```

#### Price Range Slider

Dual-thumb slider for price filtering. Shows selected range as `$XX -- $XX` label. Snap to predefined buckets ($10-20, $20-35, $35-50, $50-100, $100+) with smooth visual interpolation.

```html
<div class="space-y-4">
  <div class="flex items-center justify-between">
    <Label class="text-sm font-medium">Price Range</Label>
    <span class="text-sm font-mono text-muted-foreground">$20 -- $50</span>
  </div>
  <Slider
    defaultValue={[20, 50]}
    min={10}
    max={200}
    step={5}
    class="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
  />
</div>
```

#### Toggle Switch

Used for binary settings ("Available Nearby," notification preferences). The Shadcn `<Switch>` component with Cru styling:

```html
<div class="flex items-center justify-between">
  <Label htmlFor="available-nearby" class="text-sm font-medium cursor-pointer">
    Available nearby
  </Label>
  <Switch
    id="available-nearby"
    class="data-[state=checked]:bg-primary"
  />
</div>
```

#### Taste Profile Tag Selector

A custom component for the onboarding flow. Tags are pill-shaped buttons that toggle between selected/unselected states. Organized in category groups.

```
Fruit
[berry]  [citrus]  [tropical]  [stone fruit]

Earth
[mushroom]  [mineral]  [herbal]

Spice
[pepper]  [cinnamon]  [vanilla]
```

Tag states:
- Unselected: `border border-border bg-transparent text-muted-foreground hover:bg-muted`
- Selected: `border-primary bg-primary/10 text-primary font-medium`
- Transition: 150ms with a subtle scale pulse on selection (`scale-105` for 100ms)

```html
<button
  class={cn(
    "rounded-full px-4 py-2 text-sm transition-all duration-150",
    "border hover:bg-muted",
    selected
      ? "border-primary bg-primary/10 text-primary font-medium"
      : "border-border text-muted-foreground"
  )}
>
  berry
</button>
```

### Modal and Sheet Components

#### Dialog (Confirmation)

Used for destructive actions (cancel order, delete account) and important confirmations.

```
+-----------------------------------+
|  Cancel this order?          [x]  |
+-----------------------------------+
|                                   |
|  This will notify the customer    |
|  and refund their payment. This   |
|  action cannot be undone.         |
|                                   |
|  Reason (required):               |
|  [select: Out of stock       v]   |
|                                   |
|  [Keep Order]     [Cancel Order]  |
+-----------------------------------+
```

Rules:
- Title is a question, not a statement.
- Body explains the consequences.
- The destructive action is on the RIGHT (visual weight matches reading direction).
- The safe action (keep/cancel dialog) is on the left, styled as outline.
- Destructive action button uses `destructive` variant.

#### Sheet (Side Panel)

Used for complex forms, detailed views, and the mobile filter drawer. Slides in from the right on desktop, from the bottom on mobile.

Width: 480px on desktop. Full-width on mobile.

```html
<Sheet>
  <SheetContent side="right" class="w-full sm:max-w-md">
    <SheetHeader>
      <SheetTitle>Filter wines</SheetTitle>
      <SheetDescription>Narrow down your results</SheetDescription>
    </SheetHeader>
    {/* Filter controls */}
    <SheetFooter>
      <Button variant="outline" onClick={clearFilters}>Clear all</Button>
      <Button onClick={applyFilters}>Show {count} wines</Button>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

#### Command Palette

The power-user navigation hub. Triggered by `Cmd+K` (Mac) or `Ctrl+K` (Windows). Uses Shadcn `<Command>` (built on cmdk).

```
+-----------------------------------+
|  [search icon] Search Cru...      |
+-----------------------------------+
|  Recent Searches                  |
|  > Domaine Tempier                |
|  > Rosé under $30                 |
|                                   |
|  Quick Actions                    |
|  > Browse by Region               |
|  > View My Wishlist               |
|  > Taste Profile Settings         |
|                                   |
|  Wines                            |
|  > Domaine Tempier Bandol Rosé    |
|  > La Clarine Farm Sierra Rosé    |
|                                   |
|  Producers                        |
|  > Domaine Tempier                |
|  > La Clarine Farm                |
+-----------------------------------+
```

Features:
- Fuzzy search across wines, producers, pages, and actions.
- Results grouped by category with clear section headers.
- Keyboard navigation (arrow keys, enter to select, escape to close).
- Recent searches persisted per user.
- Renders as a centered dialog with `shadow-lg` and `backdrop-blur`.

### Feedback Components

#### Toast Notifications

Use sonner for toast notifications. Position: bottom-right on desktop, bottom-center on mobile.

| Type | Icon | Duration | Usage |
|------|------|----------|-------|
| Success | Check circle (green) | 3 seconds | "Wine added to wishlist," "Order confirmed." |
| Error | Alert triangle (red) | 5 seconds (sticky) | "Payment failed. Please try again." |
| Info | Info circle (blue) | 4 seconds | "Your taste profile has been updated." |
| Loading | Spinner | Until resolved | "Processing your order..." (transitions to success/error). |

```tsx
toast.success("Added to your wishlist", {
  description: "Domaine Tempier Bandol Rose 2023",
  action: {
    label: "View Wishlist",
    onClick: () => router.push("/wishlist"),
  },
});
```

#### Inline Alerts

Used for persistent, contextual information within a page section.

```html
<Alert variant="warning">
  <AlertTriangle class="h-4 w-4" />
  <AlertTitle>Inventory sync delayed</AlertTitle>
  <AlertDescription>
    Your last sync was 6 hours ago. Listings may show stale data.
    <Button variant="link" class="p-0 h-auto">Retry sync</Button>
  </AlertDescription>
</Alert>
```

#### Badges

| Variant | Tailwind | Usage |
|---------|----------|-------|
| Default | `bg-muted text-muted-foreground` | Neutral labels ("12 wines"). |
| Primary | `bg-primary/10 text-primary` | Active states, selected filters. |
| Success | `bg-cru-success/10 text-cru-success` | "In Stock," "Completed." |
| Warning | `bg-cru-warning/10 text-cru-warning` | "Low Stock," "Pending." |
| Destructive | `bg-destructive/10 text-destructive` | "Out of Stock," "Cancelled." |
| Wine type | Uses wine accent colors | "Red," "White," "Rose," etc. |

### Empty States

Every list, grid, and data view has a designed empty state. Empty states follow this structure:

```
+-----------------------------------+
|                                   |
|      [Illustration / Icon]        |
|                                   |
|   Your wishlist is waiting        |
|                                   |
|   As you discover wines you love, |
|   save them here. Your wishlist   |
|   helps us learn what you like.   |
|                                   |
|   [Browse Wines]                  |
|                                   |
+-----------------------------------+
```

Rules:
- Illustration is a simple, warm line drawing or icon composition. Not clipart. Not a sad face.
- Headline is encouraging, not apologetic. "Your wishlist is waiting" not "You have no items."
- Body copy (1-2 sentences) explains the value of the empty feature and guides next action.
- Single clear CTA button (primary variant).
- Centered layout, `max-w-sm mx-auto text-center`.

Specific empty state copy:

| Context | Headline | Body | CTA |
|---------|----------|------|-----|
| Wishlist | Your wishlist is waiting | As you discover wines you love, save them here. Your wishlist helps us learn your taste. | Browse Wines |
| Order History | No orders yet | When you find the perfect bottle, we will track it here so you can always come back to what you loved. | Start Exploring |
| Search Results (0) | No wines match those filters | Try widening your price range or exploring a different region. Great wine hides in unexpected places. | Clear Filters |
| Recommendations (no profile) | Let us get to know you | Take 2 minutes to tell us what you enjoy. We will handle the rest. | Build Your Taste Profile |
| Retailer Orders (empty queue) | All caught up | No pending orders right now. When a customer orders from your shop, it will appear here instantly. | -- (no CTA needed) |
| Producer Portfolio (1 wine) | More wines coming soon | [Producer] has 1 wine on Cru right now. Check back as their portfolio grows. | -- |

### Loading States

#### Skeleton Components

Every content area that loads asynchronously has a skeleton that matches its content shape exactly.

Wine card skeleton:
```html
<div class="rounded-lg border border-border overflow-hidden">
  <Skeleton class="aspect-[3/4] w-full" />
  <div class="p-4 space-y-2">
    <Skeleton class="h-3 w-24" />
    <Skeleton class="h-5 w-3/4" />
    <Skeleton class="h-4 w-1/2" />
    <Skeleton class="h-5 w-16" />
    <Skeleton class="h-8 w-full" />
  </div>
</div>
```

Skeleton animation: Subtle shimmer from left to right using a gradient animation. Default Shadcn skeleton with `animate-pulse` replaced by a shimmer:

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    hsl(var(--muted)) 25%,
    hsl(var(--muted-foreground) / 0.05) 50%,
    hsl(var(--muted)) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

#### Full Page Loading

Use the Next.js `loading.tsx` convention. Display a centered spinner with the Cru logo for full-page transitions, or an inline skeleton grid for content areas.

---

## 6. Iconography and Imagery

### Icon System

**Primary: Lucide React.** All interface icons use Lucide for consistency (1.5px stroke width, 24px default size).

Standard sizes:
| Size | Pixels | Tailwind | Usage |
|------|--------|----------|-------|
| Small | 16px | `h-4 w-4` | Inline with text, badges, compact buttons. |
| Default | 20px | `h-5 w-5` | Button icons, navigation items. |
| Large | 24px | `h-6 w-6` | Section headers, empty state accents. |
| XL | 32px | `h-8 w-8` | Empty state illustrations, feature highlights. |

### Wine-Domain Icons

Lucide does not have wine-specific icons. Use these mappings:

| Concept | Lucide Icon | Notes |
|---------|-------------|-------|
| Wine (generic) | `Wine` | The wine glass icon. |
| Wine bottle | `Wine` or custom SVG | Consider a custom bottle SVG for the brand. |
| Grapes / Varietal | `Grape` | Available in Lucide. |
| Region / Origin | `MapPin` | For location/region context. |
| Vineyard | `Sprout` or `Trees` | Nature/growing context. |
| Tasting notes | `Palette` | Flavor/aroma descriptions. |
| Food pairing | `Utensils` | Pairing suggestions. |
| Organic/Natural | `Leaf` | Farming practices. |
| Biodynamic | `Moon` | Biodynamic practices. |
| Cellar / Collection | `Archive` | Storage/collection context. |
| Price | `DollarSign` | Pricing context. |
| In stock | `CircleCheck` (green) | Availability. |
| Out of stock | `CircleX` (red) | Unavailability. |
| Low stock | `AlertCircle` (amber) | Low stock warning. |
| Share | `Share2` | External sharing action. |
| Wishlist (empty) | `Heart` | Not yet wishlisted. |
| Wishlist (full) | `HeartFilled` (custom fill) | Wishlisted. Animate with a scale-pop on toggle. |
| Filter | `SlidersHorizontal` | Filter panel toggle. |
| Sort | `ArrowUpDown` | Sort controls. |
| Search | `Search` | Search inputs and triggers. |
| Order/Cart | `ShoppingBag` | Cart and order context. Not `ShoppingCart` -- bags feel more premium. |
| Pickup | `Store` | In-store pickup. |
| Delivery | `Truck` | Delivery fulfillment. |
| Notification | `Bell` | Notification center. |
| Settings | `Settings` | User/retailer settings. |
| Dashboard | `LayoutDashboard` | Retailer dashboard nav. |
| Analytics | `BarChart3` | Analytics section. |
| Inventory | `Package` | Inventory management. |
| Sync status | `RefreshCw` | POS sync indicator. |

### Image Treatment

#### Wine Photography

- **Aspect ratio:** 3:4 (portrait) for wine cards, 1:1 (square) for thumbnails, 16:9 (landscape) for hero/banner.
- **Background:** Product shots on neutral backgrounds (warm gray or natural stone/wood texture). Never pure white -- it feels clinical.
- **Style preference:** Contextual over clinical. A bottle on a table with food is better than a bottle isolated on white. The wine should feel like part of a life, not a catalog.
- **Fallback:** When no wine image is available, show a gradient placeholder using the wine-type color:
  ```html
  <div class="aspect-[3/4] bg-gradient-to-br from-cru-wine-red/20 to-cru-wine-red/5
              flex items-center justify-center">
    <Wine class="h-12 w-12 text-cru-wine-red/30" />
  </div>
  ```

#### Producer Photography

- **Hero image:** 16:9 landscape. Vineyard, winery, or people-at-work shot. Must feel authentic -- no stock photography.
- **Gallery images:** Mixed aspects. Show the land, the cellar, the winemakers, the bottles in context.
- **Treatment:** Light warm overlay on hover for gallery images. Never desaturate or cool the tones.

#### Image Loading

- Use `next/image` with `loading="lazy"` for below-fold images.
- Display a blurred placeholder (`placeholder="blur"`) while loading.
- For user-uploaded content (if applicable), serve via Supabase Storage with automatic resizing.

### Empty State Illustrations

Style: **Warm line drawings** using the primary color palette. Single-weight stroke (2px). Slightly hand-drawn feel -- not perfectly geometric. Small accent fills using `primary/10` or `secondary/20`.

These illustrations are small (128px to 200px square) and accompany the empty state text. They should feel:
- Inviting, not sad
- Related to the action the user should take
- Simple enough to render as inline SVGs for instant loading

---

## 7. Motion and Animation System

### Motion Principles

1. **Purpose over polish.** Every animation must serve a function: provide feedback, guide attention, maintain spatial context, or ease transitions. Decorative motion is removed during QA.
2. **Quick by default.** Interactions should feel instant. Most transitions are 150ms. Nothing exceeds 400ms except page-level transitions.
3. **Spring physics over linear easing.** Natural-feeling spring curves for element movement. Linear easing for opacity changes only.
4. **Respect user preferences.** All motion respects `prefers-reduced-motion`. When reduced motion is active, transitions become instant opacity swaps.

### Timing Tokens

| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `fast` | 100ms | `ease-out` | Hover states, opacity changes, color transitions. |
| `normal` | 200ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Component state changes, dropdowns opening, tabs switching. |
| `slow` | 350ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Modals/sheets entering, page transitions, element entry. |
| `spring` | -- | `type: "spring", stiffness: 300, damping: 30` | Layout shifts, drag interactions, card movements. |
| `gentle-spring` | -- | `type: "spring", stiffness: 200, damping: 25` | Page entry animations, stagger effects. |

### Micro-Interaction Catalog

#### Button Press
```tsx
<motion.button
  whileTap={{ scale: 0.97 }}
  transition={{ duration: 0.1 }}
>
```

#### Card Hover
```tsx
<motion.div
  whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
  transition={{ duration: 0.2 }}
>
```

#### Toggle/Switch
On toggle, the thumb slides with a spring animation and the track color cross-fades.
```tsx
<motion.div
  animate={{ x: isChecked ? 20 : 0 }}
  transition={{ type: "spring", stiffness: 500, damping: 30 }}
/>
```

#### Wishlist Heart
On wishlist add, the heart icon fills with a scale-pop:
```tsx
<motion.div
  animate={isWishlisted ? { scale: [1, 1.3, 1] } : { scale: 1 }}
  transition={{ duration: 0.3 }}
>
  <Heart className={isWishlisted ? "fill-primary text-primary" : ""} />
</motion.div>
```

#### Accordion / Collapsible
Content height animates to auto using `AnimatePresence` and `motion.div`:
```tsx
<AnimatePresence initial={false}>
  {isOpen && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )}
</AnimatePresence>
```

#### Toast Entry
Toasts slide in from the bottom-right with a spring:
```tsx
initial={{ x: 100, opacity: 0 }}
animate={{ x: 0, opacity: 1 }}
exit={{ x: 100, opacity: 0 }}
transition={{ type: "spring", stiffness: 300, damping: 30 }}
```

### Page Transition Patterns

#### Route Change
Content fades in with a subtle upward slide:
```tsx
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.25 }}
>
  {children}
</motion.div>
```

#### List/Grid Stagger
When a wine grid loads, cards stagger in:
```tsx
<motion.div
  variants={{
    hidden: {},
    visible: { transition: { staggerChildren: 0.05 } }
  }}
  initial="hidden"
  animate="visible"
>
  {wines.map(wine => (
    <motion.div
      key={wine.id}
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      <WineCard wine={wine} />
    </motion.div>
  ))}
</motion.div>
```

Stagger delay: 50ms per item, max 10 items animated (remaining appear instantly).

#### Tab Content Switch
Cross-fade between tab panels:
```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={activeTab}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.15 }}
  >
    {tabContent}
  </motion.div>
</AnimatePresence>
```

### Scroll-Driven Animations

#### Parallax Hero
Producer profile hero image scrolls at 0.5x speed for depth:
```tsx
const { scrollYProgress } = useScroll();
const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

<motion.img style={{ y }} src="hero.jpg" />
```

#### Reveal on Scroll
Content sections fade in as they enter the viewport:
```tsx
<motion.section
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.5 }}
>
```

### Reduced Motion

```tsx
const prefersReducedMotion = useReducedMotion();

const variants = prefersReducedMotion
  ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
  : { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };
```

All `motion` components must check reduced motion preferences and fall back to simple opacity transitions.

---

## 8. Navigation and Information Architecture

### App-Level Navigation Structure

#### Consumer App

```
Top Navigation Bar (always visible)
+-------+------------------------------------------+--------+
| Logo  | Browse  Collections  Community           | [K] [A]|
+-------+------------------------------------------+--------+

K = Command palette trigger (Cmd+K)
A = User avatar (dropdown: Profile, Settings, Sign Out)
```

| Nav Item | Route | Subroutes |
|----------|-------|-----------|
| Browse | `/wines` | `/wines/region/[region]`, `/wines/varietal/[varietal]`, `/wines/occasion/[occasion]`, `/wines/new` |
| Collections | `/collections` | `/collections/[slug]` (curated collections) |
| Community | `/community` | `/community/feed` (future V1), `/users/[username]` |
| Search | `Cmd+K` overlay | Federated search across wines, producers, pages |
| Profile | `/profile` | `/profile/wishlist`, `/profile/orders`, `/profile/taste-profile`, `/profile/settings` |

#### Wine Detail & Producer Routes

| Route | Page |
|-------|------|
| `/wines/[slug]` | Wine Detail Page |
| `/producers/[slug]` | Producer Profile Page |
| `/taste-profile/onboarding` | Taste Profile Onboarding Flow |

#### Retailer Dashboard

Accessed via org-scoped routes: `/[orgSlug]/retailer/`

```
Left Navigation Rail (icon + tooltip)
+----+-------------------------------------------+
| D  |                                           |
| O  |  Content Area                             |
| I  |                                           |
| A  |                                           |
| S  |                                           |
+----+-------------------------------------------+

D = Dashboard (overview)
O = Orders (queue)
I = Inventory (health)
A = Analytics (basic)
S = Settings (store config)
```

| Nav Item | Route | Page |
|----------|-------|------|
| Dashboard | `/[orgSlug]/retailer` | Overview: pending orders count, sync status, top wines. |
| Orders | `/[orgSlug]/retailer/orders` | Order queue with filters. |
| Inventory | `/[orgSlug]/retailer/inventory` | Sync status, stock management. |
| Analytics | `/[orgSlug]/retailer/analytics` | Top wines, order summaries, view counts. |
| Settings | `/[orgSlug]/retailer/settings` | Store info, fulfillment, POS connection, notifications. |

### Mobile Navigation

**Consumer app:** Bottom tab bar with 4 items + center FAB.

```
+---+---+---+---+---+
| H | B | + | W | P |
+---+---+---+---+---+

H = Home (discovery feed)
B = Browse (search + filter)
+ = Quick action (opens sheet: add to wishlist, scan label)
W = Wishlist
P = Profile
```

The bottom tab bar is visible on all consumer pages. It uses 56px height, glass effect background, haptic feedback on tap (via navigator.vibrate on supported devices).

**Retailer dashboard:** Bottom tab bar with 4 items.

```
+---+---+---+---+
| O | I | A | S |
+---+---+---+---+

O = Orders (badge with pending count)
I = Inventory
A = Analytics
S = Settings
```

### Breadcrumb Strategy

Breadcrumbs appear on all pages below the top-level navigation. They provide spatial context and back-navigation.

Rules:
- Home is always the first crumb.
- Maximum 4 levels deep. Beyond that, collapse middle segments.
- Current page is the last crumb, displayed in `text-foreground` (not a link).
- All other crumbs are links in `text-muted-foreground`.

Examples:
```
Home / Wines / France / Burgundy
Home / Producers / Domaine Tempier
Home / Profile / Order History / Order #CRU-4821
Home / [Store Name] / Orders
```

### Command Palette Scope

The command palette (`Cmd+K` / `Ctrl+K`) is a global feature available on every page. It searches across:

| Category | Content | Priority |
|----------|---------|----------|
| Wines | Wine name, varietal, region | High (shown first if query matches) |
| Producers | Producer name, region | High |
| Pages | "Browse by Region," "My Wishlist," "Settings" | Medium |
| Actions | "Sign Out," "Dark Mode," "Build Taste Profile" | Low |

Results are shown in categorized groups. Max 5 results per category. Keyboard navigation with arrow keys. Enter to select. Escape to close.

### Deep Linking Strategy

Every meaningful state is represented in the URL. This enables:
- Sharing filtered wine views
- Bookmarking specific configurations
- Browser back/forward navigation

| State | URL Representation |
|-------|--------------------|
| Browse filters | `/wines?region=france&type=red&price=20-50&available=true` |
| Sort order | `/wines?sort=price-asc` |
| Search query | `/wines?q=tempranillo` |
| Tab selection | `/profile?tab=orders` |
| Pagination | `/wines?page=2` (or cursor-based) |

Filters are serialized to URL search params via `useSearchParams()`. Changes to filters update the URL without a full page reload using `router.replace()`.

---

## 9. Page-Level Design Specs

### 9.1 Home / Discovery Feed

**Purpose:** The first thing a logged-in user sees. Convert curiosity into exploration.

**Layout:**
```
+--------------------------------------------------+
| Top Nav                                           |
+--------------------------------------------------+
| Hero Section (conditional)                        |
| "Welcome back, [Name]" or seasonal greeting       |
+--------------------------------------------------+
| Picked for You (8 wine cards, horizontal scroll)  |
| "Because you love earthy reds with a hint of spice"|
+--------------------------------------------------+
| Curated Collections (4 collection cards, grid)    |
| "Staff Picks"  "Under $25"  "Natural"  "New"     |
+--------------------------------------------------+
| Popular Near You (6 wine cards, grid)             |
| "Trending at shops within 10 miles"               |
+--------------------------------------------------+
| Discover Producers (3 producer cards, grid)       |
| "Meet the people behind the wine"                 |
+--------------------------------------------------+
```

**Component Composition:**
```
HomePage (Server Component)
+-- HeroGreeting (Server Component -- personalized greeting)
+-- Suspense > PickedForYou (Server Component -- fetches recommendations)
|   +-- WineCardCarousel (Client Component -- horizontal scroll)
|       +-- WineCard (Server Component -- individual cards)
|       +-- WineCardActions (Client Component -- wishlist, share)
+-- Suspense > CuratedCollections (Server Component -- fetches active collections)
|   +-- CollectionCard (Server Component)
+-- Suspense > PopularNearYou (Server Component -- location-based query)
|   +-- WineCard (Server Component)
+-- Suspense > DiscoverProducers (Server Component)
    +-- ProducerCard (Server Component)
```

**Responsive Behavior:**
- Mobile: All sections stack vertically. "Picked for You" is a horizontal scroll carousel. Collections show 2-up. Popular shows 2-up grid.
- Tablet: Collections 2x2 grid. Popular 3-up.
- Desktop: Collections 4-up. Popular 3-up. Picked for You can be grid or carousel.

**State Variations:**
- **First visit (no taste profile):** Replace "Picked for You" with a prominent CTA card: "Tell us what you like -- build your taste profile in 2 minutes." Show "Popular Near You" and curated collections.
- **No location set:** Replace "Popular Near You" with "Set your location to see what is available nearby" CTA.
- **Loading:** Each section shows skeleton cards matching the content shape.
- **Error:** Individual section errors show inline retry messages, not page-level errors.

### 9.2 Wine Detail Page

**Purpose:** Convert discovery into desire. This page must make the user want to buy the wine or save it to their wishlist.

**Layout (Desktop):**
```
+--------------------------------------------------+
| Top Nav                                           |
+--------------------------------------------------+
| Home / Wines / France / Domaine Tempier Bandol... |
+-----------------------------------+--------------+
|                                   |              |
| [Wine Image Gallery]              | Purchase     |
| 3:4 primary + thumbnails          | Card         |
|                                   | (Sticky)     |
| DOMAINE TEMPIER (overline)        |              |
| Bandol Rose 2023                  | $28          |
| Mourvedre/Grenache/Cinsault       |              |
| Bandol, Provence, France          | Available at |
|                                   | - Wine House |
| "When you open a bottle of..."    |   1.2 mi $28 |
| (Producer story hook, 2-3 lines)  | - Vinology   |
| [Read full story ->]              |   3.4 mi $30 |
|                                   |              |
| --- Tasting Description ---       | [Buy] [Wish] |
| "Think ripe blackberry, a hint    | [Share]      |
| of dried herbs, and a finish..."  |              |
|                                   |              |
| --- Food Pairings ---             |              |
| Grilled lamb, Provencal ratatouille|             |
| Summer salads with olive oil      |              |
|                                   |              |
+-----------------------------------+--------------+
|                                                   |
| You Might Also Enjoy (6 wine cards)               |
| (Based on similar flavor profile)                 |
+--------------------------------------------------+
```

**Mobile Layout:**
- Image gallery is full-width swipeable.
- All content stacks vertically.
- Purchase card becomes a sticky bottom bar:
  ```
  +-----------------------------------+
  | $28  In stock nearby   [Buy Now]  |
  +-----------------------------------+
  ```

**Key Interactions:**
- Image gallery: Swipeable on mobile, click-to-expand on desktop.
- "Buy Now" opens a retailer selection sheet (bottom sheet on mobile, side sheet on desktop).
- Wishlist heart toggles with scale-pop animation.
- Share uses Web Share API on mobile, clipboard + social links on desktop.
- Producer story hook links to `/producers/[slug]`.

**Retailer Selection Sheet:**
```
+-----------------------------------+
| Select a store                    |
+-----------------------------------+
| Wine House                        |
| 1.2 miles -- $28.00               |
| [Pickup] [Delivery]       [Select]|
+-----------------------------------+
| Vinology                          |
| 3.4 miles -- $30.00               |
| [Pickup only]              [Select]|
+-----------------------------------+
| The Wine Collective               |
| 5.1 miles -- $27.50               |
| [Pickup] [Delivery]       [Select]|
+-----------------------------------+
```

Sorted by distance. Each retailer shows price, distance, and available fulfillment methods.

### 9.3 Producer Profile Page

**Purpose:** Connect the user with the human behind the wine. This is Cru's differentiator.

**Layout:**
```
+--------------------------------------------------+
| Top Nav                                           |
+--------------------------------------------------+
| Home / Producers / Domaine Tempier                |
+--------------------------------------------------+
|                                                   |
| [Hero Image -- 16:9 vineyard landscape]           |
|                                                   |
| DOMAINE TEMPIER                                   |
| Bandol, Provence, France                          |
| "Where old-vine Mourvedre meets the Mediterranean"|
|                                                   |
+-----------------------------------+--------------+
|                                   |              |
| The Story                         | Quick Facts  |
| (300-800 words, prose)            |              |
|                                   | Est. 1834    |
| "When Daniel Ravier first..."     | 30 hectares  |
|                                   | Biodynamic   |
|                                   | 80,000 btls  |
|                                   |              |
|                                   | [leaf] Bio   |
|                                   | [moon] Biodyn|
+-----------------------------------+--------------+
|                                                   |
| Photo Gallery (scrollable, 3-6 images)            |
| [img] [img] [img] [img]                          |
|                                                   |
+--------------------------------------------------+
| Wines by Domaine Tempier (grid)                   |
| [Wine Card] [Wine Card] [Wine Card] [Wine Card]  |
+--------------------------------------------------+
```

**Key Interactions:**
- Hero image: Parallax scroll effect (0.5x speed).
- Photo gallery: Horizontal scroll on mobile, grid on desktop. Click to open lightbox.
- Wine portfolio grid: Standard wine card grid. Sorted by popularity on Cru.
- Share button: In the hero area, shares the producer profile URL.
- SEO: `generateMetadata()` produces Open Graph tags with hero image, name, and tagline.

### 9.4 Search and Browse

**Purpose:** The primary discovery mechanism. Must serve both "I know what I want" (search) and "I'm exploring" (browse) use cases.

**Layout (Desktop):**
```
+--------------------------------------------------+
| Top Nav                                           |
+--------------------------------------------------+
| Browse Wines                         [Sort: v]    |
|                                                   |
| [Active Filter Chips]                             |
| [France x] [Red x] [$20-50 x]  [Clear all]      |
+--------+-----------------------------------------+
|        |                                         |
| Filters|  Wine Grid                              |
| Sidebar|  [Card] [Card] [Card]                   |
| 240px  |  [Card] [Card] [Card]                   |
|        |  [Card] [Card] [Card]                   |
|        |                                         |
|        |  [Load More] or pagination              |
+--------+-----------------------------------------+
```

**Browse Entry Points:**
```
+-----------------------------------+
| Browse by                         |
+---+---+---+---+                   |
| Region | Varietal | Occasion | Producer |
+---+---+---+---+                   |
```

Tabs across the top of the browse page. Each tab changes the primary grouping:
- **Region:** Shows region cards (France, Italy, California...) with sub-region drill-down.
- **Varietal:** Shows varietal cards with plain-language descriptions.
- **Occasion:** Shows occasion/mood collections (Weeknight, Celebration, Gift...).
- **Producer:** Alphabetical producer list with filter.

**Filter Behavior:**
- Filters in the sidebar on desktop, bottom sheet on mobile.
- Filter changes update URL search params and trigger a server-side data refresh.
- Active filter chips appear above the grid. Each chip has an `x` to remove. "Clear all" link when any filters are active.
- Zero-results state shows the empty state component with suggestions.

**Search Behavior:**
- Search bar at the top of the browse page (also accessible via `Cmd+K`).
- Debounced input (300ms). Autocomplete suggestions appear in a dropdown.
- Suggestions grouped by type: Wines, Producers, Regions, Varietals.
- Recent searches (last 10) shown on search focus before typing.

**Mobile:**
- Filter sidebar becomes a bottom sheet triggered by a "Filters" button with active filter count badge.
- Wine grid becomes 2-column on phone, 3-column on tablet.
- Sort control and filter button sit in a sticky bar below the top nav.

### 9.5 Taste Profile Onboarding

**Purpose:** Build the user's taste profile in under 3 minutes. The defining moment of Cru's UX.

**Flow:** 5 screens in a focused, centered layout (Template D).

**Progress Indicator:** Dots at the top. Current dot is `bg-primary`, upcoming dots are `bg-muted`, completed dots are `bg-primary/50`.

**Screen 1 -- Flavor Preferences:**
```
+-----------------------------------+
|  o  o  o  o  o  (progress)        |
+-----------------------------------+
|                                   |
|   What flavors do you             |
|   gravitate toward?               |
|                                   |
|   Pick as many as feel right.     |
|                                   |
|   Fruit                           |
|   [berry] [citrus] [tropical]     |
|   [stone fruit]                   |
|                                   |
|   Earth                           |
|   [mushroom] [mineral] [herbal]   |
|                                   |
|   Spice                           |
|   [pepper] [cinnamon] [vanilla]   |
|                                   |
|   Other                           |
|   [chocolate] [coffee] [floral]   |
|   [smoky]                         |
|                                   |
|   [Not sure? Skip ->]    [Next]  |
+-----------------------------------+
```

Tags use the pill-button pattern defined in Component Design Language. Users select 3-8. "Not sure? Skip" is a ghost link that advances without saving.

**Screen 2 -- Aversions:**
```
   Anything you know you
   DON'T like?

   [Very sweet]  [Very dry/tannic]
   [Very acidic]  [Oaky/buttery]
   [Bitter]  [Fizzy/sparkling]

   [Skip ->]  [Next]
```

Optional screen. 0 or more selections.

**Screen 3 -- Drinking Context:**
```
   How do you usually
   drink wine?

   [With dinner at home]
   [At restaurants]
   [At parties/gatherings]
   [Solo relaxation]
   [As a gift]
   [To learn and explore]

   [Skip ->]  [Next]
```

Cards or large clickable tiles (not tiny checkboxes). Each option is a `border rounded-lg p-4` card that toggles between unselected and selected state.

**Screen 4 -- Adventurousness:**
```
   How adventurous are you?

   [Stick with what I know]
       I know what I like. Show me
       more of the same.

   [Open to suggestions]
       Surprise me sometimes, but
       keep it in my comfort zone.

   [Surprise me]
       I want to try things I'd never
       pick on my own.

   [Back]  [Next]
```

Three large option cards. Single select. Each card has a title and a short description. Selected card has `border-primary bg-primary/5`.

**Screen 5 -- Profile Summary:**
```
   Here is what we think
   you will love.

   "Based on what you told us, you
    enjoy medium-bodied wines with
    earthy, berry-forward flavors and
    a bit of spice. You are open to
    exploring new regions but prefer
    wines that are dry and not too
    tannic."

   [Looks right!]  [Not quite ->]

   Your first picks:
   [Wine] [Wine] [Wine] [Wine]
   [Wine] [Wine] [Wine] [Wine]
```

The summary paragraph is generated from a template system (not AI). The first 8 wine recommendations appear immediately below. "Looks right!" navigates to the home feed. "Not quite" lets the user adjust specific preferences.

**Key Interactions:**
- All state is held client-side during the flow. A single server action fires on completion.
- Back navigation is available on every screen.
- Progress dots are clickable to jump between screens.
- The flow is skippable via a persistent "Skip for now" link in the top corner.
- Animations: tags enter with a stagger (50ms delay each). Screen transitions use a horizontal slide (300ms).

### 9.6 User Profile / Preferences

**Purpose:** Central hub for managing account, viewing history, and adjusting preferences.

**Layout:**
```
+--------------------------------------------------+
| Top Nav                                           |
+--------------------------------------------------+
| Home / Profile                                    |
+--------------------------------------------------+
| [Avatar]  Display Name                            |
| @username  |  Joined March 2026                   |
| 12 following  |  8 followers                      |
+--------------------------------------------------+
| [Wishlist] [Orders] [Taste Profile] [Settings]    |
+--------------------------------------------------+
| Tab Content Area                                  |
+--------------------------------------------------+
```

Tabs use the underline style. URL-driven: `/profile?tab=wishlist`.

**Wishlist Tab:** Grid of wine cards with "Remove" action on each. Sortable by date added or price.

**Orders Tab:** List of past orders. Each order shows date, retailer, wines, total, and status badge. Click to expand order detail.

**Taste Profile Tab:** Current profile summary with "Edit preferences" button. Shows selected tags, aversions, context, and adventurousness level.

**Settings Tab:** Form sections for:
- Personal info (name, email)
- Location (zip code with autocomplete)
- Price range preference
- Notification preferences (email digest frequency, toggles)
- Privacy (public/private profile)
- Account deletion (behind confirmation dialog)

### 9.7 Wishlist

**Purpose:** Save wines for later. Also a signal to the curation engine.

**Layout:** Standard wine card grid with removal capability. Accessible from the Profile page and as a standalone route `/profile/wishlist`.

**Key Interactions:**
- Removing a wine shows a confirmation toast with "Undo" action (5-second window).
- Sort options: Date added (default), Price low-high, Price high-low.
- Empty state guides user to browse.
- "Available nearby" indicator updates in real-time based on user location.

### 9.8 Order Flow

**Flow:** Wine Detail > Retailer Selection > Cart > Checkout > Confirmation

**Cart Page:**
```
+-----------------------------------+--------------+
| Your Order                        | Order Summary|
|                                   |              |
| From: Wine House (1.2 mi)         | Subtotal $56 |
|                                   | Delivery  $5 |
| 2x Domaine Tempier Bandol Rose    | Tax (est) $4 |
|   $28.00 each           [-] [+]   |-------------|
| 1x La Clarine Farm Sierra Rose    | Total    $65 |
|   $22.00                 [-] [+]   |              |
|                                   | [Checkout]   |
| Fulfillment:                      |              |
| (o) Pickup -- Ready in ~1 hour    |              |
| ( ) Delivery -- $5, 2-4 hours     |              |
|                                   |              |
| [Continue Shopping]               |              |
+-----------------------------------+--------------+
```

**Checkout:**
- Age verification checkbox (legal requirement).
- Delivery address (if delivery selected) -- pre-filled from profile.
- Stripe Checkout integration (redirect or embedded).
- Order summary visible throughout.

**Confirmation:**
```
+-----------------------------------+
|        [check icon]               |
|                                   |
|   Order confirmed!                |
|   Order #CRU-4821                 |
|                                   |
|   Pickup from Wine House          |
|   123 Wine St, Los Angeles        |
|   Ready in approximately 1 hour   |
|                                   |
|   We have sent a confirmation     |
|   to your email.                  |
|                                   |
|   [View Order Details]            |
|   [Continue Exploring]            |
+-----------------------------------+
```

**Mobile:**
- Cart is a full-page view (not a sidebar).
- Quantity controls are large touch targets (44px min).
- Sticky bottom bar with total and checkout button.

### 9.9 Social / Community

**Purpose (V0):** Share wines externally and follow other users.

**User Profile (Public View):**
```
+-----------------------------------+
| [Avatar]  Display Name            |
| @username                         |
| "Wine curious, kitchen obsessed"  |
|                                   |
| 12 following  |  8 followers      |
|                                   |
| [Follow] or [Following]          |
+-----------------------------------+
```

**Share Flow:**
- Tap share icon on Wine Detail or Producer Profile.
- Mobile: Native share sheet (Web Share API).
- Desktop: Popover with options: Copy Link, Twitter/X, Facebook, Email.
- Toast confirms: "Link copied!"

**Follow:**
- Optimistic UI: button state changes immediately, server action confirms.
- "Follow" button: `<Button variant="outline">Follow</Button>`
- "Following" button: `<Button variant="secondary">Following</Button>` -- hover reveals "Unfollow" text.

### 9.10 Retailer Dashboard

**Purpose:** Enable retailers to manage orders, monitor inventory, and understand performance.

**Overview Page:**
```
+----+-----------------------------------------+
| Nav|  Good morning, Wine House               |
| Rail                                         |
|    |  +--------+ +--------+ +--------+       |
| D  |  |Pending |  |Today's|  |Sync   |      |
| O  |  |Orders  |  |Revenue|  |Status |      |
| I  |  |  3     |  | $245  |  | OK    |      |
| A  |  +--------+ +--------+ +--------+       |
| S  |                                         |
|    |  Recent Orders                          |
|    |  +-----------------------------------+  |
|    |  | #4821 | John S. | 2 items | $56  |  |
|    |  | Pending  [Confirm] [View]         |  |
|    |  +-----------------------------------+  |
|    |  | #4820 | Sarah M.| 1 item  | $28  |  |
|    |  | Confirmed  [Ready] [View]         |  |
|    |  +-----------------------------------+  |
|    |                                         |
+----+-----------------------------------------+
```

**Orders Page:**
```
+----+-----------------------------------------+
| Nav|  Orders              [Filter: Status v] |
| Rail                                         |
|    |  +-----------------------------------+  |
|    |  | Order | Customer | Items | Total  |  |
|    |  |  Status | Time  | Actions        |  |
|    |  +-----------------------------------+  |
|    |  | #4821 | John S. | 2 | $56.00    |  |
|    |  | [!] Pending | 5m ago | [Confirm] |  |
|    |  +-----------------------------------+  |
|    |  | #4820 | Sarah M.| 1 | $28.00    |  |
|    |  | Confirmed | 1h ago | [Ready]    |  |
|    |  +-----------------------------------+  |
|    |                                         |
+----+-----------------------------------------+
```

Data table with sortable columns. Status badges color-coded. Time-since indicator. SLA warning badges (yellow at 1 hour, red at 2 hours).

**Inventory Page:**
```
+----+-----------------------------------------+
| Nav|  Inventory Health                       |
| Rail                                         |
|    |  +-----------------------------------+  |
|    |  | Last sync: 2 hours ago via POS    |  |
|    |  | Next sync: in 2 hours             |  |
|    |  | [Retry Sync]                      |  |
|    |  +-----------------------------------+  |
|    |                                         |
|    |  +--------+ +--------+ +--------+      |
|    |  |In Stock|  |Low     |  |Out of |     |
|    |  | 234   |  |Stock 12|  |Stock 8|     |
|    |  +--------+ +--------+ +--------+      |
|    |                                         |
|    |  Quick Stock Update                     |
|    |  [Search wine name...]                  |
|    |  +-----------------------------------+  |
|    |  | Wine Name | Status    | [Toggle] |  |
|    |  +-----------------------------------+  |
+----+-----------------------------------------+
```

**Analytics Page:** Simple stats cards and a "Top Wines" list. Not a full analytics dashboard -- keep it functional and fast.

**Settings Page:** Form-based. Store info, fulfillment toggles, POS connection status, notification preferences.

### 9.11 AI Curation / Recommendation View

**Purpose:** Surface personalized recommendations with clear explanations.

**"Picked for You" Section (Home Page):**
```
+--------------------------------------------------+
| PICKED FOR YOU                                    |
| Because you love earthy reds with a hint of spice |
+--------------------------------------------------+
| [<]                                          [>]  |
| [Wine Card]  [Wine Card]  [Wine Card]  [Wine Card]|
| "This has the   "A natural   "In stock   "Something|
|  peppery..."    Rhone red..." at Wine..."  new..."  |
+--------------------------------------------------+
```

Each wine card in the recommendation section includes a `match_reason` line below the card, rendered in `text-xs text-muted-foreground italic`. This explains WHY the wine was recommended.

**Collection Page:**
```
+--------------------------------------------------+
| [Cover Image -- 16:9]                             |
+--------------------------------------------------+
| STAFF PICKS                                       |
| "Our founding curators picked these bottles for   |
|  their ability to surprise and delight."          |
|                                                   |
| Curated by [Curator Name]                         |
+--------------------------------------------------+
| [Wine Card + Curator Note]                        |
| [Wine Card + Curator Note]                        |
| [Wine Card + Curator Note]                        |
+--------------------------------------------------+
```

Each wine in a curated collection optionally shows a curator's note -- a brief personal annotation.

**Dismiss Interaction:**
On recommended wine cards, a small "Not for me" action (muted text, ghost button) triggers a dismissal:
- Card animates out (scale down + fade, 200ms).
- Toast: "Got it -- we will show you less like this."
- The dismissed wine is excluded from future recommendations.

### 9.12 Settings

**Purpose:** Account management and preference configuration.

**Layout:**
```
+--------------------------------------------------+
| Settings                                          |
+--------------------------------------------------+
| [Account] [Preferences] [Notifications] [Privacy]|
+--------------------------------------------------+
| Account                                           |
| +-----------------------------------------------+|
| | Name          [Matt Ramey              ] [Save]||
| | Email         matt@example.com          [Change]|
| | Password      ********                 [Change]||
| | Connected     [Google icon] Connected          ||
| |                                                ||
| | Danger Zone                                    ||
| | [Delete Account]                               ||
| +-----------------------------------------------+|
+--------------------------------------------------+
```

Grouped by concern. "Danger zone" section is visually separated with a `border-destructive/20` left border and appears at the bottom. Delete account requires typing "DELETE" to confirm.

---

## 10. Interactive Patterns

### Filtering and Sorting

**Filter Architecture:**
- Filters are URL-driven. Changing a filter updates `searchParams` via `router.replace()`.
- Active filters are displayed as removable chips above the content grid.
- Filter state persists during a session (via URL) and resets on a new session.
- When filters produce zero results, show the contextual empty state with suggestions.

**Active Filter Chips:**
```html
<div class="flex flex-wrap gap-2">
  <Badge variant="secondary" class="gap-1">
    France <X class="h-3 w-3 cursor-pointer" onClick={removeFilter} />
  </Badge>
  <Badge variant="secondary" class="gap-1">
    $20-50 <X class="h-3 w-3 cursor-pointer" onClick={removeFilter} />
  </Badge>
  <Button variant="ghost" size="sm" onClick={clearAll}>
    Clear all
  </Button>
</div>
```

**Sort Options:**
- Relevance (default for search results)
- Price: Low to High
- Price: High to Low
- Newest First
- Available Nearby First

Sort uses a `<Select>` dropdown, not tabs.

### Pagination Strategy

**Consumer browse:** Cursor-based "Load More" button. Not infinite scroll (too easy to lose position). Not numbered pages (the content is dynamically ranked).

```html
<div class="flex justify-center py-8">
  <Button variant="outline" onClick={loadMore} disabled={!hasMore}>
    {isLoading ? (
      <><Loader2 class="mr-2 h-4 w-4 animate-spin" /> Loading...</>
    ) : (
      `Show more wines (${remaining} remaining)`
    )}
  </Button>
</div>
```

**Retailer dashboard:** Traditional numbered pagination for order tables. Page size: 20 items. Controls at the bottom of the table.

### Optimistic UI Patterns

| Action | Optimistic Behavior | Rollback on Error |
|--------|--------------------|--------------------|
| Wishlist add/remove | Heart icon toggles immediately | Revert icon state, show error toast |
| Follow/unfollow | Button state + count update immediately | Revert state + count, show error toast |
| Order status change | Status badge + row update immediately | Revert row state, show error toast |
| Filter change | Show loading skeleton in content area | Show previous content with error message |
| Dismiss recommendation | Card animates out immediately | Card reappears, show error toast |

Implementation pattern using React 19 `useOptimistic`:
```tsx
const [optimisticWishlist, addOptimistic] = useOptimistic(
  wishlist,
  (state, newItem) => [...state, newItem]
);
```

### Drag-and-Drop

Used in two contexts:

1. **Wishlist reordering:** Users can drag wine cards to reorder their wishlist. On mobile, use long-press to initiate drag.
2. **Curated collection ordering (admin):** Curators drag wines to set display order.

Accessible alternative: Up/down arrow buttons visible on focus for keyboard users.

### Pull-to-Refresh

On mobile, pull-to-refresh is supported on the home feed and browse pages. The pull indicator uses the Cru primary color spinner.

### Real-Time Update Indicators

| Context | Indicator |
|---------|-----------|
| New order (retailer) | Badge count on "Orders" nav item updates. Optional: subtle pulse animation. |
| Inventory sync running | Spinning `RefreshCw` icon with "Syncing..." text. |
| Order status change | Status badge updates with a brief highlight animation (200ms background flash). |

### Confirmation Dialog Patterns

Destructive actions always require confirmation. The dialog pattern:

1. Title as a question: "Cancel this order?"
2. Body explains consequences: "The customer will be notified and their payment refunded."
3. Required input for high-severity actions: Type "DELETE" to confirm account deletion.
4. Two buttons: safe action (outline, left) and destructive action (destructive variant, right).

### Onboarding / First-Time Experience

**Taste Profile Prompt (Home Page):**
After signup, if no taste profile exists, the "Picked for You" section is replaced by a large CTA card:

```
+--------------------------------------------------+
| [illustration: two wine glasses clinking]         |
|                                                   |
| Tell us what you like.                            |
| In 2 minutes, we will learn your taste and show   |
| you wines you will actually love.                 |
|                                                   |
| [Build My Taste Profile]                          |
| [Maybe later]                                     |
+--------------------------------------------------+
```

**Retailer Dashboard Onboarding:**
First-time retailer login shows a 3-step walkthrough overlay (non-blocking, dismissable):
1. "Your orders will appear here" -- highlights the order queue.
2. "Monitor your inventory sync" -- highlights the sync status card.
3. "See what is selling" -- highlights the analytics section.

Each step is a tooltip-style popover anchored to the relevant section. "Next" / "Skip" buttons. Completion sets a flag so it does not repeat.

---

## 11. Accessibility Standards

### WCAG 2.1 AA Compliance (Minimum)

| Requirement | Implementation |
|-------------|----------------|
| Color contrast | All text meets 4.5:1 ratio against its background. Large text (18px+ bold or 24px+ regular) meets 3:1. Use the Color Accessibility Matrix in Section 2. |
| Keyboard navigation | Every interactive element is reachable via Tab. Focus order follows visual reading order. No keyboard traps. |
| Focus visibility | All focusable elements show a visible focus ring (`ring-2 ring-ring ring-offset-2`). Never remove `outline` without providing an alternative. |
| Screen reader | Semantic HTML elements (`<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`). ARIA labels on all icon buttons and non-text controls. |
| Form accessibility | All inputs have associated `<Label>` elements. Error messages are linked via `aria-describedby`. Required fields marked with `aria-required`. |
| Image alt text | All informational images have descriptive alt text. Decorative images use `alt=""` or `role="presentation"`. |
| Motion | All animations respect `prefers-reduced-motion`. When enabled, transitions use instant opacity swaps only. |
| Touch targets | All interactive elements are at least 44x44px on mobile. Padding increases tap area where the visual element is smaller. |

### Focus Management Patterns

| Scenario | Focus Behavior |
|----------|---------------|
| Dialog opens | Focus moves to dialog's first focusable element. Tab cycles within dialog. Escape closes and returns focus to trigger. |
| Sheet opens | Focus moves to sheet content. Same trap behavior as dialog. |
| Toast appears | Toast is announced by screen reader but does not steal focus. |
| Page navigation | Focus moves to the page's `<h1>` or `<main>` element. |
| Filter change | Focus remains on the filter control. Content updates without stealing focus. |
| Inline error | Focus moves to the first field with an error on form submission. |

### Screen Reader Considerations

- Wine cards: announce as "Wine: [Name], by [Producer], [Price], [availability status]."
- Availability indicator: Do not rely on color alone. Include text "In stock nearby" or "Not available locally."
- Status badges: Include visually hidden text for color-coded statuses. `<Badge><span class="sr-only">Status:</span> Pending</Badge>`
- Image galleries: Provide a text alternative summary. Each image in the gallery has descriptive alt text.
- Price: Use `aria-label="Price: $28"` rather than relying on visual formatting.

### Keyboard Navigation Map

| Key | Action |
|-----|--------|
| `Tab` | Move to next focusable element. |
| `Shift+Tab` | Move to previous focusable element. |
| `Enter` / `Space` | Activate buttons, links, toggles. |
| `Escape` | Close modals, sheets, popovers, command palette. |
| `Arrow keys` | Navigate within menus, tabs, radio groups, command palette results. |
| `Cmd+K` / `Ctrl+K` | Open command palette. |
| `?` | Open keyboard shortcuts help dialog (when not in an input). |

---

## 12. Responsive Design Strategy

### Breakpoint Definitions

| Breakpoint | Tailwind | Min Width | Usage |
|------------|----------|-----------|-------|
| Mobile (default) | -- | 0px | Phone portrait. Single-column. Bottom nav. |
| Small | `sm:` | 640px | Large phone / small tablet. 2-column grids. |
| Medium | `md:` | 768px | Tablet. Sidebar appears. 2-3 column grids. |
| Large | `lg:` | 1024px | Desktop. Full sidebar. 3-4 column grids. |
| XL | `xl:` | 1280px | Wide desktop. Maximum content width applied. |
| 2XL | `2xl:` | 1536px | Ultra-wide. Dashboard layouts expand. |

### Mobile-First Component Adaptations

| Component | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| Top nav | Logo + hamburger + avatar | Full nav links | Full nav + search bar |
| Filter sidebar | Bottom sheet (on demand) | Side panel (collapsible) | Persistent sidebar |
| Wine card grid | 1-col (full width) or 2-col | 2-3 col | 3-4 col |
| Wine detail purchase card | Sticky bottom bar | Sticky sidebar | Sticky sidebar |
| Command palette | Full-screen overlay | Centered dialog (60% width) | Centered dialog (40% width) |
| Data tables | Card list (stacked fields) | Scrollable table | Full table |
| Dialogs | Full-screen sheet (bottom) | Centered dialog | Centered dialog |
| Tabs | Scrollable horizontal tabs | Full tab bar | Full tab bar |
| Producer hero | Full-bleed image | Full-bleed image | Contained with margins |

### Touch vs. Pointer Interactions

| Pattern | Pointer (Desktop) | Touch (Mobile) |
|---------|-------------------|----------------|
| Wine card | Hover state shows subtle lift | No hover. Tap navigates. |
| Wishlist heart | Click to toggle | Tap to toggle (with haptic feedback). |
| Filter | Click to toggle checkbox | Tap (44px touch target minimum). |
| Drag and drop | Mouse drag | Long-press to initiate. Drag with finger. |
| Image gallery | Hover arrows, click to advance | Swipe left/right. |
| Context menu | Right-click | Long-press. |
| Tooltip | Hover reveals | Tap-and-hold reveals. Or converted to visible label. |

### Mobile-Specific Patterns

**Sticky Bottom Action Bar:** On wine detail pages (mobile), a sticky bar at the bottom shows price and "Buy Now" button, ensuring the primary CTA is always visible.

```html
<div class="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95
            backdrop-blur-md p-4 flex items-center justify-between lg:hidden z-40">
  <div>
    <p class="text-lg font-semibold font-mono">$28</p>
    <p class="text-xs text-muted-foreground">In stock nearby</p>
  </div>
  <Button size="lg">Buy Now</Button>
</div>
```

**Bottom Sheet Pattern:** Used for filters, retailer selection, and share options on mobile. Slides up from the bottom with a drag handle. Can be dismissed by swiping down or tapping the overlay.

**Swipe Actions on Cards:** In the wishlist and order history, horizontal swipe reveals action buttons (remove from wishlist, reorder). Accessible alternative: three-dot menu button visible on each card.

### Tablet Layout Strategy

Tablets get a hybrid experience:
- Sidebar navigation is collapsible (toggle with hamburger).
- Wine grids use 2-3 columns.
- Detail pages use the sidebar layout (content + purchase card) but with smaller gutters.
- Forms are full-width within a centered container (not split into columns).

---

## 13. Design Tokens Reference

### Complete Token Table

This table maps every design decision to its implementation in Tailwind CSS classes and CSS custom properties.

#### Layout Tokens

| Token | Light Value | Dark Value | CSS Variable | Tailwind Class |
|-------|-------------|------------|--------------|----------------|
| Background | `#FAFAF8` | `#0C0A09` | `--background` | `bg-background` |
| Card Surface | `#FFFFFF` | `#1C1917` | `--card` | `bg-card` |
| Muted Surface | `#F5F3F0` | `#292524` | `--muted` | `bg-muted` |
| Border | `#E7E3DF` | `#44403C` | `--border` | `border-border` |
| Input Background | `#E7E3DF` | `#44403C` | `--input` | `bg-input` |

#### Text Tokens

| Token | Light Value | Dark Value | CSS Variable | Tailwind Class |
|-------|-------------|------------|--------------|----------------|
| Primary Text | `#1C1917` | `#FAFAF9` | `--foreground` | `text-foreground` |
| Secondary Text | `#78716C` | `#A8A29E` | `--muted-foreground` | `text-muted-foreground` |
| Primary Action Text | `#FFF7ED` | `#FFF7ED` | `--primary-foreground` | `text-primary-foreground` |
| Link / Accent | `#8B2252` | `#C4657A` | `--primary` | `text-primary` |

#### Interactive Tokens

| Token | Light Value | Dark Value | CSS Variable | Tailwind Class |
|-------|-------------|------------|--------------|----------------|
| Primary Button Bg | `#8B2252` | `#8B2252` | `--primary` | `bg-primary` |
| Secondary Button Bg | `#D4A574` | `#D4A574` | `--secondary` | `bg-secondary` |
| Destructive Button Bg | `#DC2626` | `#7F1D1D` | `--destructive` | `bg-destructive` |
| Focus Ring | `#8B2252` | `#8B2252` | `--ring` | `ring-ring` |

#### Feedback Tokens

| Token | Light Value | Dark Value | Tailwind Class | Usage |
|-------|-------------|------------|----------------|-------|
| Success | `#16A34A` | `#22C55E` | `text-cru-success` | In stock, confirmed. |
| Warning | `#D97706` | `#F59E0B` | `text-cru-warning` | Low stock, SLA. |
| Error | `#DC2626` | `#EF4444` | `text-cru-error` | Out of stock, failed. |
| Info | `#2563EB` | `#60A5FA` | `text-cru-info` | Tips, help, links. |

#### Spacing Tokens

| Token | Value | Tailwind |
|-------|-------|----------|
| `--space-xs` | 4px | `p-1` / `gap-1` |
| `--space-sm` | 8px | `p-2` / `gap-2` |
| `--space-md` | 12px | `p-3` / `gap-3` |
| `--space-lg` | 16px | `p-4` / `gap-4` |
| `--space-xl` | 24px | `p-6` / `gap-6` |
| `--space-2xl` | 32px | `p-8` / `gap-8` |
| `--space-3xl` | 48px | `p-12` / `gap-12` |
| `--space-4xl` | 64px | `p-16` / `gap-16` |

#### Border Radius Tokens

| Token | Value | Tailwind |
|-------|-------|----------|
| `--radius-sm` | 6px | `rounded-md` |
| `--radius-md` | 8px | `rounded-lg` |
| `--radius-lg` | 12px | `rounded-xl` |
| `--radius-full` | 9999px | `rounded-full` |

#### Shadow Tokens

| Token | Value | Tailwind |
|-------|-------|----------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | `shadow-sm` |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.07)` | `shadow-md` |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | `shadow-lg` |

#### Motion Tokens

| Token | Duration | Easing | Tailwind / Framer Motion |
|-------|----------|--------|--------------------------|
| `--motion-fast` | 100ms | `ease-out` | `duration-100 ease-out` |
| `--motion-normal` | 200ms | `cubic-bezier(0.16, 1, 0.3, 1)` | `duration-200` + custom easing |
| `--motion-slow` | 350ms | `cubic-bezier(0.16, 1, 0.3, 1)` | `duration-300` + custom easing |
| `--motion-spring` | -- | `stiffness: 300, damping: 30` | Framer Motion spring config |

#### Typography Tokens

| Token | Font | Size | Weight | Line Height | Tailwind |
|-------|------|------|--------|-------------|----------|
| `--type-display-xl` | Display | 48px | 700 | 1.1 | `text-5xl font-bold font-display` |
| `--type-display-l` | Display | 36px | 700 | 1.15 | `text-4xl font-bold font-display` |
| `--type-display-m` | Sans | 30px | 600 | 1.2 | `text-3xl font-semibold` |
| `--type-heading-l` | Sans | 24px | 600 | 1.3 | `text-2xl font-semibold` |
| `--type-heading-m` | Sans | 20px | 600 | 1.4 | `text-xl font-semibold` |
| `--type-heading-s` | Sans | 18px | 500 | 1.4 | `text-lg font-medium` |
| `--type-body-l` | Sans | 16px | 400 | 1.6 | `text-base` |
| `--type-body-m` | Sans | 14px | 400 | 1.5 | `text-sm` |
| `--type-body-s` | Sans | 12px | 400 | 1.5 | `text-xs` |
| `--type-overline` | Sans | 12px | 600 | 1.5 | `text-xs font-semibold uppercase tracking-widest` |
| `--type-price` | Mono | 18px | 600 | 1 | `text-lg font-semibold font-mono` |
| `--type-data` | Mono | 13px | 500 | 1.4 | `text-[13px] font-medium font-mono` |

### Theming Structure

The design system supports light and dark mode via CSS custom properties and Tailwind's `dark:` variant.

**Theme switching** is controlled at the `<html>` element level with a `class="dark"` toggle, managed by `next-themes`.

```tsx
// app/layout.tsx
import { ThemeProvider } from "next-themes";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**User preference:** The theme toggle lives in the user settings page and in the command palette ("Toggle Dark Mode" action). The system theme is the default. Users can override to light or dark.

**Component implementation:** All components use semantic Tailwind classes (`bg-background`, `text-foreground`, `border-border`) rather than hardcoded colors. This ensures automatic dark mode support.

```html
<!-- This works in both light and dark mode without any dark: overrides -->
<div class="bg-card text-foreground border border-border rounded-lg p-6 shadow-sm">
  <h2 class="text-xl font-semibold">Card Title</h2>
  <p class="text-muted-foreground">Card description text.</p>
</div>
```

---

## Appendix A: Shadcn/ui Component Usage Map

| UI Need | Shadcn Component | Cru Customization |
|---------|-----------------|-------------------|
| Primary buttons | `Button` | Custom primary color (`--primary: wine-berry`). |
| Wine grid cards | `Card` | Custom wine card layout with image, overline, story hook. |
| Data tables (retailer) | `Table` + `@tanstack/react-table` | Sortable columns, status badges, action buttons. |
| Forms | `Form` + react-hook-form + Zod | Muted background inputs, inline validation. |
| Modals | `Dialog` | Confirmation dialogs for destructive actions. |
| Side panels | `Sheet` | Retailer selection, mobile filters. |
| Dropdowns | `DropdownMenu` | User avatar menu, sort options. |
| Multi-select | `Command` + `Popover` | Varietal picker, region picker. |
| Search | `Command` (cmdk) | Global command palette (Cmd+K). |
| Toasts | Sonner | Bottom-right positioning, action buttons. |
| Inline alerts | `Alert` | Sync status warnings, error messages. |
| Badges | `Badge` | Status colors, wine type colors, filter chips. |
| Tabs | `Tabs` | Underline style, URL-driven state. |
| Tooltips | `Tooltip` | All icon-only buttons must have tooltips. |
| Sliders | `Slider` | Price range filter with dual thumbs. |
| Toggles | `Switch` | "Available nearby," notification prefs. |
| Skeletons | `Skeleton` | Content-shape-matched loading states. |
| Breadcrumbs | `Breadcrumb` | Warm separator, truncation on mobile. |
| Accordion | `Collapsible` | Filter sections, FAQ. |
| Progress | `Progress` | Onboarding flow, upload progress. |
| Separator | `Separator` | Section dividers. |
| Avatar | `Avatar` | User profiles, curator attribution. |

---

## Appendix B: File Path Conventions

| Component Type | Path Pattern | Example |
|----------------|-------------|---------|
| Shared UI primitives | `components/ui/` | `components/ui/button.tsx` |
| Wine feature components | `components/features/wine/` | `components/features/wine/WineCard.tsx` |
| Producer feature components | `components/features/producer/` | `components/features/producer/ProducerProfile.tsx` |
| Browse feature components | `components/features/browse/` | `components/features/browse/FilterSidebar.tsx` |
| Order feature components | `components/features/order/` | `components/features/order/CartItem.tsx` |
| Taste profile components | `components/features/taste-profile/` | `components/features/taste-profile/FlavorTagSelector.tsx` |
| Dashboard components | `components/features/retailer/` | `components/features/retailer/OrderQueue.tsx` |
| Social components | `components/features/social/` | `components/features/social/FollowButton.tsx` |
| Curation components | `components/features/curation/` | `components/features/curation/PickedForYou.tsx` |
| Layout components | `components/layout/` | `components/layout/TopNav.tsx` |
| Empty states | `components/shared/` | `components/shared/EmptyState.tsx` |

---

## Appendix C: Design Review Checklist

Before approving any component or page implementation, verify:

- [ ] **5-second test:** Can a new user understand the page purpose immediately?
- [ ] **Visual hierarchy:** Primary action is unmistakable. Eye flow is logical.
- [ ] **Consistency:** Same action = same interaction pattern everywhere.
- [ ] **Warm palette:** No cold grays. Borders, backgrounds, and text use warm neutrals.
- [ ] **No wine jargon without translation.** All copy is accessible to Explorers.
- [ ] **Responsive:** Works on 375px (mobile), 768px (tablet), 1280px (desktop).
- [ ] **Dark mode:** All semantic colors, borders, and surfaces flip correctly.
- [ ] **Loading state:** Skeleton matches content shape exactly.
- [ ] **Empty state:** Has illustration/icon, encouraging copy, and clear CTA.
- [ ] **Error state:** Explains what happened, why, and what to do next.
- [ ] **Accessibility:** Focus ring visible, aria-labels on icon buttons, contrast ratios pass, keyboard navigable.
- [ ] **Motion:** Animations are purposeful, respect reduced-motion, and stay under 400ms.
- [ ] **No ratings or scores displayed.** Product Principle 2 is absolute.
- [ ] **Producer story is visible.** Wine cards always show the story hook.
- [ ] **Compared against reference apps.** Does this hold up next to Linear, Stripe, Aesop?

---

*This document is the living source of truth for Cru's design system. It should be updated as the product evolves. Every frontend PR should reference the relevant section of this bible in its description.*
