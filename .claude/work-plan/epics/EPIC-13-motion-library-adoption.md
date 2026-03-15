# EPIC-13: Motion Library Adoption

**Priority:** P1 — Post-Launch Polish
**Source PRD:** PRD-13 (Motion Library Adoption)
**Depends On:** EPIC-10 (Commerce Flow — initial Motion adoption, reference implementations)

---

## Problem Statement

The platform currently uses four different animation approaches: CSS transitions, `tailwindcss-animate` plugin, CSS `@keyframes`, and Motion (in 4 components from EPIC-10). This fragmentation produces inconsistent motion language, missing exit animations, and untapped interaction potential. This epic systematically enhances every animation touchpoint with Motion's full capabilities — springs, gestures, layout animations, and coordinated sequences — while establishing a single animation standard for all future development.

---

## Stories

### STORY 13/01: Animation Foundation & Shared Presets
**Points:** 3 | **Assignee:** fullstack-1

**What:** Create the shared animation infrastructure that all subsequent stories build on.

**Build:**
1. **Presets file** (`lib/motion/presets.ts`):
   - Named spring configs: `snappy` (stiffness 400, damping 25), `gentle` (stiffness 200, damping 20), `bouncy` (stiffness 300, damping 10)
   - Named variants: `fadeSlide` (opacity 0→1, y 16→0), `scaleIn` (scale 0.95→1, opacity 0→1), `fadeIn` (opacity 0→1)
   - Stagger helper: `staggerChildren(delay)` returns parent variant with `staggerChildren` transition
   - Duration tokens mapped from CSS variables: `fast` (100ms), `normal` (200ms), `slow` (350ms)

2. **Accessibility hook wrapper** (`lib/motion/use-safe-animation.ts`):
   - `useSafeAnimation()` — returns animation props with `useReducedMotion()` applied
   - When reduced motion: all springs become `duration: 0`, all delays become 0
   - Components import from here instead of calling `useReducedMotion()` directly

3. **Audit and document** existing 4 Motion components (from EPIC-10) to verify they follow the new presets pattern. Refactor if needed to use shared presets.

**Acceptance Criteria:**
- [ ] `lib/motion/presets.ts` exports named springs, variants, and stagger helper
- [ ] `lib/motion/use-safe-animation.ts` exports accessibility-aware hook
- [ ] Existing EPIC-10 Motion components refactored to use shared presets
- [ ] All presets documented with usage examples in code comments
- [ ] Build passes with no bundle size regression > 2KB

---

### STORY 13/02: WineCard Hover & Lift Enhancement
**Points:** 2 | **Assignee:** fullstack-4

**What:** Replace CSS transition hover effects on WineCard with spring-based Motion animations.

**Build:**
1. Card container: Replace `hover:shadow-md hover:-translate-y-0.5 transition-all duration-200` with `motion.div` using `whileHover={{ y: -2, boxShadow: '...' }}` with `snappy` spring
2. Wine image: Replace `group-hover:scale-105 transition-transform duration-300` with `motion.div` using `whileHover={{ scale: 1.05 }}` with `gentle` spring — image scale feels more natural with spring return
3. Apply same pattern to `RecommendationCard` and `CollectionWineCard` (identical hover patterns)
4. Respect `useReducedMotion()` — hover effects become instant with no spring overshoot

**Acceptance Criteria:**
- [ ] WineCard hover uses spring physics (bouncy return to rest)
- [ ] Image zoom uses spring (natural deceleration)
- [ ] RecommendationCard and CollectionWineCard match WineCard pattern
- [ ] Reduced motion: hover effects apply instantly, no spring
- [ ] No layout shift during hover (use `transform` only)

---

### STORY 13/03: Sheet & Dialog Enter/Exit Animations
**Points:** 5 | **Assignee:** fullstack-1

**What:** Replace CSS `data-*` animations on Shadcn Sheet and Dialog with Motion `AnimatePresence` for smoother, spring-based enter/exit.

