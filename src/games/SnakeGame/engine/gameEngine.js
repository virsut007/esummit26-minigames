/**
 * SNAKE ENGINE
 * ────────────
 * Canvas-based snake game with grid rendering, collision detection,
 * and speed ramp-up. Follows the same callback pattern as DinoEngine.
 */

const GRID      = 20          // cells per row/column
const START_LEN = 3
const BASE_MS   = 220         // starting tick interval
const MIN_MS    = 60          // fastest tick interval
const SPEED_INC = 3           // ms faster per food eaten

// ── Colour palette (matches arcade theme) ──────────────────────────────────
const CLR_BG         = '#1a1b26'
const CLR_GRID       = 'rgba(98,114,164,0.12)'
const CLR_SNAKE_HEAD = '#50fa7b'
const CLR_SNAKE_BODY = '#3ad468'
const CLR_FOOD       = '#f1fa8c'
const CLR_FOOD_GLOW  = 'rgba(241,250,140,0.35)'
const CLR_EYES       = '#1a1b26'

export class SnakeEngine {
  constructor(canvas, { onScoreUpdate, onGameOver }) {
    this.canvas  = canvas
    this.ctx     = canvas.getContext('2d')
    this.onScore = onScoreUpdate
    this.onOver  = onGameOver

    this._raf    = null
    this._timer  = null
    this.running = false
  }

  /* ── public API ──────────────────────────────────────────────────────────── */

  init() {
    this._resize()
    this._drawIdle()
    this._resizeObs = new ResizeObserver(() => { this._resize(); if (!this.running) this._drawIdle() })
    this._resizeObs.observe(this.canvas.parentElement)
    this.startGame()
  }

  startGame() {
    this._stopLoop()

    // snake starts in the centre heading right
    const mid = Math.floor(GRID / 2)
    this.snake = []
    for (let i = START_LEN - 1; i >= 0; i--) this.snake.push({ x: mid - i, y: mid })

    this.dir       = { x: 1, y: 0 }
    this.dirQueue  = []
    this.score     = 0
    this.tickMs    = BASE_MS
    this.running   = true
    this.gameOver  = false

    this._spawnFood()
    this.onScore?.(0)
    this._lastTick = performance.now()
    this._raf = requestAnimationFrame(this._loop)
  }

  setDirection(dx, dy) {
    // queue direction so rapid inputs aren't lost
    const last = this.dirQueue.length ? this.dirQueue[this.dirQueue.length - 1] : this.dir
    // prevent 180° reversal
    if (last.x === -dx && last.y === -dy) return
    if (last.x === dx  && last.y === dy)  return
    this.dirQueue.push({ x: dx, y: dy })
  }

  destroy() {
    this._stopLoop()
    this._resizeObs?.disconnect()
  }

  /* ── game loop ───────────────────────────────────────────────────────────── */

  _loop = (now) => {
    if (!this.running) return
    if (now - this._lastTick >= this.tickMs) {
      this._tick()
      this._lastTick = now
    }
    this._draw()
    this._raf = requestAnimationFrame(this._loop)
  }

  _tick() {
    // consume one queued direction
    if (this.dirQueue.length) this.dir = this.dirQueue.shift()

    const head = this.snake[this.snake.length - 1]
    const nx   = head.x + this.dir.x
    const ny   = head.y + this.dir.y

    // wall collision
    if (nx < 0 || nx >= GRID || ny < 0 || ny >= GRID) return this._die()
    // self collision
    if (this.snake.some(s => s.x === nx && s.y === ny)) return this._die()

    this.snake.push({ x: nx, y: ny })

    if (nx === this.food.x && ny === this.food.y) {
      this.score += 10
      this.tickMs = Math.max(MIN_MS, this.tickMs - SPEED_INC)
      this.onScore?.(this.score)
      this._spawnFood()
    } else {
      this.snake.shift()
    }
  }

  _die() {
    this.running  = false
    this.gameOver = true
    this._stopLoop()
    this.onOver?.(this.score)
  }

  _stopLoop() {
    if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null }
  }

  /* ── food ────────────────────────────────────────────────────────────────── */

  _spawnFood() {
    const occupied = new Set(this.snake.map(s => `${s.x},${s.y}`))
    let x, y
    do {
      x = Math.floor(Math.random() * GRID)
      y = Math.floor(Math.random() * GRID)
    } while (occupied.has(`${x},${y}`))
    this.food = { x, y }
  }

  /* ── rendering ───────────────────────────────────────────────────────────── */

  _resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect()
    const size = Math.min(rect.width, 600)
    this.canvas.width  = size * devicePixelRatio
    this.canvas.height = size * devicePixelRatio
    this.canvas.style.width  = size + 'px'
    this.canvas.style.height = size + 'px'
    this.cell = (size * devicePixelRatio) / GRID
  }

  _drawIdle() {
    const { ctx, canvas } = this
    ctx.fillStyle = CLR_BG
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    this._drawGrid()
  }

  _draw() {
    const { ctx, canvas, cell } = this

    // background
    ctx.fillStyle = CLR_BG
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // subtle grid
    this._drawGrid()

    // food glow
    const fx = this.food.x * cell + cell / 2
    const fy = this.food.y * cell + cell / 2
    ctx.save()
    ctx.shadowColor = CLR_FOOD_GLOW
    ctx.shadowBlur  = cell * 0.8
    ctx.fillStyle   = CLR_FOOD
    ctx.beginPath()
    ctx.arc(fx, fy, cell * 0.35, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    // food square
    const fp = cell * 0.15
    ctx.fillStyle = CLR_FOOD
    ctx.fillRect(this.food.x * cell + fp, this.food.y * cell + fp, cell - fp * 2, cell - fp * 2)

    // snake body
    const pad = cell * 0.08
    for (let i = 0; i < this.snake.length; i++) {
      const s     = this.snake[i]
      const isHead = i === this.snake.length - 1
      ctx.fillStyle = isHead ? CLR_SNAKE_HEAD : CLR_SNAKE_BODY
      ctx.fillRect(s.x * cell + pad, s.y * cell + pad, cell - pad * 2, cell - pad * 2)

      if (isHead) {
        // eyes
        const cx = s.x * cell + cell / 2
        const cy = s.y * cell + cell / 2
        const er = cell * 0.1
        const eo = cell * 0.18

        let e1x, e1y, e2x, e2y
        if (this.dir.x === 1)       { e1x = cx + eo; e1y = cy - eo; e2x = cx + eo; e2y = cy + eo }
        else if (this.dir.x === -1) { e1x = cx - eo; e1y = cy - eo; e2x = cx - eo; e2y = cy + eo }
        else if (this.dir.y === -1) { e1x = cx - eo; e1y = cy - eo; e2x = cx + eo; e2y = cy - eo }
        else                        { e1x = cx - eo; e1y = cy + eo; e2x = cx + eo; e2y = cy + eo }

        ctx.fillStyle = CLR_EYES
        ctx.beginPath(); ctx.arc(e1x, e1y, er, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(e2x, e2y, er, 0, Math.PI * 2); ctx.fill()
      }
    }
  }

  _drawGrid() {
    const { ctx, canvas, cell } = this
    ctx.strokeStyle = CLR_GRID
    ctx.lineWidth   = 1
    for (let i = 0; i <= GRID; i++) {
      const pos = i * cell
      ctx.beginPath(); ctx.moveTo(pos, 0); ctx.lineTo(pos, canvas.height); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, pos); ctx.lineTo(canvas.width, pos); ctx.stroke()
    }
  }
}
