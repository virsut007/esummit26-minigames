/**
 * TETRIS ENGINE
 * ─────────────
 * Canvas-based Tetris with SRS-style rotation, wall kicks,
 * line clearing, ghost piece, and speed ramp-up.
 */

const COLS       = 10
const ROWS       = 20
const BASE_MS    = 800
const MIN_MS     = 80
const SPEED_DEC  = 40       // ms faster per level
const LINES_LVL  = 10       // lines per level
const LOCK_DELAY = 500      // ms before piece locks after landing

// ── Tetromino definitions (SRS) ─────────────────────────────────────────────
const PIECES = {
  I: { cells: [[0,1],[1,1],[2,1],[3,1]], color: '#8be9fd' },
  O: { cells: [[1,0],[2,0],[1,1],[2,1]], color: '#f1fa8c' },
  T: { cells: [[1,0],[0,1],[1,1],[2,1]], color: '#bd93f9' },
  S: { cells: [[1,0],[2,0],[0,1],[1,1]], color: '#50fa7b' },
  Z: { cells: [[0,0],[1,0],[1,1],[2,1]], color: '#ff5555' },
  J: { cells: [[0,0],[0,1],[1,1],[2,1]], color: '#6272a4' },
  L: { cells: [[2,0],[0,1],[1,1],[2,1]], color: '#ffb86c' },
}
const PIECE_KEYS = Object.keys(PIECES)

// ── Colour palette ──────────────────────────────────────────────────────────
const CLR_BG       = '#1a1b26'
const CLR_GRID     = 'rgba(98,114,164,0.10)'
const CLR_GHOST    = 'rgba(248,248,242,0.12)'
const CLR_BORDER   = 'rgba(98,114,164,0.25)'

// ── Scoring (original Nintendo) ─────────────────────────────────────────────
const LINE_SCORES = [0, 100, 300, 500, 800]

export class TetrisEngine {
  constructor(canvas, { onScoreUpdate, onGameOver, onLinesUpdate, onLevelUpdate }) {
    this.canvas   = canvas
    this.ctx      = canvas.getContext('2d')
    this.onScore  = onScoreUpdate
    this.onOver   = onGameOver
    this.onLines  = onLinesUpdate
    this.onLevel  = onLevelUpdate

    this._raf     = null
    this.running  = false
  }

  /* ── public API ──────────────────────────────────────────────────────────── */

  init() {
    this._resize()
    this._resizeObs = new ResizeObserver(() => { this._resize(); this._draw() })
    this._resizeObs.observe(this.canvas.parentElement)
    this.startGame()
  }

  startGame() {
    this._stopLoop()
    this.board     = Array.from({ length: ROWS }, () => Array(COLS).fill(null))
    this.score     = 0
    this.lines     = 0
    this.level     = 1
    this.tickMs    = BASE_MS
    this.running   = true
    this.gameOver  = false
    this._bag      = []
    this._lockTime = null

    this.onScore?.(0)
    this.onLines?.(0)
    this.onLevel?.(1)

    this._spawnPiece()
    this._lastTick = performance.now()
    this._raf = requestAnimationFrame(this._loop)
  }

  moveLeft()  { this._tryMove(-1, 0) }
  moveRight() { this._tryMove(1, 0) }
  moveDown()  { if (!this._tryMove(0, 1)) this._lockPiece() }

  hardDrop() {
    let rows = 0
    while (this._canPlace(this.piece, this.px, this.py + 1)) {
      this.py++
      rows++
    }
    this.score += rows * 2
    this.onScore?.(this.score)
    this._lockPiece()
  }

  rotate() {
    const rotated = this._rotateCells(this.piece)
    // wall kick offsets to try
    const kicks = [0, -1, 1, -2, 2]
    for (const dx of kicks) {
      if (this._canPlace(rotated, this.px + dx, this.py)) {
        this.piece = rotated
        this.px += dx
        this._lockTime = null
        return
      }
    }
  }

  destroy() {
    this._stopLoop()
    this._resizeObs?.disconnect()
  }

  /* ── game loop ───────────────────────────────────────────────────────────── */

  _loop = (now) => {
    if (!this.running) return

    // gravity tick
    if (now - this._lastTick >= this.tickMs) {
      if (this._canPlace(this.piece, this.px, this.py + 1)) {
        this.py++
        this._lockTime = null
      } else {
        // start lock delay
        if (this._lockTime === null) {
          this._lockTime = now
        } else if (now - this._lockTime >= LOCK_DELAY) {
          this._lockPiece()
        }
      }
      this._lastTick = now
    }

    this._draw()
    this._raf = requestAnimationFrame(this._loop)
  }

