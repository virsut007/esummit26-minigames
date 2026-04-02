import { GAMES } from '../games'

// ── Ad images ─────────────────────────────────────────────────────────────────
// Drop your banner images into /public/ads/ and set the paths below.
// Set to null to show the placeholder outline instead.
const AD_SUMMIT_SRC = null   // e.g. '/ads/esummit-banner.jpg'
const AD_APOGEE_SRC = null   // e.g. '/ads/apogee-banner.jpg'
// ─────────────────────────────────────────────────────────────────────────────

export default function LandingPage({ onSelectGame, user, onSignOut }) {
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

      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-10 flex flex-col gap-8 sm:gap-10">

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

        {/* ── Game Selection — main focus ── */}
        <section>
          <h2 className="font-pixel text-arcade-gray text-[9px] sm:text-xs text-center mb-5 tracking-widest">
            ── SELECT YOUR GAME ──
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
            {GAMES.map(game => (
              <GameCard key={game.id} game={game} onSelect={onSelectGame} />
            ))}
          </div>
        </section>

        {/* ── Event Ad Banners — secondary ── */}
        <section>
          <h2 className="font-pixel text-arcade-gray text-[9px] sm:text-xs text-center mb-4 tracking-widest">
            ── EVENTS ──
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdBanner
              src={AD_SUMMIT_SRC}
              label="E-SUMMIT 2026"
              accentColor="#50fa7b"
              borderClass="border-arcade-green"
              glowClass="shadow-[0_0_12px_#50fa7b33]"
            />
            <AdBanner
              src={AD_APOGEE_SRC}
              label="APOGEE 2026"
              accentColor="#bd93f9"
              borderClass="border-arcade-purple"
              glowClass="shadow-[0_0_12px_#bd93f933]"
            />
          </div>
        </section>

      </main>

      <footer className="text-center py-4 border-t-2 border-arcade-gray/20 mt-4">
        <p className="font-pixel text-arcade-gray text-[9px] sm:text-xs">
          E-SUMMIT × APOGEE 2026 MINI ARCADE
        </p>
      </footer>
    </div>
  )
}

function AdBanner({ src, label, accentColor, borderClass, glowClass }) {
  return (
    <div className={`border-2 ${borderClass} ${glowClass} overflow-hidden`}
         style={{ aspectRatio: '16 / 6' }}>
      {src ? (
        <img
          src={src}
          alt={label}
          className="w-full h-full object-cover"
        />
      ) : (
        /* Placeholder shown until an image is provided */
        <div
          className="w-full h-full flex flex-col items-center justify-center gap-2 bg-arcade-panel"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.015) 10px, rgba(255,255,255,0.015) 11px)`,
          }}
        >
          <span
            className="font-pixel text-[9px] sm:text-[10px] tracking-widest"
            style={{ color: accentColor }}
          >
            {label}
          </span>
          <span className="font-mono text-arcade-gray/40 text-[9px]">
            ad banner · 16 : 6
          </span>
        </div>
      )}
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
      <div className="w-full h-16 flex items-center justify-center bg-arcade-dark border border-arcade-gray/20
                      group-hover:border-arcade-green/50 transition-colors">
        <span className={`font-pixel text-xl ${ready ? 'text-arcade-green' : 'text-arcade-gray'}`}>
          {game.name.split(' ').map(w => w[0]).join('')}
        </span>
      </div>

      {/* Game name + description */}
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