**Build:**
1. **MotionSheet wrapper** (`components/ui/motion-sheet.tsx`):
   - Composes Radix Sheet primitives (keeps all accessibility)
   - Overlay: Motion fade in/out (opacity 0→0.5, duration 200ms)
   - Content: Motion slide + fade with `gentle` spring (side-aware: right slides from x:40, bottom slides from y:100%, etc.)
   - Exit: reverse of enter, slightly faster (damping increased)

2. **MotionDialog wrapper** (`components/ui/motion-dialog.tsx`):
   - Composes Radix Dialog primitives
   - Overlay: Motion fade in/out
   - Content: `scaleIn` variant with `gentle` spring (scale 0.95→1, opacity 0→1)
   - Exit: scale 0.95 + fade out, duration-based (150ms)

3. **Migration:** Update all Sheet/Dialog usages across the app to use Motion variants:
   - `RetailerSelectionSheet` → MotionSheet
   - `CommerceHubSheet` → MotionSheet
   - Any Dialog instances → MotionDialog

4. Keep original `sheet.tsx` and `dialog.tsx` for fallback — don't delete

**Acceptance Criteria:**
- [ ] Sheets slide in with spring physics (slight overshoot on open)
- [ ] Sheets slide out smoothly (no instant vanish)
- [ ] Dialogs scale in with spring, fade out on close
- [ ] All accessibility maintained (focus trap, aria, keyboard dismiss)
- [ ] Reduced motion: instant show/hide, no animation
- [ ] Original Shadcn components preserved as fallback

---

### STORY 13/04: Wine Grid Stagger & Filter Transitions
**Points:** 3 | **Assignee:** fullstack-4

**What:** Add staggered entry animations to wine grid cards on page load and filter changes.

**Build:**
1. Wrap wine grid in `motion.div` with `staggerChildren` variant
2. Each `WineCard` wrapped in `motion.div` with `fadeSlide` variant (opacity 0→1, y 16→0)
3. Stagger delay: 50ms between cards, max 400ms total (cap at 8 cards)
4. On filter change: `AnimatePresence` exits old cards, enters new with stagger
5. First paint: no animation (cards render instantly on SSR hydration). Stagger only on client-side navigation or filter application.
6. Use `layout` prop on card wrappers for smooth position changes when grid reflows

**Acceptance Criteria:**
- [ ] Cards stagger in on client navigation (50ms between cards)
- [ ] Filter changes animate old cards out, new cards in
- [ ] SSR first paint is instant (no flash of animation)
- [ ] Layout reflow (e.g., column count change on resize) is smooth
- [ ] Reduced motion: all cards appear instantly
- [ ] No perceptible performance impact on grid with 20+ cards

---

### STORY 13/05: Toast & Notification Animations
**Points:** 2 | **Assignee:** fullstack-2

**What:** Add enter/exit animations to toast notifications.

**Build:**
1. Toast enter: slide in from right (desktop) or bottom (mobile) with `snappy` spring + opacity fade
2. Toast exit: slide out + fade with duration-based exit (150ms)
3. Stack management: `layout` prop on each toast for smooth reposition when toasts above dismiss
4. Use `AnimatePresence` with `mode="popLayout"` for smooth stack reflow
5. Integrate with existing toast system (Sonner or custom)

**Acceptance Criteria:**
- [ ] Toasts slide in with spring physics
- [ ] Toasts slide out smoothly on dismiss or timeout
- [ ] Multiple toasts reflow smoothly when one dismisses
- [ ] Reduced motion: instant show/hide
- [ ] Touch: swipe-to-dismiss on mobile

---

### STORY 13/06: Dropdown & Accordion Spring Animations
**Points:** 3 | **Assignee:** fullstack-2

**What:** Replace CSS `data-*` animations on dropdowns and accordions with Motion springs.

**Build:**
1. **MotionDropdownMenu** (`components/ui/motion-dropdown.tsx`):
   - Content: `scaleIn` variant with origin matching trigger position
   - Exit: scale 0.95 + fade (duration 100ms)
   - Items: subtle `fadeSlide` stagger (30ms between items)

