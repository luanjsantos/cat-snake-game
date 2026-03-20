import type { Snake } from './snake';
import type { Food } from './food';

const CELL = 20;

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private gridSize: number;

  constructor(canvas: HTMLCanvasElement, gridSize: number) {
    this.ctx = canvas.getContext('2d')!;
    this.gridSize = gridSize;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.gridSize * CELL, this.gridSize * CELL);
  }

  drawGrid() {
    this.ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    this.ctx.lineWidth = 0.5;
    for (let i = 0; i <= this.gridSize; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * CELL, 0);
      this.ctx.lineTo(i * CELL, this.gridSize * CELL);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(0, i * CELL);
      this.ctx.lineTo(this.gridSize * CELL, i * CELL);
      this.ctx.stroke();
    }
  }

  drawSnake(snake: Snake) {
    snake.body.forEach((segment, index) => {
      const x = segment.x * CELL;
      const y = segment.y * CELL;

      if (index === 0) {
        // Head: cat emoji 🐱
        this.ctx.font = `${CELL}px serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🐱', x + CELL / 2, y + CELL / 2);
      } else {
        // Body: gradient from pink to purple
        const ratio = index / snake.body.length;
        const r = Math.round(233 - ratio * 100);
        const g = Math.round(69 + ratio * 50);
        const b = Math.round(96 + ratio * 120);

        this.ctx.fillStyle = `rgb(${r},${g},${b})`;
        this.ctx.beginPath();
        this.ctx.roundRect(x + 2, y + 2, CELL - 4, CELL - 4, 4);
        this.ctx.fill();
      }
    });
  }

  drawFood(food: Food) {
    const x = food.position.x * CELL;
    const y = food.position.y * CELL;
    this.ctx.font = `${CELL}px serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('🐟', x + CELL / 2, y + CELL / 2);
  }

  drawGameOver(score: number) {
    const size = this.gridSize * CELL;
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    this.ctx.fillRect(0, 0, size, size);

    this.ctx.fillStyle = '#e94560';
    this.ctx.font = 'bold 28px Segoe UI';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('😿 Game Over!', size / 2, size / 2 - 24);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '18px Segoe UI';
    this.ctx.fillText(`Score: ${score}`, size / 2, size / 2 + 16);

    this.ctx.fillStyle = '#aaa';
    this.ctx.font = '14px Segoe UI';
    this.ctx.fillText('Press ENTER or SPACE to restart', size / 2, size / 2 + 48);
  }
}
