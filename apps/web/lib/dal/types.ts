import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export type TypedClient = SupabaseClient<Database>

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  per_page: number
}
