# Competitive Research: Local Online Marketplace UX
## Uber Eats & Grubhub — Patterns Transferable to Cru Wine Marketplace

**Author:** PM Orchestrator
**Date:** March 14, 2026
**Scope:** Commerce flow architecture, proximity UX, order tracking, discovery, cart optimization, re-engagement, mobile-first patterns
**Purpose:** Extract transferable UX patterns from local delivery marketplace leaders to inform Cru's commerce experience design

---

## 1. Commerce Flow Architecture

### Uber Eats: End-to-End Purchase Flow

**Tap count from app open to order placed: 6-8 taps (optimized path)**

| Step | Screen | Key Decision Point | Taps |
|------|--------|--------------------|------|
| 1 | Home feed | Browse/search or tap a restaurant | 1 |
| 2 | Restaurant page | Scroll menu, tap an item | 1 |
| 3 | Item customization | Select size, add-ons, special instructions | 1-2 |
| 4 | Cart (bottom sheet) | Review items, adjust quantity | 1 |
| 5 | Checkout | Confirm address, payment, tip | 1-2 |
| 6 | Order placed | Confirmation + live tracking | 1 |

**Key design decisions:**
- **Persistent cart badge**: A floating cart button with item count + total is always visible at the bottom of the screen once items are added. Users never lose track of their cart state.
- **Bottom sheet cart preview**: Tapping the cart badge reveals a bottom sheet (not a full page navigation) showing items, subtotal, and a "Go to Checkout" CTA. This keeps the user in browsing context.
- **Single-restaurant cart enforcement**: Adding items from a different restaurant triggers a "Start new order?" confirmation dialog. Cart is always scoped to one restaurant. (Directly parallels Cru's single-retailer cart model.)
- **Progressive disclosure at checkout**: Address, payment method, and tip are shown as pre-filled, editable sections. Users only interact with what needs changing.
- **"Place Order" button shows total**: The final CTA reads "Place Order - $42.50" — the price is embedded in the action button. No ambiguity about what you're committing to.

### Grubhub: End-to-End Purchase Flow

**Tap count from app open to order placed: 7-9 taps**

| Step | Screen | Key Decision Point | Taps |
|------|--------|--------------------|------|
| 1 | Home / Browse | Select a restaurant from feed or search | 1 |
| 2 | Restaurant page | Browse menu categories, tap item | 1-2 |
| 3 | Item detail | Customize (required choices first) | 1-2 |
| 4 | Menu (return) | Add more items or proceed | 0-1 |
| 5 | Cart page | Full-page cart review | 1 |
| 6 | Checkout | Address, payment, promo code, tip | 1-2 |
| 7 | Order placed | Confirmation | 1 |

**Key design decisions:**
- **Full-page cart** (vs. Uber Eats bottom sheet): Grubhub navigates to a dedicated cart page. More space for upsells ("You might also like...") but adds navigation friction.
- **Required customizations gated**: If an item has required choices (size, protein), the "Add to Cart" button stays disabled until all required fields are filled. Clear error states.
- **Promo code field prominent at checkout**: Grubhub historically emphasizes deals and promo codes more than Uber Eats, with the promo field visible (not collapsed) at checkout.
- **Itemized fee breakdown**: Subtotal, delivery fee, service fee, tax, tip — all shown line-by-line. Transparency strategy to build trust despite multiple fees.

### Cru Transferable Insights

| Pattern | Uber Eats | Grubhub | Cru Application |
|---------|-----------|---------|-----------------|
| Cart scoping | Single-restaurant | Single-restaurant | Already planned: single-retailer cart. Validate with same "Start new order?" dialog pattern. |
| Persistent cart state | Floating badge + bottom sheet | Full-page navigation | **Adopt Uber Eats pattern**: floating cart badge with bottom sheet. Wine browsing is exploratory — don't break the flow with full-page cart navigation. |
| Price-in-CTA | "Place Order - $42.50" | Separate total display | **Adopt**: "Place Order - $67.00" on the final checkout button. Eliminates last-second price anxiety. |
| Progressive checkout | Pre-filled editable sections | Linear form | **Adopt progressive disclosure**: pre-fill address from profile, show saved payment method, only ask for what's new. |
| Fee transparency | Inline but less prominent | Itemized breakdown | **Adopt Grubhub's itemized approach**: wine buyers are making considered purchases (not impulse fast-food orders). Show subtotal + delivery fee + tax clearly. Trust matters more than speed here. |

---

## 2. Proximity / Distance UX

### Uber Eats: How Distance Surfaces

**Card-level display:**
- Every restaurant card shows estimated delivery time (e.g., "25-35 min") as the primary proximity signal — NOT distance in miles
- Delivery fee displayed on the card (e.g., "$1.99 Delivery Fee" or "Free Delivery")
- A small distance indicator appears secondary (e.g., "1.2 mi")
- "Pickup" filter swaps delivery time for walking/driving time

**Sorting & filtering:**
- Default sort: "Recommended" (algorithmic blend of distance, ratings, popularity, and ad placement)
- "Nearby" sort option surfaces closest restaurants first
- Distance is an implicit filter: restaurants beyond delivery range simply don't appear
- No explicit "distance" slider — the system handles the radius based on delivery feasibility

**Map view:**
- Available as an alternate browse mode: switch from list to map
- Map shows restaurant pins with delivery time labels
- Tapping a pin shows a preview card (restaurant name, time, rating, delivery fee)
- Map is secondary to the feed — most users stay in list view

**Key insight:** Uber Eats converts distance into **time** — a more intuitive and actionable metric. "15 minutes away" is more meaningful than "2.3 miles" because it accounts for traffic, prep time, and delivery logistics.

### Grubhub: How Distance Surfaces

**Card-level display:**
- Estimated delivery time prominent on cards (e.g., "30-40 min")
- Distance shown in miles as secondary info
- Delivery fee on card
- "ASAP" vs. scheduled delivery toggle at the top of the feed

**Sorting & filtering:**
- Default sort: "Recommended"
- Filter by: delivery time ranges (Under 30 min, Under 45 min), price level, cuisine, dietary
- Distance is implicit in the feed — filtered by delivery zone

**Grubhub-specific pattern: "Order for Later"**
- Prominent scheduling UI at the top of the browse experience
- Users can toggle between "ASAP" and a specific date/time
- This shifts the proximity equation: if ordering for tomorrow, a restaurant 5 miles away is fine; if ordering for now, 1 mile matters

### Cru Transferable Insights

| Pattern | How They Do It | Cru Application |
|---------|----------------|-----------------|
| **Time over distance** | Both platforms show delivery ETA, not miles | **Adapt thoughtfully**: For wine, "15 min drive" or "0.8 mi" is more relevant than delivery ETA since Cru doesn't control delivery logistics. For pickup: show drive time. For delivery: show retailer's estimated delivery window. |
| **Distance on cards** | Small, secondary text | **Adopt**: Show distance on wine cards when "Available nearby" is active. Format: "at Silver Lake Wine Co. (0.8 mi)" — store name is primary, distance is supporting context. |
| **Implicit radius filtering** | Don't show items outside delivery range | **Adopt for "Available nearby" toggle**: When active, only show wines in stock within user's configured radius. Don't show grayed-out far-away options — just filter them out. The exception: if zero local results, show a message with the nearest available store. |
| **Map as secondary view** | Available but not default | **Consider for V2**: A map showing retailer locations with in-stock wine counts. Not essential at launch — wine isn't as location-urgent as food delivery. |
| **Scheduling** | Grubhub's "Order for Later" | **Relevant for wine**: "Schedule pickup for Saturday" or "Deliver this weekend" is a natural wine buying pattern. Not P0, but a strong P1 candidate. Cru already has pickup time estimates — this extends it. |

**Critical difference from food delivery:** Wine proximity is about **where you pick it up or get it delivered**, not about freshness or prep time. The distance UX should emphasize "how convenient is it to get this wine" rather than "how fast will it arrive." A wine buyer will drive 15 minutes for a bottle they want. They won't wait 45 minutes for delivery of commodity wine.

---

## 3. Order Tracking & Post-Purchase Engagement

### Uber Eats: Live Order Tracking

**The gold standard in post-purchase UX. Three phases:**

**Phase 1: Preparation (Order placed -> Restaurant starts preparing)**
- Animated progress bar with status text: "Your order has been received"
- Estimated delivery time countdown: "Arriving by 7:42 PM"
- Restaurant name and order summary visible
- "Cancel order" option available (time-limited)

**Phase 2: Pickup & Transit (Driver assigned -> En route)**
- Live map with driver location pin, animated in real-time
- Driver name, photo, vehicle info, and rating displayed
- ETA updates dynamically based on driver position
- "Contact driver" button (call or message)
- Route visualization on map: driver's path from restaurant to delivery address
- Progress steps shown vertically: "Preparing" (done) -> "Picked up" (active) -> "On the way" -> "Arriving"

**Phase 3: Arrival (Last mile)**
- Push notification: "Your driver is nearby"
- Large ETA countdown: "Arriving in 2 minutes"
- "Meet at door" / "Leave at door" delivery instructions
- After delivery: rate driver, rate food, tip adjustment

**Post-delivery engagement:**
- "Rate your order" prompt (star rating + optional text)
- "Reorder" button prominently placed on the order confirmation
- Order receipt emailed
- Order appears in history with one-tap reorder capability

### Grubhub: Order Tracking

**Similar structure, slightly less visual fidelity:**

- Step-based tracker: "Order Placed" -> "Confirmed" -> "Being Prepared" -> "Out for Delivery" -> "Delivered"
- Driver tracking map available but historically less smooth than Uber Eats
- SMS and push notifications at each status change
- ETA displayed but updates less frequently than Uber Eats
- Post-delivery: rating prompt, receipt, reorder option

**Grubhub differentiator: Proactive communication**
- If the order is delayed, Grubhub sends a proactive notification explaining why before the user has to ask
- "Your order is running a few minutes behind. New estimated time: 7:55 PM"
- This is a trust-building pattern that addresses anxiety before it becomes frustration

### Cru Transferable Insights

**Critical framing:** Cru doesn't own delivery logistics. The retailer fulfills the order. This means Cru's tracking model is closer to a B2B marketplace (like Etsy) than a logistics-owning platform (like Uber Eats). But the emotional need is the same: "Where is my order and when do I get it?"

| Pattern | Source | Cru Application |
|---------|--------|-----------------|
| **Step-based progress tracker** | Both | **Adopt for V1**: Simple horizontal or vertical stepper showing order lifecycle: "Placed" -> "Confirmed" -> "Ready for Pickup" / "Out for Delivery" -> "Completed". No map (Cru doesn't track drivers). |
| **Status push notifications** | Both | **P1 per PRD-05, but design the data model now**: `order_status_history` table already planned. Ensure it supports notification triggers. Key notifications: (1) Order confirmed by retailer, (2) Ready for pickup / Out for delivery, (3) Order complete. |
| **Proactive delay communication** | Grubhub | **Adopt the principle**: If a retailer hasn't confirmed an order within 15 minutes, Cru should proactively message the user: "We're checking on your order with [Store Name]. We'll update you shortly." Don't leave the user wondering. |
| **Post-purchase reorder** | Both | **Strong P1 candidate**: "Reorder" button in order history. Wine reordering is even more natural than food reordering — people find a bottle they love and want it again. Should check current retailer stock before enabling. |
| **Rating prompt** | Both | **Adapt**: Don't ask users to rate the wine on a numerical scale (Product Principle #2: Stories over scores). Instead: "Did you enjoy this wine? Tell us what you thought." -> feeds into taste profile refinement. This is a differentiated engagement loop. |
| **Estimated time display** | Both | **Adopt simplified version**: For pickup: "Ready in approximately 1 hour." For delivery: "Estimated delivery: Today 5-7 PM." These come from retailer-set defaults, not real-time logistics. |

---

## 4. Discovery & Browsing Patterns

### Uber Eats: Discovery Architecture

**Home feed structure (top to bottom):**
1. **Search bar** — persistent at top, with location indicator
2. **Category pills** — horizontal scroll: "Pizza," "Sushi," "Breakfast," "Healthy," "Fast Food," etc.
3. **Promotional banner** — carousel of deals, new restaurants, seasonal promos
4. **"Picked for You" section** — personalized recommendations based on order history
5. **"Popular Near You"** — trending restaurants in the user's area
6. **"New on Uber Eats"** — recently added restaurants
7. **Curated collections** — editorial groupings: "Date Night," "Comfort Food," "Under $15"
8. **Full restaurant feed** — infinite scroll of all available restaurants

**Entry points for discovery:**
- Search (intent-driven)
- Category pills (browse by food type)
- "Picked for You" (personalized, passive discovery)
- "Popular Near You" (social proof)
- Collections (occasion/mood browsing)
- Deals & promotions (price-driven)
- Past orders (re-engagement)

**Key patterns:**
- **Dual-mode entry**: The home screen serves both "I know what I want" (search) and "Inspire me" (feed) simultaneously
- **Horizontal scrolling**: Category pills, restaurant cards within sections, and promo carousels all use horizontal scroll on mobile — maximizing content density without vertical scroll fatigue
- **Social proof signals**: "Most Popular," "Frequently ordered together," "X+ orders recently" labels on cards
- **Photo-forward**: Large, high-quality food photography drives browse engagement. The visual hierarchy is image -> restaurant name -> delivery time -> price level

### Grubhub: Discovery Architecture

**Home feed structure:**
1. **Address bar + "ASAP/Later" toggle** — scheduling prominent
2. **Deal banners** — Grubhub historically leads with promotions
3. **Category grid** — icon-based category tiles: "Pizza," "Chinese," "Mexican," etc.
4. **"Your favorites"** — previously ordered restaurants
5. **"Popular picks"** — area popularity
6. **"Free delivery"** — filtered by deal
7. **General feed** — all restaurants sorted by recommendation

**Grubhub differentiators:**
- **Deals-forward positioning**: Grubhub's browse experience emphasizes discounts, perks, and free delivery more than Uber Eats. Promo codes, Grubhub+ perks, and deal badges are visually prominent.
- **Cuisine-first taxonomy**: Categories are organized by cuisine type, not by occasion or mood. More traditional, less experiential.
- **"Reorder" as primary CTA**: For returning users, the home screen surfaces previous orders as the first scroll section, with a large "Reorder" button. This acknowledges that ~50% of food delivery is repeat orders.

### Cru Transferable Insights

| Pattern | Source | Cru Application |
|---------|--------|-----------------|
| **Dual-mode home screen** | Both | **Adopt**: Cru's home feed should serve search ("I want that Tempranillo I had") and browse ("What should I try tonight?") from the same screen. Search bar at top, browse sections below. PRD-02 already plans this. |
| **Category pills (horizontal scroll)** | Uber Eats | **Adopt and adapt**: Instead of "Pizza, Sushi, Burgers" use wine-relevant categories: "Red," "White," "Sparkling," "Natural," "Under $25," "Staff Picks." These should be horizontal scrollable chips, not a grid. |
| **Occasion/mood collections** | Uber Eats | **Adopt (already planned)**: PRD-02 specifies "Browse by Occasion" with collections like "Weeknight," "Celebration," "First Date." This directly mirrors Uber Eats' "Date Night," "Comfort Food" collections. Execution insight: make these visually rich with editorial photography, not just filtered lists. |
| **"Picked for You" personalization** | Uber Eats | **Strong P1**: Once taste profile data exists, a "Wines for You" section on the home feed — personalized recommendations with explanation ("Because you liked [previous wine]"). This is Cru's AI curation engine output, displayed in the Uber Eats pattern. |
| **Photo-forward cards** | Both | **Adopt with wine adaptation**: Wine bottles are less visually distinctive than food photos. Cru should lead with **producer/vineyard imagery** (landscapes, winemakers, cellars) rather than bottle shots. This aligns with Product Principle #4 (stories over scores) and creates visual variety that bottle shots can't. |
| **Social proof signals** | Uber Eats | **Adapt carefully**: "1,200 people ordered this" doesn't align with Cru's anti-mass-market positioning. Better: "Trending in Silver Lake," "New from [Producer]," "Curator's Pick" — signals that convey quality and locality, not popularity. |
| **Reorder as primary returning-user CTA** | Grubhub | **Strong P1**: For returning users with order history, surface "Your wines" or "Order again" as the first section. Wine reordering is a retention goldmine — a bottle you loved last month is still great this month. |
| **Horizontal scroll for content density** | Both | **Adopt for mobile**: Use horizontal scroll cards for curated collections, "New on Cru," and "Near You" sections. Prevents the feed from becoming an overwhelming vertical list. |

---

## 5. Cart & Checkout Optimization

### Uber Eats: Cart Design

**Cart interaction model:**
- **Add to cart**: Item flies to the cart badge (micro-animation). Badge shows count and running total.
- **Cart badge**: Fixed to bottom of screen. Shows "View Cart (3) - $38.50". Tapping opens bottom sheet.
- **Bottom sheet cart**: Shows items, quantities (adjustable inline), subtotal, and "Go to Checkout" CTA. Can be dismissed to continue browsing.
- **Quantity adjustment**: Stepper (+/-) inline on each item. "Remove" on swipe-left or tap minus at quantity 1.
- **Special instructions**: Expandable text field per item.

**Checkout flow:**
1. Delivery address (pre-filled from profile, editable)
2. Delivery instructions (e.g., "Leave at door")
3. Payment method (pre-filled, one-tap to change)
4. Tip selection (preset amounts: $1, $2, $3, $5 or custom)
5. Promo code (collapsed, expandable)
6. Order summary: subtotal, delivery fee, service fee, taxes, tip, total
7. "Place Order - $XX.XX" button

**Friction-reduction patterns:**
- **One-tap payment**: Saved payment methods mean returning users tap "Place Order" without re-entering anything
- **Sticky CTA**: The "Place Order" button is always visible at the bottom of the checkout screen, even while scrolling the order summary
- **Price anchoring**: The CTA button itself contains the total price, so the user never has to scan upward to see what they're paying

### Grubhub: Cart Design

- **Full-page cart**: Grubhub uses a dedicated cart page rather than a bottom sheet
- **Upsell section**: "You might also like..." section within the cart page, showing add-on items from the same restaurant
- **Promo code field**: Prominent, not collapsed
- **Fee itemization**: More granular breakdown of fees than Uber Eats
- **"Continue Shopping" CTA**: Alongside "Proceed to Checkout" — explicitly invites users back to browsing

### Cru Transferable Insights

| Pattern | Cru Application | Priority |
|---------|-----------------|----------|
| **Persistent floating cart badge** | Show a bottom-fixed badge when items are in cart: "View Cart (2) - $67.00". Never let users forget they have items. | P0 |
| **Bottom sheet cart (not full-page)** | Wine browsing is exploratory. A bottom sheet cart lets users review their selections without losing their browse position. Full-page cart breaks flow. | P0 |
| **Inline quantity adjustment** | Stepper (+/-) on each wine in the cart. For wine, also consider a "case quantity" shortcut: "Buy 6" or "Buy 12" buttons for case discounts. | P0 (stepper), P1 (case shortcuts) |
| **Pre-filled checkout** | Address from profile, saved payment method, one-tap checkout for returning users. Critical for the "under 2 minutes" goal from PRD-05. | P0 |
| **Price-in-CTA button** | "Place Order - $67.00" as the final button. | P0 |
| **Sticky CTA at checkout** | "Place Order" button always visible at bottom of checkout screen. | P0 |
| **Upsell in cart** | "Complete your selection" — suggest complementary wines from the same retailer. E.g., if user has a red, suggest a white or a sparkling. This is a natural wine shopping behavior (building a mixed case). | P1 |
| **Different-store conflict dialog** | "You have items from Silver Lake Wine Co. Start a new order from Los Feliz Cellars?" — same pattern as Uber Eats' restaurant conflict dialog. | P0 |

### Critical Difference: Considered Purchase vs. Impulse Order

Food delivery is often an impulse purchase. Wine buying, even casual wine buying, is more considered. This means:
- **Don't rush the checkout**: Unlike Uber Eats where every second of friction costs conversions, wine buyers expect to review their selections. The order summary should feel informative, not hurried.
- **Show more wine detail in cart**: Include vintage, producer, and varietal in the cart line items — not just "Wine Name x 2". The buyer wants to confirm they're getting the right bottle.
- **Delivery fee expectations differ**: Food delivery fees are expected. Wine delivery fees may feel surprising if users are used to free shipping from wine.com. Be transparent early (on the wine card or retailer selection) about delivery fees — don't surprise at checkout.

---

## 6. Re-engagement Loops

### Uber Eats: Bringing Users Back

| Mechanism | How It Works | Effectiveness |
|-----------|-------------|---------------|
| **Push notifications** | "Your favorites are nearby," "New restaurant in your area," "$5 off your next order" | High — time-sensitive offers drive opens |
| **Reorder** | "Order again" section on home screen with one-tap reorder from past orders | Very high — lowest friction path to conversion |
| **Favorites** | Heart icon on restaurants and items. Favorites appear as a dedicated tab for quick access | Medium — requires initial engagement to build |
| **"Uber One" membership** | $9.99/mo subscription offering free delivery, discounts. Creates sunk-cost retention | High — subscribers order 2-3x more |
| **Promo codes / credits** | Win-back campaigns for lapsed users: "$10 off, we miss you" | High for reactivation, lower for ongoing retention |
| **Browse without intent** | The app is designed to be browsed recreationally — looking at food photos, exploring menus — even without ordering | Medium — keeps app top-of-mind |

### Grubhub: Bringing Users Back

| Mechanism | How It Works |
|-----------|-------------|
| **Grubhub+** | Subscription ($9.99/mo) with free delivery, member deals |
| **Perks program** | Earn points on orders, redeem for credits |
| **"Your favorites"** | Past order restaurants prominently surfaced |
| **Deal alerts** | Push notifications for restaurant deals and promos |
| **Email campaigns** | Weekly "New near you" and "Deals this week" digests |
| **Scheduled ordering** | "Order for tomorrow's lunch" — creates habitual behavior |

### Cru Transferable Insights

| Pattern | Cru Application | Alignment with Product |
|---------|-----------------|----------------------|
| **One-tap reorder** | "Order this wine again" from order history or wine detail page. Check current stock/price before enabling. If out of stock: "This wine is currently unavailable. Notify me when it's back." | Directly serves PRD-05 P1 reorder flow. Wine reordering is a stronger retention lever than food — a good bottle is worth ordering every month. |
| **Wishlist as re-engagement hook** | Already planned in PRD-01. Enhance: push notifications when wishlisted wines come in stock nearby or drop in price. "That Bandol Rose you wishlisted is now in stock at Silver Lake Wine Co." | Combines Uber Eats' "favorites" pattern with Cru's "local first" principle. Transforms the wishlist from passive list to active demand signal. |
| **Subscription retention (Cru+)** | Cru+ at $49/yr offers cellar management, trading access. Add a commerce perk: "Cru+ members get free local delivery." This creates the same sunk-cost retention as Uber One. | Aligns with business model. Free delivery perk would require retailer negotiation on delivery fee absorption. |
| **"New on Cru" notifications** | Push: "3 new wines from a producer you follow" or "New arrivals at [Store Name]." Maps to Producer Storytelling (PRD-04) + Retailer Integration (PRD-06). | Differentiated from food delivery: wine arrivals are seasonal and event-driven (harvest, new vintages). Timing notifications to wine release cycles is a unique Cru advantage. |
| **Taste profile as engagement loop** | After each purchase, prompt: "How was the [Wine Name]?" -> simple thumbs up/down + optional note. Feeds taste profile refinement (PRD-03) AND creates a reason to return to the app post-purchase. | This is Cru's version of Uber Eats' rating prompt, but it serves a product function (improving recommendations) rather than just quality control. More meaningful to the user. |
| **Weekly digest email** | "This week on Cru: 5 wines we think you'd love, a new producer story, and what's trending near you." Curated by AI + editorial, personalized to taste profile. | Aligns with Product Principle #7 (Community through the glass). The digest is a mini-magazine, not a promo blast. |
| **Recreational browsing** | Design the browse experience to be enjoyable without purchase intent. Producer stories, vineyard photography, wine region deep-dives. Users should open Cru to learn and explore, not just to buy. | This is Cru's strongest differentiation. Food delivery apps are transactional — you open them when hungry. Cru can be a "wine Instagram" — opened for inspiration. |

---

## 7. Mobile-First Patterns

### Patterns Both Platforms Share

| Pattern | Implementation | Why It Works |
|---------|---------------|-------------|
| **Bottom navigation bar** | 4-5 tabs: Home, Browse/Search, Orders, Account | Thumb-reachable on large phones. Primary nav always accessible. |
| **Pull-to-refresh** | Swipe down on feed to refresh recommendations | Familiar gesture, gives users control over content freshness |
| **Swipe gestures** | Swipe left to delete cart items, swipe between order tracking steps | Reduces tap count, feels native |
| **Bottom sheets** | Cart preview, filter panels, item customization | Keeps content in the lower half of screen (thumb zone). Dismissible by swipe-down. |
| **Sticky headers** | Search bar and filter pills stay visible while scrolling the feed | User can always refine without scrolling back to top |
| **Skeleton loading** | Gray placeholder shapes while content loads | Prevents layout shift, signals that content is coming |
| **Haptic feedback** | Subtle vibration on add-to-cart, order placed | Tactile confirmation of actions |
| **Large touch targets** | Buttons are minimum 44x44px, generous spacing between tappable elements | Prevents mis-taps, critical for checkout flow |
| **Image-heavy cards** | 40-60% of card area is imagery | Visual browsing is faster than reading text |
| **Infinite scroll with section breaks** | Feed loads more content on scroll, but breaks content into labeled sections | Prevents the "endless list" feeling while keeping engagement high |

### Uber Eats-Specific Mobile Patterns

- **Location awareness bar**: Persistent banner showing delivery address with "Change" link. Makes location context omnipresent.
- **Micro-animations on state changes**: Cart badge bounces when item added. Progress bar animates during order tracking. These create a sense of responsiveness and delight.
- **Dark mode support**: Full dark mode implementation for comfortable nighttime browsing.
- **Contextual keyboard**: Numeric keyboard for phone number, email keyboard for email fields. Reduces input friction.

### Cru Transferable Insights

| Pattern | Cru Application | Priority |
|---------|-----------------|----------|
| **Bottom navigation** | 5 tabs: Home, Browse, Cart, Orders, Profile. Standard for marketplace apps. | P0 |
| **Bottom sheet for filters** | On mobile, tapping "Filter" opens a bottom sheet with filter controls (price, varietal, region, available nearby). Not a full-page navigation. | P0 |
| **Sticky search + filter bar** | Search bar + category pills stay fixed at top while scrolling the wine feed. | P0 |
| **Skeleton loading** | Wine cards show skeleton placeholders while data loads. Already in PRD-02 technical requirements. | P0 |
| **Image-heavy wine cards** | Lead with producer/vineyard photography (not bottle shots). 40%+ of card area should be visual. This is where Cru can out-execute food delivery apps — wine has beautiful source imagery (vineyards, cellars, winemakers) that food delivery can't match. | P0 |
| **Location awareness** | Persistent location indicator: "Wines near Silver Lake" or "Showing wines near 90026." Reinforce the "local first" principle visually at all times. | P0 |
| **Micro-animations** | Cart badge bounce on add. Progress step animation on order tracking. Wine card entrance animations on scroll. | P1 (nice-to-have polish) |
| **Pull-to-refresh** | On home feed and order tracking page. | P0 |
| **Large touch targets** | Minimum 44x44px for all buttons. Especially critical for "Buy" and "Add to Cart" CTAs. | P0 |
| **Haptic feedback** | Vibrate on add-to-cart and order placement. Subtle but effective. | P1 |

---

## 8. Gap Analysis: What Cru Is Missing

Based on the competitive analysis above, mapped against Cru's current PRDs and product spec:

### Gaps in Current PRDs

| Gap | What Competitors Do | Current Cru Plan | Impact |
|-----|--------------------|--------------------|--------|
| **Persistent cart state in browse** | Floating cart badge always visible | PRD-05 describes cart but doesn't specify the cart UI pattern during browsing. No mention of persistent badge or bottom sheet. | HIGH — Without this, users lose track of cart state during wine discovery. Fix: specify floating cart badge + bottom sheet pattern in PRD-05 or a design spec. |
| **Post-purchase taste feedback loop** | Star ratings + text review | PRD-05 lists "order history" but no post-purchase engagement. PRD-03 (Taste Profile) doesn't specify how post-purchase signals feed back. | HIGH — This is Cru's unique retention mechanism. Each purchase should trigger a taste feedback prompt that improves future recommendations. Design the data flow: order_completed -> prompt -> taste_signal -> profile_update. |
| **Proactive order status communication** | Grubhub sends proactive delay notifications | PRD-05 specifies order statuses but doesn't address proactive communication when things go wrong (retailer slow to confirm, unexpected delay). | MEDIUM — Trust is everything in early marketplace days. Add a requirement: if order not confirmed within 15 minutes, auto-notify user and escalate to Cru ops. |
| **Reorder flow** | Both platforms: one-tap reorder from history | PRD-05 lists as P1 "Nice-to-Have." | MEDIUM — Should be early P1. Wine reordering has higher repeat rates than food because bottles don't change. Design consideration: check current stock + price before enabling reorder button. |
| **Recreational browsing experience** | Uber Eats designed to be browsed without purchase intent | Current PRDs are commerce-focused. No PRD specifically addresses the "just browsing" experience — producer stories (PRD-04) and editorial content are P1. | HIGH — Cru's differentiator is that wine browsing should be enjoyable on its own. The app should be opened for discovery, not just transactions. Producer Storytelling (PRD-04) partially addresses this, but the home feed design needs explicit "browse for inspiration" UX. |
| **Home feed personalization** | "Picked for You" section based on order history and browsing behavior | PRD-07 (AI Curation) covers the engine but doesn't specify home feed placement or the "because you liked X" explanation pattern. | MEDIUM — The recommendation engine output needs a defined home feed surface. Add a requirement to PRD-07 or the home page design: personalized section with explanation text. |
| **Scheduled pickup/delivery** | Grubhub: "Order for Later" as primary toggle | Not in any Cru PRD. | LOW for P0, MEDIUM for P1 — Wine buying often involves planning ("I need a bottle for Saturday dinner"). Scheduling pickup or delivery time is natural. Consider for P1. |
| **In-cart upsell / "Complete your case"** | Grubhub: "You might also like" in cart | Not in any Cru PRD. | MEDIUM — "Complete your case" is a natural wine shopping pattern. After adding 1-2 wines from a retailer, suggest complementary bottles. Increases AOV. P1 candidate. |

### Gaps in Architecture / Data Model

| Gap | Implication | Recommendation |
|-----|------------|----------------|
| **No taste signal from purchase events** | Order completion doesn't feed into taste profile | Add an `order_taste_feedback` table or extend `taste_signals` to accept post-purchase input. Wire order_completed webhook to trigger feedback prompt. |
| **No proactive notification triggers** | System can't detect "order stuck" conditions | Add a scheduled job (Vercel cron) that checks for orders in "pending" status > 15 minutes and triggers a notification + ops alert. |
| **No browse behavior tracking** | Can't personalize "Picked for You" feed | Add lightweight analytics events: wine_card_viewed, wine_detail_viewed, filter_applied, search_performed. These feed the curation engine. |

---

## 9. Recommendations: Top 7 for Cru

Prioritized by impact on the Explorer persona (primary user), feasibility within the current architecture, and alignment with product principles.

### Recommendation 1: Adopt the Floating Cart Badge + Bottom Sheet Pattern
**Impact: Critical | Effort: Low | Phase: P0**

The persistent floating cart badge (showing item count + running total) with a swipe-up bottom sheet for cart preview is the single most impactful UX pattern from food delivery marketplaces. It solves three problems at once: (1) users always know their cart state, (2) reviewing the cart doesn't break the browse flow, (3) the badge itself is a persistent CTA that nudges toward checkout.

**Implementation:** A fixed-position component at the bottom of the screen, above the navigation bar, that appears when cart has items. Tapping opens a bottom sheet (Shadcn Sheet component) showing cart contents with "Go to Checkout" CTA.

### Recommendation 2: Design the Post-Purchase Taste Feedback Loop
**Impact: High | Effort: Medium | Phase: P0 (data model), P1 (UI)**

After every order is marked "completed," prompt the user: "How was the [Wine Name]?" with a simple thumbs up/down and optional freeform text. This is NOT a rating — it's a taste signal. It feeds directly into the AI curation engine (PRD-07) to improve future recommendations.

This is Cru's differentiated version of Uber Eats' star rating. It serves the user (better recommendations) rather than just the platform (quality control). Frame it as "Help Cru learn your taste" not "Rate this wine."

**Implementation:** `order_taste_feedback` table, a post-completion push/email with deep link to feedback screen, feedback data piped into taste profile update logic.

### Recommendation 3: Lead Wine Cards with Producer Imagery, Not Bottle Shots
**Impact: High | Effort: Medium | Phase: P0**

Both Uber Eats and Grubhub prove that image-heavy cards drive browse engagement. But wine bottles all look similar — a grid of bottle shots creates visual monotony. Cru should lead wine cards with **producer and vineyard photography** (landscapes, cellar shots, winemaker portraits). This creates visual variety, reinforces Product Principle #2 (Stories over scores), and differentiates Cru from every other wine app that shows a bottle on a white background.

**Implementation:** Ensure the wine/producer data model includes a `hero_image_url` for producer-level imagery. Wine cards use producer imagery as the card background/header, with wine details overlaid.

### Recommendation 4: Implement Proactive Order Status Communication
**Impact: High | Effort: Low | Phase: P0**

Grubhub's proactive delay notifications are a trust-building pattern that costs almost nothing to implement. For Cru: if a retailer hasn't confirmed an order within 15 minutes, automatically notify the user: "We're checking on your order with [Store Name]. We'll update you shortly." Simultaneously alert the Cru ops team.

In a new marketplace where trust isn't yet established, silence after payment is the fastest way to lose a customer permanently. Don't let it happen.

**Implementation:** Vercel cron job running every 5 minutes, checking `orders` table for `status = 'pending' AND created_at < NOW() - INTERVAL '15 minutes'`. Triggers notification and ops alert.

### Recommendation 5: Build the Home Feed as a Dual-Mode Discovery Surface
**Impact: High | Effort: Medium | Phase: P0**

Copy Uber Eats' home feed architecture: search bar at top for intent-driven users, then structured browse sections below for inspiration-driven users. For Cru:

1. Search bar + location indicator ("Wines near Silver Lake")
2. Category pills (horizontal scroll): "Red," "White," "Natural," "Under $25," "Staff Picks"
3. "New on Cru" — recently added wines/producers (horizontal card scroll)
4. "Available Near You" — wines in stock at nearby retailers (horizontal card scroll)
5. Curated collections — "Weeknight Wines," "Date Night," etc. (editorial cards)
6. "From Producers You Follow" (once social features exist)

This structure is partially implied by PRD-02 but not explicitly specified as a home feed layout. Making it explicit ensures the browsing experience feels as polished as Uber Eats while serving Cru's discovery mission.

### Recommendation 6: Wine-Adapted Proximity Display
**Impact: Medium | Effort: Low | Phase: P0**

Don't just show distance in miles. Adapt the proximity display to wine buying context:

- On wine cards: "at Silver Lake Wine Co. (0.8 mi)" — store name is primary, distance is secondary
- On retailer selection (when buying): sort by distance, show drive time estimate alongside miles
- "Available nearby" toggle uses a user-configured radius (default 10 miles, adjustable in settings)
- When no local results: "Not available nearby. Nearest: [Store Name] (12 mi)" — never dead-end the user

The key insight from Uber Eats: they show delivery TIME, not distance, because time is more actionable. For wine pickup, "8 min drive" is more useful than "2.3 mi."

### Recommendation 7: Design for Recreational Browsing (Wine as Content, Not Just Commerce)
**Impact: High | Effort: Medium | Phase: P0 foundation, P1 full experience**

Uber Eats is designed to be browsed recreationally — users open it to look at food photos even when not hungry. Cru has an even stronger version of this opportunity: wine has beautiful stories, stunning vineyard imagery, and fascinating production processes. The app should be worth opening even when you're not buying.

**Concrete actions:**
- Producer story cards in the home feed (not just on detail pages) — 2-3 sentence hooks with compelling photography
- "Story of the Week" featured section with editorial depth
- Regional deep-dives: "This week: explore the wines of Bandol" with educational content woven into browse
- These aren't separate content pages — they're integrated into the same feed as purchasable wines, so the line between "browsing for fun" and "buying" is seamless

This aligns with Product Principle #1 (Curiosity over expertise) and creates the "wine Instagram" behavior that drives daily app opens without requiring purchase intent.

---

## 10. Summary Matrix

| Area | Uber Eats Best Practice | Grubhub Best Practice | Cru Adaptation | Priority |
|------|------------------------|----------------------|----------------|----------|
| Commerce flow | 6-8 taps, bottom sheet cart | Itemized fee transparency | Bottom sheet cart + itemized fees + price-in-CTA | P0 |
| Proximity | Time over distance, implicit radius | Schedule for later | Drive time display, "Available nearby" toggle, scheduled pickup (P1) | P0/P1 |
| Order tracking | Live map, real-time ETA | Proactive delay notifications | Step-based tracker + proactive "checking on your order" messages | P0 |
| Discovery | Dual-mode home, personalized feed | Reorder-first for returning users | Dual-mode home feed with category pills, collections, "New on Cru" | P0 |
| Cart | Persistent badge, bottom sheet, one-tap payment | Upsell in cart, prominent promo code | Floating badge + bottom sheet + "Complete your case" upsells (P1) | P0 |
| Re-engagement | Reorder, favorites, subscription perks | Deals, points, email digests | Taste feedback loop, wishlist notifications, "New on Cru" push, weekly digest | P0/P1 |
| Mobile-first | Bottom nav, sticky header, skeleton loading | Large touch targets, contextual keyboards | All standard mobile patterns + image-heavy wine cards | P0 |

---

## Appendix: Key Differences Between Food Delivery and Wine Marketplace

These differences should temper direct pattern adoption:

| Dimension | Food Delivery | Wine Marketplace (Cru) |
|-----------|--------------|----------------------|
| Purchase urgency | High (hungry now) | Low-medium (planning, exploring) |
| Decision complexity | Low (what do I feel like eating) | Medium (varietal, region, producer, occasion) |
| Repeat purchase pattern | Same restaurant/dish weekly | Same wine monthly, or exploration |
| Visual differentiation | High (food photos are varied) | Low (bottles look similar) — solve with producer imagery |
| Price sensitivity | Moderate ($15-30 per order) | Variable ($12-100+ per bottle) |
| Delivery expectations | 30-60 minutes | Same day or next day is acceptable |
| Post-purchase engagement | Low (rate and forget) | High (taste learning, cellar tracking, sharing) |
| Logistics ownership | Platform owns/manages drivers | Retailer manages fulfillment |
| Trust requirement | Moderate | High (alcohol, legal compliance, bottle authenticity) |

The most transferable patterns are in **discovery UX**, **cart mechanics**, and **mobile interaction design**. The least transferable are **delivery logistics tracking** (Cru doesn't own the fleet) and **urgency-driven conversion patterns** (wine buying is more considered). Cru's unique advantage is the **post-purchase engagement loop** — wine creates a richer ongoing relationship than food delivery ever can.
