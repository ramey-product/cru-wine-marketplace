# Curation — Copy Deck

> **Story**: EPIC-07/STORY-11
> **Voice**: Warm, knowledgeable, never pretentious. Personal, not algorithmic.
> **Status**: Active

---

## 1. Section Headings

| Section | Heading | Subtext |
|---------|---------|---------|
| Recommendations | "Picked for You" | *(none — heading is enough)* |
| Collections | "Curated Collections" | *(none)* |
| Popular | "Popular Near You" | *(none)* |
| Collection CTA | "See all collections →" | — |

---

## 2. Recommendation Explanation Templates

Templates use warm, specific language. Never say "algorithm" or "based on your data."

| Template Pattern | Example |
|-----------------|---------|
| Flavor affinity | "Because you love earthy, spicy reds, this natural Grenache from the Southern Rhône should be right up your alley." |
| Region match | "You've been exploring Burgundy — this Côtes du Rhône has a similar elegance at a friendlier price point." |
| Producer connection | "From the same people who make your saved Bandol rosé — their red is just as expressive." |
| Adventurous push | "You said you like surprises — this orange wine from Slovenia is unlike anything else in your cellar." |
| Popular signal | "Wine lovers near you have been reaching for this one all week." |
| Seasonal | "Perfect for the season — light, crisp, and made for warm evenings on the patio." |
| Similar to saved | "Similar to the wines you've saved — bold fruit, soft tannins, and a long finish." |
| New arrival | "Just landed on Cru from a producer we love. Think of it as a first look." |

### Template Variables
```
{preference}     — user's flavor/region preference (e.g., "earthy reds")
{wine_descriptor} — brief wine description (e.g., "natural Grenache")
{region}         — wine's region
{producer}       — producer name
{saved_wine}     — name of a user-saved wine
```

---

## 3. Empty States

| State | Copy |
|-------|------|
| No taste profile | "Complete your taste profile to get personalized picks." CTA: "Set up your profile" |
| Sparse results | *(no empty state — show available results, pad with popular wines)* |
| No collections | "Our curators are putting together something special. Check back soon." |
| No location | "Enable location to see what's popular near you." CTA: "Allow location" |

---

## 4. Dismiss Interaction

| Element | Copy |
|---------|------|
| Dismiss tooltip | "Not for me" |
| Dismiss ARIA | "Remove {wine_name} from recommendations" |
| Undo toast | *(no undo — dismissal is lightweight and learning signal)* |

---

## 5. Collection Admin Copy

| Element | Copy |
|---------|------|
| Page heading | "Collections" |
| New button | "New Collection" |
| Empty table | "No collections yet. Create your first curated collection." |
| Name field | "Collection name" |
| Slug field | "URL slug" with help text "Auto-generated from name" |
| Description | "Description" with help text "A short intro shown on the collection page" |
| Cover image | "Cover image URL" |
| Date range | "Visibility dates (optional)" with help text "Leave empty to show indefinitely" |
| Active toggle | "Published" with help text "Only published collections appear on the site" |
| Wines tab heading | "Wines in this collection" |
| Add wine | "Search and add wines..." placeholder |
| Remove wine | *(icon button, no text — X icon with aria-label)* |
| Save button | "Save Collection" |
| Success toast | "Collection saved." |

---

## 6. Microcopy Patterns

### Do
- "Picked for you" (personal, warm)
- "Because you love..." (explanatory, specific)
- "Check back soon" (inviting, not dismissive)

### Don't
- "Recommended based on your profile data" (clinical)
- "Our algorithm suggests" (dehumanizing)
- "No content available" (corporate void)
- "You might also like" (generic, overused)
