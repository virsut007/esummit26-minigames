import { GAMES } from '../games'

const EVENTS = [
  {
    name: 'SOLVE FOR PILANI',
    tag:  'Case Competition',
    color: '#ff79c6',
    url:  'https://docs.google.com/forms/d/e/1FAIpQLSdRWpjb8mxyIiBwPOX8K9NLQbZA5bhc6lfKOjBVoWbvpd4fNA/viewform',
  },
  {
    name: 'DROPSHIPPING',
    tag:  'Business Challenge',
    color: '#ffb86c',
    url:  'https://forms.gle/T9gQ2yYLxqL1dhMb7',
  },
  {
    name: 'STARTUP EXPO',
    tag:  'Showcase Your Idea',
    color: '#8be9fd',
    url:  'https://forms.gle/3D3svMtTo76Md6NZ9',
  },
]

export default function LandingPage({
  onSelectGame,
  user,
  onSignOut,
  onLeaderboard,
}) {
  return (
    <div className="min-h-screen bg-arcade-bg text-white flex flex-col">

      {/* CRT scanline overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
        style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,#000 2px,#000 4px)' }}
      />

      {/* ── Header ── */}
      <header className="bg-arcade-panel border-b-4 border-arcade-green flex-shrink-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <span className="font-pixel text-arcade-green text-[11px] sm:text-sm drop-shadow-[0_0_8px_#50fa7b]">
              E-SUMMIT
            </span>
            <span className="font-pixel text-arcade-gray text-[11px] sm:text-sm">×</span>
            <span className="font-pixel text-arcade-purple text-[11px] sm:text-sm drop-shadow-[0_0_8px_#bd93f9]">
              APOGEE
            </span>
            <span className="font-pixel text-arcade-yellow text-[11px] sm:text-sm drop-shadow-[0_0_8px_#f1fa8c]">
              2026
            </span>
          </div>

          {user.id !== 'guest' && (
            <div className="flex items-center gap-2">
              <span className="hidden sm:block font-mono text-arcade-gray text-xs truncate max-w-[140px]"
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
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-lg lg:max-w-5xl xl:max-w-6xl mx-auto px-4 lg:px-10 py-6 lg:py-10">

        {/*
          Mobile  → single flex column (original order)
          Desktop → two-column grid: left = hero/skin/banners, right = game selection
        */}
        <div className="flex flex-col gap-7 lg:grid lg:gap-10 lg:items-start"
             style={{ gridTemplateColumns: 'minmax(0,2fr) minmax(0,3fr)' }}>

          {/* ── Hero — left col ── */}
          <section className="text-center lg:col-start-1 lg:row-start-1">
            <p className="font-pixel text-arcade-gray text-[9px] lg:text-[10px] tracking-widest mb-2">
              PRESENTS
            </p>
            <h1 className="font-pixel text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight">
              <span className="text-arcade-green drop-shadow-[0_0_12px_#50fa7b]">MINI</span>
              {' '}
              <span className="text-arcade-yellow drop-shadow-[0_0_12px_#f1fa8c]">ARCADE</span>
            </h1>
            <p className="font-pixel text-arcade-gray text-[9px] lg:text-[10px] mt-2 lg:mt-3 animate-blink">
              INSERT COIN TO PLAY
            </p>
          </section>

          {/* ── Game Selection — right col, spans hero+events rows ── */}
          <section className="lg:col-start-2 lg:row-start-1 lg:row-span-2">
            <button
              onClick={onLeaderboard}
              className="w-full font-pixel text-xs lg:text-sm text-arcade-bg bg-arcade-yellow border-2 border-arcade-yellow
                         py-3 lg:py-4 mb-4 hover:bg-arcade-green hover:border-arcade-green transition-all
                         shadow-[0_0_14px_#f1fa8c55] flex items-center justify-center gap-2"
            >
              🏆 HALL OF FAME
            </button>

            <h2 className="font-pixel text-arcade-gray text-[9px] lg:text-[10px] tracking-widest text-center mb-4">
              ── SELECT YOUR GAME ──
            </h2>
            <div className="grid grid-cols-3 gap-2 lg:gap-4">
              {GAMES.map(game => (
                <GameCard key={game.id} game={game} onSelect={onSelectGame} />
              ))}
            </div>
          </section>

          {/* ── Event Registrations — left col, row 2 ── */}
          <section className="lg:col-start-1 lg:row-start-2">
            <h2 className="font-pixel text-arcade-gray text-[9px] lg:text-[10px] text-center mb-3 tracking-widest">
              ── REGISTER NOW ──
            </h2>
            <div className="flex flex-col gap-3">
              {EVENTS.map(event => <EventCard key={event.name} event={event} />)}
            </div>
          </section>

        </div>

      </main>

      <footer className="text-center py-4 md:py-6 border-t-2 border-arcade-gray/20">
        <p className="font-pixel text-arcade-gray text-[9px] md:text-[10px]">
          E-SUMMIT × APOGEE 2026 MINI ARCADE
        </p>
      </footer>
    </div>
  )
}

function EventCard({ event }) {
  return (
    <a
      href={event.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 lg:py-4 transition-all
                   group-hover:scale-[1.02] group-active:scale-[0.98]"
        style={{
          border:     `2px solid ${event.color}`,
          boxShadow:  `0 0 14px ${event.color}33`,
          background: '#0f0f23',
          backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 10px,rgba(255,255,255,0.012) 10px,rgba(255,255,255,0.012) 11px)',
        }}
      >
        <div className="flex flex-col gap-0.5 min-w-0">
          <span
            className="font-pixel text-[9px] sm:text-[10px] lg:text-xs tracking-wide leading-tight truncate"
            style={{ color: event.color }}
          >
            {event.name}
          </span>
          <span className="font-mono text-arcade-gray/50 text-[8px] lg:text-[9px] truncate">
            {event.tag}
          </span>
        </div>
        <span
          className="font-pixel text-[8px] sm:text-[9px] whitespace-nowrap flex-shrink-0
                     px-2.5 py-1.5 transition-opacity group-hover:opacity-90"
          style={{ background: event.color, color: '#0f0f23' }}
        >
          REGISTER →
        </span>
      </div>
    </a>
  )
}

function GameCard({ game, onSelect }) {
  const ready = game.available

  return (
    <button
      onClick={() => ready && onSelect(game.id)}
      disabled={!ready}
      className={`relative flex flex-col items-center gap-3 lg:gap-5 p-4 lg:p-6 border-2 transition-all text-left w-full
        ${ready
          ? 'border-arcade-green hover:bg-arcade-panel hover:shadow-[0_0_20px_#50fa7b44] cursor-pointer group'
          : 'border-arcade-gray/30 cursor-not-allowed opacity-50'
        }`}
    >
      {/* Coming soon overlay */}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-arcade-bg/75 z-10">
          <span className="font-pixel text-arcade-gray text-[7px] border border-arcade-gray/60 px-2 py-1 text-center leading-relaxed">
            COMING<br />SOON
          </span>
        </div>
      )}

      {/* Icon area */}
      <div className="w-full h-14 lg:h-32 flex items-center justify-center bg-arcade-dark border border-arcade-gray/20
                      group-hover:border-arcade-green/50 transition-colors">
        <span className={`font-pixel text-xl lg:text-4xl ${ready ? 'text-arcade-green' : 'text-arcade-gray'}`}>
          {game.name.split(' ').map(w => w[0]).join('')}
        </span>
      </div>

      {/* Game name + description */}
      <div className="w-full">
        <p className={`font-pixel text-[9px] sm:text-[10px] lg:text-xs ${ready ? 'text-arcade-green' : 'text-arcade-gray'}`}>
          {game.name}
        </p>
        <p className="font-mono text-arcade-gray text-[8px] lg:text-[9px] mt-0.5 leading-tight">
          {game.description}
        </p>
      </div>

      {ready && (
        <div className="w-full font-pixel text-[8px] lg:text-[9px] text-arcade-bg bg-arcade-green
                        px-2 py-1.5 lg:py-2 text-center group-hover:bg-arcade-yellow transition-colors">
          ▶ PLAY
        </div>
      )}
    </button>
  )
}
