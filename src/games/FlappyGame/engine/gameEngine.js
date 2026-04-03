import { drawFace } from '../../skinRenderer'

// ─── Game Constants ───────────────────────────────────────────────────────────
export const GAME_W     = 400
export const GAME_H     = 600
const GROUND_H          = 56
const BIRD_X            = 90
const BIRD_W            = 34
const BIRD_H            = 26
const GRAVITY           = 0.46
const FLAP_FORCE        = -9.2
const PIPE_W            = 64
const INITIAL_GAP       = 185
const INITIAL_SPEED     = 3
const PIPE_INTERVAL     = 118   // frames between pipe spawns
// ─────────────────────────────────────────────────────────────────────────────

function makeBird() {
  return {
    y:          GAME_H / 2 - BIRD_H / 2,
    vy:         0,
    wingFrame:  0,
    wingTimer:  0,
    dead:       false,
  }
}

export class FlappyEngine {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {{ onGameOver:(score:number)=>void, onScoreUpdate:(score:number)=>void }} callbacks
   */
  constructor(canvas, callbacks) {
    this.canvas    = canvas
    this.ctx       = canvas.getContext('2d')
    this.callbacks = callbacks

    this.state     = 'idle'
    this.frame     = 0
    this.score     = 0
    this.highScore = 0

    this.bird      = makeBird()
    this.pipes     = []
    this.clouds    = []
    this.groundOff = 0
    this.pipeTimer = 0
    this.idleTick  = 0   // for idle bob animation

    this.skin     = null
    this.skinImg  = null
    this.birdImg  = null

    this._raf    = null
    this._lastTs = null
    this._bgGrad = null
    this._loop   = this._loop.bind(this)
  }

  setSkin(skin, img) {
    this.skin    = skin
    this.skinImg = img ?? null
  }

