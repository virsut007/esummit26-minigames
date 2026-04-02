import { useState, useEffect } from 'react'
import { useAuth }   from './hooks/useAuth'
import { useScores } from './hooks/useScores'

import AuthModal      from './components/Auth/AuthModal'
import LandingPage    from './components/LandingPage'
import Header         from './components/Header'
import AllLeaderboards from './components/AllLeaderboards'
import DinosaurGame   from './games/DinosaurGame/DinosaurGame'
import FlappyGame     from './games/FlappyGame/FlappyGame'
import SnakeGame      from './games/SnakeGame/SnakeGame'
import TetrisGame     from './games/TetrisGame/TetrisGame'
import { SKINS }      from './games/skins'

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-arcade-bg flex items-center justify-center">
      <p className="font-pixel text-arcade-green text-xs animate-blink">
        LOADING...
      </p>
    </div>
  )
}

function renderGame(currentGame, props) {
  switch (currentGame) {
    case 'dinosaur': return <DinosaurGame {...props} currentGame="dinosaur" />
    case 'flappy':   return <FlappyGame   {...props} currentGame="flappy"   />
    case 'snake':    return <SnakeGame    {...props} currentGame="snake"    />
    case 'tetris':   return <TetrisGame   {...props} currentGame="tetris"   />
    default:
      return (
        <div className="text-center py-16">
          <p className="font-pixel text-arcade-gray text-sm">GAME NOT FOUND</p>
        </div>
      )
  }
}

export default function App() {
  const { user, loading, domainError, signInWithGoogle, signOut } = useAuth()
  // page: 'landing' | 'game' | 'leaderboard'
  const [page,        setPage]        = useState('landing')
  const [currentGame, setCurrentGame] = useState('dinosaur')

  // ── Skin state lifted here so it persists across games and is chosen on landing ──
  const [selectedSkin, setSelectedSkin] = useState('default')
  const [imgCache,     setImgCache]     = useState({})

  const { scores, loading: scoresLoading, saveScore } = useScores(user, currentGame)

  // Preload image skins into the shared cache
  useEffect(() => {
    SKINS.forEach(skin => {
      if (skin.type === 'image' && skin.url && !imgCache[skin.id]) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => setImgCache(c => ({ ...c, [skin.id]: img }))
        img.src = skin.url
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <LoadingScreen />

  if (!user) {
    return (
      <AuthModal
        onSignInWithGoogle={signInWithGoogle}
        domainError={domainError}
      />
    )
  }

  if (page === 'landing') {
    return (
      <LandingPage
        user={user}
        onSignOut={signOut}
        onLeaderboard={() => setPage('leaderboard')}
        onSelectGame={(id) => {
          setCurrentGame(id)
          setPage('game')
        }}
        selectedSkin={selectedSkin}
        onSkinChange={setSelectedSkin}
        imgCache={imgCache}
      />
    )
  }

  if (page === 'leaderboard') {
    return <AllLeaderboards onBack={() => setPage('landing')} />
  }

  const gameProps = {
    user,
    saveScore,
    scores,
    scoresLoading,
    selectedSkin,
    onSkinChange: setSelectedSkin,
    imgCache,
    setImgCache,
  }

  return (
    <div className="min-h-screen bg-arcade-bg text-white flex flex-col">
      {/* CRT scanline overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
        style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,#000 2px,#000 4px)' }}
      />

      <Header
        user={user}
        onSignOut={signOut}
        currentGame={currentGame}
        onSelectGame={setCurrentGame}
        onHome={() => setPage('landing')}
        onLeaderboard={() => setPage('leaderboard')}
      />

      <main className="flex-1 w-full max-w-lg mx-auto px-3 py-4">
        {renderGame(currentGame, gameProps)}
      </main>

      <footer className="text-center py-4 border-t-2 border-arcade-gray/20 mt-2">
        <p className="font-pixel text-arcade-gray text-[9px]">
          E-SUMMIT × APOGEE 2026 MINI ARCADE
        </p>
      </footer>
    </div>
  )
}
