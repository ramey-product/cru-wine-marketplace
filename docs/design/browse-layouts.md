# Browse Page Layout Design Specification

> **Status:** Active
> **References:** UX Design Bible Sections 2-4, 9.4, 10, 11, 12, 13
> **Last Updated:** 2026-03-14

---

## 1. Overview

The browse experience is Cru's primary discovery mechanism. It serves two distinct user modes: **directed search** ("I want a Pinot Noir under $30") and **open exploration** ("show me something interesting"). The layout must transition seamlessly between these modes without forcing the user to declare intent.

The browse system consists of six page types:
1. Browse landing page (category entry points)
2. Region browse
3. Varietal browse
4. Occasion browse
5. Producer browse
6. Search results / filtered wine grid

All share a common structural template (Template A from the UX Bible) with variations in the header content and entry-point UI.

---

## 2. Browse Landing Page

### 2.1 Purpose

The default `/wines` route. Provides multiple entry points into the catalog and surfaces the full wine grid with filters. First-time visitors see category exploration options prominently; returning users land directly in the filtered grid with their last-used filters restored from the URL.

### 2.2 Desktop Layout (1280px)

```
+------------------------------------------------------------------+
|  Top Nav (h-14, sticky, glass)                                    |
+------------------------------------------------------------------+
|  Breadcrumbs: Home / Browse Wines                                 |
+------------------------------------------------------------------+
|  Browse Wines (Display M)                   [Sort: Relevance  v]  |
|  Discover wines from independent producers you will love.         |
+------------------------------------------------------------------+
|  Browse by                                                        |
|  +----------+ +----------+ +----------+ +----------+             |
|  | Region   | | Varietal | | Occasion | | Producer |             |
|  | (active) | |          | |          | |          |             |
|  +----------+ +----------+ +----------+ +----------+             |
+------------------------------------------------------------------+
|  [Active Filter Chips]                                            |
|  [France x] [Red x] [$20-50 x]  Clear all                       |
+--------+---------------------------------------------------------+
|        |                                                         |
| Filter |  Wine Grid (3-col at lg, 4-col at xl)                   |
| Sidebar|  +--------+ +--------+ +--------+                      |
| 240px  |  | Card   | | Card   | | Card   |                      |
| (lg+)  |  +--------+ +--------+ +--------+                      |
|        |  +--------+ +--------+ +--------+                      |
| Sticky |  | Card   | | Card   | | Card   |                      |
| scroll |  +--------+ +--------+ +--------+                      |
|        |  +--------+ +--------+ +--------+                      |
|        |  | Card   | | Card   | | Card   |                      |
|        |  +--------+ +--------+ +--------+                      |
|        |                                                         |
|        |  [Show more wines (24 remaining)]                       |
+--------+---------------------------------------------------------+
```

### 2.3 Mobile Layout (375px)

```
+-----------------------------------+
|  Top Nav (h-14)                   |
+-----------------------------------+
|  Browse Wines (text-2xl)          |
+-----------------------------------+
|  Browse by                        |
|  [Region] [Varietal] [Occasion]   |
|  [Producer]                       |
+-----------------------------------+
|  [Filters (3)] [Sort: Relevance v]|
|  (sticky bar, h-12, below nav)    |
+-----------------------------------+
|  [France x] [Red x] [Clear all]  |
+-----------------------------------+
|  +-------------------------------+|
|  | Wine Card (full width)        ||
|  +-------------------------------+|
|  +-------------------------------+|
|  | Wine Card                     ||
|  +-------------------------------+|
|  +-------------------------------+|
|  | Wine Card                     ||
|  +-------------------------------+|
|                                   |
|  [Show more wines]                |
+-----------------------------------+
|  Bottom Tab Bar (h-14)            |
+-----------------------------------+
```

### 2.4 Tailwind Implementation

