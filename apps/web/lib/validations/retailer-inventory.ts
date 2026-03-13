import { z } from 'zod'

// ---------------------------------------------------------------------------
// StockOverrideSchema
// ---------------------------------------------------------------------------

export const STOCK_STATUSES = ['in_stock', 'low_stock', 'out_of_stock'] as const

export type StockStatus = (typeof STOCK_STATUSES)[number]

export const StockOverrideSchema = z.object({
  retailerId: z.string().uuid('Invalid retailer ID'),
  wineId: z.string().uuid('Invalid wine ID'),
  overrideStatus: z.enum(STOCK_STATUSES, {
    errorMap: () => ({ message: 'Invalid stock status' }),
  }),
})

export type StockOverrideInput = z.infer<typeof StockOverrideSchema>

// ---------------------------------------------------------------------------
// ClearStockOverrideSchema
// ---------------------------------------------------------------------------

export const ClearStockOverrideSchema = z.object({
  retailerId: z.string().uuid('Invalid retailer ID'),
  wineId: z.string().uuid('Invalid wine ID'),
})

export type ClearStockOverrideInput = z.infer<typeof ClearStockOverrideSchema>
