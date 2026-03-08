import { z } from 'zod'

export const SearchQuerySchema = z.object({
  query: z.string().min(1, 'Search query is required').max(200),
})

export type SearchQuery = z.infer<typeof SearchQuerySchema>

export const SearchSuggestionsSchema = z.object({
  prefix: z.string().min(1).max(100),
})

export type SearchSuggestionsInput = z.infer<typeof SearchSuggestionsSchema>
