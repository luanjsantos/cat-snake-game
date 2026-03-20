import { Snake, type Direction } from './snake';
import { Food } from './food';
import { Renderer } from './renderer';

const GRID_SIZE = 20;
const BASE_SPEED = 150; // ms per tick — starting speed
const MIN_SPEED = 60;  // ms per tick — fastest possible

function calcSpeed(snakeLength: number): number {
  // Reduz 4ms por segmento, nunca abaixo de MIN_SPEED
  return Math.max(MIN_SPEED, BASE_SPEED - (snakeLength - 3) * 4);
}

type GameState = 'idle' | 'running' | 'over';

export class Game {
  private snake: Snake;
  private food: Food;
  private renderer: Renderer;
  private state: GameState = 'idle';
  private score = 0;
  private best = 0;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  private scoreEl: HTMLElement;
  private bestEl: HTMLElement;
  private messageEl: HTMLElement;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new Renderer(canvas, GRID_SIZE);
    this.snake = new Snake(10, 10);
    this.food = new Food(GRID_SIZE);

    this.scoreEl = document.getElementById('score')!;
    this.bestEl = document.getElementById('best')!;
    this.messageEl = document.getElementById('message')!;

    this.setupInput();
    this.renderer.clear();
    this.renderer.drawGrid();
    this.renderer.drawSnake(this.snake);
    this.renderer.drawFood(this.food);
  }

  private setupInput() {
    const dirMap: Record<string, Direction> = {
      ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
      w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT',
      W: 'UP', S: 'DOWN', A: 'LEFT', D: 'RIGHT',
    };

    document.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && this.state !== 'running') {
        this.start();
        return;
      }
      if (this.state === 'running' && dirMap[e.key]) {
        this.snake.setDirection(dirMap[e.key]);
        e.preventDefault();
      }
    });
  }

  start() {
    this.snake = new Snake(10, 10);
    this.food = new Food(GRID_SIZE);
    this.score = 0;
    this.scoreEl.textContent = '0';
    this.messageEl.textContent = '';
    this.state = 'running';

    if (this.intervalId !== null) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => this.tick(), calcSpeed(this.snake.body.length));
  }

  private tick() {
    const tail = this.snake.move();

    // Wall collision
    const head = this.snake.head;
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return this.gameOver();
    }

    // Self collision
    if (this.snake.collidesWithSelf()) {
      return this.gameOver();
    }

    // Eat food
    if (head.x === this.food.position.x && head.y === this.food.position.y) {
      this.snake.grow(tail);
      this.food.respawn(this.snake.body);
      this.score += 10;
      this.scoreEl.textContent = String(this.score);

      // Restart interval com nova velocidade baseada no tamanho atual
      if (this.intervalId !== null) clearInterval(this.intervalId);
      this.intervalId = setInterval(() => this.tick(), calcSpeed(this.snake.body.length));
    }

    this.renderer.clear();
    this.renderer.drawGrid();
    this.renderer.drawSnake(this.snake);
    this.renderer.drawFood(this.food);
  }

  private gameOver() {
    this.state = 'over';
    if (this.intervalId !== null) clearInterval(this.intervalId);
    if (this.score > this.best) {
      this.best = this.score;
      this.bestEl.textContent = String(this.best);
    }
    this.renderer.drawGameOver(this.score);
    this.messageEl.textContent = '';
  }
}
