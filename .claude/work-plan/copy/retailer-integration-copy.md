# Retailer Integration — Copy Deck

> **Story**: EPIC-06/STORY-13
> **Voice**: Warm, simple, zero jargon. Partner-to-partner for emails.
> **Status**: Active

---

## 1. Retailer Onboarding Flow

### Step Titles & Descriptions
| Step | Title | Subtitle |
|------|-------|----------|
| 1 | "Tell us about your store" | "We just need the basics to get you started." |
| 2 | "How do you manage inventory?" | "Pick your point-of-sale system and we'll handle the rest." |
| 3 | "How can customers get their orders?" | "Choose the fulfillment options you support." |
| 4 | "Upload your wine list" | "Share your current inventory so customers can find your wines." |
| 5 | "Review and submit" | "Make sure everything looks right before we get you live." |

### Form Labels & Help Text

**Store Details:**
| Field | Label | Help Text |
|-------|-------|-----------|
| Store Name | "Store name" | — |
| Address | "Store address" | "Start typing and we'll help you find it." |
| Phone | "Phone number" | "So customers can reach you." |
| Email | "Email" | "We'll send order notifications here." |
| Website | "Website (optional)" | "Your store's website, if you have one." |

**POS Selection:**
| Option | Help Text |
|--------|-----------|
| Square | "We'll sync your inventory automatically from Square. No spreadsheets needed." |
| Lightspeed | "Automatic inventory sync from Lightspeed Retail. Set it and forget it." |
| Shopify | "Pull inventory from your Shopify store. Updates every few hours." |
| Clover | "Sync directly with Clover POS. Your inventory stays up to date." |
| CSV / Manual | "Upload a spreadsheet of your wines. We'll walk you through it." |
| Other | "Don't see your system? We'll help you find the best way to connect." |

**Fulfillment:**
| Option | Help Text |
|--------|-----------|
| In-store pickup | "Customers order online and pick up at your store." |
| Local delivery | "You handle delivery within your area." |
| Radius slider | "How far do you deliver?" |
| Ship nationwide | "Coming soon — we'll let you know when it's ready." |

**CSV Upload:**
- Dropzone: "Drop your file here, or click to browse"
- Format: "We accept CSV files up to 10MB"
- Template: "Not sure about the format? Download our template as a starting point."

### Validation Errors
| Error | Message |
|-------|---------|
| Required field | "This field is required." |
| Invalid email | "That doesn't look like an email address." |
| Invalid phone | "Please enter a valid phone number." |
| File too large | "This file is over 10MB. Try a smaller file or split it up." |
| Wrong format | "We need a CSV file. This looks like a {ext} file." |
| Geocoding fail | "We couldn't find that address. Try entering it differently." |

### Success
- Submit button: "Get started on Cru"
- Success: Redirect to retailer dashboard with toast "Welcome to Cru! Your inventory is being processed."

---

## 2. CSV Column Mapping

### UI Copy
- Heading: "Map your columns"
- Subtitle: "We found {n} columns in your file. Match them to the right fields."
- Auto-mapped hint: "We auto-matched some columns — double-check them."
- Required indicator: "Required: Wine name ✓ Price ✓ Quantity ✓"
- Skip option label: "— Don't import this column —"

### Preview
- Heading: "Preview your import"
- Subtitle: "Showing the first 20 rows. {n} issues found." / "Everything looks good!"
- Start button: "Start Import"

### Errors
| Error | Message |
|-------|---------|
| Invalid price | "The price looks off — we found '{value}'. Try a number like 42.00." |
| Missing value | "Row {n} is missing the {field}." |
| Negative quantity | "Quantity can't be negative (row {n})." |
| Duplicate row | "This looks like a duplicate of row {other}." |

---

## 3. Wine Matching Admin

### Queue
- Heading: "Wine Match Queue"
- Empty: "All caught up! No pending matches to review."
- Stats format: "{n} pending · {n} unmatched · {n} resolved"

### Review Card
- Heading: "Review Match — {confidence}% Confidence"
- Approve button: "Approve Match"
- Reject button: "Reject"
- Search button: "Search for Different Wine"
- Create button: "Create New Wine"

### Batch Approve
- Button: "Batch Approve"
- Options: "Approve all above 85%", "Approve all above 90%"
- Confirmation: "Approve {n} matches? This will create inventory records for all of them."

### Search Modal
- Heading: "Search Cru Wines"
- Placeholder: "Search by name, producer, or vintage..."
- No results: "No wines found. Try a different search, or create a new wine record."
- Fallback CTA: "Can't find it? Create a new wine"

### Create Wine
- Heading: "Create New Wine"
- Subtitle: "Pre-filled from the CSV data. Edit anything that needs fixing."
- Submit: "Create Wine"
- Success toast: "Wine created and match resolved."

---

## 4. Email Templates

### Sync Success
**Subject**: "Your inventory is synced with Cru"
**Body**:
> Hi {name},
>
> Your wine list from {source} has been synced with Cru.
>
> **{matched_count}** wines matched and are live on Cru.
> **{pending_count}** wines need a quick review from our team.
>
> We'll take care of the pending matches and let you know when they're live.
>
> Cheers,
> The Cru Team

### Sync Failure
**Subject**: "We hit a snag syncing your inventory"
**Body**:
> Hi {name},
>
> We tried to sync your inventory from {source} but ran into an issue.
>
> **What happened**: {error_description}
>
> **What to do**: {remediation_steps}
>
> If you need help, reply to this email — a real person reads these.
>
> Cheers,
> The Cru Team

### Error Descriptions
| Error | Description | Remediation |
|-------|-------------|-------------|
| Auth expired | "Your {pos_name} connection expired." | "Reconnect your {pos_name} account in Settings → POS Connection." |
| API error | "We couldn't reach {pos_name}'s servers." | "This is usually temporary. We'll try again automatically in a few hours." |
| CSV parse | "We couldn't read your latest file." | "Check that your file is a standard CSV with comma-separated values." |
| Rate limit | "We made too many requests to {pos_name}." | "We'll automatically retry in a few hours. No action needed." |

---

## 5. Microcopy Patterns

### Do
- "Upload your wine list" (not "Import CSV inventory feed")
- "We found 8 columns" (not "8 fields detected in header row")
- "The price looks off" (not "Validation error: price is NaN")
- "We'll walk you through it" (not "Manual data entry required")

### Don't
- Never use "CSV", "API", "sync", "pipeline" in retailer-facing copy
- Never show stack traces or error codes
- Never blame the retailer for errors
- Never use passive voice for error messages
