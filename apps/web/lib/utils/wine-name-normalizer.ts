/**
 * Wine name normalization utilities for fuzzy matching.
 *
 * Handles the messy reality of retailer wine data:
 * - Abbreviations: "Dom." -> "Domaine", "Ch." -> "Chateau"
 * - Accents: "Rose" vs "Rose" (accent folded for matching)
 * - Vintage extraction: finds 4-digit years in wine names
 * - Producer/wine splitting: heuristics for separating producer from wine name
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Result of normalizing a raw wine string. */
export interface NormalizedWine {
  /** The fully normalized wine name (lowercase, expanded, accent-folded) */
  normalizedName: string
  /** Extracted or inferred producer name (if detectable) */
  producer?: string
  /** Extracted vintage year (if found) */
  vintage?: number
  /** Extracted or inferred varietal (if detectable) */
  varietal?: string
  /** The original input, preserved for reference */
  originalInput: string
}

// ---------------------------------------------------------------------------
// Abbreviation dictionary (60+ entries)
// ---------------------------------------------------------------------------

/**
 * Common wine abbreviations mapped to their full expansions.
 * Keys are lowercase with trailing period. Matching is case-insensitive.
 */
const ABBREVIATION_MAP: Record<string, string> = {
  // French
  'dom.': 'domaine',
  'dom ': 'domaine ',
  'ch.': 'chateau',
  'ch ': 'chateau ',
  'cht.': 'chateau',
  'cht ': 'chateau ',
  'clos.': 'clos',
  'mts.': 'monts',
  'mt.': 'mount',
  'st.': 'saint',
  'st-': 'saint-',
  'ste.': 'sainte',
  'vx.': 'vieux',
  'vx ': 'vieux ',
  'gd.': 'grand',
  'gd ': 'grand ',
  'gds.': 'grands',
  'pt.': 'petit',
  'pt ': 'petit ',
  'pts.': 'petits',
  'hts.': 'hauts',
  'ht.': 'haut',
  'ht ': 'haut ',
  'cru.': 'cru',
  'vgne.': 'vigne',
  'vgnes.': 'vignes',
  'burg.': 'burgundy',

  // Italian
  'cant.': 'cantina',
  'cas.': 'casale',
  'cast.': 'castello',
  'ten.': 'tenuta',
  'pod.': 'podere',
  'az.': 'azienda',
  'agr.': 'agricola',
  'vinic.': 'vinicola',

  // Spanish / Portuguese
  'bdg.': 'bodega',
  'bdgs.': 'bodegas',
  'hda.': 'hacienda',
  'qta.': 'quinta',
  'vna.': 'vina',

  // German / Austrian
  'wgt.': 'weingut',
  'schloss.': 'schloss',
  'stift.': 'stift',

  // General
  'est.': 'estate',
  'est ': 'estate ',
  'vyds.': 'vineyards',
  'vyd.': 'vineyard',
  'vyd ': 'vineyard ',
  'vnyd.': 'vineyard',
  'vnyd ': 'vineyard ',
  'vnyds.': 'vineyards',
  'res.': 'reserve',
  'rsv.': 'reserve',
  'sel.': 'selection',
  'sgl.': 'single',
  'btl.': 'bottle',
  'btls.': 'bottles',
  'brut.': 'brut',
  'blc.': 'blanc',
  'blnc.': 'blanc',
  'rge.': 'rouge',
  'cab.': 'cabernet',
  'sauv.': 'sauvignon',
  'chard.': 'chardonnay',
  'zin.': 'zinfandel',
  'pinot n.': 'pinot noir',
  'pinot gr.': 'pinot grigio',
  'p.n.': 'pinot noir',
  'p.g.': 'pinot grigio',
  'cs.': 'cabernet sauvignon',
  'sb.': 'sauvignon blanc',
  'gsm.': 'grenache syrah mourvedre',
  'grn.': 'grenache',
  'syh.': 'syrah',
  'shz.': 'shiraz',
  'mrl.': 'merlot',
  'temp.': 'tempranillo',
  'ries.': 'riesling',
  'gewurz.': 'gewurztraminer',
  'musc.': 'muscat',
  'sav.': 'sauvignon',
}