```html
<!-- Page container -->
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <!-- Header -->
  <div class="py-6 lg:py-8 space-y-4">
    <Breadcrumbs />
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl sm:text-3xl font-semibold">Browse Wines</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Discover wines from independent producers you will love.
        </p>
      </div>
      <SortSelect /> <!-- hidden on mobile, shown in sticky bar instead -->
    </div>
  </div>

  <!-- Browse-by tabs -->
  <Tabs class="border-b border-border mb-6">
    <TabsList class="w-full justify-start rounded-none bg-transparent p-0">
      <TabsTrigger>Region</TabsTrigger>
      <TabsTrigger>Varietal</TabsTrigger>
      <TabsTrigger>Occasion</TabsTrigger>
      <TabsTrigger>Producer</TabsTrigger>
    </TabsList>
  </Tabs>

  <!-- Filter chips -->
  <FilterChips />

  <!-- Main content area -->
  <div class="flex gap-8">
    <!-- Sidebar: hidden below lg -->
    <aside class="hidden lg:block w-60 shrink-0">
      <FilterPanel />
    </aside>

    <!-- Wine grid -->
    <main class="flex-1">
      <WineGrid />
      <LoadMoreButton />
    </main>
  </div>
</div>
```

### 2.5 Component Tree

```
BrowsePage (Server Component -- fetches initial wine data, filter options)
+-- BrowseHeader (Server Component -- title, description, breadcrumbs)
+-- BrowseTabs (Client Component -- tab switching, URL-driven)
+-- MobileFilterBar (Client Component -- sticky bar with filter/sort triggers, lg:hidden)
|   +-- FilterDrawer (Client Component -- Sheet, bottom on mobile)
|   +-- SortSelect (Client Component -- Select dropdown)
+-- FilterChips (Client Component -- active filter badges)
+-- BrowseContent (Server Component -- layout wrapper)
|   +-- FilterPanel (Client Component -- sidebar, hidden lg:block)
|   +-- Suspense boundary
|       +-- WineGrid (Server Component -- grid layout)
|           +-- WineCard (Server Component -- individual card)
|               +-- WineCardActions (Client Component -- wishlist heart)
+-- LoadMoreButton (Client Component -- cursor-based pagination)
```

---

## 3. Category Browse Layouts

### 3.1 Region Browse

Activated when the "Region" tab is selected. Shows region cards as entry points above the wine grid.

#### Desktop

```
+------------------------------------------------------------------+
|  Region tab is active (underline accent)                          |
+------------------------------------------------------------------+
|  Region Cards (3-col grid, gap-4)                                 |
|  +----------------+ +----------------+ +----------------+         |
|  | [vineyard img] | | [vineyard img] | | [vineyard img] |         |
|  | France         | | Italy          | | California     |         |
|  | 84 wines       | | 62 wines       | | 45 wines       |         |
|  +----------------+ +----------------+ +----------------+         |
|  +----------------+ +----------------+ +----------------+         |
|  | Spain          | | Oregon         | | South Africa   |         |
|  | 31 wines       | | 28 wines       | | 19 wines       |         |
|  +----------------+ +----------------+ +----------------+         |
+------------------------------------------------------------------+
```

#### Region Card Spec

- Container: `rounded-lg border border-border overflow-hidden bg-card`
- Image: `aspect-[16/9] object-cover` (landscape vineyard/landscape photo)
- Content padding: `p-4`
- Region name: `text-lg font-medium` (Heading S)
- Wine count: `text-sm text-muted-foreground`
- Hover: `hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`
- Links to `/wines/region/[region-slug]`

#### Mobile

Region cards scroll horizontally in a carousel (`overflow-x-auto snap-x snap-mandatory`). Each card is `w-[200px] snap-start shrink-0`.

### 3.2 Varietal Browse

Shows varietal cards with plain-language descriptions. No wine jargon without explanation.

```
+------------------------------------------------------------------+
|  Varietal Cards (4-col grid on desktop, 2-col on tablet)          |
|  +-----------+ +-----------+ +-----------+ +-----------+          |
|  | [color]   | | [color]   | | [color]   | | [color]   |          |
|  | Pinot Noir| | Cabernet  | | Chardonnay| | Grenache  |          |
|  | Light,    | | Bold,     | | Rich or   | | Fruity,   |          |
|  | earthy,   | | structured| | crisp --  | | spicy,    |          |
|  | elegant   | | & dark    | | it varies | | warm      |          |
|  | 42 wines  | | 38 wines  | | 35 wines  | | 28 wines  |          |
|  +-----------+ +-----------+ +-----------+ +-----------+          |
+------------------------------------------------------------------+
```

#### Varietal Card Spec

