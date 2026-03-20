import type { Point } from './snake';

export class Food {
  position: Point;
  private gridSize: number;

  constructor(gridSize: number) {
    this.gridSize = gridSize;
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
    this.position = this.randomPosition(exclude);
  }
}