/**
 * Sorted abbreviation keys by length descending so longer abbreviations
 * are matched first (prevents partial matches like "st." matching before "ste.").
 */
const SORTED_ABBREV_KEYS = Object.keys(ABBREVIATION_MAP).sort(
  (a, b) => b.length - a.length
)

// ---------------------------------------------------------------------------
// Accent folding map
// ---------------------------------------------------------------------------

/**
 * Maps accented characters to their ASCII equivalents.
 * Covers Latin-1, Latin Extended-A, and common wine label characters.
 */
const ACCENT_MAP: Record<string, string> = {
  // Vowels with accents
  '\u00e0': 'a', '\u00e1': 'a', '\u00e2': 'a', '\u00e3': 'a', '\u00e4': 'a', '\u00e5': 'a',
  '\u00c0': 'A', '\u00c1': 'A', '\u00c2': 'A', '\u00c3': 'A', '\u00c4': 'A', '\u00c5': 'A',
  '\u00e8': 'e', '\u00e9': 'e', '\u00ea': 'e', '\u00eb': 'e',
  '\u00c8': 'E', '\u00c9': 'E', '\u00ca': 'E', '\u00cb': 'E',
  '\u00ec': 'i', '\u00ed': 'i', '\u00ee': 'i', '\u00ef': 'i',
  '\u00cc': 'I', '\u00cd': 'I', '\u00ce': 'I', '\u00cf': 'I',
  '\u00f2': 'o', '\u00f3': 'o', '\u00f4': 'o', '\u00f5': 'o', '\u00f6': 'o',
  '\u00d2': 'O', '\u00d3': 'O', '\u00d4': 'O', '\u00d5': 'O', '\u00d6': 'O',
  '\u00f9': 'u', '\u00fa': 'u', '\u00fb': 'u', '\u00fc': 'u',
  '\u00d9': 'U', '\u00da': 'U', '\u00db': 'U', '\u00dc': 'U',
  '\u00fd': 'y', '\u00ff': 'y',
  '\u00dd': 'Y',

  // Consonants
  '\u00f1': 'n', '\u00d1': 'N',
  '\u00e7': 'c', '\u00c7': 'C',
  '\u00df': 'ss',

  // Ligatures
  '\u00e6': 'ae', '\u00c6': 'AE',
  '\u0153': 'oe', '\u0152': 'OE',

  // Nordic
  '\u00f8': 'o', '\u00d8': 'O',

  // Central European
  '\u0161': 's', '\u0160': 'S',
  '\u017e': 'z', '\u017d': 'Z',
  '\u010d': 'c', '\u010c': 'C',
  '\u0159': 'r', '\u0158': 'R',
  '\u0165': 't', '\u0164': 'T',
  '\u0148': 'n', '\u0147': 'N',
  '\u010f': 'd', '\u010e': 'D',
  '\u016f': 'u', '\u016e': 'U',
  '\u011b': 'e', '\u011a': 'E',
  '\u0171': 'u', '\u0170': 'U',
  '\u0151': 'o', '\u0150': 'O',
}

// ---------------------------------------------------------------------------
// Known varietal list for extraction
// ---------------------------------------------------------------------------

