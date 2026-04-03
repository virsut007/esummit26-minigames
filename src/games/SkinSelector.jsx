import { useEffect, useRef } from 'react'
import { SKINS }    from '../games/skins'
import { drawFace } from '../games/skinRenderer'

const THUMB = 44   // thumbnail canvas size in px

function SkinThumb({ skin, imgCache }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    const ctx = ref.current.getContext('2d')
    ctx.clearRect(0, 0, THUMB, THUMB)
    ctx.fillStyle = '#0f0f23'
    ctx.fillRect(0, 0, THUMB, THUMB)
    const img = skin.type === 'image' ? (imgCache[skin.id] ?? null) : null
    drawFace(ctx, 2, 2, THUMB - 4, THUMB - 4, skin, img, true)
  }, [skin, imgCache])

  return (
    <canvas
      ref={ref}
      width={THUMB}
      height={THUMB}
      className="rounded-full block"
      style={{ imageRendering: 'pixelated', width: THUMB, height: THUMB }}
    />
  )
}

export default function SkinSelector({ selectedId, onSelect, imgCache }) {
  return (
    <div className="flex flex-col gap-1.5 sm:gap-2">
      {/* Label */}
      <div className="flex items-center gap-2">
        <span className="font-pixel text-arcade-cyan text-[8px] sm:text-[9px] whitespace-nowrap">
          SELECT SKIN
        </span>
        <div className="flex-1 h-px bg-arcade-cyan/20" />
      </div>

      {/* Thumbnails — scrollable strip */}
      <div className="scroll-x pb-1">
        <div className="flex gap-2 sm:gap-3" style={{ minWidth: 'max-content' }}>
          {SKINS.map(skin => {
            const active = skin.id === selectedId
            return (
              <button
                key={skin.id}
                onClick={() => onSelect(skin.id)}
                className="flex flex-col items-center gap-1 flex-shrink-0 focus:outline-none"
                title={skin.label}
              >
                {/* Circle frame */}
                <div
                  className="rounded-full overflow-hidden"
                  style={{
                    padding:    2,
                    border:     `2px solid ${active ? '#50fa7b' : '#3d3d5c'}`,
                    boxShadow:  active ? '0 0 10px #50fa7b88' : 'none',
                    transform:  active ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <SkinThumb skin={skin} imgCache={imgCache} />
                </div>
                {/* Label */}
                <span
                  className="font-pixel text-[6px] sm:text-[7px]"
                  style={{ color: active ? '#50fa7b' : '#6272a4' }}
                >
                  {skin.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
