/**
 * POS Adapter Factory
 *
 * Returns the correct POSAdapter implementation for a given pos_type string.
 * The pos_type values correspond to the CHECK constraint on the retailers table:
 *   'square' | 'lightspeed' | 'shopify' | 'clover' | 'csv_only' | 'other'
 *
 * All four API-based adapters are implemented:
 * - Square (STORY-05)
 * - Lightspeed (STORY-06)
 * - Shopify (STORY-07)
 * - Clover (STORY-07)
 */

import type { POSAdapter } from './types'
import { SquareAdapter } from './square-adapter'
import { LightspeedAdapter } from './lightspeed-adapter'
import { ShopifyAdapter } from './shopify-adapter'
import { CloverAdapter } from './clover-adapter'

// ---------------------------------------------------------------------------
// Supported POS types (matches retailers.pos_type CHECK constraint)
// ---------------------------------------------------------------------------

/**
 * POS types that have an adapter implementation.
 * 'csv_only' and 'other' are intentionally excluded because they do not
 * have a POS API to integrate with.
 */
export const SUPPORTED_POS_TYPES = ['square', 'lightspeed', 'shopify', 'clover'] as const
export type SupportedPOSType = (typeof SUPPORTED_POS_TYPES)[number]

/**
 * All valid pos_type values from the retailers table schema.
 */
export const ALL_POS_TYPES = [
  'square',
  'lightspeed',
  'shopify',
  'clover',
  'csv_only',
  'other',
] as const
export type POSType = (typeof ALL_POS_TYPES)[number]

// ---------------------------------------------------------------------------
// Factory function
// ---------------------------------------------------------------------------

/**
 * Get a POSAdapter instance for the given POS type.
 *
 * @param posType - The POS system type (from retailers.pos_type)
 * @returns A POSAdapter implementation
 * @throws Error if the POS type is not supported or has no adapter
 *
 * @example
 *   const adapter = getPOSAdapter('square')
 *   const result = await adapter.fullSync(retailerId, credentials)
 */
export function getPOSAdapter(posType: string): POSAdapter {
  switch (posType) {
    case 'square':
      return new SquareAdapter()

    case 'lightspeed':
      return new LightspeedAdapter()

    case 'shopify':
      return new ShopifyAdapter()

    case 'clover':
      return new CloverAdapter()

    case 'csv_only':
      throw new Error(
        'csv_only retailers do not have a POS adapter. Use the CSV import flow instead.'
      )

    case 'other':
      throw new Error(
        'Retailers with pos_type "other" do not have a POS adapter.'
      )

    default:
      throw new Error(`Unsupported POS type: "${posType}"`)
  }
}

/**
 * Check whether a given pos_type has an available adapter implementation.
 * Useful for UI logic to show/hide POS sync buttons.
 *
 * @param posType - The POS system type to check
 * @returns true if an adapter exists for this type
 */
export function isPOSAdapterAvailable(posType: string): boolean {
  return (SUPPORTED_POS_TYPES as readonly string[]).includes(posType)
}
