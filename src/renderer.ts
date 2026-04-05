import type { Snake } from './snake';
import type { Food } from './food';
import { FOOD_EMOJI } from './food';
import type { Obstacle } from './obstacle';
import { CELL_SIZE, COLORS, FONTS, EMOJI } from './constants';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private gridSize: number;

  constructor(canvas: HTMLCanvasElement, gridSize: number) {
    this.ctx = canvas.getContext('2d')!;
    this.gridSize = gridSize;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.gridSize * CELL_SIZE, this.gridSize * CELL_SIZE);
  }

  drawGrid() {
    this.ctx.strokeStyle = COLORS.gridLine;
    this.ctx.lineWidth = 0.5;
    for (let i = 0; i <= this.gridSize; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * CELL_SIZE, 0);
      this.ctx.lineTo(i * CELL_SIZE, this.gridSize * CELL_SIZE);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(0, i * CELL_SIZE);
      this.ctx.lineTo(this.gridSize * CELL_SIZE, i * CELL_SIZE);
      this.ctx.stroke();
    }
  }

  drawSnake(snake: Snake) {
    snake.body.forEach((segment, index) => {
      const x = segment.x * CELL_SIZE;
      const y = segment.y * CELL_SIZE;

      if (index === 0) {
        this.ctx.font = FONTS.emoji;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(EMOJI.snakeHead, x + CELL_SIZE / 2, y + CELL_SIZE / 2);
      } else {
        const ratio = index / snake.body.length;
        const r = Math.round(233 - ratio * 100);
        const g = Math.round(69 + ratio * 50);
        const b = Math.round(96 + ratio * 120);

        this.ctx.fillStyle = `rgb(${r},${g},${b})`;
        this.ctx.beginPath();
        this.ctx.roundRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4, 4);
        this.ctx.fill();
      }
    });
  }

  drawFood(food: Food) {
    const x = food.position.x * CELL_SIZE;
    const y = food.position.y * CELL_SIZE;
    this.ctx.font = FONTS.emoji;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(FOOD_EMOJI[food.type], x + CELL_SIZE / 2, y + CELL_SIZE / 2);
  }

  drawObstacles(obstacle: Obstacle) {
    obstacle.positions.forEach(pos => {
      const x = pos.x * CELL_SIZE;
      const y = pos.y * CELL_SIZE;
      this.ctx.font = FONTS.emoji;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(EMOJI.obstacle, x + CELL_SIZE / 2, y + CELL_SIZE / 2);
    });
  }

  drawGameOver(score: number) {
    const size = this.gridSize * CELL_SIZE;
    this.ctx.fillStyle = COLORS.gameOverOverlay;
    this.ctx.fillRect(0, 0, size, size);

    this.ctx.fillStyle = COLORS.gameOverTitle;
    this.ctx.font = FONTS.gameOverTitle;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('😿 Game Over!', size / 2, size / 2 - 24);

    this.ctx.fillStyle = COLORS.gameOverScore;
    this.ctx.font = FONTS.gameOverScore;
    this.ctx.fillText(`Score: ${score}`, size / 2, size / 2 + 16);

    this.ctx.fillStyle = COLORS.gameOverHint;
    this.ctx.font = FONTS.gameOverHint;
    this.ctx.fillText('Press ENTER or SPACE to restart', size / 2, size / 2 + 48);
  }
}
