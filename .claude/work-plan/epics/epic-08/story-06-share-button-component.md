### [EPIC-08/STORY-06] — Share Button Component

**Type:** frontend
**Story Points:** 5
**Assigned Agent:** fullstack-2
**Phase:** Checkpoint 4: Frontend

#### User Story

As a user, I want to share a wine or producer page to my preferred platform so that I can recommend it to friends with a single tap.

#### Acceptance Criteria

```gherkin
Given a user taps "Share" on a wine detail page on mobile
When the Web Share API is supported
Then the native share sheet opens with the wine name, description, and URL with UTM params

Given a user clicks "Share" on desktop where Web Share API is not supported
When the fallback UI renders
Then it shows "Copy link," Twitter/X, Facebook, and Email share options

Given a user clicks "Copy link"
When the clipboard write succeeds
Then a toast notification confirms "Link copied!" and a share_event is tracked with platform = "clipboard"

Given a user shares via the native share sheet
When the share dialog closes
Then a share_event is tracked with platform = "native_share"

Given any share action
When the URL is constructed
Then UTM parameters are appended: utm_source=share&utm_medium=[platform]&utm_campaign=user_share
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Component | `components/features/social/ShareButton.tsx` | Create |
| Component | `components/features/social/ShareMenu.tsx` | Create (desktop fallback) |
| Hook | `lib/hooks/useWebShare.ts` | Create |

#### Dependencies

- **Blocked by:** [EPIC-08/STORY-04] — share tracking action/API must exist
- **Blocked by:** [EPIC-08/STORY-05] — OG metadata should be in place for good share previews
- **Blocks:** None

#### Testing Requirements

- [ ] **Unit:** useWebShare hook correctly detects Web Share API support
- [ ] **Unit:** UTM parameters are correctly appended to share URLs
- [ ] **Unit:** ShareMenu renders correct platform links with proper URLs
- [ ] **Integration:** Share button calls trackShare action with correct platform
- [ ] **Accessibility:** Share button has aria-label, ShareMenu is keyboard navigable

#### Implementation Notes

**Component architecture:**
- `ShareButton` — client component (`'use client'`). Detects Web Share API support via `navigator.share`. On mobile (supported): calls `navigator.share()` directly. On desktop (unsupported): opens `ShareMenu` popover.
- `ShareMenu` — Shadcn `Popover` with share options: Copy Link, Twitter/X, Facebook, Email. Each option constructs the appropriate share URL with UTM params.
- `useWebShare` hook — encapsulates `navigator.share` detection and invocation, handles the promise rejection when user cancels the share sheet.

**UTM construction:**
```typescript
function buildShareUrl(baseUrl: string, platform: string): string {
  const url = new URL(baseUrl)
  url.searchParams.set('utm_source', 'share')
  url.searchParams.set('utm_medium', platform)
  url.searchParams.set('utm_campaign', 'user_share')
  return url.toString()
}
```

**Platform-specific share URLs:**
- Twitter/X: `https://twitter.com/intent/tweet?url={url}&text={text}`
- Facebook: `https://www.facebook.com/sharer/sharer.php?u={url}`
- Email: `mailto:?subject={subject}&body={body}`

**Clipboard:** Use `navigator.clipboard.writeText()` with Shadcn `toast()` confirmation.

**Tracking:** Fire `trackShare` action (or `sendBeacon` to API route for non-blocking) after each share action. For native share, track on share sheet open (we can't detect if user completed the share).

Props interface:
```typescript
interface ShareButtonProps {
  shareableType: 'wine' | 'producer'
  shareableId: string
  title: string
  description: string
  url: string
  imageUrl?: string
}
```