  _stopLoop() {
    if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null }
  }

  /* ── piece management ────────────────────────────────────────────────────── */

  _randomPiece() {
    if (this._bag.length === 0) {
      this._bag = [...PIECE_KEYS]
      // Fisher-Yates shuffle
      for (let i = this._bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this._bag[i], this._bag[j]] = [this._bag[j], this._bag[i]]
      }
    }
    return this._bag.pop()
  }

  _spawnPiece() {
    const key  = this._randomPiece()
    const def  = PIECES[key]
    this.piece = def.cells.map(c => [...c])
    this.pieceColor = def.color
    this.px = Math.floor((COLS - 4) / 2)
    this.py = 0
    this._lockTime = null

    if (!this._canPlace(this.piece, this.px, this.py)) {
      this.running  = false
      this.gameOver = true
      this._stopLoop()
      this.onOver?.(this.score)
    }
  }

  _canPlace(cells, ox, oy) {
    return cells.every(([cx, cy]) => {
      const x = cx + ox, y = cy + oy
      return x >= 0 && x < COLS && y < ROWS && (y < 0 || this.board[y][x] === null)
    })
  }

  _tryMove(dx, dy) {
    if (this._canPlace(this.piece, this.px + dx, this.py + dy)) {
      this.px += dx
      this.py += dy
      if (dy === 0) this._lockTime = null // reset lock on horizontal move
      return true
    }
    return false
  }

  _rotateCells(cells) {
    // find bounding box and rotate 90° CW
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const [x, y] of cells) {
      minX = Math.min(minX, x); maxX = Math.max(maxX, x)
      minY = Math.min(minY, y); maxY = Math.max(maxY, y)
    }
    const w = maxX - minX, h = maxY - minY
    return cells.map(([x, y]) => [minX + (y - minY), minY + w - (x - minX)])
  }

  _lockPiece() {
    // place on board
    for (const [cx, cy] of this.piece) {
      const x = cx + this.px, y = cy + this.py
      if (y >= 0 && y < ROWS) this.board[y][x] = this.pieceColor
    }
    this._clearLines()
    this._spawnPiece()
  }

  _clearLines() {
    let cleared = 0
    for (let r = ROWS - 1; r >= 0; r--) {
      if (this.board[r].every(c => c !== null)) {
        this.board.splice(r, 1)
        this.board.unshift(Array(COLS).fill(null))
        cleared++
        r++ // re-check same row
      }
    }
    if (cleared) {
      this.lines += cleared
      this.score += LINE_SCORES[cleared] * this.level
      const newLevel = Math.floor(this.lines / LINES_LVL) + 1
      if (newLevel !== this.level) {
        this.level  = newLevel
        this.tickMs = Math.max(MIN_MS, BASE_MS - (this.level - 1) * SPEED_DEC)
        this.onLevel?.(this.level)
      }
      this.onScore?.(this.score)
      this.onLines?.(this.lines)
    }
  }

  /* ── ghost piece y ───────────────────────────────────────────────────────── */

  _ghostY() {
    let gy = this.py
    while (this._canPlace(this.piece, this.px, gy + 1)) gy++
    return gy
  }

  /* ── rendering ───────────────────────────────────────────────────────────── */

  _resize() {
    const rect  = this.canvas.parentElement.getBoundingClientRect()
    // Tetris is tall: cols × rows = 10 × 20, aspect 1:2
    const maxH  = Math.min(rect.height || 600, 600)
    const maxW  = rect.width
    const cellH = Math.floor(maxH / ROWS)
    const cellW = Math.floor(maxW / COLS)
    this.cell   = Math.min(cellH, cellW)
    const w     = this.cell * COLS
    const h     = this.cell * ROWS

    this.canvas.width  = w * devicePixelRatio
    this.canvas.height = h * devicePixelRatio
    this.canvas.style.width  = w + 'px'
    this.canvas.style.height = h + 'px'
    this.ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
  }

  _draw() {
    const { ctx, cell } = this
    const w = cell * COLS, h = cell * ROWS

    // background
    ctx.fillStyle = CLR_BG
    ctx.fillRect(0, 0, w, h)

    // grid lines
    ctx.strokeStyle = CLR_GRID
    ctx.lineWidth = 0.5
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath(); ctx.moveTo(c * cell, 0); ctx.lineTo(c * cell, h); ctx.stroke()
    }
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath(); ctx.moveTo(0, r * cell); ctx.lineTo(w, r * cell); ctx.stroke()
    }

    // board cells
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (this.board[r][c]) this._drawCell(c, r, this.board[r][c])
      }
    }

    if (!this.piece) return

    // ghost piece
    const gy = this._ghostY()
    for (const [cx, cy] of this.piece) {
      const x = cx + this.px, y = cy + gy
      if (y >= 0) {
        ctx.fillStyle   = CLR_GHOST
        ctx.strokeStyle = CLR_BORDER
        ctx.lineWidth   = 1
        ctx.fillRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2)
        ctx.strokeRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2)
      }
    }

    // active piece
    for (const [cx, cy] of this.piece) {
      const x = cx + this.px, y = cy + this.py
      if (y >= 0) this._drawCell(x, y, this.pieceColor)
    }
  }

  _drawCell(x, y, color) {
    const { ctx, cell } = this
    const p = 1
    // main fill
    ctx.fillStyle = color
    ctx.fillRect(x * cell + p, y * cell + p, cell - p * 2, cell - p * 2)
    // highlight (top-left bevel)
    ctx.fillStyle = 'rgba(255,255,255,0.18)'
    ctx.fillRect(x * cell + p, y * cell + p, cell - p * 2, 2)
    ctx.fillRect(x * cell + p, y * cell + p, 2, cell - p * 2)
    // shadow (bottom-right bevel)
    ctx.fillStyle = 'rgba(0,0,0,0.25)'
    ctx.fillRect(x * cell + p, y * cell + cell - p - 2, cell - p * 2, 2)
    ctx.fillRect(x * cell + cell - p - 2, y * cell + p, 2, cell - p * 2)
  }
}
