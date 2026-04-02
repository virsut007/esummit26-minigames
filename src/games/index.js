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
    id:          'snake',
    name:        'SNAKE',
    description: 'Coming soon...',
    available:   false,
  },
  {
    id:          'space',
    name:        'SPACE RAID',
    description: 'Coming soon...',
    available:   false,
  },
]
