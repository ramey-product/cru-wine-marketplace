### [EPIC-06/STORY-10] — Retailer Onboarding Form and CSV Upload UI

**Type:** frontend
**Story Points:** 5
**Assigned Agent:** fullstack-2
**Phase:** Checkpoint 4: Frontend

#### User Story

As a retailer, I want to sign up and upload my initial inventory via a guided onboarding form so that my store appears on Cru quickly.

#### Acceptance Criteria

```gherkin
Given a retailer visits the onboarding page
When they complete the multi-step form
Then an organization, membership, and retailer record are created

Given the form requires address input
When the retailer enters their address
Then it geocodes to lat/lng and displays a map pin for confirmation

Given the retailer reaches the inventory step
When they upload a CSV file
Then the file is validated for size (< 10MB) and format, and a preview shows

Given the form submission succeeds
When the retailer is redirected
Then they see their dashboard with import status and a "processing" indicator

Given the form has validation errors
When the retailer submits
Then inline errors appear on the specific fields with corrective guidance
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Page | `app/(app)/retailer-onboarding/page.tsx` | Create |
| Component | `components/features/retailer-onboarding/OnboardingWizard.tsx` | Create |
| Component | `components/features/retailer-onboarding/StoreDetailsStep.tsx` | Create |
| Component | `components/features/retailer-onboarding/POSSelectionStep.tsx` | Create |
| Component | `components/features/retailer-onboarding/CSVUploadStep.tsx` | Create |
| Component | `components/features/retailer-onboarding/FulfillmentStep.tsx` | Create |
| Action | `lib/actions/retailer-onboarding.ts` | Create |

#### Dependencies

- **Blocked by:** EPIC-06/STORY-01 — needs retailers table
- **Blocked by:** EPIC-01/STORY-01 — needs org/membership creation
- **Blocked by:** EPIC-06/STORY-13 — needs UX wireframes
- **Blocks:** EPIC-06/STORY-11 — CSV mapping UI extends from upload step

#### Testing Requirements

- [ ] **Unit:** Form validation catches missing required fields
- [ ] **Integration:** Full form submission creates org + membership + retailer records
- [ ] **Accessibility:** All form fields have labels, error messages are announced to screen readers
- [ ] **E2E:** Complete onboarding flow from form to dashboard redirect

#### Implementation Notes

**Multi-Step Wizard:**
1. **Store Details** — name, address (with geocoding), phone, email, website
2. **POS Selection** — radio group: Square, Lightspeed, Shopify, Clover, CSV Only, Other
3. **Fulfillment** — checkboxes: pickup, delivery (+ radius slider if delivery selected)
4. **Initial Inventory** — CSV upload dropzone with template download link
5. **Review & Submit** — summary of all entries, submit button

**Geocoding:**
- Use a geocoding API (e.g., Mapbox or Google Geocoding) to convert address → lat/lng
- Display a small map preview using Mapbox GL or Google Maps embed for visual confirmation
- Store as PostGIS geography point

**Form state management:** Use `react-hook-form` with Zod resolver for multi-step validation. Persist state across steps with form context.

**CSV template download:** Provide a downloadable `.csv` template file with example data and column headers.