2. **Accordion** enhancement:
   - Replace `accordion-down`/`accordion-up` CSS keyframes with Motion `animate={{ height: 'auto' }}`
   - Spring-based height animation (no jarring linear ease)
   - Chevron rotation: `motion.div` with `rotate` animation synced to open state

3. Migrate all dropdown and accordion usages

**Acceptance Criteria:**
- [ ] Dropdowns open with scale spring from trigger origin
- [ ] Dropdown items stagger in subtly (30ms)
- [ ] Accordions expand/collapse with spring-based height
- [ ] Chevron rotation is smooth and synced
- [ ] Reduced motion: instant expand/collapse
- [ ] Original components preserved as fallback

---

### STORY 13/07: Scroll-Triggered Section Reveals
**Points:** 3 | **Assignee:** fullstack-3

**What:** Add viewport-triggered entry animations to home feed sections.

**Build:**
1. Create `MotionSection` wrapper component using Motion's `whileInView`
2. Animation: `fadeSlide` variant (opacity 0→1, y 24→0) with `gentle` spring
3. `viewport={{ once: true, amount: 0.2 }}` — triggers when 20% visible, only once
4. Apply to home feed sections: PopularNearYou, RecommendationCarousel, CuratedCollectionsRow, etc.
5. First section (above fold): no animation, instantly visible
6. Stagger children within section if applicable (e.g., grid cards)

**Acceptance Criteria:**
- [ ] Sections below fold animate in on scroll
- [ ] Above-fold content loads instantly (no animation)
- [ ] Each section animates only once (not on scroll back up)
- [ ] Animations feel natural and not distracting
- [ ] Reduced motion: all sections visible immediately
- [ ] No scroll jank — animations are GPU-composited

---

### STORY 13/08: Cart Layout Animations
**Points:** 3 | **Assignee:** fullstack-1

**What:** Add layout animations to cart items for smooth add/remove/reorder transitions.

**Build:**
1. Each `CartItem` wrapped in `motion.div` with `layout` prop
2. Item removal: `AnimatePresence` exit animation (slide left + fade, 200ms)
3. Item addition: enter animation (slide in from right + fade, snappy spring)
4. Remaining items: smooth position transition via `layout` (items below slide up to fill gap)
5. Cart total: `AnimatePresence mode="wait"` for number change (already partially done in StickyCartBar, extend to full cart page)

**Acceptance Criteria:**
- [ ] Removing a cart item: item slides out, remaining items reflow smoothly
- [ ] Adding an item: new item slides in with spring
- [ ] Position changes during reflow use layout animation
- [ ] Reduced motion: instant add/remove with no movement
- [ ] Works correctly with optimistic updates (no animation flash on rollback)

---

### STORY 13/09: Image Gallery Gesture Animations
**Points:** 5 | **Assignee:** fullstack-3

**What:** Add gesture-driven swipe navigation to wine detail image galleries.

**Build:**
1. `motion.div` with `drag="x"` for horizontal swipe
2. Snap points at each image position, momentum-based scrolling
3. Swipe velocity threshold: > 500px/s triggers next/prev even without full swipe
4. Spring-based snap back to nearest image
5. Pagination dots: `layout` animation on active indicator
6. Pinch-to-zoom: `motion.div` with `drag` + scale gesture (stretch goal)

**Acceptance Criteria:**
- [ ] Swipe left/right navigates between images
- [ ] Momentum-based: fast swipe advances even from small drag
- [ ] Spring snap to nearest image (no hard stops)
- [ ] Active pagination dot slides with layout animation
- [ ] Touch and mouse drag both supported
- [ ] Reduced motion: swipe still works but snap is instant (no spring)

---

### STORY 13/10: Nav Island Wing Transition Animations
**Points:** 3 | **Assignee:** fullstack-1

**What:** Enhance MobileNavIsland wing transitions with directional crossfades, background color interpolation, and micro-interactions.