- Container: `rounded-lg border border-border overflow-hidden bg-card`
- Color swatch header: `h-2` bar at top using wine-type color token (`bg-[--cru-wine-red]` for reds, `bg-[--cru-wine-white]` for whites, etc.)
- Content padding: `p-4 space-y-1`
- Varietal name: `text-lg font-medium`
- Description: `text-sm text-muted-foreground` (1-2 lines, plain language)
- Wine count: `text-xs text-muted-foreground`
- Hover: Same as region cards

### 3.3 Occasion Browse

Shows occasion/mood-based collections with warm, inviting copy.

```
+------------------------------------------------------------------+
|  Occasion Cards (3-col, larger with illustration/icon)            |
|  +------------------+ +------------------+ +------------------+   |
|  | [Utensils icon]  | | [Gift icon]      | | [Sun icon]       |   |
|  | Weeknight        | | A Gift           | | Summer           |   |
|  | Dinner           | | Worth Giving     | | Afternoon        |   |
|  | Easy-drinking    | | Bottles that say  | | Light, bright,   |   |
|  | wines that pair  | | "I thought about | | and perfect      |   |
|  | with anything    | | this"            | | chilled           |   |
|  +------------------+ +------------------+ +------------------+   |
+------------------------------------------------------------------+
```

#### Occasion Card Spec

- Container: `rounded-lg border border-border bg-card p-6`
- Icon: Lucide icon, `h-8 w-8 text-primary mb-3`
- Occasion title: `text-xl font-semibold` (Heading M)
- Description: `text-sm text-muted-foreground line-clamp-3`
- Hover: `hover:border-primary/30 hover:bg-primary/5 transition-all duration-200`
- Links to `/wines/occasion/[occasion-slug]`

### 3.4 Producer Browse

Alphabetical producer list with a search/filter input at the top.

```
+------------------------------------------------------------------+
|  [Search producers...]                                            |
+------------------------------------------------------------------+
|  Producer Grid (3-col)                                            |
|  +------------------+ +------------------+ +------------------+   |
|  | [hero landscape] | | [hero landscape] | | [hero landscape] |   |
|  | Domaine Tempier  | | La Clarine Farm  | | Ridge Vineyards  |   |
|  | Bandol, France   | | Sierra Foothills | | Santa Cruz, CA   |   |
|  | [Bio] [Natural]  | | [Natural]        | | [Organic]        |   |
|  | 8 wines          | | 5 wines          | | 12 wines         |   |
|  +------------------+ +------------------+ +------------------+   |
+------------------------------------------------------------------+
```

Uses the ProducerCard component spec from the UX Bible (16:9 hero image, farming practice badges).

---

## 4. Search Results Page

### 4.1 Layout

When a search query is active (via `?q=` param or Command Palette redirect), the browse page enters search mode.

```
+------------------------------------------------------------------+
|  Search results for "tempranillo"          [Sort: Relevance  v]   |
|  24 wines found                                                   |
+------------------------------------------------------------------+
|  [Active Filter Chips]                                            |
+--------+---------------------------------------------------------+
|        |                                                         |
| Filter |  Search Result Grid                                     |
| Sidebar|  Cards include a match_reason line:                     |
|        |  "Matched: varietal" in text-xs italic muted            |
|        |                                                         |
+--------+---------------------------------------------------------+
```

### 4.2 Search-Specific Behaviors

- **Query persistence:** The search query stays in the URL (`?q=tempranillo`) and can be combined with filters.
- **Result count:** Always shown below the heading: `text-sm text-muted-foreground`.
- **Sort default:** "Relevance" when a query is present. "Newest First" when browsing without a query.
- **Autocomplete:** The search input in the toolbar (and Command Palette) shows debounced suggestions grouped by Wines, Producers, Regions, Varietals.

### 4.3 Search Input Spec

Located in the mobile filter bar and as a standalone input on the browse page header area.

```html
<div class="relative">
  <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  <input
    class="w-full h-10 rounded-lg border border-border bg-muted/50 pl-10 pr-4 text-sm
           placeholder:text-muted-foreground focus:bg-background focus:ring-2
           focus:ring-ring focus:ring-offset-2 transition-colors duration-150"
    placeholder="Search wines, producers, regions..."
    aria-label="Search wines"
  />
</div>
```

---

## 5. Empty States and Zero-Results

### 5.1 Zero Search Results

When a query returns no matches.

