import { forwardRef, useEffect, useRef } from 'react'
import { getPercentile } from '../utils/getPercentile'

const GAME_META = {
  dinosaur: { name: 'DINO YADAV',   emoji: '🦖' },
  flappy:   { name: 'FLAPPY SAJAL', emoji: '🐦' },
  snake:    { name: 'SNAKE',        emoji: '🐍' },
  tetris:   { name: 'TETRIS',       emoji: '🎮' },
}

const TIER_THEME = {
  top1: {
    bg:        'linear-gradient(160deg, #1c1200 0%, #2d1f00 50%, #1a0e00 100%)',
    glow:      '#f1fa8c',
    badge:     '#f1fa8c',
    badgeText: '#0f0a00',
    radial:    'rgba(241,250,140,0.12)',
    strip:     'rgba(241,250,140,0.15)',
  },
  top5: {
    bg:        'linear-gradient(160deg, #100a20 0%, #1e1030 50%, #0e0a1c 100%)',
    glow:      '#bd93f9',
    badge:     '#bd93f9',
    badgeText: '#0a0620',
    radial:    'rgba(189,147,249,0.12)',
    strip:     'rgba(189,147,249,0.15)',
  },
  top10: {
    bg:        'linear-gradient(160deg, #051808 0%, #0a2010 50%, #041410 100%)',
    glow:      '#50fa7b',
    badge:     '#50fa7b',
    badgeText: '#021008',
    radial:    'rgba(80,250,123,0.12)',
    strip:     'rgba(80,250,123,0.15)',
  },
  top25: {
    bg:        'linear-gradient(160deg, #08101c 0%, #0e1828 50%, #060e18 100%)',
    glow:      '#8be9fd',
    badge:     '#8be9fd',
    badgeText: '#04101c',
    radial:    'rgba(139,233,253,0.10)',
    strip:     'rgba(139,233,253,0.12)',
  },
  other: {
    bg:        'linear-gradient(160deg, #0a0a1e 0%, #12123a 50%, #080818 100%)',
    glow:      '#8be9fd',
    badge:     '#6272a4',
    badgeText: '#f8f8f2',
    radial:    'rgba(98,114,164,0.10)',
    strip:     'rgba(98,114,164,0.12)',
  },
}

function scoreFontSize(score) {
  if (score >= 100000) return '48px'
  if (score >= 10000)  return '60px'
  if (score >= 1000)   return '72px'
  return '82px'
}

/** Loads an image and returns { img, minX, minY, cropW, cropH } after trimming transparent edges. */
function loadCroppedChar(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const W = img.naturalWidth
      const H = img.naturalHeight
      const offscreen = document.createElement('canvas')
      offscreen.width  = W
      offscreen.height = H
      const ctx = offscreen.getContext('2d')
      ctx.drawImage(img, 0, 0)
      try {
        const { data } = ctx.getImageData(0, 0, W, H)
        let minX = W, maxX = 0, minY = H, maxY = 0
        for (let y = 0; y < H; y++) {
          for (let x = 0; x < W; x++) {
            if (data[(y * W + x) * 4 + 3] > 8) {
              if (x < minX) minX = x
              if (x > maxX) maxX = x
              if (y < minY) minY = y
              if (y > maxY) maxY = y
            }
          }
        }
        if (maxX <= minX || maxY <= minY) {
          // No visible content — fall back to full image
          resolve({ offscreen, minX: 0, minY: 0, cropW: W, cropH: H })
        } else {
          resolve({ offscreen, minX, minY, cropW: maxX - minX + 1, cropH: maxY - minY + 1 })
        }
      } catch (_) {
        // Security/taint error — use full image
        resolve({ offscreen, minX: 0, minY: 0, cropW: W, cropH: H })
      }
    }
    img.onerror = reject
    img.src = src
  })
}

