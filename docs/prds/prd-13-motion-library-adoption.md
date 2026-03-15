# PRD: Motion Library Adoption

**Feature:** Platform-Wide Animation Enhancement with Motion (formerly Framer Motion)
**Priority:** P1 — Post-Launch Polish
**Author:** Matt Ramey
**Date:** March 14, 2026
**Status:** Draft
**Parent:** [Cru — Product Spec](https://www.notion.so/31c6d459228481d9bdfecf8d36b58989)

---

## 1. Problem Statement

Cru currently has a mix of animation approaches across the platform: Tailwind CSS transitions, the `tailwindcss-animate` plugin for Shadcn/UI primitives, CSS `@keyframes`, and a handful of Motion-powered animations introduced in the EPIC-10 commerce flow. This fragmentation creates three problems:

**Inconsistent motion language.** Different components animate with different timing functions, durations, and patterns. A WineCard hover uses `transition-all duration-200`, a sheet slides with CSS `data-starting-style`, and the QuantityStepper uses Motion springs. Users feel the inconsistency even if they can't articulate it — the app doesn't feel like one cohesive product.

**Missing exit animations.** CSS transitions can't animate elements leaving the DOM. When a cart item is removed, it vanishes instantly. When a sheet closes, it snaps shut. When a toast dismisses, it disappears. These abrupt exits make the app feel unfinished. Motion's `AnimatePresence` solves this — but it's only used in 4 components today.

**Untapped interaction potential.** The platform has no gesture-driven animations (swipe to dismiss, drag to reorder), no scroll-triggered reveals, no spring physics on interactive elements, and no layout animations when content reflows. These are the interactions that separate polished consumer apps from functional ones. Motion provides all of these capabilities out of the box.

This is not a find-and-replace migration. Each animation touchpoint is an opportunity to enhance the user experience with Motion's full capabilities: springs, gestures, layout animations, viewport-triggered reveals, and coordinated sequences.

## 2. Goals

**User Goals:**
- Experience a cohesive, premium-feeling app where every interaction has appropriate motion feedback
- Never see an element appear or disappear without a smooth transition
- Enjoy subtle, delightful animations that reward interaction without getting in the way
- Have all animations respect `prefers-reduced-motion` accessibility preferences

**Business Goals:**
- Establish Motion as the single animation standard, eliminating the current multi-approach fragmentation
- Increase perceived quality — users should describe Cru as "polished" and "modern" in feedback
- Reduce animation-related code complexity by using one library instead of four approaches
- Create reusable animation patterns that accelerate future feature development

**Technical Goals:**
- All new animations use Motion — CSS transitions only for simple color/opacity on non-interactive elements
- `useReducedMotion()` hook in every component with Motion animations
- Shared animation presets (springs, durations, easings) in a central config
- Bundle impact managed through tree-shaking and lazy loading of heavy animation components

## 3. Scope

### In Scope

**Phase A: Foundation & Standards**
- Create shared animation config with named spring presets, duration tokens, and common variants
- Document animation guidelines: when to use springs vs. duration-based, enter/exit patterns, accessibility requirements
- Establish performance budget for Motion bundle impact

**Phase B: Interactive Components**
- WineCard hover/lift → spring-based hover with `whileHover` and layout animation
- BuyButton press feedback → already done (EPIC-10), serves as reference implementation
- QuantityStepper → already done (EPIC-10), serves as reference implementation
- Dialog/Sheet enter/exit → `AnimatePresence` with spring-based slide/fade
- Dropdown/accordion → spring-based expand/collapse replacing CSS `data-*` animations
- Toast notifications → `AnimatePresence` enter/exit with slide + fade

**Phase C: Content & Navigation**
- Wine grid stagger → cards enter with staggered fade+slide on page load and filter changes
- Image gallery/carousel → gesture-driven swipe with momentum
- Scroll-triggered reveals → Motion viewport detection for section entries on home feed
- Loading skeletons → enhanced shimmer with Motion (evaluate vs. CSS approach)
- Page transitions → cross-page animation for navigation (evaluate feasibility with App Router)

**Phase D: Delight & Polish**
- Cart interactions → layout animations when items reflow (add/remove)
- Mobile tab bar → spring-based active indicator that follows the selected tab
- Pull-to-refresh → custom spring animation (mobile web)
- Micro-interactions → button press springs, toggle switches, progress indicators

### Out of Scope
- Native mobile app animations (React Native / Expo)
- Server-side animation (these are all client-side)
- 3D transforms or WebGL effects
- Lottie or video-based animations

## 4. User Experience

### Animation Principles

1. **Purposeful**: Every animation communicates something — state change, spatial relationship, or feedback. Never animate just because we can.
2. **Fast**: Default to quick animations (150–300ms). Only slow down for dramatic moments (celebrations, first-time reveals).
3. **Spring-first**: Use spring physics for interactive elements. Springs feel natural because they model real-world physics. Use duration-based only for simple fades or when precise timing matters.
4. **Accessible**: Every Motion animation checks `useReducedMotion()`. Reduced motion = instant state change, no movement.
5. **Consistent**: Use shared presets. A "snappy" spring always has the same stiffness/damping. A "gentle" ease always has the same curve.

### Interaction Patterns

**Enter/Exit**: All elements that mount/unmount use `AnimatePresence`. Enter = fade in + slight scale or slide. Exit = reverse of enter, slightly faster.

**Hover/Press**: Interactive elements use `whileHover` (subtle scale or background) and `whileTap` (scale down 2–3%). Springs for the return to rest.

**Layout Changes**: When content reflows (cart item removed, filter applied, accordion opens), use `layout` prop for smooth position transitions.

**Scroll Reveal**: Home feed sections fade in + slide up as they enter the viewport. First paint is instant — only subsequent sections animate.

**Gestures**: Swipe-to-dismiss on cards and cart items. Drag handle for reorderable lists. Momentum-based carousel swiping.

## 5. Technical Architecture

### Animation Config (`lib/motion/presets.ts`)

Centralized spring presets and variants:
- `snappy`: stiffness 400, damping 25 — buttons, toggles, quick interactions
- `gentle`: stiffness 200, damping 20 — sheets, modals, larger elements
- `bouncy`: stiffness 300, damping 10 — celebration moments, delight
- `fadeSlide`: opacity 0→1, y 16→0 — standard content entry
- `scaleIn`: scale 0.95→1, opacity 0→1 — modals, popovers

### Shadcn/UI Integration

For Shadcn primitives (Dialog, Sheet, Dropdown), the approach is:
- Keep Radix primitives for accessibility and state management
- Replace CSS `data-*` animations with Motion `AnimatePresence` wrappers
- Create `MotionDialog`, `MotionSheet` wrapper components that compose Radix + Motion

### Performance Considerations

- Motion supports tree-shaking — only import what's used
- Lazy load `AnimatePresence` for below-fold components
- Monitor bundle size impact: target < 15KB gzipped added to shared chunk
- Use `layout` prop judiciously — measure paint performance in DevTools

## 6. Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Animation approach count | 4 (CSS transitions, tailwindcss-animate, @keyframes, Motion) | 2 (Motion + simple CSS color transitions) | Code audit |
| Components with exit animations | 4 | All mounting/unmounting UI | Code audit |
| Components respecting reduced-motion | 4 | 100% of animated components | Automated test |
| Bundle size increase | 0 KB | < 15 KB gzipped | Build analysis |
| User-reported "polished" sentiment | Baseline TBD | +20% improvement | User feedback surveys |

## 7. Dependencies

- Motion library already installed in `apps/web` (added in EPIC-10 Phase 3)
- Radix UI primitives for Shadcn components (already in use)
- `prefers-reduced-motion` media query support (universal browser support)
- No backend dependencies — entirely frontend

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Bundle size bloat | Slower initial load | Tree-shake aggressively, lazy load heavy components, monitor with build analysis |
| Animation jank on low-end devices | Poor UX for some users | Test on throttled CPU, `useReducedMotion()` as fallback, keep animations GPU-compositable (transform/opacity only) |
| Breaking Shadcn/UI updates | Components diverge from upstream | Wrapper pattern keeps Radix primitives unchanged, only animation layer is custom |
| Over-animation fatigue | Users feel the app is "too busy" | Follow animation principles — purposeful, fast, subtle. UX review on every story. |

## 9. Rollout

This is a progressive enhancement — no feature flags needed. Each story can be merged independently. The platform works identically without animations (just feels less polished). Rollout order follows the EPIC stories, prioritizing highest-impact touchpoints first.
