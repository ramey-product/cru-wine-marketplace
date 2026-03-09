import { z } from 'zod'

// Re-export shared pagination schema from wines
export { PaginationSchema, type Pagination } from '@/lib/validations/wines'

// ---------------------------------------------------------------------------
// Inventory enums
// ---------------------------------------------------------------------------

export const StockStatusEnum = z.enum(['in_stock', 'low_stock', 'out_of_stock'])
export type StockStatus = z.infer<typeof StockStatusEnum>

export const SyncSourceEnum = z.enum(['csv', 'pos_api', 'manual'])
export type SyncSource = z.infer<typeof SyncSourceEnum>

// ---------------------------------------------------------------------------
// Inventory mutation schemas
// ---------------------------------------------------------------------------

export const UpsertInventoryItemSchema = z.object({
  org_id: z.string().uuid(),
  retailer_id: z.string().uuid(),
  wine_id: z.string().uuid(),
  sku: z.string().max(100).optional(),
  price: z.number().int().min(0, 'Price must be non-negative (in cents)'),
  quantity: z.number().int().min(0, 'Quantity must be non-negative'),
  stock_status: StockStatusEnum.default('in_stock'),
  sync_source: SyncSourceEnum.default('csv'),
})

export type UpsertInventoryItemInput = z.infer<typeof UpsertInventoryItemSchema>

export const BulkUpsertInventorySchema = z.object({
  org_id: z.string().uuid(),
  retailer_id: z.string().uuid(),
  items: z
    .array(
      z.object({
        wine_id: z.string().uuid(),
        sku: z.string().max(100).optional(),
        price: z.number().int().min(0, 'Price must be non-negative (in cents)'),
        quantity: z.number().int().min(0, 'Quantity must be non-negative'),
        stock_status: StockStatusEnum.default('in_stock'),
        sync_source: SyncSourceEnum.default('csv'),
      })
    )
    .min(1, 'At least one inventory item is required')
    .max(1000, 'Cannot upsert more than 1000 items at once'),
})

export type BulkUpsertInventoryInput = z.infer<typeof BulkUpsertInventorySchema>

// ---------------------------------------------------------------------------
// Inventory filter schemas
// ---------------------------------------------------------------------------

export const InventoryFiltersSchema = z.object({
  stock_status: StockStatusEnum.optional(),
  sync_source: SyncSourceEnum.optional(),
  query: z.string().max(200).optional(),
})

export type InventoryFilters = z.infer<typeof InventoryFiltersSchema>

// ---------------------------------------------------------------------------
// Stock status update schema
// ---------------------------------------------------------------------------

export const UpdateStockStatusSchema = z.object({
  inventory_id: z.string().uuid(),
  stock_status: StockStatusEnum,
})

export type UpdateStockStatusInput = z.infer<typeof UpdateStockStatusSchema>
