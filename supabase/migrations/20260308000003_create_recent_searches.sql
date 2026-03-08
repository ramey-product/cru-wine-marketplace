-- ---------------------------------------------------------------------------
-- recent_searches — user-scoped recent search queries (no org_id per CG-2)
-- ---------------------------------------------------------------------------

CREATE TABLE public.recent_searches (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  query       TEXT NOT NULL,
  searched_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Prevent duplicate queries per user
  CONSTRAINT recent_searches_user_query_unique UNIQUE (user_id, query)
);

-- Index for fast lookups by user, ordered by recency
CREATE INDEX idx_recent_searches_user_recency
  ON public.recent_searches (user_id, searched_at DESC);

-- ---------------------------------------------------------------------------
-- RLS — user can only access their own searches
-- ---------------------------------------------------------------------------

ALTER TABLE public.recent_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own recent searches"
  ON public.recent_searches FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own recent searches"
  ON public.recent_searches FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own recent searches"
  ON public.recent_searches FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own recent searches"
  ON public.recent_searches FOR DELETE
  USING (user_id = auth.uid());
