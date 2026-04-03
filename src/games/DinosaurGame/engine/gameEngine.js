import { drawFace } from '../../skinRenderer'

// ─── Game Constants ───────────────────────────────────────────────────────────
export const GAME_W   = 800
export const GAME_H   = 1050          // tall canvas → fills phone screen
const GROUND_Y        = 840           // y of the ground line (80% of GAME_H)
const DS              = 1.65          // dino draw scale (everything ×1.65 bigger)
const DINO_X          = 90
const DINO_W          = Math.round(44  * DS)   // 73 — collision box width
const DINO_H          = Math.round(56  * DS)   // 92 — visual + collision height (to leg bottom)
const GRAVITY         = 0.85
const JUMP_FORCE      = -22           // bigger jump for taller canvas
const INITIAL_SPEED   = 5
const OS              = 1.65          // obstacle scale
// Airplane banner constants
const PLANE_W   = 54
const PLANE_H   = 22
const TOW_LEN   = 26
const BANNER_W  = 210  // 16:9-ish banner (210 × 118)
const BANNER_H  = 118
const AIR_TOTAL = PLANE_W + TOW_LEN + BANNER_W  // 290
// ─────────────────────────────────────────────────────────────────────────────

function makeDino() {
  return { x: DINO_X, y: GROUND_Y - DINO_H, vy: 0, onGround: true, legFrame: 0, legTimer: 0 }
}

function makeAirplanes() {
  return [
    { x: GAME_W + 100,  y: 110, speed: 1.3, variant: 0 },
    { x: GAME_W + 700,  y: 170, speed: 1.0, variant: 1 },
    { x: GAME_W + 1350, y: 90,  speed: 1.6, variant: 0 },
  ]
}

export class DinoEngine {
  constructor(canvas, callbacks) {
    this.canvas    = canvas
    this.ctx       = canvas.getContext('2d')
    this.callbacks = callbacks

    this.state     = 'idle'
    this.frame     = 0
    this.score     = 0
    this.highScore = 0
    this.speed     = INITIAL_SPEED

    this.dino      = makeDino()
    this.obstacles = []
    this.clouds    = []
    this.airplanes = makeAirplanes()
    this.groundOff = 0

    this.obstacleCounter = 0
    this.nextObstacleIn  = 90

    this.skin    = null
    this.skinImg = null

    this.charImgs = { run1: null, run2: null, jump: null }
    this._loadCharImages()

    this._raf    = null
    this._lastTs = null
    this._loop   = this._loop.bind(this)
  }

  // ─── Character image loader ────────────────────────────────────────────────

