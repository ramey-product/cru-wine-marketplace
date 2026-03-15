# Epic 04 — Producer Storytelling Copy Deck

> **Story**: EPIC-04/STORY-08
> **Voice**: Warm, knowledgeable, never pretentious. Second person. Stories over scores.
> **Status**: Active

---

## 1. Producer Profile Page

### Section Headings
| Section | Heading | Notes |
|---------|---------|-------|
| Story | "The Story" | Not "About" — too corporate |
| Quick Facts | "At a Glance" | Overline style, understated |
| Photo Gallery | "From the Vineyard" | Not "Gallery" — warmer, more evocative |
| Wine Portfolio | "The Wines" | Context already established on producer page |

### Empty States

**No Story Content:**
> This producer's story is coming soon.
> Great wines are made by great people — stay tuned.

**No Wines:**
> No wines available yet.
> We're working with this producer to bring their wines to Cru. Check back soon.

**No Photos:**
*(Section hidden entirely — no empty state shown to users)*

### Error States

**Page Error:**
> Something went wrong
> We couldn't load this producer's page. This is on us — try refreshing, or head back to browse.
> [Try Again] [Browse Producers]

**Not Found:**
> Producer not found
> This producer may have moved or been removed. Explore other producers on Cru.
> [Browse Producers]

### Meta Description Templates
```
Default: "Discover wines from {producer_name} on Cru."
With tagline: "{tagline} — explore wines from {producer_name} on Cru."
With region: "Wines from {producer_name} in {region}, {country}. {tagline}"
```

---

## 2. Wine Detail Page

### Section Headings
| Section | Heading |
|---------|---------|
| Tasting Notes | "Tasting Notes" |
| Food Pairings | "Pairs With" |
| Producer Hook | *(no heading — producer name is the anchor)* |
| Related Wines | "You Might Also Love" |
| Availability | "Where to Buy" |

### CTA Button Text
| Action | Label | State |
|--------|-------|-------|
| Add to Wishlist | "Save" | Default |
| Remove from Wishlist | "Saved" | Active (filled heart) |
| Share | "Share" | Icon button, tooltip text |
| Notify | "Notify me when available" | Out-of-stock state |
| Add to Cart | "Add" | Per-retailer button |

### Share Dialog
- Title: "Share this wine"
- Options: "Copy link", "Messages", "Email", "Twitter", "Facebook"
- Success toast: "Link copied!"

### Availability States

**In Stock:**
> Available from {n} retailers

**Out of Stock:**
> Not available nearby
> This wine isn't in stock at any Cru retailers right now.
> [Notify me when available]

**No Availability Data:**
> Availability information coming soon.

### Tasting Notes Empty State
> Tasting notes coming soon. In the meantime, explore more from {producer_name}.

### Producer Hook CTA
> Read the full story →

### Meta Description Templates
```
Default: "Discover {wine_name} {vintage} from {producer_name} on Cru."
With description: "{first_sentence_of_description} — available on Cru."
Template: "When you taste {producer_name}'s {varietal}, you're tasting {region} at its finest."
```

---

## 3. Loading States

### Producer Profile
> *(Skeleton states — no text, shape-matching placeholders)*

### Wine Detail
> *(Skeleton states — no text, shape-matching placeholders)*

---

## 4. Admin Content Management

### Producer Table
- Search placeholder: "Search producers..."
- New button: "New Producer"
- Empty table: "No producers yet. Add your first producer to get started."

### Producer Form
- Save button: "Save" / "Saving..."
- Success toast: "Producer saved successfully."
- Error toast: "Something went wrong. Please try again."
- Tagline help text: "A one-line hook that captures this producer's essence (150 chars max)"
- Story help text: "Tell this producer's story. What makes them special?"
- Farming practices label: "How do they farm?"

### Wine Form
- Save button: "Save Wine" / "Saving..."
- Price help text: "Enter price in dollars"
- Tags help text: "Comma-separated tags (e.g., bold, structured, age-worthy)"

### Photo Manager
- Add button: "Add Photo"
- URL placeholder: "https://..."
- Caption placeholder: "Describe this photo..."
- Remove confirmation: *(no confirmation — immediate removal, undo available)*
- Empty state: "No photos yet. Add your first photo to showcase this producer."

---

## 5. Microcopy Patterns

### Tone Guidelines
- **DO**: "You might love this" / "We think you'll enjoy" / "Explore more from..."
- **DON'T**: "Customers also purchased" / "Based on your browsing history" / "Algorithm recommends"
- **DO**: "Earthy, with hints of dark cherry" / "Like a campfire in autumn"
- **DON'T**: "92 points" / "Robert Parker rated" / "Scored highly by critics"
