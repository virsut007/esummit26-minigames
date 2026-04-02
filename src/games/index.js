/**
 * GAME REGISTRY
 * ─────────────
 * To add a new game:
 *   1. Create src/games/YourGame/YourGame.jsx
 *   2. Add an entry here with `available: true`
 *   3. Import it in App.jsx and add a case in the `renderGame()` function
 */
export const GAMES = [
  {
    id:          'dinosaur',
    name:        'DINO RUN',
    description: 'Jump over cacti!',
    available:   true,
  },
  {
    id:          'flappy',
    name:        'FLAPPY',
    description: 'Tap to flap through pipes!',
    available:   true,
  },
  {
    id:          'tetris',
    name:        'TETRIS',
    description: 'Stack \u0026 clear lines!',
    available:   true,
  },
]