```
+-----------------------------------+
|                                   |
|      [Search icon, h-12 w-12     |
|       text-muted-foreground]      |
|                                   |
|   No wines match those filters    |
|                                   |
|   Try widening your price range   |
|   or exploring a different        |
|   region. Great wine hides in     |
|   unexpected places.              |
|                                   |
|   [Clear Filters]                 |
|                                   |
|   Or try one of these:            |
|   [Browse all wines]              |
|   [Newest arrivals]               |
|   [Napa Valley]  [Pinot Noir]     |
+-----------------------------------+
```

#### Implementation

```html
<div class="flex flex-col items-center justify-center py-16 px-4 text-center max-w-sm mx-auto">
  <Search class="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
  <h2 class="text-lg font-medium mb-2">No wines match those filters</h2>
  <p class="text-sm text-muted-foreground mb-6">
    Try widening your price range or exploring a different region.
    Great wine hides in unexpected places.
  </p>
  <Button variant="primary" onClick={clearFilters}>Clear Filters</Button>
  <div class="mt-6 space-y-3">
    <p class="text-sm font-medium text-muted-foreground">Or try one of these:</p>
    <div class="flex flex-wrap justify-center gap-2">
      <!-- Suggestion links as rounded pill buttons -->
    </div>
  </div>
</div>
```

### 5.2 First Visit Empty State (No Wines in Catalog)

Unlikely in production but needed for development/staging.

```
+-----------------------------------+
|                                   |
|      [Wine glass icon]           |
|                                   |
|   Wines are on their way          |
|                                   |
|   Our curators are adding wines   |
|   from independent producers.     |
|   Check back soon.                |
|                                   |
+-----------------------------------+
```

### 5.3 No Taste Profile Yet (Recommendation Empty State)

When the "Picked for You" section would appear but the user has no taste profile.

```
+-----------------------------------+
|      [Two wine glasses icon]     |
|                                   |
|   Tell us what you like.          |
|                                   |
|   In 2 minutes, we will learn     |
|   your taste and show you wines   |
|   you will actually love.         |
|                                   |
|   [Build My Taste Profile]        |
|   Maybe later                     |
+-----------------------------------+
```

---

## 6. Filter System

### 6.1 Desktop Filter Sidebar

Fixed-width sidebar (240px / `w-60`) on the left. Visible at `lg` breakpoint and above. Content scrolls independently of the main grid.

```
Filters
-------
Price Range
  [$12] ---- [$50]
  [==========o======]

Wine Type
  [x] Red
  [ ] White
  [ ] Rose
  [x] Sparkling
  [v] Show more (3 more)

Region
  [x] France
  [ ] Italy
  [x] California
  [ ] Spain
  [v] Show more (8 more)

Available Nearby
  [toggle: ON]

Producer Values
  [ ] Natural
  [ ] Organic
  [ ] Women-owned
  [ ] BIPOC-owned

[Clear All Filters]
```

#### Structure

```html
<aside class="hidden lg:block w-60 shrink-0 space-y-6" aria-label="Wine filters">
  <!-- Header -->
  <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
    <SlidersHorizontal class="h-4 w-4" aria-hidden="true" />
    Filters
  </div>

  <!-- Each filter section is a Collapsible -->
  <Collapsible defaultOpen>
    <CollapsibleTrigger class="flex items-center justify-between w-full text-sm font-medium">
      Wine Type
      <ChevronDown class="h-4 w-4" />
    </CollapsibleTrigger>
    <CollapsibleContent class="pt-2 space-y-1.5">
      <!-- Checkboxes -->
    </CollapsibleContent>
  </Collapsible>

  <!-- Price range uses dual-thumb Slider -->
  <!-- Available Nearby uses Switch -->
  <!-- Clear All appears only when filters are active -->
</aside>
```

#### Filter Section Behavior

- Each section uses `Collapsible` from Shadcn/ui (replaces the current raw fieldset approach)
- Sections with more than 5 items show a "Show more" toggle (expands inline, no dialog)
- Active filters show a count badge next to the section label: `<Badge variant="primary" class="ml-2">2</Badge>`
- "Clear All Filters" button appears only when at least one filter is active
- Styling: `text-sm` for all filter labels, `rounded border-border text-primary focus:ring-primary` for checkboxes

### 6.2 Mobile Filter Drawer (Bottom Sheet)

On screens below `lg` (mobile and tablet), filters are accessed via a "Filters" button in the sticky toolbar. This opens a Sheet from the bottom.

