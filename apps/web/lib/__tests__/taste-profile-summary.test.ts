import { describe, it, expect } from 'vitest'
import {
  generateTasteProfileSummary,
  type TasteProfileSummaryInput,
} from '@/lib/utils/taste-profile-summary'

function makeInput(
  overrides: Partial<TasteProfileSummaryInput> = {}
): TasteProfileSummaryInput {
  return {
    flavor_affinities: [],
    flavor_aversions: [],
    drinking_contexts: ['dinner_at_home'],
    adventurousness_score: 2,
    ...overrides,
  }
}

describe('generateTasteProfileSummary', () => {
  // ---------------------------------------------------------------------------
  // Edge case: no affinities
  // ---------------------------------------------------------------------------

  it('returns graceful fallback when no affinities are selected', () => {
    const result = generateTasteProfileSummary(makeInput())
    expect(result).toContain('open mind')
    expect(result).toContain('crowd favorites')
    expect(result.length).toBeGreaterThan(0)
  })

  // ---------------------------------------------------------------------------
  // Basic affinity combinations
  // ---------------------------------------------------------------------------

  it('generates a fruit-driven summary for fruit affinities', () => {
    const result = generateTasteProfileSummary(
      makeInput({ flavor_affinities: ['berry', 'citrus'] })
    )
    expect(result).toContain('fruit')
    expect(result.length).toBeGreaterThan(0)
  })

  it('generates an earthy summary for earth affinities', () => {
    const result = generateTasteProfileSummary(
      makeInput({ flavor_affinities: ['mushroom', 'mineral'] })
    )
    expect(result).toContain('earth')
    expect(result.length).toBeGreaterThan(0)
  })

  it('generates a bold earthy+fruit summary for mixed affinities', () => {
    const result = generateTasteProfileSummary(
      makeInput({ flavor_affinities: ['berry', 'mushroom', 'pepper'] })
    )
    expect(result).toContain('bold')
    expect(result).toContain('earth')
    expect(result).toContain('berry fruit')
    expect(result.length).toBeGreaterThan(0)
  })

  it('generates a spice-focused summary for spice-only affinities', () => {
    const result = generateTasteProfileSummary(
      makeInput({ flavor_affinities: ['pepper', 'cinnamon'] })
    )
    expect(result).toContain('spice')
    expect(result.length).toBeGreaterThan(0)
  })

  it('handles "other" category affinities', () => {
    const result = generateTasteProfileSummary(
      makeInput({ flavor_affinities: ['chocolate', 'smoky'] })
    )
    expect(result).toContain('rich')
    expect(result).toContain('smoky')
    expect(result.length).toBeGreaterThan(0)
  })

  // ---------------------------------------------------------------------------
  // Aversion clauses
  // ---------------------------------------------------------------------------

  it('includes aversion clause for a single aversion', () => {
    const result = generateTasteProfileSummary(
      makeInput({
        flavor_affinities: ['berry'],
        flavor_aversions: ['very_sweet'],
      })
    )
    expect(result).toContain('avoid')
    expect(result).toContain('sweeter styles')
  })

  it('includes aversion clause for two aversions', () => {
    const result = generateTasteProfileSummary(
      makeInput({
        flavor_affinities: ['berry'],
        flavor_aversions: ['very_sweet', 'oaky_buttery'],
      })
    )
    expect(result).toContain('avoid')
    expect(result).toContain('sweeter styles')
    expect(result).toContain('oaky or buttery')
  })

  it('handles all aversions selected', () => {
    const result = generateTasteProfileSummary(
      makeInput({
        flavor_affinities: ['berry'],
        flavor_aversions: [
          'very_sweet',
          'very_dry_tannic',
          'very_acidic_sour',
          'oaky_buttery',
          'bitter',
          'fizzy_sparkling',
        ],
      })
    )
    expect(result).toContain('avoid')
    expect(result.length).toBeGreaterThan(0)
    expect(result.length).toBeLessThanOrEqual(300)
  })

  // ---------------------------------------------------------------------------
  // Adventurousness tone
  // ---------------------------------------------------------------------------

  it('includes conservative tone for adventurousness=1', () => {
    const result = generateTasteProfileSummary(
      makeInput({
        flavor_affinities: ['berry'],
        adventurousness_score: 1,
      })
    )
    expect(result).toContain('stick with what you know')
  })

  it('includes adventurous tone for adventurousness=3', () => {
    const result = generateTasteProfileSummary(
      makeInput({
        flavor_affinities: ['berry'],
        adventurousness_score: 3,
      })
    )
    expect(result).toContain('surprises')
  })

  it('does not add tone modifier for adventurousness=2 (default)', () => {
    const result = generateTasteProfileSummary(
      makeInput({
        flavor_affinities: ['berry'],
        adventurousness_score: 2,
      })
    )
    expect(result).not.toContain('stick with')
    expect(result).not.toContain('surprises')
  })

  it('applies adventurousness to fallback when no affinities', () => {
    const result = generateTasteProfileSummary(
      makeInput({ adventurousness_score: 3 })
    )
    expect(result).toContain('open mind')
    expect(result).toContain('surprises')
  })

  // ---------------------------------------------------------------------------
  // Acceptance criteria example from story
  // ---------------------------------------------------------------------------

  it('matches the acceptance criteria example', () => {
    const result = generateTasteProfileSummary(
      makeInput({
        flavor_affinities: ['berry', 'mushroom', 'pepper'],
        flavor_aversions: ['very_sweet'],
      })
    )
    // Should contain key concepts from the example
    expect(result).toContain('berry fruit')
    expect(result).toContain('earth')
    expect(result).toContain('avoid')
    expect(result).toContain('sweeter')
  })

  // ---------------------------------------------------------------------------
  // Length constraint
  // ---------------------------------------------------------------------------

  it('never exceeds 300 characters for any combination', () => {
    // Maximum complexity input
    const result = generateTasteProfileSummary(
      makeInput({
        flavor_affinities: [
          'berry',
          'citrus',
          'tropical',
          'stone_fruit',
          'mushroom',
          'mineral',
          'herbal',
          'pepper',
        ],
        flavor_aversions: [
          'very_sweet',
          'very_dry_tannic',
          'very_acidic_sour',
          'oaky_buttery',
          'bitter',
          'fizzy_sparkling',
        ],
        adventurousness_score: 1,
      })
    )
    expect(result.length).toBeLessThanOrEqual(300)
  })

  it('never returns an empty string', () => {
    const inputs: TasteProfileSummaryInput[] = [
      makeInput(),
      makeInput({ flavor_affinities: ['berry'] }),
      makeInput({ flavor_aversions: ['very_sweet'] }),
      makeInput({ adventurousness_score: 1 }),
      makeInput({ adventurousness_score: 3 }),
      makeInput({
        flavor_affinities: ['chocolate', 'floral', 'smoky'],
        flavor_aversions: ['bitter'],
        adventurousness_score: 3,
      }),
    ]

    for (const input of inputs) {
      const result = generateTasteProfileSummary(input)
      expect(result.length).toBeGreaterThan(0)
      expect(result.length).toBeLessThanOrEqual(300)
    }
  })
})
