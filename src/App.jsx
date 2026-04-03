import { useState, useEffect } from 'react'
import { useAuth }   from './hooks/useAuth'
import { useScores } from './hooks/useScores'

import AuthModal        from './components/Auth/AuthModal'
import LandingPage      from './components/LandingPage'
import PlayerSelectPage from './components/PlayerSelectPage'
import Header           from './components/Header'
import AllLeaderboards  from './components/AllLeaderboards'
import DinosaurGame   from './games/DinosaurGame/DinosaurGame'
import FlappyGame     from './games/FlappyGame/FlappyGame'
import TetrisGame     from './games/TetrisGame/TetrisGame'
import { SKINS }      from './games/skins'

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-arcade-bg flex items-center justify-center">
      <p className="font-pixel text-arcade-green text-xs animate-blink">LOADING...</p>
    </div>
  )
}

function renderGame(currentGame, props) {
  switch (currentGame) {
    case 'dinosaur': return <DinosaurGame {...props} currentGame="dinosaur" />
    case 'flappy':   return <FlappyGame   {...props} currentGame="flappy"   />
    case 'tetris':   return <TetrisGame   {...props} currentGame="tetris"   />
    default: return null
  }
}

export default function App() {
  const { user, loading, domainError, signInWithGoogle, signOut } = useAuth()
  const [page,        setPage]        = useState('playerselect')
  const [currentGame, setCurrentGame] = useState('dinosaur')

  const [selectedSkin, setSelectedSkin] = useState('custom')
  const [imgCache,     setImgCache]     = useState({})

  const { scores, loading: scoresLoading, saveScore } = useScores(user, currentGame)

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

  if (page === 'playerselect') {
    return (
      <PlayerSelectPage
        imgCache={imgCache}
        onSelect={(skinId) => { setSelectedSkin(skinId); setPage('landing') }}
      />
    )
  }

  if (page === 'landing') {
    return (
      <LandingPage
        user={user}
        onSignOut={signOut}
        onLeaderboard={() => setPage('leaderboard')}
        onSelectGame={(id) => { setCurrentGame(id); setPage('game') }}
      />
    )
  }

  if (page === 'leaderboard') {
    return <AllLeaderboards onBack={() => setPage('landing')} />
  }

  const gameProps = {
    user, saveScore, scores, scoresLoading,
    selectedSkin, onSkinChange: setSelectedSkin,
    imgCache, setImgCache,
  }

  // Game page: full viewport height, no scroll, no footer
  return (
    <div className="h-dvh bg-arcade-bg text-white flex flex-col overflow-hidden">
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
      />

      {/* Game fills all remaining height, no scroll */}
      {/* On desktop: center the game in a capped column so portrait games don't stretch */}
      <main className="flex-1 overflow-hidden flex flex-col items-center bg-arcade-bg">
        <div className="flex-1 overflow-hidden flex flex-col w-full lg:max-w-xl">
          {renderGame(currentGame, gameProps)}
        </div>
      </main>
    </div>
  )
}
