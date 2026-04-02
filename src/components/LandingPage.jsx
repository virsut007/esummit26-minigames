import { GAMES } from '../games'

const EVENTS = [
  {
    id:      'summit',
    name:    'SUMMIT',
    tagline: 'TECHNICAL FEST',
    accent:  'arcade-green',
    border:  'border-arcade-green',
    glow:    'shadow-[0_0_18px_#50fa7b44]',
    textAccent: 'text-arcade-green',
    badge:   'bg-arcade-green',
  },
  {
    id:      'apogee',
    name:    'APOGEE',
    tagline: 'CULTURAL FEST',
    accent:  'arcade-purple',
    border:  'border-arcade-purple',
    glow:    'shadow-[0_0_18px_#bd93f944]',
    textAccent: 'text-arcade-purple',
    badge:   'bg-arcade-purple',
  },
]

const GAME_ICONS = {
  dinosaur: ['  ##  ', ' #### ', '######', '  ##  '],
  flappy:   [' >>=  ', '>>=== ', ' >>=  ', '      '],
  snake:    ['###   ', '  ##  ', '  ### ', '      '],
  space:    [' /\\   ', '/  \\  ', ' /\\   ', '      '],
}

export default function LandingPage({ onSelectGame, user, onSignOut }) {
  return (
    <div className="min-h-screen bg-arcade-bg text-white flex flex-col">

      {/* CRT scanline overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
        style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,#000 2px,#000 4px)' }}
      />

      {/* ── Top bar ── */}
      <header className="bg-arcade-panel border-b-4 border-arcade-green flex-shrink-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-pixel text-arcade-green text-sm sm:text-base drop-shadow-[0_0_8px_#50fa7b]">
              SUMMIT
            </span>
            <span className="font-pixel text-arcade-gray text-sm sm:text-base">×</span>
            <span className="font-pixel text-arcade-purple text-sm sm:text-base drop-shadow-[0_0_8px_#bd93f9]">
              APOGEE
            </span>
          </div>

          {user.id !== 'guest' && (
            <div className="flex items-center gap-2">
              <span className="hidden sm:block font-mono text-arcade-gray text-xs truncate max-w-[160px]"
                    title={user.email}>
                {user.email}
              </span>
              <button
                onClick={onSignOut}
                className="font-pixel text-[9px] text-arcade-red border-2 border-arcade-red
                           px-2 py-1.5 hover:bg-arcade-red hover:text-arcade-bg transition-all"
              >
                SIGN OUT
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-10 flex flex-col gap-8 sm:gap-12">

        {/* ── Hero ── */}
        <section className="text-center">
          <p className="font-pixel text-arcade-gray text-[9px] sm:text-xs tracking-widest mb-3">
            PRESENTS
          </p>
          <h1 className="font-pixel text-2xl sm:text-4xl md:text-5xl tracking-tight leading-tight">
            <span className="text-arcade-green drop-shadow-[0_0_12px_#50fa7b]">MINI</span>
            {' '}
            <span className="text-arcade-yellow drop-shadow-[0_0_12px_#f1fa8c]">ARCADE</span>
          </h1>
          <p className="font-pixel text-arcade-gray text-[9px] sm:text-xs mt-3 animate-blink">
            INSERT COIN TO PLAY
          </p>
        </section>

        {/* ── Event Ad Banners ── */}
        <section>
          <h2 className="font-pixel text-arcade-gray text-[9px] sm:text-xs text-center mb-4 tracking-widest">
            ── UPCOMING EVENTS ──
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {EVENTS.map(ev => (
              <div
                key={ev.id}
                className={`relative bg-arcade-panel border-2 ${ev.border} ${ev.glow} p-5 sm:p-6 overflow-hidden`}
              >
                {/* Decorative corner brackets */}
                <span className={`absolute top-2 left-2 font-pixel text-[10px] ${ev.textAccent} opacity-50`}>┌</span>
                <span className={`absolute top-2 right-2 font-pixel text-[10px] ${ev.textAccent} opacity-50`}>┐</span>
                <span className={`absolute bottom-2 left-2 font-pixel text-[10px] ${ev.textAccent} opacity-50`}>└</span>
                <span className={`absolute bottom-2 right-2 font-pixel text-[10px] ${ev.textAccent} opacity-50`}>┘</span>

                {/* Background grid pattern */}
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 20px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 20px)' }}
                />

                <div className="relative z-10 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`font-pixel text-[8px] ${ev.textAccent} tracking-widest`}>
                        {ev.tagline}
                      </span>
                      <h3 className={`font-pixel text-2xl sm:text-3xl mt-1 ${ev.textAccent} drop-shadow-[0_0_10px_currentColor]`}>
                        {ev.name}
                      </h3>
                    </div>
                    <span className={`font-pixel text-[8px] ${ev.badge} text-arcade-bg px-2 py-1 whitespace-nowrap`}>
                      BITS PILANI
                    </span>
                  </div>

                  <div className="border-t border-current/20 pt-3 flex flex-col gap-1.5">
                    <p className="font-mono text-arcade-gray text-xs">
                      ◆ Competitions &amp; Workshops
                    </p>
                    <p className="font-mono text-arcade-gray text-xs">
                      ◆ Performances &amp; Events
                    </p>
                    <p className="font-mono text-arcade-gray text-xs">
                      ◆ Cash Prizes &amp; Goodies
                    </p>
                  </div>

                  <div className={`font-pixel text-[9px] ${ev.textAccent} border ${ev.border}
                                   px-3 py-2 text-center hover:${ev.badge} hover:text-arcade-bg
                                   transition-all cursor-pointer mt-1`}>
                    LEARN MORE →
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Game Selection ── */}
        <section>
          <h2 className="font-pixel text-arcade-gray text-[9px] sm:text-xs text-center mb-4 tracking-widest">
            ── SELECT YOUR GAME ──
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {GAMES.map(game => (
              <GameCard key={game.id} game={game} onSelect={onSelectGame} />
            ))}
          </div>
        </section>

      </main>

      <footer className="text-center py-4 border-t-2 border-arcade-gray/20 mt-4">
        <p className="font-pixel text-arcade-gray text-[9px] sm:text-xs">
          SUMMIT × APOGEE MINI ARCADE © 2025
        </p>
      </footer>
    </div>
  )
}

function GameCard({ game, onSelect }) {
  const ready = game.available

  return (
    <button
      onClick={() => ready && onSelect(game.id)}
      disabled={!ready}
      className={`relative flex flex-col items-center gap-3 p-4 border-2 transition-all text-left w-full
        ${ready
          ? 'border-arcade-green hover:bg-arcade-panel hover:shadow-[0_0_18px_#50fa7b44] cursor-pointer group'
          : 'border-arcade-gray/30 cursor-not-allowed opacity-50'
        }`}
    >
      {/* Coming soon overlay */}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-arcade-bg/70 z-10">
          <span className="font-pixel text-arcade-gray text-[7px] border border-arcade-gray/60 px-2 py-1">
            COMING<br />SOON
          </span>
        </div>
      )}

      {/* Icon area */}
      <div className="w-full h-14 flex items-center justify-center bg-arcade-dark border border-arcade-gray/20
                      group-hover:border-arcade-green/40 transition-colors">
        <span className={`font-pixel text-lg ${ready ? 'text-arcade-green' : 'text-arcade-gray'}`}>
          {game.name.split(' ').map(w => w[0]).join('')}
        </span>
      </div>

      {/* Game name */}
      <div className="w-full">
        <p className={`font-pixel text-[9px] sm:text-[10px] ${ready ? 'text-arcade-green' : 'text-arcade-gray'}`}>
          {game.name}
        </p>
        <p className="font-mono text-arcade-gray text-[9px] mt-1 leading-tight">
          {game.description}
        </p>
      </div>

      {ready && (
        <div className="w-full font-pixel text-[8px] text-arcade-bg bg-arcade-green
                        px-2 py-1.5 text-center group-hover:bg-arcade-yellow transition-colors">
          ▶ PLAY
        </div>
      )}
    </button>
  )
}