  setBirdImg(img) {
    this.birdImg = img
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  init() {
    this.canvas.width  = GAME_W
    this.canvas.height = GAME_H
    // Cache background gradient (canvas dimensions never change)
    this._bgGrad = this.ctx.createLinearGradient(0, 0, 0, GAME_H)
    this._bgGrad.addColorStop(0,   '#0f0f23')
    this._bgGrad.addColorStop(0.7, '#1a1a3e')
    this._bgGrad.addColorStop(1,   '#0f0f23')
    this._seedClouds()
    this._renderIdle(0)
    this._idleBob()
  }

  flap() {
    if (this.state === 'idle') {
      this._clearIdle()
      this.startGame()
      return
    }
    if (this.state === 'playing' && !this.bird.dead) {
      this.bird.vy = FLAP_FORCE
    }
  }

  startGame() {
    this.state     = 'playing'
    this.frame     = 0
    this.score     = 0
    this.bird      = makeBird()
    this.pipes     = []
    this.groundOff = 0
    this.pipeTimer = 0
    this._lastTs   = null
    this._seedClouds()
    this._raf = requestAnimationFrame(this._loop)
  }

  destroy() {
    if (this._raf) cancelAnimationFrame(this._raf)
    this._idleRaf && cancelAnimationFrame(this._idleRaf)
  }

  // ─── Idle bob animation ────────────────────────────────────────────────────

  _idleBob() {
    let lastTs = null
    const draw = (ts) => {
      if (this.state !== 'idle') return
      const delta = lastTs === null ? 1 : Math.min((ts - lastTs) / (1000 / 60), 3)
      lastTs = ts
      this.idleTick += delta
      this._renderIdle(this.idleTick)
      this._idleRaf = requestAnimationFrame(draw)
    }
    this._idleRaf = requestAnimationFrame(draw)
  }

  _clearIdle() {
    if (this._idleRaf) cancelAnimationFrame(this._idleRaf)
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

    // Dynamic speed & gap (difficulty scaling)
    const speed = Math.min(INITIAL_SPEED + this.score * 0.18, 8)
    const gap   = Math.max(INITIAL_GAP   - this.score * 2, 130)

    // ── Bird physics ──
    const b = this.bird
    b.vy += GRAVITY * delta
    b.y  += b.vy * delta

    // Wing flap animation
    b.wingTimer += delta
    if (b.wingTimer >= 7) {
      b.wingTimer = 0
      b.wingFrame = (b.wingFrame + 1) % 3
    }

    // ── Pipes ──
    this.pipeTimer += delta
    if (this.pipeTimer >= PIPE_INTERVAL) {
      this._spawnPipe(gap)
      this.pipeTimer = 0
    }

    this.pipes = this.pipes.filter(p => p.x + PIPE_W > -10)
    for (const p of this.pipes) {
      p.x -= speed * delta

      // Score — passed the pipe
      if (!p.scored && p.x + PIPE_W < BIRD_X) {
        p.scored = true
        this.score++
        this.callbacks.onScoreUpdate(this.score)
      }

      // Collision vs pipes
      if (this._hitsPipe(b, p, gap)) {
        this._die()
        return
      }
    }

    // ── Boundaries ──
    if (b.y + BIRD_H >= GAME_H - GROUND_H || b.y <= 0) {
      this._die()
      return
    }

    // ── Clouds ──
    for (const c of this.clouds) c.x -= speed * 0.2 * delta
    this.clouds = this.clouds.filter(c => c.x + c.w > -30)
    if (this.clouds.length < 4 && Math.random() < 0.006) {
      this.clouds.push({ x: GAME_W + 20, y: 30 + Math.random() * 180, w: 50 + Math.random() * 60 })
    }

    // ── Ground scroll ──
    this.groundOff = (this.groundOff + speed * delta) % 20
  }

  _spawnPipe(gap) {
    const minGapY = 120
    const maxGapY = GAME_H - GROUND_H - gap - 80
    const gapY    = minGapY + Math.random() * (maxGapY - minGapY)
    this.pipes.push({ x: GAME_W + 10, gapY, scored: false })
  }

  _hitsPipe(bird, pipe, gap) {
    const pad  = 5
    const bx1  = BIRD_X + pad
    const bx2  = BIRD_X + BIRD_W - pad
    const by1  = bird.y + pad
    const by2  = bird.y + BIRD_H - pad
    const px1  = pipe.x + pad
    const px2  = pipe.x + PIPE_W - pad
    const topH = pipe.gapY
    const botY = pipe.gapY + gap

    if (bx2 < px1 || bx1 > px2) return false         // no x overlap
    if (by1 < topH) return true                        // hit top pipe
    if (by2 > botY) return true                        // hit bottom pipe
    return false
  }

  _die() {
    this.state = 'dead'
    if (this.score > this.highScore) this.highScore = this.score
    cancelAnimationFrame(this._raf)
    this._raf = null
    this._render()
    this._drawDeathFlash()
    this.callbacks.onGameOver(this.score)
  }

  _seedClouds() {
    this.clouds = [
      { x: 80,  y: 60,  w: 80 },
      { x: 230, y: 40,  w: 60 },
      { x: 340, y: 90,  w: 70 },
    ]
  }

  // ─── Rendering ─────────────────────────────────────────────────────────────

  _renderIdle(tick) {
    const ctx   = this.ctx
    const bobY  = Math.sin(tick * 0.05) * 10
    const birdY = GAME_H / 2 - BIRD_H / 2 + bobY
    const wingF = Math.floor(tick / 10) % 3

    this._drawBg()
    this._drawClouds()
    for (const p of this.pipes) this._drawPipe(p, INITIAL_GAP)
    this._drawGround()
    this._drawBird(birdY, 0, wingF)

    ctx.textAlign = 'center'
    ctx.font      = 'bold 14px "Press Start 2P", monospace'
    ctx.fillStyle = '#50fa7b'
    ctx.fillText('PRESS SPACE TO START', GAME_W / 2, GAME_H / 2 + 80)
    ctx.font      = '10px "Press Start 2P", monospace'
    ctx.fillStyle = '#6272a4'
    ctx.fillText('TAP SCREEN ON MOBILE', GAME_W / 2, GAME_H / 2 + 106)
  }

  _render() {
    const ctx = this.ctx
    const b   = this.bird
    const gap = Math.max(INITIAL_GAP - this.score * 2, 110)

    this._drawBg()
    this._drawClouds()
    for (const p of this.pipes) this._drawPipe(p, gap)
    this._drawGround()
    this._drawBird(b.y, b.vy, b.wingFrame)

    // Score HUD
    ctx.textAlign = 'center'
    ctx.font      = 'bold 32px "Press Start 2P", monospace'
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.fillText(this.score, GAME_W / 2 + 2, 72)
    ctx.fillStyle = '#f1fa8c'
    ctx.fillText(this.score, GAME_W / 2, 70)

    if (this.highScore > 0) {
      ctx.font      = '10px "Press Start 2P", monospace'
      ctx.fillStyle = '#bd93f9'
      ctx.textAlign = 'right'
      ctx.fillText(`BEST: ${this.highScore}`, GAME_W - 12, 20)
    }
  }

  _drawBg() {
    const ctx = this.ctx
    ctx.fillStyle = this._bgGrad
    ctx.fillRect(0, 0, GAME_W, GAME_H)

    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    for (let i = 0; i < 18; i++) {
      ctx.fillRect((i * 31 + 7) % GAME_W, (i * 23 + 5) % (GAME_H * 0.65), 2, 2)
    }
  }

  _drawClouds() {
    const ctx = this.ctx
    ctx.fillStyle = '#1e1e3a'
    for (const c of this.clouds) {
      ctx.fillRect(c.x, c.y, c.w, 12)
      ctx.fillRect(c.x + 8, c.y - 8, c.w - 16, 10)
      if (c.w > 60) ctx.fillRect(c.x + 18, c.y - 14, c.w - 36, 8)
    }
  }

  _drawGround() {
    const ctx = this.ctx
    const gy  = GAME_H - GROUND_H

    // Main strip
    ctx.fillStyle = '#2a3a1a'
    ctx.fillRect(0, gy, GAME_W, GROUND_H)

    // Top edge highlight
    ctx.fillStyle = '#3d5c2a'
    ctx.fillRect(0, gy, GAME_W, 6)

    // Scrolling dots
    ctx.fillStyle = '#1e2c14'
    for (let gx = -this.groundOff; gx < GAME_W; gx += 20) {
      ctx.fillRect(gx, gy + 10, 4, 4)
      ctx.fillRect(gx + 10, gy + 18, 3, 3)
    }
  }

  _drawPipe(pipe, gap) {
    const ctx   = this.ctx
    const { x, gapY } = pipe
    const topH  = gapY
    const botY  = gapY + gap
    const botH  = GAME_H - GROUND_H - botY
    const CAP_H = 22
    const CAP_X = x - 5

    if (topH > 0) {
      // Top pipe body
      ctx.fillStyle = '#27c65a'
      ctx.fillRect(x, 0, PIPE_W, topH - CAP_H)
      ctx.fillStyle = '#1a8c3e'
      ctx.fillRect(x, 0, 5, topH - CAP_H)      // left shadow
      ctx.fillStyle = '#50fa7b'
      ctx.fillRect(x + PIPE_W - 5, 0, 5, topH - CAP_H) // highlight

      // Top cap
      ctx.fillStyle = '#27c65a'
      ctx.fillRect(CAP_X, topH - CAP_H, PIPE_W + 10, CAP_H)
      ctx.fillStyle = '#1a8c3e'
      ctx.fillRect(CAP_X, topH - CAP_H, 5, CAP_H)
      ctx.fillStyle = '#50fa7b'
      ctx.fillRect(CAP_X + PIPE_W + 5, topH - CAP_H, 5, CAP_H)
    }

    if (botH > 0) {
      // Bottom cap
      ctx.fillStyle = '#27c65a'
      ctx.fillRect(CAP_X, botY, PIPE_W + 10, CAP_H)
      ctx.fillStyle = '#1a8c3e'
      ctx.fillRect(CAP_X, botY, 5, CAP_H)
      ctx.fillStyle = '#50fa7b'
      ctx.fillRect(CAP_X + PIPE_W + 5, botY, 5, CAP_H)

      // Bottom pipe body
      ctx.fillStyle = '#27c65a'
      ctx.fillRect(x, botY + CAP_H, PIPE_W, botH)
      ctx.fillStyle = '#1a8c3e'
      ctx.fillRect(x, botY + CAP_H, 5, botH)
      ctx.fillStyle = '#50fa7b'
      ctx.fillRect(x + PIPE_W - 5, botY + CAP_H, 5, botH)
    }
  }

  _drawBird(y, vy, wingFrame) {
    const ctx   = this.ctx
    const angle = Math.min(Math.max(vy * 0.09, -0.45), 1.3)

    ctx.save()
    ctx.translate(BIRD_X + BIRD_W / 2, y + BIRD_H / 2)
    ctx.rotate(angle)

 main
    // Flappy bird image — draw it as a circle
    if (this.birdImg) {
      const img = this.birdImg
      const r   = 36
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(img, -r, -r, r * 2, r * 2)
      ctx.restore()
      return
    }

 main
    const bx = -BIRD_W / 2
    const by = -BIRD_H / 2

    // Body
    ctx.fillStyle = '#f1fa8c'
    ctx.fillRect(bx + 4, by + 3,  BIRD_W - 8, BIRD_H - 6)
    ctx.fillRect(bx + 2, by + 6,  BIRD_W - 4, BIRD_H - 12)

    // Belly (lighter)
    ctx.fillStyle = '#ffffa8'
    ctx.fillRect(bx + 8, by + 8,  BIRD_W - 16, BIRD_H - 14)

    // Wing
    const wingOffsets = [-5, 0, 4]   // up / mid / down
    const wingY = by + 8 + wingOffsets[wingFrame]
    ctx.fillStyle = '#d4c800'
    ctx.fillRect(bx + 2, wingY, 14, 9)
    ctx.fillRect(bx + 4, wingY + 9, 10, 4)

    const useSkin = this.skin && this.skin.type !== 'default'

    if (!useSkin) {
      // Default pixel-art face
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(bx + BIRD_W - 14, by + 4, 10, 10)
      ctx.fillStyle = '#0f0f23'
      ctx.fillRect(bx + BIRD_W - 11, by + 6,  6, 6)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(bx + BIRD_W - 10, by + 6,  2, 2)
      ctx.fillStyle = '#ff9500'
      ctx.fillRect(bx + BIRD_W - 3, by + 10, 8, 5)
      ctx.fillStyle = '#e07800'
      ctx.fillRect(bx + BIRD_W - 3, by + 15, 7, 4)
    } else {
      // Custom skin — overlay on the whole bird body (local space)
      drawFace(ctx, bx + 1, by + 1, BIRD_W - 2, BIRD_H - 2, this.skin, this.skinImg)
    }

    ctx.restore()
  }

  _drawDeathFlash() {
    const ctx = this.ctx
    const b   = this.bird
    ctx.fillStyle = 'rgba(255,85,85,0.35)'
    ctx.fillRect(BIRD_X - 8, b.y - 8, BIRD_W + 16, BIRD_H + 16)

    ctx.strokeStyle = '#ff5555'
    ctx.lineWidth   = 3
    ctx.beginPath()
    ctx.moveTo(BIRD_X,         b.y)
    ctx.lineTo(BIRD_X + BIRD_W, b.y + BIRD_H)
    ctx.moveTo(BIRD_X + BIRD_W, b.y)
    ctx.lineTo(BIRD_X,          b.y + BIRD_H)
    ctx.stroke()
  }
}
