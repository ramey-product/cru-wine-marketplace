# Epic: [EPIC-03] — Taste Profile Onboarding

**Source PRD:** `docs/prds/prd-03-taste-profile.md`
**Priority:** P0 — Launch Critical
**RICE Score:** 6,000
**Epic Owner:** pm-orchestrator
**Primary Agents:** sr-backend, fullstack-1, fullstack-2, ux-designer, marketing-writer

## Epic Summary

Taste Profile Onboarding is Cru's core differentiator — a 3-minute, jargon-free flow that translates everyday flavor language into a structured palate model. Instead of quizzing users on grape varietals, it asks about flavors they already know (berry, earthy, pepper) and maps those to wine attributes that power the curation engine. This epic delivers the 5-screen onboarding flow, the taste_profiles data model, the "Wines I've Loved" quick-add feature, and the rules-based profile summary generator.

## Success Criteria

- [ ] 65%+ taste profile completion rate among new signups in first session
- [ ] Onboarding completes in under 3 minutes average
- [ ] Less than 15% drop-off per screen in the funnel
- [ ] Profile summary generates a human-readable paragraph (not a tag list)
- [ ] First recommendation batch appears within 1 second of "Looks right!" tap
- [ ] Users who skip onboarding can still browse and receive generic curation
- [ ] Profile can be re-done or edited from settings at any time

## Architecture Dependencies

- **Database tables:** `taste_profiles`, `taste_profile_wines`
- **Depends on:** `wines` table (EPIC-02/STORY-01) for "Wines I've Loved" autocomplete and flavor attribute lookup
- **Depends on:** `profiles` table (EPIC-01/STORY-01) for user identity
- **Downstream:** EPIC-07 Curation Engine consumes taste_profiles as its primary input signal
- **Shared components:** Tag selector component (reusable), profile summary template engine

## Cross-Cutting Concerns

- **CG-2 Table Categorization:** `taste_profiles` and `taste_profile_wines` are user-scoped tables. Per CG-2 resolution, user-scoped tables do NOT have `org_id`. However, PRD specifies `org_id` on these tables. Following CG-2 resolution (approved in Checkpoint 1) — these tables use `user_id` as primary scope, no `org_id` column.
- **Data seeding dependency:** Wine-to-flavor-profile mapping data must be populated before taste matching rules work. Cross-track dependency with EPIC-04 (Producer Storytelling) and content seeding.
- **Skip experience:** Users who skip onboarding receive generic curation seeded by location and price range only (per PRD open question resolution).
- **Profile summary generation:** Rules-based template matrix at V1 (not LLM-generated) for predictability and speed.

## Technical Risks & Open Questions

- [ ] Final tag taxonomy for Screen 1 and Screen 2 — how many tags is optimal? PRD proposes 15-20 per screen in 4 categories.
- [ ] Wine-to-flavor-profile mapping table — who maintains it (editorial team vs. automated)? Needs a `wine_flavor_profiles` or equivalent data structure.
- [ ] Profile summary template matrix needs authoring — how many template combinations? Rough estimate: ~50-100 templates based on tag combinations.
- [ ] How does adventurousness_score (1-3) translate to concrete recommendation diversity multipliers in EPIC-07?

---

## Developer Stories

> Individual story files are located in `.claude/work-plan/stories/epic-03/`.

| Story | Title | Type | Points | Agent | Phase | Status |
|-------|-------|------|--------|-------|-------|--------|
| [STORY-01](../stories/epic-03/story-01-create-taste-profiles-tables-rls.md) | Create taste_profiles and taste_profile_wines tables with RLS | backend | 5 | sr-backend | CP3 | pending |
| [STORY-02](../stories/epic-03/story-02-flavor-tag-taxonomy-mapping-constants.md) | Create flavor tag taxonomy data and mapping constants | backend | 3 | sr-backend | CP3 | pending |
| [STORY-03](../stories/epic-03/story-03-taste-profile-dal-server-actions.md) | Implement taste profile DAL and Server Actions | backend | 5 | sr-backend | CP3 | pending |
| [STORY-04](../stories/epic-03/story-04-profile-summary-template-engine.md) | Implement profile summary template engine | backend | 3 | sr-backend | CP3 | pending |
| [STORY-05](../stories/epic-03/story-05-design-onboarding-flow-ux.md) | Design taste profile onboarding flow UX | design | 5 | ux-designer | CP4 | pending |
| [STORY-06](../stories/epic-03/story-06-build-onboarding-client-component.md) | Build taste profile onboarding Client Component | frontend | 8 | fullstack-1 | CP4 | pending |
| [STORY-07](../stories/epic-03/story-07-wines-ive-loved-quick-add.md) | Build "Wines I've Loved" quick-add feature | frontend | 5 | fullstack-2 | CP4 | pending |
| [STORY-08](../stories/epic-03/story-08-onboarding-copy-microcopy.md) | Write taste profile onboarding copy and microcopy | copy | 3 | marketing-writer | CP4 | pending |
| [STORY-09](../stories/epic-03/story-09-taste-profile-settings-page.md) | Build taste profile settings page for editing | frontend | 3 | fullstack-1 | CP4 | pending |

**Total: 9 stories, 40 story points**
