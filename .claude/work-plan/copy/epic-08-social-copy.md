# Social Layer — Copy Deck

> **Story**: EPIC-08/STORY-10
> **Voice**: Warm, casual, wine-friend energy. Never corporate. Anti-vanity-metric.
> **Status**: Active

---

## 1. Share Component

| Element | Copy |
|---------|------|
| Share menu title | "Share this wine" / "Share this producer" |
| Copy link option | "Copy link" |
| Messages option | "Messages" |
| Email option | "Email" |
| Twitter option | "Twitter" |
| Facebook option | "Facebook" |
| Success toast | "Link copied!" |
| Share button aria | "Share {name}" |

---

## 2. Follow Component

| State | Button Label | ARIA |
|-------|-------------|------|
| Not following | "Follow" | "Follow {name}" |
| Following | "Following" | "Following {name}. Click to unfollow." |
| Hover on following | "Unfollow" | — |
| Loading | "..." | "Updating follow status" |
| Error toast | "Something went wrong. Try again." | — |

### Screen Reader Announcements
- On follow: "Now following {name}"
- On unfollow: "Unfollowed {name}"

---

## 3. Profile Page

| Element | Copy |
|---------|------|
| Bio placeholder | "Tell the world what you love about wine (160 chars)" |
| Wishlisted section | "Wishlisted Wines" |
| Recently viewed | "Recently Viewed" |
| Follow counts | "{n} following · {n} followers" |

### Empty States

**Own profile, no wishlist:**
> You haven't saved any wines yet. Browse and save wines you love — they'll show up here.
> [Browse wines →]

**Own profile, no followers:**
> No followers yet — share your favorite wines to connect with friends.

**Own profile, not following anyone:**
> You're not following anyone yet — discover wine lovers you trust.

**Other's profile, no public wines:**
> {Name} hasn't shared any wines yet. Check back later.

**Private profile:**
> This profile is private. Follow to see more.

---

## 4. Privacy Settings

| Element | Copy |
|---------|------|
| Toggle label | "Make my profile private" |
| Toggle description | "When private, only your followers can see your wishlisted wines and activity." |
| Section heading | "Profile Visibility" |

---

## 5. Logged-Out / Unauthenticated States

| Context | Copy |
|---------|------|
| Follow CTA from shared link | "Join Cru to follow {name} and discover wines together." |
| Wishlist CTA from shared link | "Sign up to start saving wines you love." |
| Share page view (logged out) | "Discover {wine_name} on Cru — a better way to find wine." |

---

## 6. Tone Guidelines

### Do
- "Link copied!" (acknowledge what happened, move on)
- "No followers yet" (neutral, no pressure)
- "Discover wine lovers you trust" (positive framing)
- "Follow to see more" (clear, simple)

### Don't
- "Shared successfully!" (over-formal)
- "Grow your network" (LinkedIn energy)
- "You have 0 followers" (vanity metric emphasis)
- "Your social score" (gamification)
- "Invite friends to boost your profile" (engagement bait)
- "See who's viewed your profile" (creepy)
