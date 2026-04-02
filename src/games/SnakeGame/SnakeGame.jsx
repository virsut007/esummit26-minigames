import { useEffect, useRef, useState, useCallback } from 'react'
import { SnakeEngine } from './engine/gameEngine'
import GameOverModal    from '../../components/GameOverModal'

const SWIPE_MIN = 30 // px threshold for swipe detection

export default function SnakeGame({ user, saveScore, scores, scoresLoading, currentGame }) {
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

  // ── Touch / Swipe on canvas ───────────────────────────────────────────────
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

  // ── D-pad button handler ──────────────────────────────────────────────────
  const handleDpad = useCallback((dx, dy) => (e) => {
    e.preventDefault()
    engineRef.current?.setDirection(dx, dy)
  }, [])

  const handlePlayAgain = useCallback(() => {
    setGameOver(false)
    setLiveScore(0)
    engineRef.current?.startGame()
  }, [])

  return (
    <div className="flex flex-col gap-3 items-center">
      {/* Title + score */}
      <div className="flex items-center justify-between w-full">
        <h2 className="font-pixel text-arcade-green text-xs drop-shadow-[0_0_6px_#50fa7b]">
          SNAKE
        </h2>
        <span className="font-pixel text-arcade-yellow text-xs">{liveScore}</span>
      </div>

      {/* Canvas */}
      <div className="relative border-2 border-arcade-green shadow-[0_0_16px_#50fa7b44]
                      w-full max-w-[340px]">
        <canvas
          ref={canvasRef}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="block w-full cursor-pointer select-none"
          style={{ touchAction: 'none', aspectRatio: '1 / 1' }}
        />
        {gameOver && (
          <GameOverModal
            score={finalScore}
            onPlayAgain={handlePlayAgain}
            currentGame={currentGame}
          />
        )}
      </div>

      {/* ── D-pad ── */}
      <div className="grid grid-cols-3 gap-1 w-36 mt-1">
        {/* Row 1: empty, up, empty */}
        <div />
        <DpadBtn label="▲" onPress={handleDpad(0, -1)} />
        <div />
        {/* Row 2: left, empty, right */}
        <DpadBtn label="◀" onPress={handleDpad(-1, 0)} />
        <div className="border-2 border-arcade-gray/20 rounded aspect-square" />
        <DpadBtn label="▶" onPress={handleDpad(1, 0)} />
        {/* Row 3: empty, down, empty */}
        <div />
        <DpadBtn label="▼" onPress={handleDpad(0, 1)} />
        <div />
      </div>
    </div>
  )
}

function DpadBtn({ label, onPress }) {
  return (
    <button
      onTouchStart={onPress}
      onClick={onPress}
      className="font-pixel text-arcade-green text-sm border-2 border-arcade-green
                 bg-arcade-panel flex items-center justify-center aspect-square
                 active:bg-arcade-green active:text-arcade-bg transition-colors
                 select-none touch-none"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {label}
    </button>
  )
}