  _loadCharImages() {
    const entries = [
      ['run1', '/char-run1.png'],
      ['run2', '/char-run2.png'],
      ['jump', '/char-jump.png'],
    ]
    for (const [key, src] of entries) {
      const img = new Image()
      img.onload = () => { this.charImgs[key] = img }
      img.src = src
    }
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  init() {
    this.canvas.width  = GAME_W
    this.canvas.height = GAME_H
    this._renderIdle()
  }

  jump() {
    if (this.state === 'idle') { this.startGame(); return }
    if (this.state === 'playing' && this.dino.onGround) {
      this.dino.vy       = JUMP_FORCE
      this.dino.onGround = false
    }
  }

  startGame() {
    this.state     = 'playing'
    this.frame     = 0
    this.score     = 0
    this.speed     = INITIAL_SPEED
    this.dino      = makeDino()
    this.obstacles = []
    this.airplanes = makeAirplanes()
    this.clouds    = [
      { x: 180, y: 340, w: 100 },
      { x: 520, y: 370, w: 80  },
    ]
    this.obstacleCounter = 0
    this.nextObstacleIn  = 90
    this.groundOff       = 0
    this._lastTs         = null
    this._raf = requestAnimationFrame(this._loop)
  }

  setSkin(skin, img) { this.skin = skin; this.skinImg = img ?? null }

  destroy() { if (this._raf) cancelAnimationFrame(this._raf) }

  // ─── Game Loop ─────────────────────────────────────────────────────────────

  _loop(ts) {
    const delta = this._lastTs === null ? 1 : Math.min((ts - this._lastTs) / (1000 / 60), 3)
    this._lastTs = ts
    this._update(delta)
    this._render()
    if (this.state === 'playing') this._raf = requestAnimationFrame(this._loop)
  }

  _update(delta) {
    this.frame += delta
    this.speed  = Math.min(INITIAL_SPEED + Math.floor(this.frame / 400) * 0.7, 16)
    this.score  = Math.floor(this.frame / 6)
    this.callbacks.onScoreUpdate(this.score)

    // Dino physics
    const d = this.dino
    if (!d.onGround) {
      d.vy += GRAVITY * delta
      d.y  += d.vy * delta
      if (d.y >= GROUND_Y - DINO_H) {
        d.y = GROUND_Y - DINO_H; d.vy = 0; d.onGround = true
      }
    } else {
      d.legTimer += delta
      if (d.legTimer >= 8) { d.legTimer = 0; d.legFrame = (d.legFrame + 1) % 2 }
    }

    this.groundOff = (this.groundOff + this.speed * delta) % 20

    // Obstacles
    this.obstacleCounter += delta
    if (this.obstacleCounter >= this.nextObstacleIn) {
      this._spawnObstacle()
      this.obstacleCounter = 0
      this.nextObstacleIn  = 55 + Math.random() * 60
    }
    this.obstacles = this.obstacles.filter(o => o.x + o.w > -50)
    for (const obs of this.obstacles) {
      obs.x -= this.speed * delta
      if (this._hits(d, obs)) { this._die(); return }
    }

    // Clouds — float in mid-sky
    for (const c of this.clouds) c.x -= this.speed * 0.18 * delta
    this.clouds = this.clouds.filter(c => c.x + c.w > -30)
    if (this.clouds.length < 4 && Math.random() < 0.007) {
      this.clouds.push({ x: GAME_W + 20, y: 300 + Math.random() * 160, w: 60 + Math.random() * 60 })
    }

    // Airplanes — slow, upper sky
    for (const p of this.airplanes) {
      p.x -= p.speed * delta
      if (p.x + AIR_TOTAL < 0) {
        p.x       = GAME_W + 150 + Math.random() * 700
        p.y       = 70 + Math.random() * 140
        p.speed   = 0.9 + Math.random() * 0.8
        p.variant = Math.random() < 0.5 ? 0 : 1
      }
    }
  }

  _hits(dino, obs) {
    const p = 10
    return (
      dino.x + p          < obs.x + obs.w - p &&
      dino.x + DINO_W - p > obs.x + p          &&
      dino.y + p          < obs.y + obs.h - p   &&
      dino.y + DINO_H - p > obs.y + p
    )
  }

  _die() {
    this.state = 'dead'
    if (this.score > this.highScore) this.highScore = this.score
    cancelAnimationFrame(this._raf)
    this._raf = null
    this._render()
    this._drawDeathOverlay()
    this.callbacks.onGameOver(this.score)
  }

  _spawnObstacle() {
    const r = Math.random()
    let w, h, type
    if (r < 0.35)      { w = Math.round(20*OS); h = Math.round(38*OS); type = 'small'   }
    else if (r < 0.65) { w = Math.round(24*OS); h = Math.round(54*OS); type = 'tall'    }
    else               { w = Math.round(52*OS); h = Math.round(46*OS); type = 'cluster' }
    this.obstacles.push({ x: GAME_W + 10, y: GROUND_Y - h, w, h, type })
  }

  // ─── Rendering ─────────────────────────────────────────────────────────────

  _render() {
    const ctx = this.ctx

    ctx.fillStyle = '#0f0f23'
    ctx.fillRect(0, 0, GAME_W, GAME_H)

    // Stars (upper sky only)
    ctx.fillStyle = 'rgba(255,255,255,0.28)'
    for (let i = 0; i < 32; i++) {
      ctx.fillRect((i * 43 + 11) % GAME_W, (i * 37 + 7) % 480, 2, 2)
    }

    // Airplanes (behind clouds — drawn first)
    for (const p of this.airplanes) this._drawAirplane(p)

    // Clouds
    ctx.fillStyle = '#1e1e3a'
    for (const c of this.clouds) {
      ctx.fillRect(c.x, c.y, c.w, 16)
      ctx.fillRect(c.x + 12, c.y - 10, c.w - 24, 14)
      if (c.w > 80) ctx.fillRect(c.x + 26, c.y - 18, c.w - 52, 10)
    }

    // Ground line + dots
    ctx.fillStyle = '#3d3d5c'
    ctx.fillRect(0, GROUND_Y, GAME_W, 3)
    ctx.fillStyle = '#2a2a4a'
    for (let gx = -this.groundOff; gx < GAME_W; gx += 22) {
      ctx.fillRect(gx, GROUND_Y + 6, 5, 5)
    }

    // Obstacles
    for (const obs of this.obstacles) this._drawObstacle(obs)

    // Dino
    this._drawDino(this.dino, this.state === 'dead' ? '#ff5555' : '#50fa7b')

    // Score HUD
    ctx.textAlign = 'right'
    ctx.font      = 'bold 18px "Press Start 2P", monospace'
    ctx.fillStyle = '#f1fa8c'
    ctx.fillText(`SCORE: ${this.score}`, GAME_W - 18, 36)
    if (this.highScore > 0) {
      ctx.fillStyle = '#bd93f9'
      ctx.font      = 'bold 14px "Press Start 2P", monospace'
      ctx.fillText(`BEST: ${this.highScore}`, GAME_W - 18, 62)
    }
  }

  _renderIdle() {
    const ctx = this.ctx
    ctx.fillStyle = '#0f0f23'
    ctx.fillRect(0, 0, GAME_W, GAME_H)

    ctx.fillStyle = 'rgba(255,255,255,0.28)'
    for (let i = 0; i < 32; i++) {
      ctx.fillRect((i * 43 + 11) % GAME_W, (i * 37 + 7) % 480, 2, 2)
    }

    // Show an airplane on idle screen
    this._drawAirplane({ x: GAME_W * 0.05, y: 120, variant: 0 })

    ctx.fillStyle = '#3d3d5c'
    ctx.fillRect(0, GROUND_Y, GAME_W, 3)
    this._drawDino(this.dino, '#50fa7b')

    ctx.textAlign  = 'center'
    ctx.font       = 'bold 20px "Press Start 2P", monospace'
    ctx.fillStyle  = '#50fa7b'
    ctx.fillText('TAP TO START', GAME_W / 2, GROUND_Y - 180)
    ctx.font       = '14px "Press Start 2P", monospace'
    ctx.fillStyle  = '#6272a4'
    ctx.fillText('SPACE / UP ARROW / TAP', GAME_W / 2, GROUND_Y - 148)
  }

  _drawDeathOverlay() {
    const ctx = this.ctx
    const d   = this.dino
    ctx.fillStyle = 'rgba(255,85,85,0.25)'
    ctx.fillRect(d.x - 10, d.y - 10, DINO_W + 20, DINO_H + 20)
    ctx.strokeStyle = '#ff5555'
    ctx.lineWidth   = 4
    ctx.beginPath()
    ctx.moveTo(d.x, d.y);           ctx.lineTo(d.x + DINO_W, d.y + DINO_H)
    ctx.moveTo(d.x + DINO_W, d.y); ctx.lineTo(d.x, d.y + DINO_H)
    ctx.stroke()
  }

  _drawDino(d, color) {
    const ctx = this.ctx
    const { x, y, onGround, legFrame } = d

    // ── Custom character images (only for the custom/P1 player) ─────────────
    const isCustomPlayer = !this.skin || this.skin.id === 'custom'
    const charImg = isCustomPlayer
      ? (onGround ? (legFrame === 0 ? this.charImgs.run1 : this.charImgs.run2) : this.charImgs.jump)
      : null

    if (charImg) {
      // Draw slightly larger than the collision box, feet anchored to the ground
      const drawW = Math.round(DINO_W * 1.6)
      const drawH = Math.round(DINO_H * 1.6)
      const drawX = x - Math.round((drawW - DINO_W) / 2)
      const drawY = y - (drawH - DINO_H)
      ctx.drawImage(charImg, drawX, drawY, drawW, drawH)
      return
    }

    // ── Fallback: original pixel-art dino (while images load) ────────────────
    const S = DS
    ctx.save()
    ctx.translate(x, y)
    ctx.fillStyle = color

    // Tail
    ctx.fillRect(-14*S, 28*S, 18*S, 9*S)
    ctx.fillRect(-20*S, 33*S, 10*S, 7*S)

    // Body
    ctx.fillRect(2*S, 18*S, 28*S, 28*S)

    // Neck
    ctx.fillRect(16*S, 8*S, 16*S, 14*S)

    const useSkin = this.skin && this.skin.type !== 'default'
    if (!useSkin) {
      ctx.fillRect(18*S, 0, 24*S, 14*S)
      ctx.fillStyle = '#0f0f23'
      ctx.fillRect(34*S, 3*S, 5*S, 5*S)
      ctx.fillStyle = color
      ctx.fillRect(36*S, 9*S, 6*S, 5*S)
    } else {
      drawFace(ctx, 14*S, -3*S, 30*S, 22*S, this.skin, this.skinImg)
    }

    // Spine bumps
    ctx.fillStyle = '#27c65a'
    ctx.fillRect(18*S, -6*S, 7*S, 7*S)
    ctx.fillRect(27*S, -4*S, 5*S, 5*S)

    // Legs
    ctx.fillStyle = color
    if (onGround) {
      if (legFrame === 0) {
        ctx.fillRect(16*S, 46*S, 12*S, 12*S)
        ctx.fillRect( 4*S, 40*S, 12*S,  7*S)
      } else {
        ctx.fillRect(16*S, 40*S, 12*S,  7*S)
        ctx.fillRect( 4*S, 46*S, 12*S, 12*S)
      }
    } else {
      ctx.fillRect(16*S, 44*S, 12*S, 10*S)
      ctx.fillRect( 4*S, 44*S, 12*S, 10*S)
    }

    ctx.restore()
  }

  _drawObstacle(obs) {
    const ctx        = this.ctx
    const { x, y, w, h, type } = obs
    const S = OS
    const C = '#ff5555', D = '#cc2222'
    ctx.fillStyle = C

    if (type === 'cluster') {
      const h1 = h, h2 = h - Math.round(10*S)
      const y1 = GROUND_Y - h1, y2 = GROUND_Y - h2
      const sw = Math.round(8*S), sh = Math.round(7*S)

      ctx.fillRect(x + Math.round(4*S),  y1, sw, h1)
      ctx.fillRect(x + Math.round(28*S), y2, sw, h2)

      ctx.fillRect(x - Math.round(4*S),  y1 + Math.round(14*S), Math.round(12*S), sh)
      ctx.fillRect(x - Math.round(4*S),  y1 + Math.round( 2*S), sh, Math.round(14*S))
      ctx.fillRect(x + Math.round(12*S), y1 + Math.round(10*S), Math.round(10*S), sh)
      ctx.fillRect(x + Math.round(12*S), y1 + Math.round( 2*S), Math.round( 5*S), Math.round(10*S))

      ctx.fillRect(x + Math.round(20*S), y2 + Math.round(16*S), Math.round(12*S), sh)
      ctx.fillRect(x + Math.round(36*S), y2 + Math.round(12*S), sh, sh)
      ctx.fillRect(x + Math.round(36*S), y2 + Math.round( 4*S), Math.round( 5*S), Math.round(10*S))

      ctx.fillStyle = D
      ctx.fillRect(x + Math.round(4*S),  y1, Math.round(2*S), h1)
      ctx.fillRect(x + Math.round(28*S), y2, Math.round(2*S), h2)
    } else {
      const sw  = Math.round(10*S)
      const cx  = Math.floor(x + w / 2) - Math.round(5*S)

      ctx.fillRect(cx, y, sw, h)

      const aw = Math.round(7*S), ah = Math.round(8*S)
      ctx.fillRect(x, y + Math.floor(h * 0.3), cx - x + Math.round(5*S), aw)
      ctx.fillRect(x, y + Math.floor(h * 0.3) - Math.round(16*S), aw, Math.round(18*S))

      const rx = cx + sw
      ctx.fillRect(rx, y + Math.floor(h * 0.4), x + w - rx, aw)
      ctx.fillRect(x + w - aw, y + Math.floor(h * 0.4) - Math.round(20*S), aw, Math.round(22*S))

      ctx.fillStyle = D
      ctx.fillRect(cx, y, Math.round(3*S), h)
    }
  }

  _drawAirplane(plane) {
    const ctx = this.ctx
    const { x, y, variant } = plane

    // Banner trails behind (to the right) as plane flies left
    const bx = x + PLANE_W + TOW_LEN
    const by = y + PLANE_H / 2 - BANNER_H / 2

    // Tow rope
    ctx.strokeStyle = 'rgba(200,200,200,0.55)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x + PLANE_W, y + PLANE_H / 2)
    ctx.lineTo(bx, by + BANNER_H / 2)
    ctx.stroke()

    // Banner background
    ctx.fillStyle = '#0c0c28'
    ctx.fillRect(bx, by, BANNER_W, BANNER_H)

    // Banner border — gold hoarding frame
    ctx.strokeStyle = '#f1fa8c'
    ctx.lineWidth = 3
    ctx.strokeRect(bx + 1, by + 1, BANNER_W - 2, BANNER_H - 2)

    // Corner rivet dots
    const rv = 5
    ctx.fillStyle = '#f1fa8c88'
    ;[[bx+6, by+6], [bx+BANNER_W-6, by+6], [bx+6, by+BANNER_H-6], [bx+BANNER_W-6, by+BANNER_H-6]]
      .forEach(([rx2, ry]) => { ctx.beginPath(); ctx.arc(rx2, ry, rv/2, 0, Math.PI*2); ctx.fill() })

    // Banner text
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'top'
    const cx = bx + BANNER_W / 2

    if (variant === 0) {
      ctx.fillStyle = '#50fa7b'
      ctx.font      = 'bold 28px "Press Start 2P", monospace'
      ctx.fillText('E-SUMMIT', cx, by + 10)
      ctx.fillStyle = '#6272a4'
      ctx.font      = '18px "Press Start 2P", monospace'
      ctx.fillText('× APOGEE 2026', cx, by + 46)
      ctx.fillStyle = '#f1fa8c'
      ctx.font      = 'bold 20px "Press Start 2P", monospace'
      ctx.fillText('MINI ARCADE', cx, by + 74)
    } else {
      ctx.fillStyle = '#bd93f9'
      ctx.font      = 'bold 28px "Press Start 2P", monospace'
      ctx.fillText('APOGEE', cx, by + 10)
      ctx.fillStyle = '#6272a4'
      ctx.font      = '18px "Press Start 2P", monospace'
      ctx.fillText('× E-SUMMIT 2026', cx, by + 46)
      ctx.fillStyle = '#ffb86c'
      ctx.font      = 'bold 20px "Press Start 2P", monospace'
      ctx.fillText('PLAY & WIN!', cx, by + 74)
    }

    // Plane body (nose/cockpit on left since it flies left)
    ctx.fillStyle = '#b8c8e0'
    // Fuselage
    ctx.fillRect(x + 6, y + 4, PLANE_W - 6, PLANE_H - 8)
    // Nose cone
    ctx.fillStyle = '#d0ddf5'
    ctx.beginPath()
    ctx.moveTo(x, y + PLANE_H / 2)
    ctx.lineTo(x + 8, y + 4)
    ctx.lineTo(x + 8, y + PLANE_H - 4)
    ctx.closePath()
    ctx.fill()
    // Top wing
    ctx.fillStyle = '#c8d8f0'
    ctx.fillRect(x + 14, y - 8, 24, 10)
    // Bottom tail fin
    ctx.fillRect(x + PLANE_W - 14, y + PLANE_H - 4, 14, 8)
    // Top tail fin
    ctx.fillRect(x + PLANE_W - 14, y - 4, 14, 8)
    // Cockpit window
    ctx.fillStyle = '#1a3050'
    ctx.fillRect(x + 6, y + 5, 9, 12)
    ctx.fillStyle = '#3a7090'
    ctx.fillRect(x + 7, y + 6, 6, 8)
    // Engine pod under wing
    ctx.fillStyle = '#9aaabb'
    ctx.fillRect(x + 18, y + PLANE_H - 2, 14, 6)
  }
}
