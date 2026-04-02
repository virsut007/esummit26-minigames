import { useEffect, useRef, useState, useCallback } from 'react'
import { DinoEngine, GAME_W, GAME_H } from './engine/gameEngine'
import GameOverModal from '../../components/GameOverModal'
import { SKINS }    from '../skins'

// ── Hoarding / Billboard Configuration ────────────────────────────────────────
// Drop your poster image into /public/ads/ and set the path below.
// The hoarding fills the space below the game canvas — like a highway billboard.
const HOARDING_SRC = null   // e.g. '/ads/hoarding.jpg'
// ─────────────────────────────────────────────────────────────────────────────

export default function DinosaurGame({
  user, saveScore,
  selectedSkin, imgCache, setImgCache,
  currentGame,
}) {
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const saveRef   = useRef(saveScore)
  useEffect(() => { saveRef.current = saveScore }, [saveScore])

  const [liveScore,  setLiveScore]  = useState(0)
  const [gameOver,   setGameOver]   = useState(false)
  const [finalScore, setFinalScore] = useState(0)

  // ── Init engine ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current) return
    const engine = new DinoEngine(canvasRef.current, {
      onScoreUpdate: (s) => setLiveScore(s),
      onGameOver:    (s) => { setFinalScore(s); setGameOver(true); saveRef.current(s) },
    })
    engine.init()
    engineRef.current = engine
    return () => engine.destroy()
  }, [])

  // ── Keyboard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        engineRef.current?.jump()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ── Skin ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const skin = SKINS.find(s => s.id === selectedSkin)
    if (!skin) return
    if (skin.type === 'image' && skin.url) {
      if (imgCache[skin.id]) {
        engineRef.current?.setSkin(skin, imgCache[skin.id])
      } else {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload  = () => { setImgCache(c => ({ ...c, [skin.id]: img })); engineRef.current?.setSkin(skin, img) }
        img.onerror = () => engineRef.current?.setSkin({ ...skin, type: 'face', color: skin.color, expression: 'happy' }, null)
        img.src = skin.url
      }
    } else {
      engineRef.current?.setSkin(skin, null)
    }
  }, [selectedSkin, imgCache])

  const handleTap = useCallback((e) => {
    e.preventDefault()
    engineRef.current?.jump()
  }, [])

  const handlePlayAgain = useCallback(() => {
    setGameOver(false)
    setLiveScore(0)
    engineRef.current?.startGame()
  }, [])

  return (
    // Full height flex column — fills the main area with no scroll
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Score bar */}
      <div className="flex items-center justify-between px-3 py-1.5 flex-shrink-0">
        <span className="font-pixel text-arcade-green text-[10px] drop-shadow-[0_0_6px_#50fa7b]">
          DINO RUN
        </span>
        <span className="font-pixel text-arcade-yellow text-[10px]">{liveScore}</span>
      </div>

      {/* Canvas — full width, no horizontal padding so it truly fills the screen */}
      <div className="relative border-y-2 border-arcade-green shadow-[0_0_12px_#50fa7b44] flex-shrink-0">
        <canvas
          ref={canvasRef}
          onClick={handleTap}
          onTouchStart={handleTap}
          className="block w-full cursor-pointer select-none"
          style={{ touchAction: 'none', aspectRatio: `${GAME_W} / ${GAME_H}` }}
        />
        {gameOver && (
          <GameOverModal score={finalScore} onPlayAgain={handlePlayAgain} currentGame={currentGame} />
        )}
      </div>

      <p className="font-pixel text-arcade-gray text-[8px] text-center py-1 flex-shrink-0">
        TAP to jump
      </p>

      {/* ── Hoarding / Billboard — fills all remaining screen space ── */}
      <div className="flex-1 min-h-0 mx-3 mb-3 border-2 border-arcade-yellow/60
                      shadow-[0_0_16px_#f1fa8c33] overflow-hidden">
        {HOARDING_SRC ? (
          <img
            src={HOARDING_SRC}
            alt="Event hoarding"
            className="w-full h-full object-cover"
          />
        ) : (
          /* Temp highway hoarding design */
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-3 relative overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f23 60%, #1a1a2e 100%)',
            }}
          >
            {/* Road lines texture */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 40px, #f1fa8c 40px, #f1fa8c 44px)',
              }}
            />
            {/* Corner bolts */}
            <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-arcade-yellow/40 border border-arcade-yellow/60" />
            <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-arcade-yellow/40 border border-arcade-yellow/60" />
            <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-arcade-yellow/40 border border-arcade-yellow/60" />
            <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-arcade-yellow/40 border border-arcade-yellow/60" />

            {/* Content */}
            <p className="font-pixel text-arcade-gray text-[8px] tracking-widest z-10">PRESENTS</p>
            <div className="text-center z-10">
              <p className="font-pixel text-arcade-green text-2xl drop-shadow-[0_0_16px_#50fa7b]">
                E-SUMMIT
              </p>
              <p className="font-pixel text-arcade-gray text-[9px] my-1">×</p>
              <p className="font-pixel text-arcade-purple text-2xl drop-shadow-[0_0_16px_#bd93f9]">
                APOGEE
              </p>
              <p className="font-pixel text-arcade-yellow text-lg mt-1 drop-shadow-[0_0_12px_#f1fa8c]">
                2026
              </p>
            </div>
            <p className="font-pixel text-arcade-gray/60 text-[7px] tracking-widest z-10">
              MINI ARCADE
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
