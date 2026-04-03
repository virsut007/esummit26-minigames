import { useState, useEffect, useRef } from 'react'
import { SKINS } from '../games/skins'
import { drawFace } from '../games/skinRenderer'

const THUMB = 80

function PlayerThumb({ skin, imgCache }) {
  const ref = useRef(null)

  useEffect(() => {
    // Custom player uses a real photo — no canvas needed
    if (skin.id === 'custom' || !ref.current) return
    const ctx = ref.current.getContext('2d')
    ctx.clearRect(0, 0, THUMB, THUMB)
    ctx.fillStyle = '#1a1a3e'
    ctx.fillRect(0, 0, THUMB, THUMB)
    const img = skin.type === 'image' ? (imgCache[skin.id] ?? null) : null
    drawFace(ctx, 4, 4, THUMB - 8, THUMB - 8, skin, img, true)
  }, [skin, imgCache])

  if (skin.id === 'custom') {
    return (
      <img
        src="/char-idle.png"
        alt="Custom Character"
        crossOrigin="anonymous"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    )
  }

  return (
    <canvas
      ref={ref}
      width={THUMB}
      height={THUMB}
      style={{
        imageRendering: 'pixelated',
        display: 'block',
        width: '100%',
        height: '100%',
      }}
    />
  )
}

export default function PlayerSelectPage({ onSelect, imgCache }) {
  const [selected, setSelected] = useState(SKINS[0].id)

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

      <main className="flex-1 w-full max-w-lg lg:max-w-4xl mx-auto px-4 lg:px-10 py-8 lg:py-12
                       flex flex-col items-center gap-8 lg:gap-10">

        {/* Title */}
        <section className="text-center">
          <p className="font-pixel text-arcade-gray text-[9px] lg:text-[10px] tracking-widest mb-2">
            SELECT YOUR
          </p>
          <h1 className="font-pixel text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight
                         text-arcade-cyan drop-shadow-[0_0_12px_#8be9fd]">
            PLAYER
          </h1>
          <p className="font-pixel text-arcade-gray text-[9px] mt-3 animate-blink">
            CHOOSE WISELY
          </p>
        </section>

        {/* Player grid — 3 cols on mobile, all 7 in a row on desktop */}
        <div className="grid grid-cols-3 lg:grid-cols-7 gap-3 lg:gap-5 w-full">
          {SKINS.map((skin, i) => {
            const active = selected === skin.id
            return (
              <button
                key={skin.id}
                onClick={() => setSelected(skin.id)}
                className="flex flex-col items-center gap-2 focus:outline-none"
              >
                {/* Avatar frame */}
                <div
                  className="w-full overflow-hidden"
                  style={{
                    aspectRatio: '1 / 1',
                    border:      `2px solid ${active ? '#50fa7b' : '#3d3d5c'}`,
                    boxShadow:   active ? '0 0 18px #50fa7b55' : 'none',
                    transform:   active ? 'scale(1.07)' : 'scale(1)',
                    transition:  'all 0.15s ease',
                    background:  '#0f0f23',
                    padding:     skin.id === 'custom' ? 0 : 4,
                  }}
                >
                  <PlayerThumb skin={skin} imgCache={imgCache} />
                </div>

                {/* Player number + name */}
                <div className="text-center leading-tight">
                  <p className="font-pixel text-[6px] text-arcade-gray/50">P{i + 1}</p>
                  <p className={`font-pixel text-[7px] sm:text-[8px] ${
                    active ? 'text-arcade-green' : 'text-arcade-gray/50'
                  }`}>
                    {skin.label}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Confirm */}
        <button
          onClick={() => onSelect(selected)}
          className="w-full max-w-xs font-pixel text-sm text-arcade-bg bg-arcade-green
                     border-4 border-arcade-green shadow-pixel py-3 lg:py-4
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
