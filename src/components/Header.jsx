import { useState } from 'react'
import { GAMES } from '../games'

export default function Header({ user, onSignOut, currentGame, onSelectGame, onHome, onLeaderboard }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-arcade-panel border-b-4 border-arcade-green flex-shrink-0">
      <div className="max-w-5xl mx-auto px-3 sm:px-4">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between py-2.5 sm:py-3 gap-2 sm:gap-3">

          {/* Logo / Home */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {onHome && (
              <button
                onClick={onHome}
                className="font-pixel text-[9px] text-arcade-gray border-2 border-arcade-gray/50
                           px-2 py-1.5 hover:border-arcade-green hover:text-arcade-green transition-all mr-1"
                title="Back to home"
              >
                ← HOME
              </button>
            )}
            <span className="font-pixel text-arcade-green text-[11px] sm:text-sm md:text-base
                             drop-shadow-[0_0_8px_#50fa7b]">
              MINI
            </span>
            <span className="font-pixel text-arcade-yellow text-[11px] sm:text-sm md:text-base
                             drop-shadow-[0_0_8px_#f1fa8c]">
              ARCADE
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden sm:flex gap-1.5 sm:gap-2 flex-1 justify-center flex-wrap">
            <GameButtons currentGame={currentGame} onSelectGame={onSelectGame} />
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {user.id !== 'guest' && (
              <>
                <span className="hidden md:block font-mono text-arcade-gray text-xs truncate max-w-[130px]"
                      title={user.email}>
                  {user.email}
                </span>
                <button
                  onClick={onSignOut}
                  className="font-pixel text-[9px] text-arcade-red border-2 border-arcade-red
                             px-2 py-1.5 hover:bg-arcade-red hover:text-arcade-bg transition-all"
                >
                  OUT
                </button>
              </>
            )}

            {/* Leaderboard shortcut */}
            {onLeaderboard && (
              <button
                onClick={onLeaderboard}
                className="font-pixel text-[9px] text-arcade-yellow border-2 border-arcade-yellow
                           px-2 py-1.5 hover:bg-arcade-yellow hover:text-arcade-bg transition-all
                           hidden sm:block"
              >
                🏆
              </button>
            )}

            {/* Hamburger — mobile only */}
            <button
              className="sm:hidden flex flex-col justify-center items-center gap-[4px]
                         border-2 border-arcade-green px-2 py-2
                         hover:bg-arcade-green hover:text-arcade-bg transition-all group"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                /* X icon */
                <span className="font-pixel text-arcade-green text-[10px] group-hover:text-arcade-bg
                                 leading-none">✕</span>
              ) : (
                /* Hamburger lines */
                <>
                  <span className="block w-4 h-0.5 bg-arcade-green group-hover:bg-arcade-bg transition-colors" />
                  <span className="block w-4 h-0.5 bg-arcade-green group-hover:bg-arcade-bg transition-colors" />
                  <span className="block w-4 h-0.5 bg-arcade-green group-hover:bg-arcade-bg transition-colors" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Mobile dropdown ── */}
        {menuOpen && (
          <div className="sm:hidden border-t-2 border-arcade-gray/30 py-2.5 flex flex-wrap gap-2">
            <GameButtons
              currentGame={currentGame}
              onSelectGame={id => { onSelectGame(id); setMenuOpen(false) }}
            />
            {onLeaderboard && (
              <button
                onClick={() => { onLeaderboard(); setMenuOpen(false) }}
                className="font-pixel text-[9px] px-2 py-1.5 border-2 transition-all
                           text-arcade-yellow border-arcade-yellow hover:bg-arcade-yellow hover:text-arcade-bg"
              >
                🏆 SCORES
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

function GameButtons({ currentGame, onSelectGame }) {
  return GAMES.map(game => (
    <button
      key={game.id}
      onClick={() => game.available && onSelectGame(game.id)}
      disabled={!game.available}
      title={game.available ? game.description : 'Coming soon!'}
      className={`font-pixel text-[9px] sm:text-[10px] px-2 sm:px-3 py-1.5 sm:py-2
                  border-2 transition-all whitespace-nowrap
        ${game.available
          ? currentGame === game.id
            ? 'bg-arcade-green text-arcade-bg border-arcade-green shadow-pixel'
            : 'text-arcade-green border-arcade-green hover:bg-arcade-green hover:text-arcade-bg'
          : 'text-arcade-gray border-arcade-gray cursor-not-allowed opacity-40'
        }`}
    >
      {game.name}
      {!game.available && <span className="ml-1 text-[6px]">SOON</span>}
    </button>
  ))
}
