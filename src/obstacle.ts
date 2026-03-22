import type { Point } from './snake';

export class Obstacle {
  positions: Point[];

  constructor(positions: Point[]) {
    this.positions = positions;
  }

  collidesWith(point: Point): boolean {
    return this.positions.some(p => p.x === point.x && p.y === point.y);
  }
}
