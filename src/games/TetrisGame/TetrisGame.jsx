import { useEffect, useRef, useState, useCallback } from 'react'
import { TetrisEngine } from './engine/gameEngine'
import GameOverModal     from '../../components/GameOverModal'
import ScoreHistory      from '../../components/ScoreHistory'

export default function TetrisGame({ user, saveScore, scores, scoresLoading }) {
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const saveRef   = useRef(saveScore)
  useEffect(() => { saveRef.current = saveScore }, [saveScore])

  const [liveScore,  setLiveScore]  = useState(0)
  const [lines,      setLines]      = useState(0)
  const [level,      setLevel]      = useState(1)
  const [gameOver,   setGameOver]   = useState(false)
  const [finalScore, setFinalScore] = useState(0)

  // ── Init engine ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current) return
    const engine = new TetrisEngine(canvasRef.current, {
      onScoreUpdate: (s) => setLiveScore(s),
      onGameOver:    (s) => {
        setFinalScore(s)
        setGameOver(true)
        saveRef.current(s)
      },
      onLinesUpdate: (l) => setLines(l),
      onLevelUpdate: (l) => setLevel(l),
    })
    engine.init()
    engineRef.current = engine
    return () => engine.destroy()
  }, [])

  // ── Keyboard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      const eng = engineRef.current
      if (!eng || !eng.running) return
      switch (e.code) {
        case 'ArrowLeft':  case 'KeyA': e.preventDefault(); eng.moveLeft();  break
        case 'ArrowRight': case 'KeyD': e.preventDefault(); eng.moveRight(); break
        case 'ArrowDown':  case 'KeyS': e.preventDefault(); eng.moveDown();  break
        case 'ArrowUp':    case 'KeyW': e.preventDefault(); eng.rotate();    break
        case 'Space':                   e.preventDefault(); eng.hardDrop();  break
        default: break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ── Touch: continuous drag ────────────────────────────────────────────────
  const touchRef = useRef(null)
  const CELL_PX  = 25  // px of drag per 1-cell move

  const onTouchStart = useCallback((e) => {
    const t = e.touches[0]
    touchRef.current = { x: t.clientX, y: t.clientY, ox: t.clientX, oy: t.clientY, time: Date.now(), moved: false }
  }, [])

  const onTouchMove = useCallback((e) => {
    if (!touchRef.current) return
    const t   = e.touches[0]
    const ref = touchRef.current
    const eng = engineRef.current
    if (!eng || !eng.running) return

    const dx = t.clientX - ref.x
    const dy = t.clientY - ref.y

    // horizontal: move one cell per CELL_PX of drag
    if (Math.abs(dx) >= CELL_PX) {
      const steps = Math.floor(Math.abs(dx) / CELL_PX)
      for (let i = 0; i < steps; i++) dx > 0 ? eng.moveRight() : eng.moveLeft()
      ref.x += (dx > 0 ? 1 : -1) * steps * CELL_PX
      ref.moved = true
    }

    // vertical down: soft drop per CELL_PX
    if (dy >= CELL_PX) {
      const steps = Math.floor(dy / CELL_PX)
      for (let i = 0; i < steps; i++) eng.moveDown()
      ref.y += steps * CELL_PX
      ref.moved = true
    }
  }, [])

  const onTouchEnd = useCallback((e) => {
    if (!touchRef.current) return
    const ref = touchRef.current
    const t   = e.changedTouches[0]
    const dx  = t.clientX - ref.ox
    const dy  = t.clientY - ref.oy
    const dt  = Date.now() - ref.time
    touchRef.current = null

    const eng = engineRef.current
    if (!eng || !eng.running) return

    // quick tap (no drag) = rotate
    if (!ref.moved && Math.abs(dx) < 15 && Math.abs(dy) < 15 && dt < 250) {
      eng.rotate()
      return
    }

    // fast swipe down = hard drop
    if (dy > 60 && Math.abs(dx) < 40 && dt < 300) {
      eng.hardDrop()
    }
  }, [])

  const handlePlayAgain = useCallback(() => {
    setGameOver(false)
    setLiveScore(0)
    setLines(0)
    setLevel(1)
    engineRef.current?.startGame()
  }, [])

  return (
    <div className="flex flex-col gap-3 sm:gap-5">
      {/* Title bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-pixel text-arcade-purple text-xs sm:text-sm drop-shadow-[0_0_6px_#bd93f9]">
          TETRIS
        </h2>
        <div className="flex gap-3 sm:gap-5">
          <span className="font-pixel text-arcade-yellow text-[9px] sm:text-xs">
            SCORE <span className="text-xs sm:text-sm">{liveScore}</span>
          </span>
          <span className="font-pixel text-arcade-cyan text-[9px] sm:text-xs">
            LINES <span className="text-xs sm:text-sm">{lines}</span>
          </span>
          <span className="font-pixel text-arcade-green text-[9px] sm:text-xs">
            LVL <span className="text-xs sm:text-sm">{level}</span>
          </span>
        </div>
      </div>

      {/* Canvas — 1:2 aspect ratio */}
      <div className="relative border-2 sm:border-4 border-arcade-purple shadow-[0_0_16px_#bd93f944]
                      w-full max-w-[200px] sm:max-w-[300px] mx-auto">
        <canvas
          ref={canvasRef}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="block w-full cursor-pointer select-none"
          style={{ touchAction: 'none', aspectRatio: '1 / 2' }}
        />
        {gameOver && <GameOverModal score={finalScore} onPlayAgain={handlePlayAgain} />}
      </div>

      {/* Instructions */}
      <p className="font-pixel text-arcade-gray text-[8px] sm:text-xs text-center">
        <span className="hidden sm:inline">← → MOVE &nbsp; ↑ ROTATE &nbsp; ↓ SOFT DROP &nbsp; SPACE HARD DROP</span>
        <span className="sm:hidden">TAP to rotate · SWIPE to move · SWIPE ↓ to drop</span>
      </p>

      {scores.length > 0 && (
        <div className="bg-arcade-panel border-2 border-arcade-gray/40 p-3 sm:p-4">
          <ScoreHistory scores={scores} loading={scoresLoading} />
        </div>
      )}
    </div>
  )
}
