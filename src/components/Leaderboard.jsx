import { useState, useEffect, useCallback } from 'react'
import { getLeaderboard } from '../services/supabase/scores'
import { supabase } from '../services/supabase/client'

const RANK_META = {
  1: { color: '#f1fa8c', glow: '#f1fa8c55', label: 'GOLD'   },
  2: { color: '#8be9fd', glow: '#8be9fd44', label: 'SILVER' },
  3: { color: '#ffb86c', glow: '#ffb86c44', label: 'BRONZE' },
}

export default function Leaderboard({ currentGame }) {
  const [topScores, setTopScores] = useState([])

  const fetchLeaderboard = useCallback(async () => {
    if (!currentGame) return
    try {
      const data = await getLeaderboard(currentGame, 5)
      setTopScores(data)
    } catch (err) {
      console.error('[Leaderboard] fetch error', err)
    }
  }, [currentGame])

  useEffect(() => {
    // Initial fetch
    fetchLeaderboard()

    // Realtime: re-fetch only when a new score is inserted for this game.
    // Requires Realtime enabled on the scores table in Supabase:
    //   Dashboard → Database → Replication → scores ✓
    // or run: ALTER PUBLICATION supabase_realtime ADD TABLE public.scores;
    const channel = supabase
      .channel(`leaderboard-${currentGame}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'scores', filter: `game_name=eq.${currentGame}` },
        () => fetchLeaderboard()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [currentGame, fetchLeaderboard])

  return (
    <section className="mb-5 sm:mb-8">
      {/* Title row */}
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <span className="font-pixel text-arcade-yellow text-[10px] sm:text-xs whitespace-nowrap
                         drop-shadow-[0_0_6px_#f1fa8c]">
          HALL OF FAME
        </span>
        <div className="flex-1 h-px bg-arcade-yellow/30" />
        <span className="font-pixel text-arcade-gray text-[8px] sm:text-[9px] whitespace-nowrap">
          TOP 5
        </span>
      </div>

      {/* Cards strip — scrollable on mobile */}
      <div className="scroll-x pb-2">
        <div className="flex gap-2 sm:gap-3"
             style={{ minWidth: 'max-content' }}>
          {topScores.length === 0 ? (
             <div className="font-pixel text-arcade-gray text-xs py-4 px-2">
               No scores yet... Be the first!
             </div>
          ) : (
            topScores.map((entry, index) => {
              const rank  = index + 1
              const meta  = RANK_META[rank]
              const isTop = !!meta

              return (
                <div
                  key={`${entry.player_name}-${rank}`}
                  className="flex flex-col items-center gap-1.5 px-2 sm:px-3 py-2 sm:py-3
                             border-2 bg-arcade-panel flex-shrink-0"
                  style={{
                    width:       'clamp(90px, 22vw, 130px)',
                    borderColor: isTop ? meta.color : '#6272a4',
                    boxShadow:   isTop ? `0 0 10px ${meta.glow}` : 'none',
                  }}
                >
                  {/* Rank label */}
                  <span
                    className="font-pixel text-[7px] sm:text-[9px] whitespace-nowrap"
                    style={{ color: isTop ? meta.color : '#6272a4' }}
                  >
                    {isTop ? meta.label : `#${rank}`}
                  </span>

                  {/* Name — truncated */}
                  <span className="font-pixel text-[8px] sm:text-[9px] text-white text-center
                                   leading-snug w-full px-1 overflow-hidden"
                        style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {entry.player_name || 'Player'}
                  </span>

                  {/* Score */}
                  <span
                    className="font-pixel text-sm sm:text-lg lg:text-xl leading-none mt-auto"
                    style={{ color: isTop ? meta.color : '#f8f8f2' }}
                  >
                    {entry.score.toLocaleString()}
                  </span>

                  {/* Game tag */}
                  <span className="font-pixel text-[6px] sm:text-[7px] text-arcade-gray
                                   text-center whitespace-nowrap">
                    {currentGame.toUpperCase()}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}