```
+-----------------------------------+
|  --- (drag handle)                |
+-----------------------------------+
|  Filter wines             [x]     |
|  Narrow down your results         |
+-----------------------------------+
|                                   |
|  Price Range                      |
|  [$12] ---- [$50]                 |
|  [==========o======]              |
|                                   |
|  Wine Type                        |
|  [Red]  [White]  [Rose]           |
|  [Sparkling]  [Orange]            |
|                                   |
|  Region                           |
|  [France]  [Italy]  [California]  |
|  [Spain]  [Oregon]  [+5 more]    |
|                                   |
|  Available Nearby                 |
|  [toggle: ON]                     |
|                                   |
|  Producer Values                  |
|  [Natural]  [Organic]             |
|  [Women-owned]  [BIPOC-owned]     |
|                                   |
+-----------------------------------+
|  [Clear all]   [Show 47 wines]    |
+-----------------------------------+
```

#### Key Differences from Desktop

- Wine Type and Region use pill-toggle buttons instead of checkboxes (larger touch targets, 44px min height)
- Sheet footer is sticky with "Clear all" (outline) and "Show N wines" (primary) buttons
- Wine count in the primary button updates reactively as filters change
- Sheet is dismissable by swipe-down or overlay tap
- Maximum height: 85vh

#### Implementation

```html
<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline" size="sm" class="lg:hidden gap-2">
      <SlidersHorizontal class="h-4 w-4" />
      Filters
      {activeCount > 0 && (
        <Badge variant="primary" class="ml-1">{activeCount}</Badge>
      )}
    </Button>
  </SheetTrigger>
  <SheetContent side="bottom" class="max-h-[85vh] rounded-t-xl">
    <SheetHeader>
      <SheetTitle>Filter wines</SheetTitle>
      <SheetDescription>Narrow down your results</SheetDescription>
    </SheetHeader>
    <div class="overflow-y-auto flex-1 py-4 space-y-6">
      <!-- Filter sections with pill toggles -->
    </div>
    <SheetFooter class="sticky bottom-0 bg-background border-t border-border pt-4">
      <Button variant="outline" onClick={clearFilters}>Clear all</Button>
      <Button onClick={applyAndClose}>Show {resultCount} wines</Button>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

### 6.3 Active Filter Chips

Displayed above the wine grid, below the browse tabs. Each chip shows the filter value with an "x" to remove.

```html
<div class="flex flex-wrap items-center gap-2 mb-4" role="list" aria-label="Active filters">
  <Badge variant="secondary" class="gap-1 cursor-pointer hover:bg-muted/80" role="listitem">
    France
    <X class="h-3 w-3" onClick={() => removeFilter('region', 'france')} aria-label="Remove France filter" />
  </Badge>
  <Badge variant="secondary" class="gap-1 cursor-pointer hover:bg-muted/80" role="listitem">
    $20 -- $50
    <X class="h-3 w-3" onClick={() => removePriceFilter()} aria-label="Remove price filter" />
  </Badge>
  <Button variant="ghost" size="sm" onClick={clearAll} aria-label="Clear all filters">
    Clear all
  </Button>
</div>
```

### 6.4 Filter Persistence

- All filter state is URL-driven via `searchParams`
- Changing any filter calls `router.push()` with `scroll: false` (already implemented)
- Filters reset pagination to page 1 (already implemented)
- Sort order is also URL-driven: `?sort=price-asc`
- On mobile, filters are applied on "Show N wines" tap (batch apply), not individually

---

## 7. Responsive Breakpoints and Grid Behavior

### 7.1 Wine Card Grid

| Breakpoint | Columns | Gap | Card Min Width |
|------------|---------|-----|----------------|
| Default (0-639px) | 1 | `gap-4` | Full width |
| `sm` (640px+) | 2 | `gap-4` | ~280px |
| `lg` (1024px+) | 3 | `gap-6` | ~280px |
| `xl` (1280px+) | 4 | `gap-6` | ~270px |

```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
  <!-- WineCard components -->
