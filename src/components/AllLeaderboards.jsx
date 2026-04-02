import { useState, useEffect } from 'react'
import { getAllLeaderboards } from '../services/supabase/scores'
import { GAMES } from '../games'

const RANK_COLOR = ['#f1fa8c', '#8be9fd', '#ffb86c']

const GAME_COLOR = {
  dinosaur: '#50fa7b',
  flappy:   '#f1fa8c',
  snake:    '#50fa7b',
  tetris:   '#bd93f9',
}

export default function AllLeaderboards({ onBack }) {
  const [boards, setBoards] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllLeaderboards(5)
      .then(setBoards)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-arcade-bg text-white flex flex-col">
      {/* CRT scanline overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
        style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,#000 2px,#000 4px)' }}
      />

      {/* Header */}
      <header className="bg-arcade-panel border-b-4 border-arcade-yellow flex-shrink-0">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="font-pixel text-[9px] text-arcade-gray border-2 border-arcade-gray/50
                       px-2 py-1.5 hover:border-arcade-green hover:text-arcade-green transition-all"
          >
            ← BACK
          </button>
          <span className="font-pixel text-arcade-yellow text-[11px] sm:text-sm
                           drop-shadow-[0_0_8px_#f1fa8c]">
            HALL OF FAME
          </span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">

        {loading ? (
          <p className="font-pixel text-arcade-green text-xs text-center animate-blink py-8">
            LOADING...
          </p>
        ) : (
          GAMES.map(game => {
            const scores  = boards[game.id] ?? []
            const accent  = GAME_COLOR[game.id] ?? '#50fa7b'

            return (
              <section key={game.id}>
                {/* Game title */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="font-pixel text-[10px] sm:text-xs whitespace-nowrap"
                    style={{ color: accent, textShadow: `0 0 8px ${accent}88` }}
                  >
                    {game.name}
                  </span>
                  <div className="flex-1 h-px" style={{ background: accent + '44' }} />
                  <span className="font-pixel text-arcade-gray text-[8px]">TOP 5</span>
                </div>

                {scores.length === 0 ? (
                  <p className="font-pixel text-arcade-gray/50 text-[9px] px-2">
                    No scores yet — be the first!
                  </p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {scores.map((entry, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 bg-arcade-panel px-3 py-2 border"
                        style={{ borderColor: i < 3 ? RANK_COLOR[i] + '55' : '#3d3d5c' }}
                      >
                        {/* Rank */}
                        <span
                          className="font-pixel text-[9px] w-5 text-center flex-shrink-0"
                          style={{ color: RANK_COLOR[i] ?? '#6272a4' }}
                        >
                          {i < 3 ? ['★', '✦', '◆'][i] : `#${i + 1}`}
                        </span>

                        {/* Name */}
                        <span
                          className="font-pixel text-[8px] sm:text-[9px] flex-1 truncate"
                          style={{ color: RANK_COLOR[i] ?? '#f8f8f2' }}
                        >
                          {entry.player_name || 'Player'}
                        </span>

                        {/* Score */}
                        <span
                          className="font-pixel text-[10px] sm:text-xs flex-shrink-0"
                          style={{ color: RANK_COLOR[i] ?? '#f8f8f2' }}
                        >
                          {entry.score.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )
          })
        )}
      </main>

      <footer className="text-center py-4 border-t-2 border-arcade-gray/20">
        <p className="font-pixel text-arcade-gray text-[9px]">
          E-SUMMIT × APOGEE 2026 MINI ARCADE
        </p>
      </footer>
    </div>
  )
}
