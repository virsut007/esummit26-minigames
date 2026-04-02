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

  // ── Touch swipe ──────────────────────────────────────────────────────────
  const touchRef = useRef(null)

  const onTouchStart = useCallback((e) => {
    const t = e.touches[0]
    touchRef.current = { x: t.clientX, y: t.clientY, time: Date.now() }
  }, [])

  const onTouchEnd = useCallback((e) => {
    if (!touchRef.current) return
    const t  = e.changedTouches[0]
    const dx = t.clientX - touchRef.current.x
    const dy = t.clientY - touchRef.current.y
    const dt = Date.now() - touchRef.current.time
    touchRef.current = null

    const eng = engineRef.current
    if (!eng || !eng.running) return

    // quick tap = rotate
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20 && dt < 250) {
      eng.rotate()
      return
    }

    // swipe down fast = hard drop
    if (dy > 60 && Math.abs(dx) < 40) {
      eng.hardDrop()
      return
    }

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 25) {
      dx > 0 ? eng.moveRight() : eng.moveLeft()
    } else if (dy > 25) {
      eng.moveDown()
    }
  }, [])

  // ── Button handlers ──────────────────────────────────────────────────────
  const btn = useCallback((action) => {
    const eng = engineRef.current
    if (!eng || !eng.running) return
    eng[action]()
  }, [])

  const handlePlayAgain = useCallback(() => {
    setGameOver(false)
    setLiveScore(0)
    setLines(0)
    setLevel(1)
    engineRef.current?.startGame()
  }, [])

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
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
                      w-full max-w-[300px] mx-auto">
        <canvas
          ref={canvasRef}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="block w-full cursor-pointer select-none"
          style={{ touchAction: 'none', aspectRatio: '1 / 2' }}
        />
        {gameOver && <GameOverModal score={finalScore} onPlayAgain={handlePlayAgain} />}
      </div>

      {/* Desktop instructions */}
      <p className="hidden sm:block font-pixel text-arcade-gray text-[9px] sm:text-xs text-center">
        ← → MOVE &nbsp; ↑ ROTATE &nbsp; ↓ SOFT DROP &nbsp; SPACE HARD DROP
      </p>

      {/* ── Mobile controls ─────────────────────────────────────────────────── */}
      <div className="sm:hidden flex flex-col items-center gap-2 select-none"
           style={{ touchAction: 'manipulation' }}>

        {/* Row 1: Rotate */}
        <button onTouchStart={() => btn('rotate')}
          className="font-pixel text-[10px] text-arcade-purple border-2 border-arcade-purple
                     w-16 h-12 flex items-center justify-center
                     active:bg-arcade-purple active:text-arcade-bg transition-all">
          ↻ ROT
        </button>

        {/* Row 2: Left · Down · Right */}
        <div className="flex gap-2">
          <button onTouchStart={() => btn('moveLeft')}
            className="font-pixel text-base text-arcade-green border-2 border-arcade-green
                       w-14 h-14 flex items-center justify-center
                       active:bg-arcade-green active:text-arcade-bg transition-all">
            ◀
          </button>
          <button onTouchStart={() => btn('moveDown')}
            className="font-pixel text-base text-arcade-yellow border-2 border-arcade-yellow
                       w-14 h-14 flex items-center justify-center
                       active:bg-arcade-yellow active:text-arcade-bg transition-all">
            ▼
          </button>
          <button onTouchStart={() => btn('moveRight')}
            className="font-pixel text-base text-arcade-green border-2 border-arcade-green
                       w-14 h-14 flex items-center justify-center
                       active:bg-arcade-green active:text-arcade-bg transition-all">
            ▶
          </button>
        </div>

        {/* Row 3: Hard drop */}
        <button onTouchStart={() => btn('hardDrop')}
          className="font-pixel text-[10px] text-arcade-red border-2 border-arcade-red
                     px-6 h-12 flex items-center justify-center
                     active:bg-arcade-red active:text-arcade-bg transition-all">
          ⬇ DROP
        </button>

        <p className="font-pixel text-arcade-gray text-[8px] mt-1">
          TAP canvas to rotate · SWIPE ↓ to drop
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