**Build:**
1. **Mode swap crossfade (cart ↔ order):** When cart clears after order placement and the wing transitions from cart mode to order tracking mode, animate with directional slide — cart exits left (x: -20, opacity: 0, 150ms), order enters from right (x: 20→0, opacity: 0→1, 200ms). Use `AnimatePresence mode="wait"` with keyed content.
2. **Background color interpolation:** Animate the wing container background from `primary` to `emerald-700` over ~400ms during cart→order transition using Motion's `animate` with color values rather than instant class swap.
3. **Order status text transition:** When order status updates in real-time (e.g., "Being prepared" → "Ready for pickup"), animate the status label with slide-up/fade (same pattern as cart price counter: y: -8→0, opacity: 0→1).
4. **Track/View Cart CTA micro-bounce:** Add `whileTap={{ scale: 0.97 }}` to both CTAs (matching BuyButton pattern).
5. **Wing entrance content stagger:** On initial wing appearance, stagger internal elements (dot → status text → retailer → CTA) with 50ms intervals for a polished reveal.

**Acceptance Criteria:**
- [ ] Cart→order wing transition uses directional slide crossfade
- [ ] Background color morphs smoothly between primary and emerald
- [ ] Status text updates animate (not instant swap)
- [ ] CTAs have press feedback (scale 0.97)
- [ ] Reduced motion: all transitions are instant
- [ ] No layout shift during mode swap
- [ ] Works correctly on rapid cart clear + order placement sequence

---

### STORY 13/11: Mobile Tab Bar Active Indicator
**Points:** 2 | **Assignee:** fullstack-4

**What:** Add a spring-animated active indicator to the MobileNavIsland tab row.

**Build:**
1. Active tab indicator (bottom border or background pill): `motion.div` with `layoutId="activeTab"`
2. Indicator slides between tabs with `snappy` spring
3. Tab icon: `motion.div` with subtle `whileTap={{ scale: 0.9 }}` for press feedback
4. Active icon: slight scale up (1.05) with spring transition

**Acceptance Criteria:**
- [ ] Active indicator slides smoothly between tabs
- [ ] Spring physics on indicator movement (slight overshoot)
- [ ] Tab icons have press feedback
- [ ] Reduced motion: indicator jumps instantly between tabs
- [ ] No layout shift — indicator is absolutely positioned

---

### STORY 13/12: Loading Skeleton Enhancement
**Points:** 2 | **Assignee:** fullstack-4

**What:** Evaluate and enhance loading skeletons with Motion shimmer.

**Build:**
1. Evaluate: compare Motion shimmer vs. current CSS `animate-pulse` for visual quality and performance
2. If Motion shimmer is better: create `MotionSkeleton` component with gradient animation
3. If CSS pulse is equivalent: keep CSS approach, document decision
4. Regardless: add `AnimatePresence` exit animation to skeletons — fade out when content loads (currently, content just pops in over the skeleton)

**Acceptance Criteria:**
- [ ] Skeletons have exit animation when content loads (fade out)
- [ ] Shimmer approach chosen based on quality + performance evaluation
- [ ] Decision documented in component comments
- [ ] Reduced motion: skeletons are static gray, instant swap to content

---

## Review Notes

### UX Review Required
Stories 13/02 (WineCard hover), 13/03 (Sheet/Dialog), 13/04 (Grid stagger), 13/07 (Scroll reveals), 13/09 (Gallery gestures), and 13/10 (Tab bar) require UX agent review for:
- Spring tuning (stiffness/damping values)
- Animation duration appropriateness
- Gesture thresholds
- Interaction pattern consistency

### Frontend Lead Review Required
All stories require Frontend Lead review for:
- Bundle size impact per story
- Performance on low-end devices
- Shadcn/UI wrapper pattern correctness
- Shared preset API design (Story 13/01)
- `layout` prop performance implications (Stories 13/04, 13/05, 13/08)

---

## Execution Order

