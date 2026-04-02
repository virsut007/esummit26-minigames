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
// Each theme defines the card background, accent glow, and badge colours.
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

// Responsive font size for the score number
function scoreFontSize(score) {
  if (score >= 100000) return '52px'
  if (score >= 10000)  return '66px'
  if (score >= 1000)   return '78px'
  return '90px'
}

/**
 * ScoreShareCard — 450 × 800 px Instagram-story-ready share card.
 *
 * Uses ONLY inline styles so html2canvas captures every pixel correctly
 * (Tailwind utility classes are fine at runtime but html2canvas sometimes
 * misses dynamic/JIT values — inline styles are bulletproof).
 *
 * Pass `ref` down via forwardRef so the parent can hand it to generateShareImage().
 */
const ScoreShareCard = forwardRef(function ScoreShareCard(
  { score = 0, gameName = 'dinosaur', username = null },
  ref,
) {
  const meta      = GAME_META[gameName] ?? GAME_META.dinosaur
  const pct       = getPercentile(score)
  const theme     = TIER_THEME[pct.tier] ?? TIER_THEME.other
  const scoreSize = scoreFontSize(score)
  const domain    = typeof window !== 'undefined' ? window.location.hostname : 'esummit26-minigames'

  // ── Root card ───────────────────────────────────────────────────────────────
  return (
    <div
      ref={ref}
      style={{
        width: '450px',
        height: '800px',
        background: theme.bg,
        fontFamily: "'Press Start 2P', monospace",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
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

      {/* ── Radial glow bloom centred on score area ── */}
      <div style={{
        position: 'absolute',
        top: '42%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '340px', height: '340px',
        background: `radial-gradient(circle, ${theme.radial} 0%, transparent 72%)`,
        zIndex: 0,
        pointerEvents: 'none',
      }} />

      {/* ── All visible content (above overlays) ── */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>

        {/* TOP STRIP — branding */}
        <div style={{
          width: '100%',
          padding: '18px 22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${theme.strip}`,
          boxSizing: 'border-box',
        }}>
          <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.35)', letterSpacing: '2.5px' }}>
            E-SUMMIT × APOGEE 2026
          </span>
          <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.18)', letterSpacing: '1.5px' }}>
            MINI ARCADE
          </span>
        </div>

        {/* MAIN BODY — game + score + percentile */}
        <div style={{
          flex: 1,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '0 28px',
          gap: 0,
        }}>

          {/* Game emoji */}
          <div style={{
            fontSize: '68px',
            lineHeight: 1,
            marginBottom: '14px',
            filter: `drop-shadow(0 0 18px ${theme.glow}80)`,
          }}>
            {meta.emoji}
          </div>

          {/* Game name */}
          <div style={{
            fontSize: '10px',
            color: 'rgba(255,255,255,0.40)',
            letterSpacing: '4px',
            marginBottom: '28px',
          }}>
            {meta.name}
          </div>

          {/* Score — the hero element */}
          <div style={{
            fontSize: scoreSize,
            color: theme.glow,
            lineHeight: 1,
            letterSpacing: '-2px',
            textShadow: `0 0 24px ${theme.glow}, 0 0 60px ${theme.glow}60, 0 0 100px ${theme.glow}30`,
            marginBottom: '28px',
          }}>
            {score.toLocaleString()}
          </div>

          {/* Percentile badge */}
          <div style={{
            background: theme.badge,
            color: theme.badgeText,
            fontSize: '9px',
            padding: '9px 22px',
            letterSpacing: '2.5px',
            marginBottom: '14px',
            boxShadow: `0 0 16px ${theme.badge}50`,
          }}>
            {pct.label}
          </div>

          {/* Tagline */}
          <div style={{
            fontSize: '8px',
            color: 'rgba(255,255,255,0.42)',
            letterSpacing: '1px',
          }}>
            {pct.tagline.toUpperCase()}
          </div>

        </div>

        {/* BOTTOM STRIP — username + CTA */}
        <div style={{
          width: '100%',
          padding: '18px 24px 26px',
          borderTop: `1px solid ${theme.strip}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          boxSizing: 'border-box',
        }}>

          {/* Username row */}
          {username && (
            <div style={{
              fontSize: '9px',
              color: 'rgba(255,255,255,0.70)',
              letterSpacing: '1.5px',
            }}>
              {username.toUpperCase()}
            </div>
          )}

          {/* Call to action */}
          <div style={{
            fontSize: '8px',
            color: theme.glow,
            letterSpacing: '1px',
            textAlign: 'center',
          }}>
            CAN YOU BEAT ME? →
          </div>

          {/* Domain */}
          <div style={{
            fontSize: '7px',
            color: 'rgba(255,255,255,0.22)',
            letterSpacing: '0.5px',
          }}>
            {domain}
          </div>

        </div>

      </div>
    </div>
  )
})

export default ScoreShareCard
