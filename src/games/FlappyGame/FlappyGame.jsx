import { useEffect, useRef, useState, useCallback } from 'react'
import { FlappyEngine, GAME_W, GAME_H } from './engine/gameEngine'
import GameOverModal  from '../../components/GameOverModal'
import ScoreHistory   from '../../components/ScoreHistory'
import SkinSelector   from '../../components/SkinSelector'
import { SKINS }      from '../skins'

export default function FlappyGame({ user, saveScore, scores, scoresLoading }) {
  const canvasRef    = useRef(null)
  const engineRef    = useRef(null)
  const saveRef      = useRef(saveScore)
  useEffect(() => { saveRef.current = saveScore }, [saveScore])

  const [liveScore,    setLiveScore]    = useState(0)
  const [gameOver,     setGameOver]     = useState(false)
  const [finalScore,   setFinalScore]   = useState(0)
  const [selectedSkin, setSelectedSkin] = useState('default')
  const [imgCache,     setImgCache]     = useState({})

  // ── Init engine ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current) return
    const engine = new FlappyEngine(canvasRef.current, {
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

  // ── Keyboard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        engineRef.current?.flap()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ── Skin change ────────────────────────────────────────────────────────────
  useEffect(() => {
    const skin = SKINS.find(s => s.id === selectedSkin)
    if (!skin) return

    if (skin.type === 'image' && skin.url) {
      if (imgCache[skin.id]) {
        engineRef.current?.setSkin(skin, imgCache[skin.id])
      } else {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          setImgCache(c => ({ ...c, [skin.id]: img }))
          engineRef.current?.setSkin(skin, img)
        }
        img.onerror = () => {
          engineRef.current?.setSkin({ ...skin, type: 'face', color: skin.color, expression: 'happy' }, null)
        }
        img.src = skin.url
      }
    } else {
      engineRef.current?.setSkin(skin, null)
    }
  }, [selectedSkin, imgCache])

  const handleTap = useCallback((e) => {
    e.preventDefault()
    // Ignore extra touch points (multi-finger)
    if (e.touches && e.touches.length > 1) return
    engineRef.current?.flap()
  }, [])

  const handlePlayAgain = useCallback(() => {
    setGameOver(false)
    setLiveScore(0)
    engineRef.current?.startGame()
  }, [])

  return (
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 lg:items-start lg:justify-center">

      {/* Left: title + skin selector + canvas */}
      <div className="flex flex-col gap-3 sm:gap-4 w-full lg:w-auto">
        <div className="flex items-center justify-between lg:justify-start lg:gap-6">
          <h2 className="font-pixel text-arcade-green text-xs sm:text-sm drop-shadow-[0_0_6px_#50fa7b]">
            FLAPPY BIRD
          </h2>
          <span className="font-pixel text-arcade-yellow text-xs sm:text-sm">{liveScore}</span>
        </div>

        {/* Skin selector */}
        <SkinSelector selectedId={selectedSkin} onSelect={setSelectedSkin} imgCache={imgCache} />

        {/* Canvas */}
        <div className="relative border-2 sm:border-4 border-arcade-green shadow-[0_0_16px_#50fa7b44]
                        w-full mx-auto"
             style={{ maxWidth: 400, touchAction: 'none' }}>
          <canvas
            ref={canvasRef}
            onPointerDown={handleTap}
            className="block w-full cursor-pointer select-none"
            style={{ touchAction: 'none', aspectRatio: `${GAME_W} / ${GAME_H}` }}
          />
          {gameOver && <GameOverModal score={finalScore} onPlayAgain={handlePlayAgain} />}
        </div>

        <p className="font-pixel text-arcade-gray text-[9px] sm:text-xs text-center">
          TAP / SPACE / UP ARROW to flap
        </p>
      </div>

      {/* Right: score history */}
      {scores.length > 0 && (
        <div className="w-full lg:w-72 bg-arcade-panel border-2 border-arcade-gray/40 p-3 sm:p-4
                        lg:self-start lg:sticky lg:top-4">
          <ScoreHistory scores={scores} loading={scoresLoading} />
        </div>
      )}
    </div>
  )
}
