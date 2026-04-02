import { useEffect, useRef, useState, useCallback } from 'react'
import { SnakeEngine } from './engine/gameEngine'
import GameOverModal    from '../../components/GameOverModal'
import ScoreHistory     from '../../components/ScoreHistory'

const SWIPE_MIN = 30 // px threshold for swipe detection

export default function SnakeGame({ user, saveScore, scores, scoresLoading }) {
  const canvasRef  = useRef(null)
  const engineRef  = useRef(null)
  const saveRef    = useRef(saveScore)
  const touchStart = useRef(null)
  useEffect(() => { saveRef.current = saveScore }, [saveScore])

  const [liveScore,  setLiveScore]  = useState(0)
  const [gameOver,   setGameOver]   = useState(false)
  const [finalScore, setFinalScore] = useState(0)

  // ── Init engine ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current) return
    const engine = new SnakeEngine(canvasRef.current, {
      onScoreUpdate: (s) => setLiveScore(s),
      onGameOver:    (s) => {
        setFinalScore(s)
        setGameOver(true)
        saveRef.current(s)
      },
    })
    engine.init()
    engineRef.current = engine
    return () => engine.destroy()
  }, [])

  // ── Keyboard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      const map = {
        ArrowUp:    [0, -1], ArrowDown:  [0, 1],
        ArrowLeft:  [-1, 0], ArrowRight: [1, 0],
        KeyW: [0, -1], KeyS: [0, 1],
        KeyA: [-1, 0], KeyD: [1, 0],
      }
      const dir = map[e.code]
      if (dir) {
        e.preventDefault()
        engineRef.current?.setDirection(dir[0], dir[1])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ── Touch / Swipe ────────────────────────────────────────────────────────
  const onTouchStart = useCallback((e) => {
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
  }, [])

  const onTouchEnd = useCallback((e) => {
    if (!touchStart.current) return
    const t  = e.changedTouches[0]
    const dx = t.clientX - touchStart.current.x
    const dy = t.clientY - touchStart.current.y
    touchStart.current = null

    if (Math.abs(dx) < SWIPE_MIN && Math.abs(dy) < SWIPE_MIN) return

    if (Math.abs(dx) > Math.abs(dy)) {
      engineRef.current?.setDirection(dx > 0 ? 1 : -1, 0)
    } else {
      engineRef.current?.setDirection(0, dy > 0 ? 1 : -1)
    }
  }, [])

  // ── D-pad button ─────────────────────────────────────────────────────────
  const dpad = useCallback((dx, dy) => {
    engineRef.current?.setDirection(dx, dy)
  }, [])

  const handlePlayAgain = useCallback(() => {
    setGameOver(false)
    setLiveScore(0)
    engineRef.current?.startGame()
  }, [])

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {/* Title bar */}
      <div className="flex items-center justify-between">
        <h2 className="font-pixel text-arcade-green text-xs sm:text-sm drop-shadow-[0_0_6px_#50fa7b]">
          SNAKE
        </h2>
        <span className="font-pixel text-arcade-yellow text-xs sm:text-sm">{liveScore}</span>
      </div>

      {/* Canvas */}
      <div className="relative border-2 sm:border-4 border-arcade-green shadow-[0_0_16px_#50fa7b44]
                      w-full max-w-[600px] mx-auto">
        <canvas
          ref={canvasRef}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="block w-full cursor-pointer select-none"
          style={{ touchAction: 'none', aspectRatio: '1 / 1' }}
        />
        {gameOver && <GameOverModal score={finalScore} onPlayAgain={handlePlayAgain} />}
      </div>

      {/* Instructions */}
      <p className="hidden sm:block font-pixel text-arcade-gray text-[9px] sm:text-xs text-center">
        ARROW KEYS / WASD to move
      </p>

      {/* ── D-pad — mobile only ─────────────────────────────────────────────── */}
      <div className="sm:hidden flex flex-col items-center gap-1 select-none"
           style={{ touchAction: 'manipulation' }}>
        {/* Up */}
        <button onTouchStart={() => dpad(0, -1)}
          className="font-pixel text-base text-arcade-green border-2 border-arcade-green
                     w-14 h-14 flex items-center justify-center
                     active:bg-arcade-green active:text-arcade-bg transition-all">
          ▲
        </button>
        {/* Left · Right */}
        <div className="flex gap-1">
          <button onTouchStart={() => dpad(-1, 0)}
            className="font-pixel text-base text-arcade-green border-2 border-arcade-green
                       w-14 h-14 flex items-center justify-center
                       active:bg-arcade-green active:text-arcade-bg transition-all">
            ◀
          </button>
          <div className="w-14 h-14" /> {/* spacer */}
          <button onTouchStart={() => dpad(1, 0)}
            className="font-pixel text-base text-arcade-green border-2 border-arcade-green
                       w-14 h-14 flex items-center justify-center
                       active:bg-arcade-green active:text-arcade-bg transition-all">
            ▶
          </button>
        </div>
        {/* Down */}
        <button onTouchStart={() => dpad(0, 1)}
          className="font-pixel text-base text-arcade-green border-2 border-arcade-green
                     w-14 h-14 flex items-center justify-center
                     active:bg-arcade-green active:text-arcade-bg transition-all">
          ▼
        </button>
        <p className="font-pixel text-arcade-gray text-[8px] mt-1">
          SWIPE or use D-PAD
        </p>
      </div>

      {scores.length > 0 && (
        <div className="bg-arcade-panel border-2 border-arcade-gray/40 p-3 sm:p-4">
          <ScoreHistory scores={scores} loading={scoresLoading} />
        </div>
      )}
    </div>
  )
}
