import { useEffect, useRef, useState, useCallback } from 'react'
import { DinoEngine, GAME_W, GAME_H } from './engine/gameEngine'
import GameOverModal from '../../components/GameOverModal'
import { SKINS }    from '../skins'

// ── Billboard Configuration ───────────────────────────────────────────────────
// Drop your hoarding image into /public/ads/ and set the path.
// The billboard appears as a compact strip below the game canvas.
const BILLBOARD_SRC = null   // e.g. '/ads/hoarding.jpg'
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
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Score bar — slim */}
      <div className="flex items-center justify-between px-3 py-1 flex-shrink-0">
        <span className="font-pixel text-arcade-green text-[10px] drop-shadow-[0_0_6px_#50fa7b]">DINO RUN</span>
        <span className="font-pixel text-arcade-yellow text-[10px]">{liveScore}</span>
      </div>

      {/* ── Canvas — edge to edge, fills as much height as possible ── */}
      <div className="relative border-y-2 border-arcade-green shadow-[0_0_16px_#50fa7b55] flex-shrink-0">
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

      {/* ── Billboard — compact strip, full width, like a highway hoarding ── */}
      <div className="flex-1 min-h-0 overflow-hidden flex-shrink-0 mx-0" style={{ maxHeight: 130 }}>
        <Billboard src={BILLBOARD_SRC} />
      </div>

    </div>
  )
}

function Billboard({ src }) {
  if (src) {
    return (
      <img
        src={src}
        alt="Event billboard"
        className="w-full h-full object-cover"
      />
    )
  }

  // Temp highway hoarding design
  return (
    <div
      className="w-full h-full flex items-center justify-center relative overflow-hidden"
      style={{ background: '#0a0a1a', borderTop: '3px solid #f1fa8c', borderBottom: '3px solid #f1fa8c' }}
    >
      {/* Rivet bolts in corners */}
      {[['top-1 left-2'], ['top-1 right-2'], ['bottom-1 left-2'], ['bottom-1 right-2']].map(([pos], i) => (
        <div key={i} className={`absolute ${pos} w-2.5 h-2.5 rounded-full bg-arcade-yellow/30 border border-arcade-yellow/50`} />
      ))}

      {/* Left event block */}
      <div className="flex items-center gap-4 px-5 w-full justify-between">
        <div className="text-left flex-shrink-0">
          <p className="font-pixel text-arcade-green text-sm leading-none drop-shadow-[0_0_8px_#50fa7b]">E-SUMMIT</p>
          <p className="font-pixel text-arcade-gray text-[8px] mt-0.5">×</p>
          <p className="font-pixel text-arcade-purple text-sm leading-none drop-shadow-[0_0_8px_#bd93f9]">APOGEE</p>
        </div>

        {/* Divider */}
        <div className="w-px self-stretch bg-arcade-yellow/30 flex-shrink-0" />

        {/* Center CTA */}
        <div className="text-center flex-1">
          <p className="font-pixel text-arcade-yellow text-lg leading-none drop-shadow-[0_0_12px_#f1fa8c]">2026</p>
          <p className="font-pixel text-arcade-gray text-[7px] mt-1 tracking-widest">MINI ARCADE</p>
        </div>

        {/* Divider */}
        <div className="w-px self-stretch bg-arcade-yellow/30 flex-shrink-0" />

        {/* Right tagline */}
        <div className="text-right flex-shrink-0">
          <p className="font-pixel text-arcade-cyan text-[9px] leading-relaxed">PLAY.<br />COMPETE.<br />WIN.</p>
        </div>
      </div>
    </div>
  )
}
