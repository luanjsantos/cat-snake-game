import type { Point, FoodType } from './types';

export const FOOD_EMOJI: Record<FoodType, string> = {
  fish: '🐟',
  shrimp: '🦐',
  milk: '🥛',
};

export const FOOD_POINTS: Record<FoodType, number> = {
  fish: 10,
  shrimp: 20,
  milk: 5,
};

// Weighted spawn: fish 60%, shrimp 25%, milk 15%
const FOOD_WEIGHTS: { type: FoodType; weight: number }[] = [
  { type: 'fish', weight: 60 },
  { type: 'shrimp', weight: 25 },
  { type: 'milk', weight: 15 },
];

function pickFoodType(): FoodType {
  const total = FOOD_WEIGHTS.reduce((sum, w) => sum + w.weight, 0);
  let roll = Math.random() * total;
  for (const entry of FOOD_WEIGHTS) {
    roll -= entry.weight;
    if (roll <= 0) return entry.type;
  }
  return 'fish';
}

export class Food {
  position: Point;
  type: FoodType;
  private gridSize: number;

  constructor(gridSize: number) {
    this.gridSize = gridSize;
    this.type = pickFoodType();
    this.position = this.randomPosition([]);
  }

  randomPosition(exclude: Point[]): Point {
    let pos: Point;
    do {
      pos = {
        x: Math.floor(Math.random() * this.gridSize),
        y: Math.floor(Math.random() * this.gridSize),
      };
    } while (exclude.some(p => p.x === pos.x && p.y === pos.y));
    return pos;
  }

  respawn(exclude: Point[]) {
    this.type = pickFoodType();
    this.position = this.randomPosition(exclude);
  }
}