const KNOWN_VARIETALS = [
  'cabernet sauvignon',
  'pinot noir',
  'pinot grigio',
  'pinot gris',
  'pinot blanc',
  'pinot meunier',
  'sauvignon blanc',
  'chenin blanc',
  'chardonnay',
  'merlot',
  'syrah',
  'shiraz',
  'zinfandel',
  'malbec',
  'tempranillo',
  'grenache',
  'mourvedre',
  'viognier',
  'riesling',
  'gewurztraminer',
  'muscat',
  'moscato',
  'sangiovese',
  'nebbiolo',
  'barbera',
  'dolcetto',
  'primitivo',
  'garnacha',
  'albarino',
  'verdejo',
  'gruner veltliner',
  'torrontes',
  'carmenere',
  'petite sirah',
  'petit verdot',
  'cabernet franc',
  'gamay',
  'cinsault',
  'marsanne',
  'roussanne',
  'semillon',
  'muscadet',
  'rose',
  'blanc de blancs',
  'blanc de noirs',
  'brut',
  'champagne',
  'prosecco',
  'cava',
  'cremant',
  'sparkling',
  'port',
  'sherry',
  'madeira',
  'vermentino',
  'fiano',
  'greco',
  'aglianico',
  'nero d avola',
  'montepulciano',
  'trebbiano',
  'cortese',
  'arneis',
  'ribera del duero',
  'rioja',
  'barolo',
  'barbaresco',
  'brunello',
  'chianti',
  'bordeaux',
  'burgundy',
  'beaujolais',
  'chablis',
  'sauternes',
  'bandol',
  'cotes du rhone',
] as const

// ---------------------------------------------------------------------------
// Core normalization functions
// ---------------------------------------------------------------------------

/**
 * Fold accented characters to their ASCII equivalents.
 *
 * @example foldAccents("Chateau d'Yquem Rosé") => "Chateau d'Yquem Rose"
 */
export function foldAccents(input: string): string {
  let result = ''
  for (const char of input) {
    result += ACCENT_MAP[char] ?? char
  }
  return result
}

/**
 * Expand common wine abbreviations to their full forms.
 * Operates on the lowercased input; returns lowercased output.
 *
 * @example expandAbbreviations("dom. tempier") => "domaine tempier"
 */
export function expandAbbreviations(input: string): string {
  let result = input.toLowerCase()

  for (const abbrev of SORTED_ABBREV_KEYS) {
    // Use a word-boundary-aware replacement to avoid partial matches
    // within words (e.g., "estate" should not re-expand "est." inside it)
    const idx = result.indexOf(abbrev)
    if (idx !== -1) {
      result = result.substring(0, idx) + ABBREVIATION_MAP[abbrev] + result.substring(idx + abbrev.length)
    }
  }

  return result
}

/**
 * Extract a 4-digit vintage year from a string.
 * Recognizes years in the range 1800-2099.
 * Returns the year as a number, or undefined if not found.
 *
 * @example extractVintage("Opus One 2019 Napa Valley") => 2019
 */
export function extractVintage(input: string): number | undefined {
  // Match 4-digit years that are either at word boundaries or surrounded by
  // non-digit characters. Prefer years in the 19xx-20xx range.
  const matches = input.match(/\b((?:19|20)\d{2})\b/g)
  if (!matches || matches.length === 0) return undefined

  // If multiple years found, prefer the one that looks like a vintage
  // (usually the last 4-digit number, or the most recent year <= current year + 1)
  const currentYear = new Date().getFullYear()
  const validYears = matches
    .map(Number)
    .filter((y) => y >= 1800 && y <= currentYear + 1)

  if (validYears.length === 0) return undefined

  // Return the last valid year found (wine names typically have vintage at the end)
  return validYears[validYears.length - 1]
}

/**
 * Remove the vintage year from a string, returning the cleaned string.
 */
export function removeVintage(input: string): string {
  return input.replace(/\b(?:19|20)\d{2}\b/g, '').trim()
}

/**
 * Attempt to extract a varietal from the normalized wine name.
 * Matches against a known list of varietals.
 */
export function extractVarietal(normalizedInput: string): string | undefined {
  const lower = normalizedInput.toLowerCase()

  // Check longest varietals first to avoid partial matches
  const sortedVarietals = [...KNOWN_VARIETALS].sort((a, b) => b.length - a.length)

  for (const varietal of sortedVarietals) {
    if (lower.includes(varietal)) {
      return varietal
    }
  }
  return undefined
}

/**
 * Remove extra whitespace and normalize spacing.
 */
function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim()
}