</div>
```

This matches the existing `WineGrid` implementation.

### 7.2 Category Card Grids

| Card Type | Mobile | Tablet (md) | Desktop (lg) |
|-----------|--------|-------------|--------------|
| Region | Horizontal scroll | 2-col grid | 3-col grid |
| Varietal | 2-col grid | 3-col grid | 4-col grid |
| Occasion | 1-col stack | 2-col grid | 3-col grid |
| Producer | 1-col stack | 2-col grid | 3-col grid |

### 7.3 Mobile Sticky Toolbar

Below the top nav on mobile. Contains filter trigger button and sort dropdown. Becomes sticky on scroll.

```html
<div class="sticky top-14 z-30 bg-background/95 backdrop-blur-md border-b border-border
            px-4 py-2 flex items-center justify-between lg:hidden">
  <FilterDrawerTrigger />
  <SortSelect />
</div>
```

Height: 48px (`h-12`). Glass effect background. Z-index below nav (z-30) but above content.

### 7.4 Sidebar Visibility

| Breakpoint | Filter Sidebar | Filter Access |
|------------|---------------|---------------|
| Mobile (default) | Hidden | Bottom sheet via "Filters" button |
| Tablet (md) | Hidden | Bottom sheet via "Filters" button |
| Desktop (lg+) | Visible, 240px, left side | Persistent sidebar |

---

## 8. Spacing and Typography Tokens

### 8.1 Page-Level Spacing

| Element | Token | Tailwind |
|---------|-------|----------|
| Page horizontal padding (mobile) | `space-lg` | `px-4` |
| Page horizontal padding (desktop) | `space-2xl` | `px-8` or `lg:px-8` |
| Page top padding | `space-xl` | `py-6` |
| Section gap | `space-2xl` | `space-y-8` or `gap-8` |
| Filter sidebar gap | `space-xl` | `space-y-6` |
| Grid gap (mobile) | `space-lg` | `gap-4` |
| Grid gap (desktop) | `space-xl` | `gap-6` |

### 8.2 Typography Usage

| Element | Token | Tailwind |
|---------|-------|----------|
| Page title | Display M | `text-2xl sm:text-3xl font-semibold` |
| Page subtitle | Body M | `text-sm text-muted-foreground` |
| Section heading | Heading L | `text-2xl font-semibold` |
| Filter section label | Body M, medium | `text-sm font-medium` |
| Filter section overline | Overline | `text-xs font-semibold uppercase tracking-widest text-muted-foreground` |
| Filter option labels | Body M | `text-sm` |
| Active chip text | Body M | `text-sm` |
| Result count | Body M, muted | `text-sm text-muted-foreground` |
| Sort label | Body M | `text-sm` |
| "Load More" button | Body M, medium | `text-sm font-medium` |
| Browse tab labels | Body M, medium | `text-sm font-medium` |

---

## 9. Loading States

### 9.1 Wine Grid Skeleton

When the grid is loading (initial load or filter change), show skeleton cards that match the WineCard shape exactly.

```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
  {Array.from({ length: 12 }).map((_, i) => (
    <div key={i} class="rounded-lg border border-border overflow-hidden">
      <Skeleton class="aspect-[3/4] w-full" />
      <div class="p-4 space-y-2">
        <Skeleton class="h-3 w-24" />       <!-- producer overline -->
        <Skeleton class="h-5 w-3/4" />      <!-- wine name -->
        <Skeleton class="h-4 w-1/2" />      <!-- varietal -- region -->
        <Skeleton class="h-5 w-16" />       <!-- price -->
        <Skeleton class="h-8 w-full" />     <!-- story hook (2 lines) -->
        <Skeleton class="h-3 w-28" />       <!-- availability -->
      </div>
    </div>
  ))}
</div>
```

### 9.2 Filter Sidebar Skeleton

```html
<div class="w-60 space-y-6">
  <Skeleton class="h-4 w-16" />            <!-- "Filters" label -->
  <div class="space-y-3">
    <Skeleton class="h-4 w-24" />           <!-- Section label -->
    <Skeleton class="h-4 w-full" />
    <Skeleton class="h-4 w-full" />
    <Skeleton class="h-4 w-3/4" />
  </div>
  <div class="space-y-3">
    <Skeleton class="h-4 w-20" />
    <Skeleton class="h-8 w-full" />         <!-- Slider -->
  </div>
</div>
```

### 9.3 Category Card Skeleton

```html
<div class="rounded-lg border border-border overflow-hidden">
  <Skeleton class="aspect-[16/9] w-full" />
  <div class="p-4 space-y-1">
    <Skeleton class="h-5 w-24" />
    <Skeleton class="h-4 w-16" />
  </div>
