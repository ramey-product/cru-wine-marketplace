# Taste Profile Onboarding — UX Design Spec

> **Route**: `/onboarding/taste-profile`
> **Story**: EPIC-03/STORY-05
> **Reference**: UX Design Bible Sections 5, 7, 9, 10, 11
> **Status**: Active — engineering scaffold complete

---

## 1. Overview

The taste profile onboarding is a 5-screen conversational flow that transforms a new user into a known palate. It is the single most important UX moment in Cru — the "aha moment" where users feel understood. The flow must feel like a conversation with a knowledgeable wine friend, not a registration form.

### Design Principles
- **One question per screen** — progressive disclosure, never a long form
- **Touch-first** — tag tapping, not hover menus
- **Forgiving** — every selection is editable later via settings
- **Skippable** — visible but not prominent skip option on every screen

---

## 2. Flow Architecture

```
Screen 1: Wine Types        →  "What kinds of wine do you enjoy?"
Screen 2: Flavor Affinities →  "What flavors speak to you?"
Screen 3: Regions           →  "Any regions you're drawn to?"
Screen 4: Adventurousness   →  "How adventurous are you?"
Screen 5: Profile Summary   →  "Here's what we think you'll love"
```

### Progress Indicator

Dot-based stepper at the top of each screen:

- Active/Completed: `bg-primary` (wine-berry), `h-2 w-2 rounded-full`
- Upcoming: `bg-muted`
- Container: `flex gap-2 justify-center py-4`

---

## 3. Screen Layouts

### Screen 1: Wine Types

```
┌─────────────────────────────────────┐
│           ●  ○  ○  ○  ○            │
│                                     │
│   What kinds of wine do you enjoy?  │
│   Pick all that apply.              │
│                                     │
│   ┌─────────┐  ┌─────────┐         │
│   │  Red    │  │  White  │         │
│   └─────────┘  └─────────┘         │
│   ┌─────────┐  ┌─────────┐         │
│   │  Rosé   │  │Sparkling│         │
│   └─────────┘  └─────────┘         │
│   ┌─────────┐  ┌─────────┐         │
│   │  Orange │  │  Dessert│         │
│   └─────────┘  └─────────┘         │
│                                     │
│          [ Continue → ]             │
│            Skip for now             │
└─────────────────────────────────────┘
```

**Type Cards:**
- Grid: `grid grid-cols-2 gap-3` (mobile), `grid-cols-3 gap-4` (desktop)
- Card: `rounded-lg border-2 p-4 cursor-pointer transition-all duration-150`
- Unselected: `border-border bg-card hover:border-primary/30`
- Selected: `border-primary bg-primary/5 ring-1 ring-primary/20`
- Touch target: minimum 44×44px

### Screen 2: Flavor Affinities

**Tag Pills by Category:**
- Category heading: `text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2`
- Categories: Fruit, Earth & Spice, Rich & Sweet, Fresh & Light
- Tag: `px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-all duration-150`
- Unselected: `bg-muted text-muted-foreground hover:bg-muted/80`
- Selected: `bg-primary text-primary-foreground`
- "Not sure" option: `border-dashed border-2 border-border bg-transparent`
- Selection counter: `text-sm text-muted-foreground`, turns `text-primary` at 3-8
- Min/max: 3-8 selections

### Screen 3: Regions

Same tag pill pattern as Screen 2. Grouped by: France, Italy, Americas, Rest of World.
No min/max selection. "I'm open to anything!" special option.

### Screen 4: Adventurousness

**Segmented Cards (Radio Group):**
- Three options: Comfort Zone / Balanced / Adventurous
- Card: `rounded-lg border-2 p-4 cursor-pointer transition-all`
- Unselected: `border-border bg-card`
- Selected: `border-primary bg-primary/5`
- Single selection only (radio behavior)
- Each card: icon + title (`font-semibold`) + description (`text-sm text-muted-foreground`)

### Screen 5: Profile Summary

**Summary Card:**
- Container: `rounded-lg bg-muted/30 border border-border p-6`
- Summary text: `text-base leading-relaxed text-foreground/80`
- Generated dynamically from selections

**Actions:**
- "Looks right!": Primary button
- "Not quite — let me tweak": Secondary/outline, navigates back to Screen 1

**First Picks:**
- Horizontal scroll: `flex gap-4 overflow-x-auto snap-x`
- Standard WineCard components
- 4 visible desktop, ~1.5 mobile (peek pattern)

---

## 4. Responsive Breakpoints

| Element | Mobile (<640px) | Tablet (768px+) | Desktop (1024px+) |
|---------|----------------|-----------------|-------------------|
| Container | Full width, px-4 | max-w-lg mx-auto | max-w-xl mx-auto |
| Type cards | 2 columns | 3 columns | 3 columns |
| Tag pills | flex-wrap | flex-wrap | flex-wrap |
| Adventure cards | Full width | max-w-md | max-w-md |
| Summary recs | H-scroll | H-scroll | 4-col grid |

---

## 5. Animations

- **Screen entry**: Slide from right, `duration-300 ease-out`
- **Screen exit**: Slide to left, `duration-200 ease-in`
- **Tag selection**: Scale pop `scale-95 → scale-100`, `duration-150`
- **Progress dots**: Fill animation, `duration-200`

---

## 6. Accessibility

- **Tag pills**: `role="checkbox"`, `aria-checked`, Space/Enter toggle
- **Adventure cards**: `role="radiogroup"` with `role="radio"`
- **Progress**: `role="progressbar"`, `aria-valuenow`, `aria-valuemax="5"`
- **Focus**: On screen transition, focus moves to heading
- **Touch targets**: 44×44px minimum
- **Contrast**: WCAG 2.1 AA (4.5:1 body, 3:1 large text)

---

## 7. State Management

- React context persists across all 5 screens
- Back navigation preserves selections
- "Not quite" returns to Screen 1 with state intact
- "Looks right!" triggers Server Action → redirect to home
- No localStorage — state lost on navigation away (intentional)
