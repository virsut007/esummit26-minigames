import { supabase } from './client'

/**
 * Insert a new score row for every game attempt (never overwrite).
 */
export async function insertScore({ user_id, email, player_name, game_name, score }) {
  const { data, error } = await supabase
    .from('scores')
    .insert([{ user_id, email, player_name, game_name, score }])
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Fetch the last 10 scores for a user in a specific game (newest first).
 */
export async function getUserScores(user_id, game_name, limit = 10) {
  const { data, error } = await supabase
    .from('scores')
    .select('id, score, created_at')
    .eq('user_id', user_id)
    .eq('game_name', game_name)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

/**
 * Fetch global top scores for a game — for the leaderboard.
 */
export async function getLeaderboard(game_name, limit = 10) {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('player_name, score, created_at')
    .eq('game_name', game_name)
    .order('score', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

/**
 * Fetch top scores for all games at once.
 */
export async function getAllLeaderboards(limit = 5) {
  const games = ['dinosaur', 'flappy', 'snake', 'tetris']
  const entries = await Promise.all(
    games.map(g => getLeaderboard(g, limit).then(d => [g, d]))
  )
  return Object.fromEntries(entries)
}
