import { useEffect, useRef, useState } from 'react'
import { getLeaderboard } from '../services/supabase/scores'
import ScoreShareCard from './ScoreShareCard'
import { generateShareImage } from '../utils/generateShareImage'

// ── Banner / Hoarding Configuration ───────────────────────────────────────────
const BANNER_SRC = null   // e.g. '/ads/esummit-hoarding.jpg'
// ─────────────────────────────────────────────────────────────────────────────

const RANK_COLOR = ['#f1fa8c', '#8be9fd', '#ffb86c']

// Human-readable game names used in the share text
const GAME_LABEL = {
  dinosaur: 'Dino Run 🦖',
  flappy:   'Flappy Bird 🐦',
  snake:    'Snake 🐍',
  tetris:   'Tetris 🎮',
}

export default function GameOverModal({ score, onPlayAgain, currentGame, user = null }) {
  const [leaders,    setLeaders]    = useState([])
  const [sharing,    setSharing]    = useState(false) // loading state while generating image
  const [shareError, setShareError] = useState('')    // brief error message

  // Ref to the hidden ScoreShareCard — passed to generateShareImage()
  const cardRef = useRef(null)

  useEffect(() => {
    if (!currentGame) return
    getLeaderboard(currentGame, 5).then(setLeaders).catch(() => {})
  }, [currentGame])

  // ── Share handler ─────────────────────────────────────────────────────────
  const handleShare = async () => {
    setSharing(true)
    setShareError('')

    try {
      const blob = await generateShareImage(cardRef)
      const file = new File([blob], 'my-score.png', { type: 'image/png' })

      const gameLabel = GAME_LABEL[currentGame] ?? 'the Mini Arcade'
      const shareText = `I just scored ${score.toLocaleString()} in ${gameLabel}! Can you beat me? 🎮`

      // ── Mobile: native share sheet (best path — opens Instagram Stories etc.) ──
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title:  `Score: ${score.toLocaleString()} in ${gameLabel}`,
          text:   shareText,
          url:    window.location.href,
        })
        return
      }

      // ── Mobile: share URL only (no file support) ──
      if (navigator.share) {
        await navigator.share({
          title: `Score: ${score.toLocaleString()} in ${gameLabel}`,
          text:  shareText,
          url:   window.location.href,
        })
        return
      }

      // ── Desktop / unsupported: download the PNG ──
      const url = URL.createObjectURL(blob)
      const a   = Object.assign(document.createElement('a'), {
        href:     url,
        download: `score-${currentGame}-${score}.png`,
      })
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (err) {
      // AbortError = user cancelled the share sheet — not a real error
      if (err?.name !== 'AbortError') {
        console.error('[ShareScore]', err)
        setShareError('SHARE FAILED — try again')
      }
    } finally {
      setSharing(false)
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  const username = user?.user_metadata?.full_name ?? null

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col overflow-y-auto">

      {/* ── Hidden ScoreShareCard (off-screen capture target) ── */}
      {/* Rendered outside the visible viewport; html2canvas reads it from the DOM. */}
      <div
        style={{
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          width: '450px',
          height: '800px',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        <ScoreShareCard
          ref={cardRef}
          score={score}
          gameName={currentGame}
          username={username}
        />
      </div>

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

        {/* ── SHARE button ── */}
        <button
          onClick={handleShare}
          disabled={sharing}
          className="w-full max-w-xs font-pixel text-[10px] text-arcade-bg
                     border-4 shadow-pixel py-3
                     transition-all active:translate-y-1 active:shadow-none
                     disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background:   sharing ? '#6272a4' : '#bd93f9',
            borderColor:  sharing ? '#6272a4' : '#bd93f9',
            color: '#0f0f23',
          }}
        >
          {sharing ? '⏳ GENERATING...' : '📤 SHARE YOUR SCORE'}
        </button>

        {/* Share error message */}
        {shareError && (
          <p className="font-pixel text-arcade-red text-[8px] text-center">{shareError}</p>
        )}

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
