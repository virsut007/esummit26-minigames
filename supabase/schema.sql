-- ============================================================
--  MINI ARCADE — Supabase Schema
--  Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. Scores table
CREATE TABLE IF NOT EXISTS public.scores (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT        NOT NULL,
  game_name  TEXT        NOT NULL,  -- e.g. "dinosaur"
  score      INTEGER     NOT NULL,
  player_name TEXT       DEFAULT 'Player',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Safely add the player_name column if the table already existed from a previous run
ALTER TABLE public.scores ADD COLUMN IF NOT EXISTS player_name TEXT DEFAULT 'Player';

-- 2. Row-Level Security
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- Users can insert their OWN scores only
DROP POLICY IF EXISTS "insert_own_scores" ON public.scores;
CREATE POLICY "insert_own_scores"
  ON public.scores
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can read ALL scores (needed for leaderboard)
DROP POLICY IF EXISTS "select_own_scores" ON public.scores;
DROP POLICY IF EXISTS "select_all_scores" ON public.scores;
CREATE POLICY "select_all_scores"
  ON public.scores
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 3. Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_scores_user_game
  ON public.scores (user_id, game_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_scores_leaderboard
  ON public.scores (game_name, score DESC);

-- ============================================================
--  LEADERBOARD HELPER VIEW (optional, for future use)
--  Shows the single best score per user per game
-- ============================================================
DROP VIEW IF EXISTS public.leaderboard;
CREATE VIEW public.leaderboard AS
  SELECT DISTINCT ON (game_name, user_id)
    user_id,
    email,
    player_name,
    game_name,
    score,
    created_at
  FROM  public.scores
  ORDER BY game_name, user_id, score DESC;

-- Grant read access to authenticated users (leaderboard is public within app)
GRANT SELECT ON public.leaderboard TO authenticated;

-- ============================================================
--  REALTIME
--  Enables Supabase Realtime on the scores table so the
--  leaderboard updates instantly without polling.
--  (Alternatively enable via: Dashboard → Database → Replication)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.scores;
