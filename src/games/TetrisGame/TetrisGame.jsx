import { useEffect, useRef, useState, useCallback } from 'react'
import { TetrisEngine } from './engine/gameEngine'
import GameOverModal     from '../../components/GameOverModal'

const TIME_LIMIT = 180 // 3 minutes in seconds

function fmt(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function TetrisGame({ user, saveScore, currentGame }) {
  const canvasRef  = useRef(null)
  const engineRef  = useRef(null)
  const saveRef    = useRef(saveScore)
  const timerRef   = useRef(null)
  useEffect(() => { saveRef.current = saveScore }, [saveScore])

  const [liveScore,  setLiveScore]  = useState(0)
  const [lines,      setLines]      = useState(0)
  const [level,      setLevel]      = useState(1)
  const [timeLeft,   setTimeLeft]   = useState(TIME_LIMIT)
  const [gameOver,   setGameOver]   = useState(false)
  const [finalScore, setFinalScore] = useState(0)

  const triggerGameOver = useCallback((score) => {
    clearInterval(timerRef.current)
    setFinalScore(score)
    setGameOver(true)
    saveRef.current(score)
  }, [])

  // ── Init engine ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current) return
    const engine = new TetrisEngine(canvasRef.current, {
      onScoreUpdate: (s) => setLiveScore(s),
      onGameOver:    (s) => triggerGameOver(s),
      onLinesUpdate: (l) => setLines(l),
      onLevelUpdate: (l) => setLevel(l),
    })
    engine.init()
    engineRef.current = engine
    return () => { engine.destroy(); clearInterval(timerRef.current) }
  }, [triggerGameOver])

  // ── Countdown timer ───────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current)
    setTimeLeft(TIME_LIMIT)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          const eng = engineRef.current
          if (eng && eng.running) {
            eng.running = false
            eng._stopLoop?.()
            triggerGameOver(eng.score)
          }
          return 0
        }
        return t - 1
      })
    }, 1000)
  }, [triggerGameOver])

  // Start timer shortly after mount (once engine is initialised)
  useEffect(() => {
    const id = setTimeout(() => startTimer(), 150)
    return () => clearTimeout(id)
  }, [startTimer])

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
  const CELL_PX  = 25

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
    if (Math.abs(dx) >= CELL_PX) {
      const steps = Math.floor(Math.abs(dx) / CELL_PX)
      for (let i = 0; i < steps; i++) dx > 0 ? eng.moveRight() : eng.moveLeft()
      ref.x += (dx > 0 ? 1 : -1) * steps * CELL_PX
      ref.moved = true
    }
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
    if (!ref.moved && Math.abs(dx) < 15 && Math.abs(dy) < 15 && dt < 250) {
      eng.rotate(); return
    }
    if (dy > 60 && Math.abs(dx) < 40 && dt < 300) eng.hardDrop()
  }, [])

  const handlePlayAgain = useCallback(() => {
    setGameOver(false)
    setLiveScore(0)
    setLines(0)
    setLevel(1)
    engineRef.current?.startGame()
    startTimer()
  }, [startTimer])

  const urgent = timeLeft <= 30

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Score bar */}
      <div className="flex items-center justify-between px-3 py-1.5 flex-shrink-0 bg-arcade-panel border-b border-arcade-gray/20">
        <h2 className="font-pixel text-arcade-purple text-[10px] drop-shadow-[0_0_6px_#bd93f9]">TETRIS</h2>
        <div className="flex gap-3 items-center">
          <span className={`font-pixel text-[10px] ${urgent ? 'text-arcade-red animate-blink' : 'text-arcade-green'}`}>
            ⏱ {fmt(timeLeft)}
          </span>
          <span className="font-pixel text-arcade-yellow text-[9px]">{liveScore}</span>
          <span className="font-pixel text-arcade-cyan text-[9px]">L{lines}</span>
          <span className="font-pixel text-arcade-green text-[9px]">Lv{level}</span>
        </div>
      </div>

      {/* Canvas: width-driven so engine can compute cell size correctly */}
      <div className="flex-1 flex items-start justify-center pt-2 overflow-hidden">
        <div
          className="relative border-2 border-arcade-purple shadow-[0_0_14px_#bd93f966] flex-shrink-0"
          style={{ width: 'min(46vw, 210px)' }}
        >
          <canvas
            ref={canvasRef}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="block cursor-pointer select-none"
            style={{ touchAction: 'none' }}
          />
          {gameOver && (
            <GameOverModal score={finalScore} onPlayAgain={handlePlayAgain} currentGame={currentGame} user={user} />
          )}
        </div>
      </div>

    </div>
  )
}