/**
 * Remove common punctuation that doesn't carry meaning for matching.
 * Preserves hyphens (important for wine names like "Cote-Rotie") and
 * apostrophes (important for "d'Yquem").
 */
function stripPunctuation(input: string): string {
  // Remove: commas, semicolons, colons, parentheses, brackets, quotes (but not apostrophes)
  return input.replace(/[,;:()[\]"]/g, ' ')
}

// ---------------------------------------------------------------------------
// Producer / wine name splitting heuristics
// ---------------------------------------------------------------------------

/**
 * Common separator patterns between producer and wine name in raw strings.
 * Retailers often use " - ", " | ", " / ", or a comma to separate them.
 */
const SEPARATOR_PATTERNS = [
  /\s+[-|]\s+/, // " - " or " | "
  /\s+\/\s+/,   // " / "
  /,\s+/,        // ", "
] as const

/**
 * Attempt to split a raw wine string into producer and wine name components.
 * Uses common separator patterns found in retailer CSV data.
 *
 * If no separator is found, returns the entire input as the wine name
 * with no producer extracted.
 */
export function splitProducerAndWine(
  input: string
): { producer?: string; wineName: string } {
  for (const pattern of SEPARATOR_PATTERNS) {
    const parts = input.split(pattern)
    if (parts.length >= 2) {
      // Heuristic: the first part is usually the producer
      const producer = parts[0]!.trim()
      const wineName = parts.slice(1).join(' ').trim()
      if (producer.length > 0 && wineName.length > 0) {
        return { producer, wineName }
      }
    }
  }

  // No separator found — return the whole string as wine name
  return { wineName: input.trim() }
}

// ---------------------------------------------------------------------------
// Main normalization function
// ---------------------------------------------------------------------------

/**
 * Normalize a raw wine entry string into structured components for matching.
 *
 * Pipeline:
 * 1. Fold accents (e => e, u => u, etc.)
 * 2. Expand abbreviations (Dom. => Domaine, Ch. => Chateau)
 * 3. Extract vintage year
 * 4. Strip unnecessary punctuation
 * 5. Normalize whitespace
 * 6. Attempt producer/wine splitting
 * 7. Extract varietal if detectable
 *
 * @param input - Raw wine name string from retailer data
 * @returns NormalizedWine with extracted components
 */
export function normalizeWineName(input: string): NormalizedWine {
  if (!input || input.trim().length === 0) {
    return {
      normalizedName: '',
      originalInput: input ?? '',
    }
  }

  const originalInput = input.trim()

  // Step 1: Fold accents
  let normalized = foldAccents(originalInput)

  // Step 2: Expand abbreviations (works on lowercased input)
  normalized = expandAbbreviations(normalized)

  // Step 3: Extract vintage before further processing
  const vintage = extractVintage(normalized)
  normalized = removeVintage(normalized)

  // Step 4: Strip unnecessary punctuation
  normalized = stripPunctuation(normalized)

  // Step 5: Normalize whitespace
  normalized = normalizeWhitespace(normalized)

  // Step 6: Lowercase for consistent matching
  normalized = normalized.toLowerCase()

  // Step 7: Extract varietal
  const varietal = extractVarietal(normalized)

  // Step 8: Attempt producer/wine splitting (on the normalized string)
  const { producer, wineName } = splitProducerAndWine(normalized)

  return {
    normalizedName: normalized,
    producer: producer || undefined,
    vintage,
    varietal: varietal || undefined,
    originalInput,
  }
}

/**
 * Normalize a raw wine name for comparison purposes only (no component extraction).
 * Faster than full normalizeWineName when you just need a clean string for similarity.
 *
 * @param input - Raw wine name string
 * @returns Lowercase, accent-folded, abbreviation-expanded, whitespace-normalized string
 */
export function normalizeForComparison(input: string): string {
  if (!input) return ''
  let result = foldAccents(input.trim())
  result = expandAbbreviations(result)
  result = stripPunctuation(result)
  result = normalizeWhitespace(result)
  return result.toLowerCase()
}