</div>
```

### 9.4 Stagger Animation on Load

Wine cards stagger in with 50ms delay per card, max 10 cards animated (rest appear instantly). Uses Framer Motion:

```tsx
<motion.div
  variants={{
    hidden: {},
    visible: { transition: { staggerChildren: 0.05 } }
  }}
  initial="hidden"
  animate="visible"
>
  {wines.map((wine, i) => (
    <motion.div
      key={wine.id}
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.25 }}
      // Items beyond 10 appear instantly
      {...(i >= 10 ? { initial: "visible" } : {})}
    >
      <WineCard wine={wine} />
    </motion.div>
  ))}
</motion.div>
```

---

## 10. Pagination

### 10.1 Load More Pattern

Consumer browse uses cursor-based "Load More" -- not infinite scroll (too easy to lose position), not numbered pages (content is dynamically ranked).

```html
<div class="flex justify-center py-8">
  <Button variant="outline" onClick={loadMore} disabled={!hasMore || isLoading}>
    {isLoading ? (
      <>
        <Loader2 class="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </>
    ) : hasMore ? (
      `Show more wines (${remaining} remaining)`
    ) : (
      'You have seen all the wines'
    )}
  </Button>
</div>
```

### 10.2 Page Size

- Default page size: 24 wines
- Subsequent loads: 24 wines per "Load More" click
- Maximum before suggesting filter refinement: 120 wines (show a message encouraging filters)

---

## 11. Accessibility Notes

### 11.1 Keyboard Navigation

- Tab order: Search input -> Browse tabs -> Filter chips -> Sort dropdown -> Wine cards -> Load More
- Filter sidebar: Tab enters the sidebar, arrow keys navigate within radio groups
- Filter chips: Each chip is focusable, Enter/Space removes the filter
- Wine cards: Each card is a focusable link, Enter navigates to wine detail
- Command Palette (`Cmd+K`) accessible from any point on the page

### 11.2 ARIA Attributes

- Filter sidebar: `aria-label="Wine filters"`
- Filter sections: Use `fieldset` + `legend` (already implemented)
- Active filter chips: `role="list"` container with `role="listitem"` on each chip
- Wine grid: `role="list"` on the grid container, `role="listitem"` on each card wrapper
- Sort dropdown: `aria-label="Sort wines by"`
- Result count: `aria-live="polite"` so screen readers announce count changes
- Mobile filter trigger: `aria-expanded` reflects sheet state, `aria-controls` points to sheet content

### 11.3 Color and Contrast

- All filter labels meet 4.5:1 contrast against background
- Active filter chips: primary text on primary/10 background meets AA
- Availability indicator: text accompanies color dot (never color-only)
- Focus rings visible on all interactive elements: `ring-2 ring-ring ring-offset-2`

### 11.4 Screen Reader Announcements

- When filters change: announce result count via `aria-live="polite"` region
- When "Load More" completes: announce "N more wines loaded, M total"
- Search suggestions: `aria-live="polite"` on the suggestion list

---

## 12. Error States

### 12.1 Filter Load Error

If filter options fail to load, show the wine grid without the filter sidebar and an inline alert:

```html
<Alert variant="info" class="mb-4">
  <AlertCircle class="h-4 w-4" />
  <AlertTitle>Filters unavailable right now</AlertTitle>
  <AlertDescription>
    You can still browse wines below. Filters will be back shortly.
    <Button variant="link" class="p-0 h-auto" onClick={retry}>Try again</Button>
  </AlertDescription>
</Alert>
```

### 12.2 Wine Grid Load Error

If the wine grid fails to load, show in the content area:

```html
<div class="flex flex-col items-center justify-center py-16 text-center">
  <AlertCircle class="h-12 w-12 text-muted-foreground mb-4" />
  <h2 class="text-lg font-medium mb-2">Something went wrong</h2>
  <p class="text-sm text-muted-foreground mb-6">
    We could not load wines right now. This is usually temporary.
  </p>
  <Button variant="primary" onClick={retry}>Try again</Button>
</div>
```

### 12.3 Next.js error.tsx

The browse route has its own `error.tsx` boundary that catches unexpected errors and provides the recovery UI above with a "Try again" button that calls `reset()`.
