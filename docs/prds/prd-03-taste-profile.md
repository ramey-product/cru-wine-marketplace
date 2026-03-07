# PRD: Taste Profile Onboarding

**Feature:** Taste Profile Onboarding
**Priority:** P0 — Launch Critical (RICE: 6,000)
**Author:** Matt Ramey
**Date:** March 6, 2026
**Status:** Draft
**Parent:** [Cru — Product Spec](https://www.notion.so/31c6d459228481d9bdfecf8d36b58989)

---

## 1. Problem Statement

The single biggest barrier to wine discovery is vocabulary. Consumers know what they like when they taste it, but they can't describe it in the language the industry uses. "I like that smooth red that's not too dry" is a perfectly valid preference — but no existing platform can translate it into a recommendation. Vivino asks for ratings after purchase. Wine.com assumes you already know varietals. CellarTracker speaks exclusively in tasting-note jargon.

Cru's Taste Profile Onboarding flips the model: instead of quizzing users on grape varietals or making them rate wines they've never tried, it asks them to describe what they enjoy in their own words and maps those preferences to a palate model that powers every recommendation going forward. This is Cru's key differentiator — the moment where "I don't know wine" becomes "Cru knows me."

This feature affects every Explorer who signs up. If onboarding feels like a test, users bounce. If it feels like a conversation, they convert to the discovery loop. The Taste Profile is the data foundation for the entire curation engine.

## 2. Goals

**User Goals:**
- Complete a taste profile in under 3 minutes without encountering a single piece of wine jargon they don't understand
- Feel that Cru "gets them" — that the profile output reflects their actual preferences, not a generic bucket
- See immediate value: first recommendation batch appears as soon as the profile is complete
- Be able to skip the onboarding and still get value from browsing (no hard gate)

**Business Goals:**
- Achieve 65%+ taste profile completion rate among new signups in the first session
- Generate structured taste preference data that the AI Curation Engine can immediately use for rules-based matching
- Collect the implicit preference signals (flavor affinities, aversions, price comfort, adventurousness) that become ML training data when the model upgrades in Month 5-6
- Differentiate Cru from every competitor in the first 3 minutes of the user experience

## 3. Non-Goals

- **Wine rating or review input** — That's Advanced Taste Learning (P1). Onboarding captures initial preferences; ongoing refinement is a separate feature.
- **ML-powered taste modeling** — V1 uses a rules-based mapping from user language to flavor/style attributes. ML models layer in during the Month 5-6 curation upgrade.
- **Sommelier-level precision** — The profile doesn't need to identify a user's exact preference for specific appellations. It needs to get them into the right neighborhood (e.g., "you probably like medium-bodied reds with earthy flavors") so curation can start.
- **Mandatory completion** — Users who skip onboarding still get access to browse and generic curation. The profile enhances, not gates.
- **Food pairing quizzes or gamification** — Keep it conversational and fast. No badges, no scores, no "wine personality type" gimmick.

## 4. User Stories

### Explorer (Primary)
- As an Explorer, I want to describe my taste preferences using words I already know (like "I like bold flavors" or "I don't like anything too sweet") so that I don't need to learn wine vocabulary to get started.
- As an Explorer, I want to answer questions about flavors I enjoy in food and drinks generally (coffee, chocolate, fruit) so that Cru can infer my wine preferences from things I already understand.
- As an Explorer, I want to see a summary of what Cru thinks I like after completing the profile so that I can confirm or correct it before seeing recommendations.
- As an Explorer, I want to indicate wines I've enjoyed in the past (by name, photo, or description) so that Cru has concrete reference points for my taste.
- As an Explorer, I want the option to skip onboarding and come back to it later so that I'm not forced into a flow before I'm ready.

### Enthusiast (Secondary)
- As an Enthusiast, I want to specify varietals, regions, or producers I already know I love so that my profile starts from a more advanced baseline.
- As an Enthusiast, I want to indicate styles I actively dislike (e.g., "I never drink oaked Chardonnay") so that those are filtered from my recommendations.

### Edge Cases
- As a user who has never consciously thought about their taste preferences, I want the questions to be approachable enough that I can answer them honestly with "I don't know" options.
- As a user who completes the profile but gets recommendations they don't like, I want to re-do the onboarding or adjust my profile so that the system corrects.
- As a user on a slow connection, I want the onboarding flow to work without heavy assets loading so that I don't abandon mid-flow.

## 5. Requirements

### Must-Have (P0)

**Onboarding Flow (3-5 screens)**

Screen 1 — Flavor Preferences:
- "What flavors do you gravitate toward?" — presented as selectable tags, not free text
- Tags organized by category: Fruit (berry, citrus, tropical, stone fruit), Earth (mushroom, mineral, herbal), Spice (pepper, cinnamon, vanilla), Other (chocolate, coffee, floral, smoky)
- Users select 3-8 tags. "Not sure" option skips to next screen.
- Acceptance criteria:
  - Given a user selects "berry," "earthy," and "pepper," when they proceed, then these are stored as flavor_affinities in the taste_profiles table
  - Given a user selects "Not sure," when they proceed, then they advance without error and the system marks flavor preferences as "unset"

Screen 2 — Aversions:
- "Anything you know you DON'T like?" — same tag format
- Tags: Very sweet, Very dry/tannic, Very acidic/sour, Oaky/buttery, Bitter, Fizzy/sparkling
- Users select 0+ tags. This screen is optional.
- Acceptance criteria:
  - Given a user selects "Very sweet" and "Oaky/buttery," when they proceed, then these are stored as flavor_aversions and the curation engine excludes wines with those dominant profiles

Screen 3 — Drinking Context:
- "How do you usually drink wine?" — single or multi-select
- Options: "With dinner at home," "At restaurants," "At parties/gatherings," "Solo relaxation," "As a gift," "To learn and explore"
- Acceptance criteria:
  - Given a user selects "With dinner at home" and "To learn and explore," when they proceed, then these context signals are stored and used to weight occasion-based curation

Screen 4 — Adventurousness Scale:
- "How adventurous are you with wine?" — slider or 3-option selector
- Options: "Stick with what I know" / "Open to suggestions" / "Surprise me"
- This directly controls recommendation diversity in the curation engine
- Acceptance criteria:
  - Given a user selects "Surprise me," when they see recommendations, then the curation engine increases varietal and regional diversity by 2x compared to "Stick with what I know"

Screen 5 — Profile Summary:
- Displays a plain-language summary: "Based on what you told us, you probably enjoy [style description]. Here are your first picks."
- "Looks right!" button → navigate to personalized browse/curation feed
- "Not quite" button → option to adjust specific preferences or redo onboarding
- First batch of 6-8 wine recommendations shown immediately below
- Acceptance criteria:
  - Given a user completes all screens, when the summary displays, then it shows a human-readable paragraph (not a list of tags) describing their predicted style
  - Given a user taps "Looks right!", when they navigate to the main feed, then recommendations reflect their profile within 1 second (no loading delay for first batch)

**Optional Quick-Add: "Wines I've Loved"**
- Accessible from the profile summary or settings
- User can type a wine name → autocomplete against the Cru wine database
- Each matched wine adds its flavor profile data to the user's taste model
- Acceptance criteria:
  - Given a user types "Whispering Angel" and selects it from autocomplete, when the wine is added, then its flavor attributes (rosé, Provence, dry, light-bodied) are factored into the user's taste profile

**Technical Requirements**
- `taste_profiles` table: user_id, flavor_affinities (JSONB), flavor_aversions (JSONB), drinking_contexts (JSONB), adventurousness_score (integer 1-3), profile_version (integer), org_id
- `taste_profile_wines` table: user_id, wine_id, source ("onboarding" | "manual_add"), org_id
- All tables with RLS, org_id, updated_at triggers
- DAL functions in `lib/dal/taste-profiles.ts`
- Server Actions in `lib/actions/taste-profile.ts` — validate with Zod, auth check, DAL call, revalidatePath
- Profile summary generation: rules-based template system mapping tag combinations to human-readable descriptions (not AI-generated at V1)
- Onboarding flow as a Client Component with local state; only writes to server on completion (single Server Action call)

### Nice-to-Have (P1)

- Photo upload: snap a wine label to add to "Wines I've Loved" (OCR + wine DB match)
- Progressive profiling: ask one follow-up question per session after onboarding (e.g., "You browsed a lot of Italian reds this week — should we show you more?")
- A/B test different onboarding flows (tag-based vs. slider-based vs. conversational)
- "Wine personality" fun output (e.g., "You're an Explorer who loves the unexpected") — shareable to social

### Future Considerations (P2)

- ML-powered taste embeddings that learn from every interaction, not just explicit preferences
- Taste profile comparison: "See how your palate compares to [friend]"
- Collaborative taste profiles for couples or households

## 6. Success Metrics

### Leading Indicators (Week 1-4)
| Metric | Target | Stretch | Measurement |
|--------|--------|---------|-------------|
| Profile completion rate | 65% of signups complete in first session | 75% | taste_profiles table fill rate |
| Time to complete | < 3 minutes average | < 2 minutes | Event timestamps |
| Drop-off per screen | < 15% per screen | < 10% | Funnel analytics |
| "Looks right!" rate on summary | 70% | 80% | Button click events |
| Skip rate | < 30% of signups skip onboarding | < 20% | Skip event tracking |

### Lagging Indicators (Month 1-3)
| Metric | Target | Stretch | Measurement |
|--------|--------|---------|-------------|
| Profile → first purchase conversion | 25% of profile completers purchase within 14 days | 35% | Funnel analytics |
| Recommendation satisfaction | 60% of curated picks get a positive signal (click, wishlist, purchase) | 70% | Interaction events on curated content |
| Profile edit rate | < 20% redo or significantly edit within 30 days | < 15% | Profile version changes |
| Taste Profile → retention | Users with complete profiles have 2x Day-30 retention vs. skippers | 2.5x | Cohort analysis |

## 7. Open Questions

- **[Design — blocking]** Final tag taxonomy for Screen 1 and Screen 2 — how many tags is too many? Proposed: 15-20 per screen, organized in 4 categories.
- **[Engineering — non-blocking]** Should the profile summary be a pre-written template matrix or an LLM-generated paragraph? Decision: template matrix at V1 for predictability and speed. LLM upgrade in P1.
- **[Product — blocking]** What does the "skip" experience look like? Generic curation (most popular in your area)? Or fully unfiltered browse? Proposed: generic curation seeded by location and price range only.
- **[Data — non-blocking]** How do we map flavor tags to wine attributes? Need a wine-to-flavor-profile mapping table. Who maintains it — editorial team or automated from producer data?

## 8. Timeline Considerations

- **Build order: #3** — Begins after Search & Browse ships (Week 3-4).
- **Week 3-6 of pre-launch sprint** (Track A)
- **Hard dependency:** Search & Browse (#2) — Taste Profile needs the wine content and browse infrastructure to generate recommendations against.
- **Downstream dependents:** AI Curation Engine (#7) consumes the taste profile as its primary input signal.
- **Parallel coordination:** Producer Storytelling (#4) must have wine flavor/attribute data populated for the taste matching rules to work. Content + data seeding is a cross-track dependency.
