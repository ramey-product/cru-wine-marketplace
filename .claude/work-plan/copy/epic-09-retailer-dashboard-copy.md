# Retailer Dashboard — Copy Deck

> **Story**: EPIC-09/STORY-11
> **Voice**: Partner-to-partner. Professional, efficient, respectful of retailer's time.
> **Status**: Active

---

## 1. Dashboard Welcome

"Welcome back, {name}. Here's what's happening at {store_name}."

---

## 2. Empty States

| Context | Copy |
|---------|------|
| No orders | "No orders yet — your wines are live on Cru. Orders will appear here as they come in." |
| No analytics | "Analytics will appear once you've received your first orders." |
| No inventory data | "Connect your POS or upload a CSV to see your inventory here." |
| No sync connected | "Set up your POS connection to keep inventory in sync automatically." |

---

## 3. SLA Badge Tooltips

| Level | Tooltip |
|-------|---------|
| Normal (<60m) | "Order placed {time} ago" |
| Warning (60-120m) | "This order has been waiting over an hour. Consider confirming soon." |
| Urgent (>120m) | "This order needs attention — it's been waiting over 2 hours." |

---

## 4. Order Actions

| Action | Button Label | Confirmation |
|--------|-------------|--------------|
| Confirm | "Confirm Order" | *(no confirmation — immediate)* |
| Mark Ready (pickup) | "Mark Ready for Pickup" | *(no confirmation)* |
| Mark Out for Delivery | "Out for Delivery" | *(no confirmation)* |
| Complete | "Complete Order" | *(no confirmation)* |
| Cancel | "Cancel Order" | "Are you sure? The customer will be notified and refunded." |

---

## 5. Inventory Copy

| Element | Copy |
|---------|------|
| Sync healthy | "Connected to {pos_name}. Last sync {time} ago." |
| Sync error | "We hit a snag syncing with {pos_name}." |
| Search placeholder | "Search wines by name..." |
| Stock status labels | "In Stock" / "Low Stock" / "Out of Stock" |
| Total wines label | "Total Wines" |
| Low stock label | "Low Stock" |
| Out of stock label | "Out of Stock" |
| Match rate label | "Match Rate" |

---

## 6. Sync Error Messages

| Error Type | Message | Next Step |
|-----------|---------|-----------|
| Auth expired | "Your {pos_name} connection needs to be refreshed." | "Reconnect in Settings → POS Connection." |
| API unreachable | "We couldn't reach {pos_name}'s servers." | "This is usually temporary. We'll try again soon." |
| Rate limited | "We hit a rate limit with {pos_name}." | "We'll automatically retry. No action needed." |
| CSV parse error | "We couldn't read your latest inventory file." | "Check the file format and try uploading again." |

---

## 7. Analytics Labels

| Metric | Label | Trend Format |
|--------|-------|-------------|
| Revenue | "Revenue (30d)" | "↑ 12% vs last period" / "↓ 3% vs last period" |
| Orders | "Orders (30d)" | Same format |
| Average Order | "Avg. Order Value" | Same format |
| Items/Order | "Items per Order" | Same format |
| Top Sellers heading | "Top Sellers" | — |
| Most Viewed heading | "Most Viewed" | — |
| Weekly Summary heading | "Weekly Summary" | — |

---

## 8. Settings Labels

### Store Information
| Field | Label | Help Text |
|-------|-------|-----------|
| Name | "Store name" | — |
| Address | "Store address" | — |
| Phone | "Phone" | — |
| Email | "Contact email" | "Order notifications go here." |
| Website | "Website" | "Optional" |
| Hours | "Store hours" | "Set your hours for each day." |
| Save | "Save Store Info" | — |

### Fulfillment
| Field | Label | Help Text |
|-------|-------|-----------|
| Pickup toggle | "In-store pickup" | "Allow customers to pick up at your store." |
| Delivery toggle | "Local delivery" | "Deliver orders within your area." |
| Radius | "Delivery radius" | "{n} miles" |
| Save | "Save Fulfillment Settings" | — |

### Notifications
| Toggle | Label |
|--------|-------|
| New order | "Email me when a new order comes in" |
| Low stock | "Email me when wines are running low" |
| Sync errors | "Email me when inventory sync fails" |
| Weekly digest | "Weekly sales summary email" |

---

## 9. Onboarding Tour Steps

| Step | Title | Body |
|------|-------|------|
| 1 | "Here's your order queue" | "Orders from Cru customers show up here. You'll get an email notification too." |
| 2 | "Monitor your inventory" | "Keep your wine list up to date so customers see accurate availability." |
| 3 | "Check your performance" | "See how your wines are performing on Cru. Sales, views, and trends — all in one place." |
| Skip link | "Skip tour" | — |
| Final button | "Got it!" | — |

---

## 10. Order Status Email Templates

### Order Confirmed
**Subject**: "Your order at {store_name} is confirmed"
> Hi {customer_name},
>
> Great news — {store_name} confirmed your order.
>
> **Order #{order_number}**
> {item_list}
> **Total: {total}**
>
> We'll let you know when it's ready.

### Ready for Pickup
**Subject**: "Your wine is ready for pickup at {store_name}"
> Hi {customer_name},
>
> Your order is ready and waiting at {store_name}.
>
> **Address**: {store_address}
> **Hours**: {store_hours}

### Out for Delivery
**Subject**: "Your wine is on its way"
> Hi {customer_name},
>
> Your order from {store_name} is out for delivery.

### Completed
**Subject**: "Thanks for your order from {store_name}"
> Hi {customer_name},
>
> Your order is complete. We hope you enjoy the wine!
>
> Discovered something great? Share it with friends on Cru.

### Cancelled
**Subject**: "Your order at {store_name} has been cancelled"
> Hi {customer_name},
>
> Your order at {store_name} has been cancelled and you'll receive a full refund.
>
> If you have questions, contact {store_name} directly at {store_phone}.

---

## 11. Tone Guidelines

### Do
- "Here's what's happening at your store" (direct, partner-level)
- "This order needs attention" (clear, actionable)
- "We'll try again soon" (reassuring, not alarming)

### Don't
- "Your metrics dashboard awaits!" (cutesy)
- "Attention: sync failure detected" (robotic alarm)
- "Please contact support" (pass-the-buck)
- "Error code: POS_SYNC_401" (technical jargon)
