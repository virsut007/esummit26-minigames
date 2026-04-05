import { forwardRef } from 'react'
import { getPercentile } from '../utils/getPercentile'

// ── Game display metadata ─────────────────────────────────────────────────────
const GAME_META = {
  dinosaur: { name: 'DINO RUN',    emoji: '🦖' },
  flappy:   { name: 'FLAPPY BIRD', emoji: '🐦' },
  snake:    { name: 'SNAKE',       emoji: '🐍' },
  tetris:   { name: 'TETRIS',      emoji: '🎮' },
}

// ── Visual themes per score tier ──────────────────────────────────────────────
const TIER_THEME = {
  top1: {
    bg:         'linear-gradient(160deg, #1c1200 0%, #2d1f00 50%, #1a0e00 100%)',
    glow:       '#f1fa8c',
    badge:      '#f1fa8c',
    badgeText:  '#0f0a00',
    radial:     'rgba(241,250,140,0.12)',
    strip:      'rgba(241,250,140,0.08)',
  },
  top5: {
    bg:         'linear-gradient(160deg, #100a20 0%, #1e1030 50%, #0e0a1c 100%)',
    glow:       '#bd93f9',
    badge:      '#bd93f9',
    badgeText:  '#0a0620',
    radial:     'rgba(189,147,249,0.12)',
    strip:      'rgba(189,147,249,0.08)',
  },
  top10: {
    bg:         'linear-gradient(160deg, #051808 0%, #0a2010 50%, #041410 100%)',
    glow:       '#50fa7b',
    badge:      '#50fa7b',
    badgeText:  '#021008',
    radial:     'rgba(80,250,123,0.12)',
    strip:      'rgba(80,250,123,0.08)',
  },
  top25: {
    bg:         'linear-gradient(160deg, #08101c 0%, #0e1828 50%, #060e18 100%)',
    glow:       '#8be9fd',
    badge:      '#8be9fd',
    badgeText:  '#04101c',
    radial:     'rgba(139,233,253,0.10)',
    strip:      'rgba(139,233,253,0.06)',
  },
  other: {
    bg:         'linear-gradient(160deg, #0a0a1e 0%, #12123a 50%, #080818 100%)',
    glow:       '#8be9fd',
    badge:      '#6272a4',
    badgeText:  '#f8f8f2',
    radial:     'rgba(98,114,164,0.10)',
    strip:      'rgba(98,114,164,0.06)',
  },
}

function scoreFontSize(score) {
  if (score >= 100000) return '52px'
  if (score >= 10000)  return '64px'
  if (score >= 1000)   return '76px'
  return '86px'
}

/**
 * ScoreShareCard — 450 × 800 px Instagram-story-ready share card.
 *
 * Layout:
 *  - Character: left side, spanning nearly full height
 *  - Score + username: right side, vertically centred
 *  - Footer: developers credit at the bottom
 */
