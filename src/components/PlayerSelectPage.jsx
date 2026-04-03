export default function PlayerSelectPage({ onSelect }) {
  return (
    <div className="min-h-screen bg-arcade-bg text-white flex flex-col">

      {/* CRT scanline overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
        style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,#000 2px,#000 4px)' }}
      />

      {/* Header */}
      <header className="bg-arcade-panel border-b-4 border-arcade-green flex-shrink-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 sm:gap-3">
          <span className="font-pixel text-arcade-green text-[11px] sm:text-sm drop-shadow-[0_0_8px_#50fa7b]">E-SUMMIT</span>
          <span className="font-pixel text-arcade-gray text-[11px] sm:text-sm">×</span>
          <span className="font-pixel text-arcade-purple text-[11px] sm:text-sm drop-shadow-[0_0_8px_#bd93f9]">APOGEE</span>
          <span className="font-pixel text-arcade-yellow text-[11px] sm:text-sm drop-shadow-[0_0_8px_#f1fa8c]">2026</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-8
                       flex flex-col items-center justify-center gap-8">

        {/* Title */}
        <section className="text-center">
          <p className="font-pixel text-arcade-gray text-[9px] tracking-widest mb-2">
            YOUR PLAYER
          </p>
          <h1 className="font-pixel text-3xl sm:text-4xl tracking-tight leading-tight
                         text-arcade-cyan drop-shadow-[0_0_12px_#8be9fd]">
            CHAR 1
          </h1>
        </section>

        {/* Character display */}
        <div
          style={{
            border:     '2px solid #50fa7b',
            boxShadow:  '0 0 24px #50fa7b55',
            background: '#0f0f23',
            width:      160,
            height:     160,
            display:    'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src="/char-idle.png"
            alt="Char 1"
            crossOrigin="anonymous"
            style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>

        <p className="font-pixel text-arcade-gray text-[9px] animate-blink">
          PRESS START
        </p>

        {/* Confirm */}
        <button
          onClick={() => onSelect('custom')}
          className="w-full max-w-xs font-pixel text-sm text-arcade-bg bg-arcade-green
                     border-4 border-arcade-green shadow-pixel py-3
                     hover:bg-arcade-yellow hover:border-arcade-yellow
                     active:translate-y-1 active:shadow-none transition-all"
        >
          ▶ ENTER ARCADE
        </button>

      </main>

      <footer className="text-center py-4 border-t-2 border-arcade-gray/20">
        <p className="font-pixel text-arcade-gray text-[9px]">
          E-SUMMIT × APOGEE 2026 MINI ARCADE
        </p>
      </footer>
    </div>
  )
}
