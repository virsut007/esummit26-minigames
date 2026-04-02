import { useEffect, useRef, useState, useCallback } from 'react'
import { SnakeEngine } from './engine/gameEngine'
import GameOverModal    from '../../components/GameOverModal'

const SWIPE_MIN = 30

export default function SnakeGame({ user, saveScore, currentGame }) {
  const canvasRef  = useRef(null)
  const engineRef  = useRef(null)
  const saveRef    = useRef(saveScore)
  const touchStart = useRef(null)
  useEffect(() => { saveRef.current = saveScore }, [saveScore])

  const [liveScore,  setLiveScore]  = useState(0)
  const [gameOver,   setGameOver]   = useState(false)
  const [finalScore, setFinalScore] = useState(0)

  useEffect(() => {
    if (!canvasRef.current) return
    const engine = new SnakeEngine(canvasRef.current, {
      onScoreUpdate: (s) => setLiveScore(s),
      onGameOver:    (s) => { setFinalScore(s); setGameOver(true); saveRef.current(s) },
    })
    engine.init()
    engineRef.current = engine
    return () => engine.destroy()
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      const map = {
        ArrowUp:[0,-1], ArrowDown:[0,1], ArrowLeft:[-1,0], ArrowRight:[1,0],
        KeyW:[0,-1], KeyS:[0,1], KeyA:[-1,0], KeyD:[1,0],
      }
      const d = map[e.code]
      if (d) { e.preventDefault(); engineRef.current?.setDirection(d[0], d[1]) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

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
    if (Math.abs(dx) > Math.abs(dy)) engineRef.current?.setDirection(dx > 0 ? 1 : -1, 0)
    else                              engineRef.current?.setDirection(0, dy > 0 ? 1 : -1)
  }, [])

  const dpad = useCallback((dx, dy) => (e) => {
    e.preventDefault(); engineRef.current?.setDirection(dx, dy)
  }, [])

  const handlePlayAgain = useCallback(() => {
    setGameOver(false); setLiveScore(0); engineRef.current?.startGame()
  }, [])

  return (
    <div className="flex-1 flex flex-col items-center py-2">

      {/* Score bar */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0"
           style={{ width: 'calc(100vw - 56px)' }}>
        <span className="font-pixel text-arcade-green text-[10px] drop-shadow-[0_0_6px_#50fa7b]">SNAKE</span>
        <span className="font-pixel text-arcade-yellow text-[10px]">{liveScore}</span>
      </div>

      {/* Canvas — 28px margin each side guarantees all borders visible */}
      <div
        className="relative border-2 border-arcade-green shadow-[0_0_10px_#50fa7b88] flex-shrink-0"
        style={{ width: 'calc(100vw - 56px)', maxWidth: 320 }}
      >
        <canvas
          ref={canvasRef}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="block w-full select-none"
          style={{ touchAction: 'none', aspectRatio: '1 / 1' }}
        />
        {gameOver && (
          <GameOverModal score={finalScore} onPlayAgain={handlePlayAgain} currentGame={currentGame} />
        )}
      </div>

      {/* D-pad */}
      <div className="grid grid-cols-3 gap-2 mt-4 flex-shrink-0" style={{ width: 150 }}>
        <div /><DpadBtn label="▲" onPress={dpad(0,-1)} /><div />
        <DpadBtn label="◀" onPress={dpad(-1,0)} />
        <div className="border-2 border-arcade-gray/20 aspect-square rounded-sm" />
        <DpadBtn label="▶" onPress={dpad(1,0)} />
        <div /><DpadBtn label="▼" onPress={dpad(0,1)} /><div />
      </div>
    </div>
  )
}

function DpadBtn({ label, onPress }) {
  return (
    <button
      onTouchStart={onPress}
      onClick={onPress}
      className="font-pixel text-arcade-green text-base border-2 border-arcade-green
                 bg-arcade-panel flex items-center justify-center aspect-square
                 active:bg-arcade-green active:text-arcade-bg transition-colors select-none"
      style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'none' }}
    >
      {label}
    </button>
  )
}
