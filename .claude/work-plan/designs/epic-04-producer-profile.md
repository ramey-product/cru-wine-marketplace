# Epic 04 — Producer Profile Page UX Spec

> **Route**: `/producers/[slug]`
> **Story**: EPIC-04/STORY-08
> **Reference**: UX Design Bible Sections 5, 9, 12
> **Status**: Active — engineering scaffold complete

---

## 1. Page Structure

```
ProducerProfilePage (Server Component)
  ├── Breadcrumbs: Home > Producers > {Name}
  ├── ProducerHero (hero image, name, location, tagline)
  ├── ProducerStoryLayout (two-column grid)
  │   ├── ProducerStory (rich text, left column)
  │   └── ProducerQuickFacts (sidebar card, right column)
  ├── PhotoGallery (horizontal scroll with snap)
  └── ProducerWineGrid (wine card grid)
```

---

## 2. Hero Section

### Desktop (lg+)
- Full-width image: `aspect-[21/9]`, `max-h-[420px]`, `object-cover`, `rounded-lg`
- Below: producer name (`font-display text-4xl font-bold`), location, tagline in `max-w-3xl`
- Spacing: `space-y-6` between image and text

### Mobile (<md)
- Image: `aspect-video` (16:9)
- Name: `text-3xl` (scaled down)
- Full width with `px-4`

### No-Image Fallback
- Warm gradient: `bg-gradient-to-br from-muted to-muted/60`
- Centered Mountain icon: `w-16 h-16 text-muted-foreground/40`

### Accessibility
- `<h1>` = producer name (one per page)
- Image alt: `"{Name} vineyard"`
- Fallback icon: `aria-hidden="true"`

---

## 3. Story + Quick Facts Layout

### Desktop (lg+)
- Two-column grid: `lg:grid lg:grid-cols-[1fr_280px] lg:gap-10`
- Story (left): prose rendering with `prose-stone dark:prose-invert`
- Quick Facts (right): sticky sidebar `sticky top-24`

### Mobile (<md)
- Single column, stacked: Story first, Quick Facts below
- Quick Facts gets full width

### Story Content
- Markdown rendering via `react-markdown` or paragraph splitting
- Typography: `text-base leading-relaxed text-foreground/80`
- Section heading: "The Story" — `text-2xl font-semibold`

### Story Empty State
```
┌─────────────────────────────────────────┐
│  [BookOpen icon, muted]                 │
│  "This producer's story is coming soon."│
│  "Great wines are made by great         │
│   people — stay tuned."                 │
└─────────────────────────────────────────┘
```
- Style: `border-dashed border-border bg-muted/30 p-8 text-center rounded-lg`

### Quick Facts Card
- Card: `rounded-lg border bg-card p-5 space-y-5`
- Each fact: icon (`h-4 w-4 text-muted-foreground`) + label (`text-xs text-muted-foreground`) + value (`text-sm font-medium`)
- Farming practice badges: `text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary`
- Heading: `text-sm font-semibold uppercase tracking-widest text-muted-foreground`

---

## 4. Photo Gallery

### Scroll Behavior
- Container: `flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4`
- Photo: `flex-shrink-0 snap-start w-72 sm:w-80 aspect-[4/3] object-cover rounded-lg`
- Caption: `text-sm text-muted-foreground mt-2`
- Section heading: "From the Vineyard" — `text-2xl font-semibold`

### Empty State
- Hidden entirely when no photos (admin CMS prompts uploads)

### Accessibility
- Container: `role="region"` with `aria-label="Photo gallery for {name}"`
- Each image: descriptive alt from caption or `"{Name} photo {n}"`

---

## 5. Wine Portfolio Grid

### Grid Configuration
| Breakpoint | Columns | Gap |
|------------|---------|-----|
| Mobile | 2 | `gap-4` |
| sm (640px) | 3 | `gap-4` |
| lg (1024px) | 4 | `gap-4` |

### Section Heading
- "The Wines (12)" — count in `text-muted-foreground`

### Card Modifications
- Hide producer name (redundant on producer page)
- Show story hook and availability indicator

### Wine Empty State
```
┌──────────────────────────────────────┐
│  [Wine icon, muted]                  │
│  "No wines available yet"            │
│  "We're working with this producer   │
│   to bring their wines to Cru."      │
└──────────────────────────────────────┘
```

---

## 6. Page Spacing

```
Breadcrumbs → space-y-6 → Hero → space-y-10 → Story + Facts
→ space-y-10 → Photo Gallery → space-y-10 → Wine Grid → pb-16
```

---

## 7. Loading / Error / Not Found States

**Loading**: Shape-matching skeleton mirroring hero + story + grid layout
**Error**: "Something went wrong" with Try Again + Browse Producers CTAs
**Not Found**: "This producer may have moved. Explore other producers on Cru."

---

## 8. Metadata

```tsx
title: `${producer.name} | Cru`
description: producer.tagline ?? `Discover wines from ${producer.name} on Cru.`
openGraph.type: 'website'
openGraph.url: `https://cru.wine/producers/${producer.slug}`
openGraph.images: hero_image_url (1200×675)
```
