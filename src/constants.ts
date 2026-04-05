// ─── Grid ───────────────────────────────────────────────────────────────────
export const GRID_SIZE = 20;       // number of cells (axis)
export const CELL_SIZE = 20;       // pixels per cell

// ─── Snake spawn ────────────────────────────────────────────────────────────
export const SNAKE_SPAWN_X = 10;
export const SNAKE_SPAWN_Y = 10;
export const INITIAL_SNAKE_LENGTH = 3;

// ─── Speed (ms per tick) ────────────────────────────────────────────────────
export const BASE_SPEED = 150;
export const MIN_SPEED = 60;
export const BOOST_SPEED = 40;
export const SPEED_DECREMENT_PER_SEGMENT = 4;

// ─── Countdown ──────────────────────────────────────────────────────────────
export const COUNTDOWN_STEPS = ['3', '2', '1', 'GO! 🐾'] as const;
export const COUNTDOWN_INTERVAL_MS = 700;
export const COUNTDOWN_CLEAR_DELAY_MS = 400;

// ─── Level progression ──────────────────────────────────────────────────────
export const FOODS_PER_LEVEL = 5;
export const OBSTACLES_PER_LEVEL = 2;

// ─── LocalStorage keys ──────────────────────────────────────────────────────
export const BEST_SCORE_KEY = {
  endless: 'cat-snake-best-endless',
  stage: 'cat-snake-best-stage',
} as const;

// ─── Mode display ───────────────────────────────────────────────────────────
export const MODE_BADGE_LABEL = {
  endless: '♾️ ENDLESS',
  stage: '🏆 STAGE',
} as const;

// ─── Renderer colors ────────────────────────────────────────────────────────
export const COLORS = {
  gridLine: 'rgba(255,255,255,0.03)',
  snakeHead: '#e94560',
  gameOverOverlay: 'rgba(0,0,0,0.75)',
  gameOverTitle: '#e94560',
  gameOverScore: '#fff',
  gameOverHint: '#aaa',
} as const;

// ─── Renderer fonts ─────────────────────────────────────────────────────────
export const FONTS = {
  emoji: `${CELL_SIZE}px serif`,
  gameOverTitle: 'bold 28px Segoe UI',
  gameOverScore: '18px Segoe UI',
  gameOverHint: '14px Segoe UI',
} as const;

// ─── Emojis ─────────────────────────────────────────────────────────────────
export const EMOJI = {
  snakeHead: '🐱',
  obstacle: '🧱',
} as const;
