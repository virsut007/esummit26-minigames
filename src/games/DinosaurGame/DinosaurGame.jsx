import { useEffect, useRef, useState, useCallback } from 'react'
import { DinoEngine, GAME_W, GAME_H } from './engine/gameEngine'
import GameOverModal  from '../../components/GameOverModal'
import SkinSelector   from '../../components/SkinSelector'
import { SKINS }      from '../skins'

export default function DinosaurGame({
  user, saveScore, scores, scoresLoading,
  selectedSkin, onSkinChange, imgCache, setImgCache,
  currentGame,
}) {
  const canvasRef  = useRef(null)
  const engineRef  = useRef(null)
  const saveRef    = useRef(saveScore)
  useEffect(() => { saveRef.current = saveScore }, [saveScore])

  const [liveScore,  setLiveScore]  = useState(0)
  const [gameOver,   setGameOver]   = useState(false)
  const [finalScore, setFinalScore] = useState(0)

  // ── Init engine ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current) return
    const engine = new DinoEngine(canvasRef.current, {
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
        engineRef.current?.jump()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ── Skin change: preload image if needed, then push to engine ─────────────
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
    engineRef.current?.jump()
  }, [])

  const handlePlayAgain = useCallback(() => {
    setGameOver(false)
    setLiveScore(0)
    engineRef.current?.startGame()
  }, [])

  return (
    <div className="flex flex-col gap-3">
      {/* Title + score */}
      <div className="flex items-center justify-between">
        <h2 className="font-pixel text-arcade-green text-xs drop-shadow-[0_0_6px_#50fa7b]">
          DINO RUN
        </h2>
        <span className="font-pixel text-arcade-yellow text-xs">{liveScore}</span>
      </div>

      {/* Skin selector */}
      <SkinSelector selectedId={selectedSkin} onSelect={onSkinChange} imgCache={imgCache} />

      {/* Canvas — full width, no max-width cap so it's as large as possible on phone */}
      <div className="relative border-2 border-arcade-green shadow-[0_0_16px_#50fa7b44]">
        <canvas
          ref={canvasRef}
          onClick={handleTap}
          onTouchStart={handleTap}
          className="block w-full cursor-pointer select-none"
          style={{ touchAction: 'none', aspectRatio: `${GAME_W} / ${GAME_H}` }}
        />
        {gameOver && (
          <GameOverModal
            score={finalScore}
            onPlayAgain={handlePlayAgain}
            currentGame={currentGame}
          />
        )}
      </div>

      <p className="font-pixel text-arcade-gray text-[9px] text-center">
        TAP to jump
      </p>
    </div>
  )
}
