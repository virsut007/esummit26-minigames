import { useEffect, useRef, useState, useCallback } from 'react'
import { FlappyEngine, GAME_W, GAME_H } from './engine/gameEngine'
import GameOverModal from '../../components/GameOverModal'
import { SKINS }    from '../skins'

export default function FlappyGame({
  user, saveScore,
  selectedSkin, imgCache, setImgCache,
  currentGame,
}) {
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const saveRef   = useRef(saveScore)
  useEffect(() => { saveRef.current = saveScore }, [saveScore])

  const [gameOver,   setGameOver]   = useState(false)
  const [finalScore, setFinalScore] = useState(0)

  useEffect(() => {
    if (!canvasRef.current) return
    const engine = new FlappyEngine(canvasRef.current, {
      onScoreUpdate: () => {},
      onGameOver: (s) => { setFinalScore(s); setGameOver(true); saveRef.current(s) },
    })
    engine.init()
    engineRef.current = engine
    return () => engine.destroy()
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); engineRef.current?.flap() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

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
    if (e.touches && e.touches.length > 1) return
    engineRef.current?.flap()
  }, [])

  const handlePlayAgain = useCallback(() => {
    setGameOver(false); engineRef.current?.startGame()
  }, [])

  // Canvas fills the entire area — score is drawn inside canvas by the engine
  return (
    <div className="flex-1 relative overflow-hidden">
      <canvas
        ref={canvasRef}
        onPointerDown={handleTap}
        className="block w-full h-full cursor-pointer select-none"
        style={{ touchAction: 'none' }}
      />
      {gameOver && (
        <GameOverModal score={finalScore} onPlayAgain={handlePlayAgain} currentGame={currentGame} />
      )}
    </div>
  )
}
