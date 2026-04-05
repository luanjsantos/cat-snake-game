// Shared domain types for cat-snake-game

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Point {
  x: number;
  y: number;
}

export type FoodType = 'fish' | 'shrimp' | 'milk';

export type GameMode = 'endless' | 'stage';

export type GameState = 'idle' | 'countdown' | 'running' | 'paused' | 'over';
