import { useEffect, useState } from 'react'
import { getLeaderboard } from '../services/supabase/scores'

// ── Banner / Hoarding Configuration ───────────────────────────────────────────
// Drop your poster images into /public/ads/ and set the path below.
// Shown full-width at the top of the game-over screen like a road hoarding.
// Set to null to show the placeholder until you have an image ready.
const BANNER_SRC = null   // e.g. '/ads/esummit-hoarding.jpg'
// ─────────────────────────────────────────────────────────────────────────────

const RANK_COLOR = ['#f1fa8c', '#8be9fd', '#ffb86c']

export default function GameOverModal({ score, onPlayAgain, currentGame }) {
  const [leaders, setLeaders] = useState([])

  useEffect(() => {
    if (!currentGame) return
    getLeaderboard(currentGame, 5).then(setLeaders).catch(() => {})
  }, [currentGame])

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col overflow-y-auto">

      {/* ── Banner / Hoarding ── */}
      <div className="w-full flex-shrink-0 border-b-2 border-arcade-gray/30"
           style={{ aspectRatio: '16 / 5' }}>
        {BANNER_SRC ? (
          <img
            src={BANNER_SRC}
            alt="Event hoarding"
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-1 bg-arcade-panel"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 10px,rgba(255,255,255,0.015) 10px,rgba(255,255,255,0.015) 11px)',
            }}
          >
            <span className="font-pixel text-arcade-green text-[9px] sm:text-[11px] tracking-widest">
              E-SUMMIT × APOGEE 2026
            </span>
            <span className="font-mono text-arcade-gray/40 text-[8px]">
              hoarding banner · 16 : 5
            </span>
          </div>
        )}
      </div>

      {/* ── Game Over content ── */}
      <div className="flex-1 flex flex-col items-center px-5 py-5 gap-4">

        {/* Title */}
        <h2 className="font-pixel text-arcade-red text-2xl sm:text-3xl text-center leading-tight
                       drop-shadow-[0_0_12px_#ff5555] animate-shake">
          GAME<br />OVER
        </h2>

        {/* Score box */}
        <div className="bg-arcade-bg border-2 border-arcade-yellow px-6 py-3 text-center w-full max-w-xs">
          <p className="font-pixel text-arcade-gray text-[9px] mb-1">YOUR SCORE</p>
          <p className="font-pixel text-arcade-yellow text-4xl leading-none">{score}</p>
        </div>

        {/* Leaderboard */}
        {leaders.length > 0 && (
          <div className="w-full max-w-xs">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-pixel text-arcade-yellow text-[9px] drop-shadow-[0_0_4px_#f1fa8c]">
                HALL OF FAME
              </span>
              <div className="flex-1 h-px bg-arcade-yellow/30" />
            </div>
            <div className="flex flex-col gap-1.5">
              {leaders.map((entry, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-arcade-panel px-3 py-2
                             border border-arcade-gray/30"
                  style={{ borderColor: i < 3 ? RANK_COLOR[i] + '66' : undefined }}
                >
                  <span
                    className="font-pixel text-[8px] sm:text-[9px] truncate max-w-[55%]"
                    style={{ color: RANK_COLOR[i] ?? '#f8f8f2' }}
                  >
                    #{i + 1} {entry.player_name || 'Player'}
                  </span>
                  <span
                    className="font-pixel text-[9px] sm:text-[10px]"
                    style={{ color: RANK_COLOR[i] ?? '#f8f8f2' }}
                  >
                    {entry.score.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Play Again */}
        <button
          onClick={onPlayAgain}
          className="w-full max-w-xs font-pixel text-sm text-arcade-bg bg-arcade-green
                     border-4 border-arcade-green shadow-pixel py-3 mt-auto
                     hover:bg-arcade-yellow hover:border-arcade-yellow
                     active:translate-y-1 active:shadow-none transition-all"
        >
          ▶ PLAY AGAIN
        </button>
      </div>
    </div>
  )
}
