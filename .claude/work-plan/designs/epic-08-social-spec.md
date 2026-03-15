# Social Layer — UX Design Spec

> **Story**: EPIC-08/STORY-10
> **Routes**: Wine/producer action bars, `/profile/[username]`, Settings
> **Reference**: UX Design Bible Sections 5, 7, 10
> **Status**: Active — engineering complete

---

## 1. Design Philosophy

Social features should feel natural, not like a social network. Anti-vanity-metric. No follower count prominence, no engagement scores, no notification spam. Wine friends sharing discoveries — that's it.

---

## 2. ShareButton

### Placement
- Wine detail page: action bar alongside wishlist button
- Producer profile: below hero section
- Collection detail: below collection header

### Design
- Icon button: `h-10 w-10 rounded-full border border-border`
- Icon: Lucide `Share2`, `h-4 w-4`
- Not prominent — utility, not CTA
- `aria-label="Share {wine_name}"`

### ShareMenu (Popover)
```
┌──────────────────────┐
│  Share this wine      │
│                       │
│  📋 Copy link         │  <- first option, most common
│  ─────────────────── │
│  💬 Messages          │
│  ✉️  Email             │
│  🐦 Twitter           │
│  📘 Facebook          │
└──────────────────────┘
```

- Shadcn Popover anchored to ShareButton
- Width: `w-56`
- Items: `flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-md cursor-pointer`
- "Copy link" at top, separator, then platform options
- On copy: toast "Link copied!" (not "Shared successfully!")

---

## 3. FollowButton

### States
| State | Label | Style |
|-------|-------|-------|
| Not following | "Follow" | Secondary outline: `border border-border text-foreground` |
| Following | "Following" | Filled: `bg-primary/10 text-primary border-primary/20` |
| Hover while following | "Unfollow" | Destructive hint: `border-destructive/50 text-destructive` |

### Design
- Compact: `h-8 px-3 text-sm font-medium rounded-full`
- Not a primary CTA — secondary action
- Optimistic UI: state changes immediately, reverts on error
- `aria-label="Follow {username}"` / `aria-label="Unfollow {username}"`
- Screen reader announcement on state change: `aria-live="polite"`

---

## 4. User Profile Page

```
┌─────────────────────────────────────────┐
│                                         │
│     [Avatar, 80px]                      │
│     Display Name                        │  <- text-2xl font-bold
│     @username                           │  <- text-sm text-muted-foreground
│                                         │
│     "I love natural wines and           │
│      discovering small producers."      │  <- text-sm text-foreground/80
│                                         │
│     12 following · 8 followers          │  <- small, understated
│                                         │
│     [Follow]                            │
│                                         │
│  ── Wishlisted Wines ──                 │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐           │
│  │Wine│ │Wine│ │Wine│ │Wine│           │
│  │Card│ │Card│ │Card│ │Card│           │
│  └────┘ └────┘ └────┘ └────┘           │
│                                         │
│  ── Recently Viewed ──                  │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐           │
│  │Wine│ │Wine│ │Wine│ │Wine│           │
│  └────┘ └────┘ └────┘ └────┘           │
└─────────────────────────────────────────┘
```

### Layout
- Avatar: `h-20 w-20 rounded-full`
- Counts: `text-sm text-muted-foreground` — small, not vanity metrics
- Counts link to following/followers lists
- Wine sections: standard WineCard grids
- Desktop: centered layout, `max-w-3xl mx-auto`
- Mobile: full width

### Private Profile
```
┌─────────────────────────────────────────┐
│     [Avatar]                            │
│     Display Name                        │
│     @username                           │
│                                         │
│     🔒 This profile is private.        │
│     Follow to see more.                 │
│                                         │
│     [Follow]                            │
└─────────────────────────────────────────┘
```

---

## 5. Following / Followers Lists

```
┌─────────────────────────────────────────┐
│  ← Back to profile                      │
│                                         │
│  Following (12)                         │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ [Avatar] Jane D.    [Following] │    │
│  │          @jane_wine             │    │
│  ├─────────────────────────────────┤    │
│  │ [Avatar] Mike R.    [Follow]    │    │
│  │          @mike_vino             │    │
│  ├─────────────────────────────────┤    │
│  │ [Avatar] Sarah K.   [Following] │    │
│  │          @sarahk                │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

- List items: `flex items-center gap-3 p-3 border-b`
- Avatar: `h-10 w-10 rounded-full`
- Name: `text-sm font-medium`, username: `text-xs text-muted-foreground`
- FollowButton on each row

---

## 6. Privacy Toggle

Lives in account settings, NOT on profile page:

```
Settings > Privacy

┌─────────────────────────────────────────┐
│  Profile visibility                     │
│                                         │
│  [Toggle] Make my profile private       │
│                                         │
│  "When private, only your followers     │
│   can see your wishlisted wines and     │
│   activity."                            │
└─────────────────────────────────────────┘
```

---

## 7. Accessibility

- FollowButton: `aria-pressed` for toggle state
- ShareMenu: `role="menu"` with `role="menuitem"` per option
- Follow state changes: `aria-live="polite"` announcement
- Avatar images: `alt="{name}'s profile photo"`
- Private profile lock icon: `aria-hidden="true"` (text communicates the state)
- Keyboard: Tab through follow buttons in lists, Enter to toggle
