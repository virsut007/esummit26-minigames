import { drawFace } from '../../skinRenderer'

// ─── Game Constants ───────────────────────────────────────────────────────────
export const GAME_W   = 800
export const GAME_H   = 700
const GROUND_Y        = 560   // y of the ground line
const DINO_X          = 70
const DINO_W          = 44
const DINO_H          = 52
const GRAVITY         = 0.85
const JUMP_FORCE      = -17
const INITIAL_SPEED   = 5
// ─────────────────────────────────────────────────────────────────────────────

function makeDino() {
  return {
    x: DINO_X,
    y: GROUND_Y - DINO_H,
    vy: 0,
    onGround: true,
    legFrame: 0,
    legTimer: 0,
  }
}

export class DinoEngine {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {{ onGameOver: (score:number)=>void, onScoreUpdate: (score:number)=>void }} callbacks
   */
  constructor(canvas, callbacks) {
    this.canvas    = canvas
    this.ctx       = canvas.getContext('2d')
    this.callbacks = callbacks

    this.state     = 'idle'   // 'idle' | 'playing' | 'dead'
    this.frame     = 0
    this.score     = 0
    this.highScore = 0
    this.speed     = INITIAL_SPEED

    this.dino      = makeDino()
    this.obstacles = []
    this.clouds    = []
    this.groundOff = 0   // scrolling offset for ground dots

    this.obstacleCounter   = 0
    this.nextObstacleIn    = 90

    this.skin    = null   // active skin object
    this.skinImg = null   // preloaded HTMLImageElement for image skins

    this._raf    = null
    this._lastTs = null
    this._loop   = this._loop.bind(this)
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  init() {
    this.canvas.width  = GAME_W
    this.canvas.height = GAME_H
    this._renderIdle()
  }

  /** Jump (or start if idle) */
  jump() {
    if (this.state === 'idle') {
      this.startGame()
      return
    }
    if (this.state === 'playing' && this.dino.onGround) {
      this.dino.vy       = JUMP_FORCE
      this.dino.onGround = false
    }
  }

  startGame() {
    this.state           = 'playing'
    this.frame           = 0
    this.score           = 0
    this.speed           = INITIAL_SPEED
    this.dino            = makeDino()
    this.obstacles       = []
    this.clouds          = [
      { x: 200, y: 45, w: 80 },
      { x: 550, y: 28, w: 60 },
    ]
    this.obstacleCounter = 0
    this.nextObstacleIn  = 90
    this.groundOff       = 0
    this._lastTs         = null
    this._raf = requestAnimationFrame(this._loop)
  }

  setSkin(skin, img) {
    this.skin    = skin
    this.skinImg = img ?? null
  }

  destroy() {
    if (this._raf) cancelAnimationFrame(this._raf)
  }

  // ─── Game Loop ─────────────────────────────────────────────────────────────

  _loop(ts) {
    const delta = this._lastTs === null ? 1 : Math.min((ts - this._lastTs) / (1000 / 60), 3)
    this._lastTs = ts
    this._update(delta)
    this._render()
    if (this.state === 'playing') {
      this._raf = requestAnimationFrame(this._loop)
    }
  }

  _update(delta) {
    this.frame += delta

    // Speed ramps up every 400 frames (+0.7 each step, capped at 16)
    this.speed = Math.min(INITIAL_SPEED + Math.floor(this.frame / 400) * 0.7, 16)
    this.score = Math.floor(this.frame / 6)
    this.callbacks.onScoreUpdate(this.score)

    // ── Dino physics ──
    const d = this.dino
    if (!d.onGround) {
      d.vy += GRAVITY * delta
      d.y  += d.vy * delta
      if (d.y >= GROUND_Y - DINO_H) {
        d.y        = GROUND_Y - DINO_H
        d.vy       = 0
        d.onGround = true
      }
    } else {
      d.legTimer += delta
      if (d.legTimer >= 8) {
        d.legTimer = 0
        d.legFrame = (d.legFrame + 1) % 2
      }
    }

    // ── Ground scroll offset ──
    this.groundOff = (this.groundOff + this.speed * delta) % 20

    // ── Obstacles ──
    this.obstacleCounter += delta
    if (this.obstacleCounter >= this.nextObstacleIn) {
      this._spawnObstacle()
      this.obstacleCounter = 0
      this.nextObstacleIn  = 55 + Math.random() * 60
    }

    this.obstacles = this.obstacles.filter(o => o.x + o.w > -30)
    for (const obs of this.obstacles) {
      obs.x -= this.speed * delta
      if (this._hits(d, obs)) {
        this._die()
        return
      }
    }

    // ── Clouds ──
    for (const c of this.clouds) c.x -= this.speed * 0.22 * delta
    this.clouds = this.clouds.filter(c => c.x + c.w > -30)
    if (this.clouds.length < 3 && Math.random() < 0.008) {
      this.clouds.push({ x: GAME_W + 20, y: 20 + Math.random() * 90, w: 50 + Math.random() * 50 })
    }
  }

  _hits(dino, obs) {
    const p = 7  // collision padding (forgiveness)
    return (
      dino.x + p            < obs.x + obs.w - p &&
      dino.x + DINO_W - p   > obs.x + p          &&
      dino.y + p            < obs.y + obs.h - p   &&
      dino.y + DINO_H - p   > obs.y + p
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
    if (r < 0.35)      { w = 20; h = 38; type = 'small' }
    else if (r < 0.65) { w = 24; h = 54; type = 'tall'  }
    else               { w = 52; h = 46; type = 'cluster' }

    this.obstacles.push({ x: GAME_W + 10, y: GROUND_Y - h, w, h, type })
  }

  // ─── Rendering ─────────────────────────────────────────────────────────────

  _render() {
    const ctx = this.ctx

    // Background
    ctx.fillStyle = '#0f0f23'
    ctx.fillRect(0, 0, GAME_W, GAME_H)

    // Stars (pseudo-random, static pattern)
    ctx.fillStyle = 'rgba(255,255,255,0.25)'
    for (let i = 0; i < 24; i++) {
      ctx.fillRect((i * 43 + 11) % GAME_W, (i * 37 + 7) % 400, 2, 2)
    }

    // Clouds
    ctx.fillStyle = '#1e1e3a'
    for (const c of this.clouds) {
      ctx.fillRect(c.x, c.y, c.w, 12)
      ctx.fillRect(c.x + 10, c.y - 8, c.w - 20, 10)
      if (c.w > 70) ctx.fillRect(c.x + 22, c.y - 14, c.w - 44, 8)
    }

    // Ground line
    ctx.fillStyle = '#3d3d5c'
    ctx.fillRect(0, GROUND_Y, GAME_W, 2)

    // Ground scrolling dots
    ctx.fillStyle = '#2a2a4a'
    for (let gx = -this.groundOff; gx < GAME_W; gx += 20) {
      ctx.fillRect(gx, GROUND_Y + 5, 4, 4)
    }

    // Obstacles
    for (const obs of this.obstacles) this._drawObstacle(obs)

    // Dino
    this._drawDino(this.dino, this.state === 'dead' ? '#ff5555' : '#50fa7b')

    // Score HUD
    ctx.textAlign = 'right'
    ctx.font      = 'bold 13px "Press Start 2P", monospace'
    ctx.fillStyle = '#f1fa8c'
    ctx.fillText(`SCORE: ${this.score}`, GAME_W - 16, 26)
    if (this.highScore > 0) {
      ctx.fillStyle = '#bd93f9'
      ctx.font      = 'bold 11px "Press Start 2P", monospace'
      ctx.fillText(`BEST: ${this.highScore}`, GAME_W - 16, 46)
    }
  }

  _renderIdle() {
    const ctx = this.ctx

    ctx.fillStyle = '#0f0f23'
    ctx.fillRect(0, 0, GAME_W, GAME_H)

    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.25)'
    for (let i = 0; i < 24; i++) {
      ctx.fillRect((i * 43 + 11) % GAME_W, (i * 37 + 7) % 400, 2, 2)
    }

    // Ground
    ctx.fillStyle = '#3d3d5c'
    ctx.fillRect(0, GROUND_Y, GAME_W, 2)

    // Idle dino
    this._drawDino(this.dino, '#50fa7b')

    // Press space prompt
    ctx.textAlign  = 'center'
    ctx.font       = 'bold 14px "Press Start 2P", monospace'
    ctx.fillStyle  = '#50fa7b'
    ctx.fillText('PRESS SPACE TO START', GAME_W / 2, GAME_H / 2)
    ctx.font       = '10px "Press Start 2P", monospace'
    ctx.fillStyle  = '#6272a4'
    ctx.fillText('TAP SCREEN ON MOBILE', GAME_W / 2, GAME_H / 2 + 28)
  }

  _drawDeathOverlay() {
    const ctx = this.ctx
    const d   = this.dino

    // Red flash over dino area
    ctx.fillStyle = 'rgba(255,85,85,0.25)'
    ctx.fillRect(d.x - 6, d.y - 6, DINO_W + 12, DINO_H + 12)

    // X marks
    ctx.strokeStyle = '#ff5555'
    ctx.lineWidth   = 3
    ctx.beginPath()
    ctx.moveTo(d.x,          d.y)
    ctx.lineTo(d.x + DINO_W, d.y + DINO_H)
    ctx.moveTo(d.x + DINO_W, d.y)
    ctx.lineTo(d.x,          d.y + DINO_H)
    ctx.stroke()
  }

  _drawDino(d, color) {
    const ctx = this.ctx
    const { x, y, onGround, legFrame } = d

    // Tail (behind body)
    ctx.fillStyle = color
    ctx.fillRect(x - 14, y + 28, 18, 9)
    ctx.fillRect(x - 20, y + 33, 10, 7)

    // Body
    ctx.fillRect(x + 2, y + 18, 28, 28)

    // Neck
    ctx.fillRect(x + 16, y + 8, 16, 14)

    const useSkin = this.skin && this.skin.type !== 'default'

    if (!useSkin) {
      // Default pixel-art head
      ctx.fillRect(x + 18, y, 24, 14)
      ctx.fillStyle = '#0f0f23'
      ctx.fillRect(x + 34, y + 3, 5, 5)
      ctx.fillStyle = color
      ctx.fillRect(x + 36, y + 9, 6, 5)
    } else {
      // Custom skin face — drawn over the head area (slightly padded for visibility)
      drawFace(ctx, x + 14, y - 3, 30, 22, this.skin, this.skinImg)
    }

    // Back spine bumps
    ctx.fillStyle = '#27c65a'
    ctx.fillRect(x + 18, y - 5, 6, 6)
    ctx.fillRect(x + 26, y - 3, 4, 4)

    // Legs
    ctx.fillStyle = color
    if (onGround) {
      if (legFrame === 0) {
        ctx.fillRect(x + 16, y + 46, 10, 10)  // front leg down
        ctx.fillRect(x +  4, y + 40, 10,  6)  // back leg raised
      } else {
        ctx.fillRect(x + 16, y + 40, 10,  6)  // front leg raised
        ctx.fillRect(x +  4, y + 46, 10, 10)  // back leg down
      }
    } else {
      // Airborne — legs tucked back
      ctx.fillRect(x + 16, y + 44, 10, 8)
      ctx.fillRect(x +  4, y + 44, 10, 8)
    }
  }

  _drawObstacle(obs) {
    const ctx        = this.ctx
    const { x, y, w, h, type } = obs
    const C = '#ff5555'
    const D = '#cc2222'
    ctx.fillStyle = C

    if (type === 'cluster') {
      // Two cacti close together
      const h1 = h
      const h2 = h - 10
      const y1 = GROUND_Y - h1
      const y2 = GROUND_Y - h2

      // Stems
      ctx.fillRect(x + 4,  y1,      8, h1)
      ctx.fillRect(x + 28, y2,      8, h2)

      // Arms cactus 1
      ctx.fillRect(x - 4,  y1 + 14, 12, 7)
      ctx.fillRect(x - 4,  y1 +  2, 7,  14)
      ctx.fillRect(x + 12, y1 + 10, 10, 7)
      ctx.fillRect(x + 12, y1 +  2, 5,  10)

      // Arms cactus 2
      ctx.fillRect(x + 20, y2 + 16, 12, 7)
      ctx.fillRect(x + 36, y2 + 12, 7,  7)
      ctx.fillRect(x + 36, y2 +  4, 5,  10)

      // Shading
      ctx.fillStyle = D
      ctx.fillRect(x + 4,  y1, 2, h1)
      ctx.fillRect(x + 28, y2, 2, h2)

    } else {
      // Single cactus (small or tall)
      const cx = Math.floor(x + w / 2) - 4

      // Main stem
      ctx.fillRect(cx, y, 8, h)

      // Left arm
      ctx.fillRect(x,      y + Math.floor(h * 0.3),       cx - x + 4, 7)
      ctx.fillRect(x,      y + Math.floor(h * 0.3) - 14,  7,          16)

      // Right arm
      const rx = cx + 8
      ctx.fillRect(rx,     y + Math.floor(h * 0.4),       x + w - rx, 7)
      ctx.fillRect(x+w-7,  y + Math.floor(h * 0.4) - 18,  7,          20)

      // Shading
      ctx.fillStyle = D
      ctx.fillRect(cx, y, 2, h)
    }
  }
}
