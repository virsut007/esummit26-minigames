import { useState } from 'react'
import { useAuth }   from './hooks/useAuth'
import { useScores } from './hooks/useScores'

import AuthModal     from './components/Auth/AuthModal'
import LandingPage   from './components/LandingPage'
import Header        from './components/Header'
import Leaderboard   from './components/Leaderboard'
import DinosaurGame  from './games/DinosaurGame/DinosaurGame'
import FlappyGame    from './games/FlappyGame/FlappyGame'

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-arcade-bg flex items-center justify-center">
      <p className="font-pixel text-arcade-green text-xs sm:text-sm animate-blink">
        LOADING...
      </p>
    </div>
  )
}

function renderGame(currentGame, props) {
  switch (currentGame) {
    case 'dinosaur': return <DinosaurGame {...props} />
    case 'flappy':   return <FlappyGame   {...props} />
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
  const [page,        setPage]        = useState('landing')   // 'landing' | 'game'
  const [currentGame, setCurrentGame] = useState('dinosaur')

  const { scores, loading: scoresLoading, saveScore } = useScores(user, currentGame)

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
        onSelectGame={(id) => {
          setCurrentGame(id)
          setPage('game')
        }}
      />
    )
  }

  const gameProps = { user, saveScore, scores, scoresLoading }

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
      />

      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-5 sm:py-8">
        <Leaderboard currentGame={currentGame} />
        {renderGame(currentGame, gameProps)}
      </main>

      <footer className="text-center py-4 border-t-2 border-arcade-gray/20 mt-4">
        <p className="font-pixel text-arcade-gray text-[9px] sm:text-xs">
          E-SUMMIT × APOGEE 2026 MINI ARCADE
        </p>
      </footer>
    </div>
  )
}
