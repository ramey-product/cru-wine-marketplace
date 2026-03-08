### [EPIC-09/STORY-11] — UX Design, Retailer Copy & Onboarding

**Type:** design
**Story Points:** 3
**Assigned Agent:** ux-designer + marketing-writer
**Phase:** Checkpoint 3: Backend (design runs parallel to backend)

#### User Story

As a retailer using the dashboard for the first time, I want clear navigation, helpful empty states, and professional copy so that I feel confident managing my Cru presence.

#### Acceptance Criteria

```gherkin
Given a new retailer logs in for the first time
When the dashboard loads
Then they see a brief onboarding guide highlighting key areas (orders, inventory, analytics, settings)

Given a retailer has no pending orders
When they view the order queue
Then a friendly empty state says "No orders yet — your wines are live on Cru. Orders will appear here as they come in."

Given a retailer's POS sync has failed
When the error banner appears
Then the copy is clear, non-technical, and includes specific next steps

Given a retailer reads an order status email
When they see the email content
Then the tone is professional, warm, and branded (consistent with Cru's voice)
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Component | UX specs for all retailer dashboard components | Create |
| Component | Copy document for all retailer-facing text | Create |
| Component | Email template copy for order status notifications | Create |

#### Dependencies

- **Blocked by:** Nothing — design and copy work can begin as soon as the PRD is understood
- **Blocks:** [EPIC-09/STORY-06] through [EPIC-09/STORY-10] — Frontend stories consume UX specs and copy

#### Testing Requirements

- [ ] **Accessibility:** All UX designs pass contrast ratio checks and include focus state specifications
- [ ] **Accessibility:** Interaction patterns are keyboard-navigable

#### Implementation Notes

**UX deliverables:**
- Dashboard layout wireframe: order queue dominant (70% viewport on desktop), analytics/inventory/settings as tabs
- Order queue interaction patterns: row click → detail, inline action buttons, SLA badge placement
- Inventory health monitor: sync status card design, error banner hierarchy, quick stock search UX
- Analytics page: cards + lists layout, empty state designs
- Settings forms: section grouping, conditional field visibility, save/discard patterns
- Mobile responsive breakpoints: single-column layout for tablet/phone (retailers may check on mobile)

**Copy deliverables:**
- All empty state messages (orders, analytics, inventory)
- Error banner copy for sync failures (CSV vs API, with specific remediation steps)
- SLA warning/critical badge tooltip text
- Settings section headers and help text
- Onboarding walkthrough step text (3-4 steps: "Here's your order queue," "Monitor your inventory," "Check your analytics," "Update your settings")
- Email template copy for all order status change notifications (confirmed, ready, out for delivery, completed, cancelled)
- Dashboard header welcome message: "Welcome back, [Name]. Here's what's happening at [Store Name]."

**Brand voice:** The retailer dashboard tone is **partner-to-partner** — professional, efficient, respectful of the retailer's time. Not cutesy. Not corporate. Direct and helpful. The retailer is a business partner, not a consumer being delighted.
