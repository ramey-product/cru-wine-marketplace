### [EPIC-09/STORY-09] — Retailer Settings Pages

**Type:** frontend
**Story Points:** 5
**Assigned Agent:** fullstack-2
**Phase:** Checkpoint 4: Frontend

#### User Story

As a retailer owner, I want to manage my store information, fulfillment options, and notification preferences so that my Cru presence is always up to date.

#### Acceptance Criteria

```gherkin
Given a retailer owner views Settings
When the page loads
Then they see sections for Store Information, Fulfillment, POS Connection, and Notifications

Given a retailer updates delivery radius from 5 to 10 miles
When they save the form
Then a success toast appears and the new radius takes effect

Given a retailer disables delivery
When they toggle delivery to off
Then the delivery radius and fee fields are disabled/hidden

Given a retailer's POS connection shows "Disconnected"
When they click "Reconnect"
Then they are redirected to the POS OAuth flow (or prompted for CSV re-upload)

Given a retailer staff member views Settings
When the page loads
Then they see only the Notifications section (store settings are owner-only)
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Page | `app/(app)/[orgSlug]/retailer/settings/page.tsx` | Create |
| Component | `components/features/retailer/StoreInfoForm.tsx` | Create |
| Component | `components/features/retailer/FulfillmentSettingsForm.tsx` | Create |
| Component | `components/features/retailer/PosConnectionStatus.tsx` | Create |
| Component | `components/features/retailer/NotificationPreferencesForm.tsx` | Create |

#### Dependencies

- **Blocked by:** [EPIC-09/STORY-05] — Needs settings DAL and Server Actions
- **Blocked by:** [EPIC-09/STORY-11] — UX design for settings forms

#### Testing Requirements

- [ ] **Unit:** Form validation matches Zod schemas (delivery radius positive, hours format)
- [ ] **Integration:** Save store info form → Server Action → success toast → data persisted
- [ ] **Integration:** Toggle delivery off → delivery-specific fields disabled
- [ ] **Accessibility:** All form fields have labels, error states are announced to screen readers

#### Implementation Notes

**Settings page layout:** Tabbed or sectioned layout with clear groupings:
1. **Store Information** — Name, address, phone, email, hours of operation. Hours input as a structured form (day → open time → close time) that serializes to JSONB.
2. **Fulfillment** — Toggle: pickup (on/off), delivery (on/off). When delivery is on: radius (miles), fee ($), estimated time (minutes). Conditional rendering: delivery fields only show when delivery is enabled.
3. **POS Connection** — Read-only status card showing: connection type, last sync, status (connected/disconnected/error). Action button: "Reconnect" (disconnected) or "Disconnect" (connected). This delegates to the POS connection flow from Epic 06.
4. **Notifications** — Toggles: new order email alerts (on/off), daily summary email (on/off). Available to all retailer members (owner + staff).

**Role-based visibility:** Wrap owner-only sections in a role check. Staff members see only the Notifications section. If a staff member navigates directly to a settings URL, show a "You need owner access" message for restricted sections.

**Form state:** Use React Hook Form + Zod resolver for validation. Forms are `'use client'` components with `useTransition` for the save action. Show dirty state indicator ("Unsaved changes") and confirmation on navigation away.
