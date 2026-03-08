### [EPIC-08/STORY-10] — UX Design and User-Facing Copy for Social Layer

**Type:** design
**Story Points:** 3
**Assigned Agent:** ux-designer + marketing-writer
**Phase:** Checkpoint 4: Frontend

#### User Story

As a user, I want the social features to feel natural and human — not like a corporate social network — so that sharing and following feels like something I'd actually do with wine friends.

#### Acceptance Criteria

```gherkin
Given the UX designer delivers social component wireframes
When the designs are reviewed
Then they include: ShareButton placement on wine/producer pages, ShareMenu layout, FollowButton states, UserProfile layout, Following/Followers list layout, and privacy toggle placement

Given the marketing writer delivers social copy
When the copy is reviewed
Then it includes: share button label and toast messages, follow/unfollow button states, empty state messages (no followers yet, no following yet), privacy toggle description, profile bio placeholder text, and "Follow to see more" private profile message

Given the social UX patterns
When compared against Cru's brand guidelines
Then the social layer avoids: follower count vanity (no prominence beyond small text), notification spam patterns, engagement-bait language, or anything that feels like a "social media platform"
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Design | `components/features/social/` | Inform (all component designs) |
| Copy | Social copy strings | Create |

#### Dependencies

- **Blocked by:** None (design and copy can start in parallel with backend)
- **Blocks:** [EPIC-08/STORY-06], [EPIC-08/STORY-07], [EPIC-08/STORY-08], [EPIC-08/STORY-09] — all frontend stories consume these designs and copy

#### Testing Requirements

- [ ] **Accessibility:** All social components meet WCAG 2.1 AA in design
- [ ] **Accessibility:** Color contrast ratios verified for follow button states
- [ ] **Accessibility:** Screen reader announcements defined for optimistic state changes

#### Implementation Notes

**Key UX decisions for ux-designer:**
- ShareButton placement: icon button (share icon) in the action bar of wine detail and producer profile pages. Not too prominent — it's a utility, not a CTA.
- ShareMenu: Shadcn `Popover` anchored to the share icon. Clean list of platform icons + labels. "Copy link" at the top (most common action).
- FollowButton: Compact, secondary style. "Follow" / "Following" / "Unfollow" (on hover). Not a primary CTA — following is a background action.
- Profile page: Clean, minimal layout. Avatar + name prominently. Bio below. Counts small and understated (not vanity metrics). No "activity score" or gamification.
- Privacy toggle: In account settings, not on the profile page itself. Simple on/off with explanation.

**Key copy decisions for marketing-writer:**
- Share toast: "Link copied!" (not "Shared successfully!" — the user knows what they did)
- Empty followers: "No followers yet — share your favorite wines to connect with friends"
- Empty following: "You're not following anyone yet — discover wine lovers you trust"
- Private profile message: "This profile is private. Follow to see more."
- Bio placeholder: "Tell the world what you love about wine (160 chars)"
- Follow CTA from shared link (logged out): "Join Cru to follow [name] and discover wines together"

Tone: warm, casual, wine-friend energy. Never corporate. Never "grow your network" language.