const ScoreShareCard = forwardRef(function ScoreShareCard(
  { score = 0, gameName = 'dinosaur', username = null },
  ref,
) {
  const meta      = GAME_META[gameName] ?? GAME_META.dinosaur
  const pct       = getPercentile(score)
  const theme     = TIER_THEME[pct.tier] ?? TIER_THEME.other
  const scoreSize = scoreFontSize(score)

  const HEADER_H = 72
  const FOOTER_H = 68
  const BODY_H   = 800 - HEADER_H - FOOTER_H  // 660px

  const charCanvasRef = useRef(null)

  useEffect(() => {
    const canvas = charCanvasRef.current
    if (!canvas) return
    loadCroppedChar('/char-idle.png').then(({ offscreen, minX, minY, cropW, cropH }) => {
      // Scale to ~75% of body height so the full character is visible
      const drawH = Math.round(BODY_H * 0.75)
      const drawW = Math.round(drawH * (cropW / cropH))
      canvas.width  = drawW
      canvas.height = drawH
      canvas.style.width  = `${drawW}px`
      canvas.style.height = `${drawH}px`
      const ctx = canvas.getContext('2d')
      ctx.drawImage(offscreen, minX, minY, cropW, cropH, 0, 0, drawW, drawH)
    }).catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [BODY_H])

  return (
    <div
      ref={ref}
      style={{
        width:      '450px',
        height:     '800px',
        background: theme.bg,
        fontFamily: "'Press Start 2P', monospace",
        position:   'relative',
        overflow:   'hidden',
        boxSizing:  'border-box',
      }}
    >
      {/* Dot-grid texture */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
        pointerEvents: 'none',
      }} />

      {/* Radial glow — right body area */}
      <div style={{
        position:  'absolute',
        top:       `${HEADER_H + BODY_H * 0.45}px`,
        left:      '72%',
        transform: 'translate(-50%, -50%)',
        width:     '300px', height: '300px',
        background: `radial-gradient(circle, ${theme.radial} 0%, transparent 70%)`,
        zIndex:    0,
        pointerEvents: 'none',
      }} />

      {/* ── HEADER — full width, centred ── */}
      <div style={{
        position:       'absolute',
        top: 0, left: 0, right: 0,
        height:         `${HEADER_H}px`,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            '6px',
        borderBottom:   `2px solid ${theme.strip}`,
        background:     'rgba(0,0,0,0.20)',
        zIndex:         5,
        boxSizing:      'border-box',
      }}>
        <span style={{
          fontSize:      '13px',
          color:         theme.glow,
          letterSpacing: '4px',
          textShadow:    `0 0 14px ${theme.glow}90`,
        }}>
          E-SUMMIT × APOGEE 2026
        </span>
        <span style={{
          fontSize:      '8px',
          color:         'rgba(255,255,255,0.35)',
          letterSpacing: '5px',
        }}>
          MINI ARCADE
        </span>
      </div>

      {/* ── CHARACTER canvas — left side, clipped to 235px so it never bleeds into text ── */}
      <div style={{
        position:  'absolute',
        left:      0,
        top:       `${HEADER_H}px`,
        width:     '235px',
        height:    `${BODY_H}px`,
        overflow:  'hidden',
        zIndex:    3,
        pointerEvents: 'none',
      }}>
        <canvas
          ref={charCanvasRef}
          style={{
            position: 'absolute',
            left:     0,
            bottom:   0,
            filter:   `drop-shadow(4px 0 18px ${theme.glow}55)`,
            display:  'block',
          }}
        />
      </div>

      {/* ── GAME TITLE — floating overlay, full width centred, just above the character's chest ── */}
      <div style={{
        position:       'absolute',
        top:            `${HEADER_H + 30}px`,
        left: 0, right: 0,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            '12px',
        zIndex:         6,
        pointerEvents:  'none',
      }}>
        <span style={{ fontSize: '26px', lineHeight: 1 }}>{meta.emoji}</span>
        <span style={{
          fontSize:      '18px',
          color:         theme.glow,
          letterSpacing: '3px',
          textShadow:    `0 0 18px ${theme.glow}, 0 0 40px ${theme.glow}60`,
        }}>
          {meta.name}
        </span>
      </div>

      {/* ── RIGHT PANEL — score + info ── */}
      <div style={{
        position:       'absolute',
        right:          0,
        top:            `${HEADER_H}px`,
        width:          '215px',
        height:         `${BODY_H}px`,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'flex-start',
        justifyContent: 'center',
        padding:        '0 18px',
        zIndex:         4,
        boxSizing:      'border-box',
        background:     'linear-gradient(to right, rgba(5,8,25,0.0) 0%, rgba(5,8,25,0.82) 18%, rgba(5,8,25,0.92) 100%)',
      }}>

        {/* Score */}
        <div style={{
          fontSize:      scoreSize,
          color:         theme.glow,
          lineHeight:    1,
          letterSpacing: '-2px',
          textShadow:    `0 0 20px ${theme.glow}, 0 0 50px ${theme.glow}60, 0 0 90px ${theme.glow}30`,
          marginBottom:  '18px',
        }}>
          {score.toLocaleString()}
        </div>

        {/* Percentile badge */}
        <div style={{
          background:    theme.badge,
          color:         theme.badgeText,
          fontSize:      '7px',
          padding:       '7px 14px',
          letterSpacing: '2px',
          marginBottom:  '10px',
          boxShadow:     `0 0 14px ${theme.badge}50`,
        }}>
          {pct.label}
        </div>

        {/* Tagline */}
        <div style={{
          fontSize:      '6px',
          color:         'rgba(255,255,255,0.35)',
          letterSpacing: '0.5px',
          marginBottom:  '28px',
        }}>
          {pct.tagline.toUpperCase()}
        </div>

        {/* Username */}
        {username && (
          <div style={{
            fontSize:      '8px',
            color:         theme.glow,
            letterSpacing: '1.5px',
            marginBottom:  '8px',
            textShadow:    `0 0 10px ${theme.glow}60`,
          }}>
            {username.toUpperCase()}
          </div>
        )}

        {/* CTA */}
        <div style={{
          fontSize:      '7px',
          color:         'rgba(255,255,255,0.40)',
          letterSpacing: '0.5px',
        }}>
          CAN YOU BEAT ME? →
        </div>

      </div>

      {/* ── FOOTER — developers ── */}
      <div style={{
        position:       'absolute',
        left: 0, right: 0, bottom: 0,
        height:         `${FOOTER_H}px`,
        borderTop:      `2px solid ${theme.strip}`,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            '7px',
        zIndex:         5,
        background:     'rgba(0,0,0,0.25)',
        boxSizing:      'border-box',
      }}>
        <span style={{
          fontSize:      '6px',
          color:         'rgba(255,255,255,0.22)',
          letterSpacing: '3px',
        }}>
          DEVELOPERS
        </span>
        <span style={{
          fontSize:      '7px',
          color:         'rgba(255,255,255,0.42)',
          letterSpacing: '0.8px',
          fontFamily:    'monospace',
        }}>
          Srijan Sahay · Viren Suthar · Rishu Raj Gupta
        </span>
      </div>

    </div>
  )
})

export default ScoreShareCard