1. **13/01** (Foundation) — must be first, all others depend on it
2. **13/03** (Sheet/Dialog) — highest UX impact, most components affected
3. **13/02** (WineCard hover) — visible on every browse page
4. **13/04** (Grid stagger) — visible on every wine grid
5. **13/08** (Cart layout) — completes the commerce animation story
6. **13/10** (Nav Island wing transitions) — polishes the new island UX
7. **13/05** (Toasts) — system-wide improvement
8. **13/06** (Dropdown/Accordion) — component-level polish
9. **13/07** (Scroll reveals) — home feed enhancement
10. **13/11** (Tab bar active indicator) — mobile navigation polish
11. **13/12** (Skeletons) — loading state polish
12. **13/09** (Gallery gestures) — most complex, can be deferred

Total estimated points: **36**

---

### UX Design Review

**Reviewer:** UX/UI Design Lead
**Date:** 2026-03-14
**Status:** Approved with recommendations

#### Spring Preset Tuning
- **Snappy (400/25)** — Approved. Settles in ~200-250ms with minimal overshoot. Good for buttons/toggles.
- **Gentle (200/20)** — Approved. For exits, increase damping to 28 (exits should feel slightly faster than entries).
- **Bouncy (300/10)** — Use sparingly (celebration moments only). Add `lively` preset (350/18) for energy without bounce (tab bar, etc.).
- **Add `subtle` preset** (500/30) — Nearly invisible spring for micro-interactions (hover returns, press feedback). Settles <150ms with no overshoot. Should be the default for most hover/press feedback.
- **Add named exit presets** — `exitFade` (0.15s ease-out) and `exitQuick` (0.1s ease-out) to prevent hardcoded durations across files.

#### Animation Principles — Additions
- **Principle 6: Directional consistency.** Elements exit in the direction they entered or in the direction of user intent. Swiped items exit in swipe direction.
- **Principle 7: No animation on first paint.** SSR content appears instantly. Only subsequent interactions animate.

#### Story-Specific Notes
- **13/02 (WineCard):** Verify `overflow-hidden` on image container to prevent scale overflow.
- **13/03 (Sheet/Dialog):** Critical: coordinate Radix portal unmount with Motion exit timing. Test rapid open/close.
- **13/04 (Grid Stagger):** Prefer per-row stagger (80ms between rows, 0ms within row) over per-card wave. Alternative: reduce to 30ms/card with 6-card cap.
- **13/06 (Accordion):** Spring height animation can overshoot on tall panels (500px+). Use duration-based for panels >200px expanded height.
- **13/07 (Scroll Reveals):** Reduce y from 24 to 16. Add scroll velocity check (>1500px/s = skip animation).
- **13/09 (Gallery):** Add minimum drag distance (20% container width) as alternative to velocity threshold.
- **13/10 (Tab Bar):** Reduce `whileTap` scale from 0.9 to 0.92 for subtlety.
- **13/11 (Skeletons):** Keep CSS `animate-pulse` for shimmer (compositor thread). Use Motion only for skeleton-to-content exit crossfade.

#### Over-Animation Risk
- Schedule a full-flow animation review after stories 13/01–13/08. Test: browse → add to cart → checkout. If UI feels like it's "performing" rather than "responding," dial back.
- The `subtle` preset is the key guardrail — most hover/press interactions should use it.

#### Missing Patterns
- Standardize `AnimatedNumber`/`NumberTransition` component in 13/01 presets (reusable for cart totals, counts, prices).
- Skeleton-to-content crossfade should overlap (content starts fading in 50ms before skeleton finishes fading out).

#### Acceptance Criteria Additions (All Stories)
- [ ] Animations are GPU-composited (transform/opacity only)
- [ ] No animation plays during SSR hydration
- [ ] Component works identically with Motion removed (graceful degradation)

---

### Frontend Lead Review

**Reviewer:** fullstack-1 (Lead Full Stack Developer)
**Date:** 2026-03-14
**Verdict:** Approve with required changes before implementation begins

#### Critical Issue: Base UI, Not Radix

The project uses `@base-ui/react` v1.3.0, not Radix. All Shadcn/ui components are built on Base UI. This changes the wrapper pattern for Stories 13/03 and 13/06:

