### [EPIC-09/STORY-05] — Retailer Settings DAL & Server Actions

**Type:** backend
**Story Points:** 2
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a retailer owner, I want to update my store information, fulfillment options, and notification preferences so that my Cru presence accurately reflects my business.

#### Acceptance Criteria

```gherkin
Given a retailer owner updates delivery_radius from 5 to 10 miles
When the update saves
Then users within the expanded radius begin seeing this retailer's wines

Given a retailer disables delivery
When the setting saves
Then only "Pickup" appears as a fulfillment option for this retailer's wines

Given a retailer staff member tries to update store settings
When the role check runs
Then it returns { error: 'Owner access required' }

Given a retailer member updates their notification preferences
When they toggle new_order_email to false
Then they no longer receive new order notification emails
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| DAL | `lib/dal/retailer-settings.ts` | Create |
| Action | `lib/actions/retailer-settings.ts` | Create |
| Validation | `lib/validations/retailer-settings.ts` | Create |

#### Dependencies

- **Blocked by:** [EPIC-09/STORY-01] — Needs retailer fulfillment columns and notification_preferences table
- **Blocks:** [EPIC-09/STORY-09] — Settings UI needs these DAL functions

#### Testing Requirements

- [ ] **Unit:** Zod validation for settings schemas (delivery_radius must be positive, hours format validation)
- [ ] **Integration:** updateRetailerSettings() correctly updates fulfillment columns on retailers table
- [ ] **Integration:** updateNotificationPreferences() correctly updates per-member preferences
- [ ] **RLS:** Only owner role can update store settings; any member can update their own notification preferences

#### Implementation Notes

**DAL functions:**
- `getRetailerSettings(client, retailerId)` — returns store info, fulfillment config, POS connection status
- `getNotificationPreferences(client, retailerMemberId)` — returns per-member notification settings
- `getPosConnectionStatus(client, retailerId)` — returns connection status, last sync, errors from `retailer_pos_connections`

**Server Actions:**
- `updateRetailerSettings(retailerId, data)` — Zod validate → auth → owner role check → DAL update → revalidatePath. Covers: store name, address, phone, email, hours, fulfillment settings.
- `updateNotificationPreferences(retailerMemberId, data)` — Zod validate → auth → member check (own prefs only) → DAL update → revalidatePath
- `reconnectPos(retailerId)` — initiates POS reconnection flow (redirect to OAuth for API-based, or prompt for new CSV)

**Hours of operation** stored as JSONB: `{ "mon": "10:00-20:00", "tue": "10:00-20:00", ... }`. Validate format in Zod schema.
