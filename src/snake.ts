import type { Direction, Point } from './types';

export class Snake {
  body: Point[];
  direction: Direction;
  nextDirection: Direction;

  constructor(startX: number, startY: number) {
    this.body = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY },
    ];
    this.direction = 'RIGHT';
    this.nextDirection = 'RIGHT';
  }

  get head(): Point {
    return this.body[0];
  }

  setDirection(dir: Direction) {
    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT',
    };
    if (opposites[this.direction] !== dir) {
      this.nextDirection = dir;
    }
  }

  reverse() {
    this.body.reverse();

    // Deduce new direction from the new head → next segment vector
    const head = this.body[0];
    const next = this.body[1];
    const dx = head.x - next.x;
    const dy = head.y - next.y;

    if (dx === 1)       this.direction = 'RIGHT';
    else if (dx === -1) this.direction = 'LEFT';
    else if (dy === 1)  this.direction = 'DOWN';
    else                this.direction = 'UP';

    this.nextDirection = this.direction;
  }

  move(): Point {
    this.direction = this.nextDirection;

    const newHead: Point = {
      x: this.head.x + (this.direction === 'RIGHT' ? 1 : this.direction === 'LEFT' ? -1 : 0),
      y: this.head.y + (this.direction === 'DOWN' ? 1 : this.direction === 'UP' ? -1 : 0),
    };

    this.body.unshift(newHead);
    return this.body.pop()!;
  }

  grow(tail: Point) {
    this.body.push(tail);
  }

  collidesWithSelf(): boolean {
    const [head, ...rest] = this.body;
    return rest.some(p => p.x === head.x && p.y === head.y);
  }
}