const ScoreShareCard = forwardRef(function ScoreShareCard(
  { score = 0, gameName = 'dinosaur', username = null },
  ref,
) {
  const meta      = GAME_META[gameName] ?? GAME_META.dinosaur
  const pct       = getPercentile(score)
  const theme     = TIER_THEME[pct.tier] ?? TIER_THEME.other
  const scoreSize = scoreFontSize(score)

  // Card dimensions
  const W = 450
  const H = 800
  const FOOTER_H = 72
  const STRIP_H  = 38
  const CHAR_H   = H - FOOTER_H  // character spans from top to just above footer

  return (
    <div
      ref={ref}
      style={{
        width: `${W}px`,
        height: `${H}px`,
        background: theme.bg,
        fontFamily: "'Press Start 2P', monospace",
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Dot-grid texture overlay ── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
        pointerEvents: 'none',
      }} />

      {/* ── Radial glow bloom on the right side ── */}
      <div style={{
        position: 'absolute',
        top: '45%', left: '68%',
        transform: 'translate(-50%, -50%)',
        width: '320px', height: '320px',
        background: `radial-gradient(circle, ${theme.radial} 0%, transparent 72%)`,
        zIndex: 0,
        pointerEvents: 'none',
      }} />

      {/* ── Character — left side, full height ── */}
      <img
        src="/char-idle.png"
        alt=""
        crossOrigin="anonymous"
        style={{
          position: 'absolute',
          left: '-10px',
          bottom: `${FOOTER_H}px`,
          height: `${CHAR_H}px`,
          width: 'auto',
          zIndex: 3,
          pointerEvents: 'none',
          filter: `drop-shadow(6px 0 28px ${theme.glow}70)`,
        }}
      />

      {/* ── Right-side content panel ── */}
      <div style={{
        position: 'absolute',
        right: 0,
        top: 0,
        width: '240px',
        bottom: `${FOOTER_H}px`,
        zIndex: 4,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        padding: '0',
      }}>

        {/* TOP BRANDING */}
        <div style={{
          height: `${STRIP_H}px`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 18px',
          borderBottom: `1px solid ${theme.strip}`,
          boxSizing: 'border-box',
        }}>
          <span style={{ fontSize: '6px', color: 'rgba(255,255,255,0.35)', letterSpacing: '2px' }}>
            E-SUMMIT × APOGEE 2026
          </span>
          <span style={{ fontSize: '6px', color: 'rgba(255,255,255,0.18)', letterSpacing: '1.5px', marginTop: '3px' }}>
            MINI ARCADE
          </span>
        </div>

        {/* SCORE AREA — centre of the right panel */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '0 18px',
          gap: 0,
        }}>

          {/* Game emoji */}
          <div style={{
            fontSize: '44px',
            lineHeight: 1,
            marginBottom: '10px',
            filter: `drop-shadow(0 0 14px ${theme.glow}80)`,
          }}>
            {meta.emoji}
          </div>

          {/* Game name */}
          <div style={{
            fontSize: '8px',
            color: 'rgba(255,255,255,0.40)',
            letterSpacing: '3px',
            marginBottom: '20px',
          }}>
            {meta.name}
          </div>

          {/* Score — hero */}
          <div style={{
            fontSize: scoreSize,
            color: theme.glow,
            lineHeight: 1,
            letterSpacing: '-2px',
            textShadow: `0 0 20px ${theme.glow}, 0 0 50px ${theme.glow}60, 0 0 90px ${theme.glow}30`,
            marginBottom: '20px',
          }}>
            {score.toLocaleString()}
          </div>

          {/* Percentile badge */}
          <div style={{
            background: theme.badge,
            color: theme.badgeText,
            fontSize: '8px',
            padding: '7px 16px',
            letterSpacing: '2px',
            marginBottom: '10px',
            boxShadow: `0 0 14px ${theme.badge}50`,
          }}>
            {pct.label}
          </div>

          {/* Tagline */}
          <div style={{
            fontSize: '7px',
            color: 'rgba(255,255,255,0.38)',
            letterSpacing: '0.5px',
            marginBottom: '24px',
          }}>
            {pct.tagline.toUpperCase()}
          </div>

          {/* Username */}
          {username && (
            <div style={{
              fontSize: '8px',
              color: theme.glow,
              letterSpacing: '1.5px',
              marginBottom: '6px',
            }}>
              {username.toUpperCase()}
            </div>
          )}

          {/* CTA */}
          <div style={{
            fontSize: '7px',
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: '0.5px',
          }}>
            CAN YOU BEAT ME? →
          </div>

        </div>
      </div>

      {/* ── Footer — developers credit ── */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0,
        bottom: 0,
        height: `${FOOTER_H}px`,
        borderTop: `1px solid ${theme.strip}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        zIndex: 5,
        boxSizing: 'border-box',
        background: 'rgba(0,0,0,0.25)',
      }}>
        <span style={{
          fontSize: '6px',
          color: 'rgba(255,255,255,0.22)',
          letterSpacing: '3px',
        }}>
          DEVELOPERS
        </span>
        <span style={{
          fontSize: '7px',
          color: 'rgba(255,255,255,0.40)',
          letterSpacing: '1px',
          fontFamily: 'monospace',
        }}>
          Srijan Sahay · Viren Suthar · Rishu Raj Gupta
        </span>
      </div>

    </div>
  )
})

export default ScoreShareCard
