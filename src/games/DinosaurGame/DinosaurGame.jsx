import { useEffect, useRef, useState, useCallback } from 'react'
import { DinoEngine, GAME_W, GAME_H } from './engine/gameEngine'
import GameOverModal from '../../components/GameOverModal'
import { SKINS }    from '../skins'

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

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); engineRef.current?.jump() }
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

  const handleTap = useCallback((e) => { e.preventDefault(); engineRef.current?.jump() }, [])

  const handlePlayAgain = useCallback(() => {
    setGameOver(false); setLiveScore(0); engineRef.current?.startGame()
  }, [])

  return (
    // Fills the entire available area — no padding, edge-to-edge canvas
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Slim score bar */}
      <div className="flex items-center justify-between px-3 py-1 flex-shrink-0">
        <span className="font-pixel text-arcade-green text-[10px] drop-shadow-[0_0_6px_#50fa7b]">DINO RUN</span>
        <span className="font-pixel text-arcade-yellow text-[10px]">{liveScore}</span>
      </div>

      {/* Canvas — edge to edge, fills all remaining height */}
      <div className="relative flex-1 min-h-0">
        <canvas
          ref={canvasRef}
          onClick={handleTap}
          onTouchStart={handleTap}
          className="block w-full h-full cursor-pointer select-none"
          style={{ touchAction: 'none', objectFit: 'contain' }}
        />
        {gameOver && (
          <GameOverModal score={finalScore} onPlayAgain={handlePlayAgain} currentGame={currentGame} />
        )}
      </div>
    </div>
  )
}