- Base UI uses CSS-based animations via `data-starting-style`/`data-ending-style` and manages its own mount/unmount lifecycle through `keepMounted` and CSS transition detection.
- The wrapper pattern described in 13/03 will fight Base UI's animation system. If you add Motion animations AND Base UI still has its CSS transition classes, you get competing systems.

**Required approaches:**
1. Use `keepMounted` on Base UI portals and let Motion handle all enter/exit via `AnimatePresence`, stripping CSS transition classes.
2. Fork Shadcn/ui components and replace CSS animation classes with Motion equivalents inline, using `data-open`/`data-closed` as triggers.
3. Evaluate whether CSS `data-starting-style` animations are good enough (Sheet benefits from spring physics; Dialog's current zoom/fade may be sufficient).

**Recommendation:** Approach 2 for Sheet, Approach 3 for Dialog. Update all "Radix" references to "Base UI."

#### Bundle Size: Revised Target

The 15KB target is misleading. Realistic totals:
- Motion core (`motion.div` + `AnimatePresence` + `useReducedMotion`): ~16-18KB gzipped (already loaded from EPIC-10)
- `layout` prop module: +4-6KB (first use in 13/04 or 13/08)
- `drag` gesture module: +3-4KB (first use in 13/09)
- **Realistic total: 20-28KB gzipped**

**Required fix:** Per-story incremental budget approach:
- Stories using core only: 0-2KB incremental
- First `layout` story: ~5KB step increase
- First `drag` story: ~4KB step increase
- **Total budget: <30KB gzipped cumulative**

#### `layout` Prop Performance Warning

**Remove `layout` from Story 13/04 (Wine Grid).** On a grid with 20+ cards, `layout` triggers layout projection recalculations on every reflow, causing multi-frame layout thrash. Replace with: "Grid reflow uses `AnimatePresence` for enter/exit only; position changes are instant."

`layout` is appropriate for 13/05 (Toast, 1-3 items) and 13/08 (Cart, 3-10 items).

#### RSC Boundary Correctness
- **13/07 (Scroll Reveals):** `MotionSection` must accept children as a thin client wrapper. Server-rendered children passed to a client component remain server components.
- **13/11 (Skeleton Exit):** `AnimatePresence` around skeletons conflicts with `loading.tsx` (server component). Scope to client-side loading states only.

#### Presets API Refinements
1. **Drop `useSafeAnimation()` hook** — over-abstracted. Keep presets as plain objects, use `useReducedMotion()` directly, add a `reduceMotion()` utility.
2. **Drop duration tokens** — they encourage duration-based thinking when this epic is about springs.
3. **Stagger helper is fine** as described.

#### Story Point Adjustments
- **13/03:** Increase to 8 points (Base UI complication)
- **13/05:** If toast system doesn't exist yet, increase to 5 points
- **13/06:** If accordion doesn't exist yet, increase to 5 points or split scope
- **Adjusted total:** 38-41 points depending on scope clarifications

#### Story Split/Combine Recommendations
- Split **13/03** into 13/03a (MotionSheet, 5pt) and 13/03b (MotionDialog, 3pt)
- Split **13/06** into 13/06a (Dropdown, 2pt) and 13/06b (Accordion, 3pt, blocked on component creation)
- Combine **13/02 + 13/10** (both fullstack-4, both `whileHover`/`whileTap`)

#### Additional Technical Risks
1. **Next.js streaming + AnimatePresence:** Suspense controls mount/unmount, not AnimatePresence. Skeleton exit (13/11) limited to client-side transitions.
2. **Hydration mismatch with `useReducedMotion()`:** Never conditionally render different component trees based on this hook — only change transition values.
3. **`AnimatePresence` requires stable keys:** Dynamic lists must use stable IDs (wine ID, cart item ID), never array index.
4. **CSS specificity conflicts:** Each story must remove Tailwind transition classes from elements now animated by Motion.
5. **Browser support for `@starting-style`:** Verify Base UI's existing animations work across the browser support matrix before deciding what to replace.
