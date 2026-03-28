import { Snake, type Direction } from './snake';
import { Food } from './food';
import { Renderer } from './renderer';
import { Obstacle } from './obstacle';

const GRID_SIZE = 20;
const BASE_SPEED = 150; // ms per tick — starting speed
const MIN_SPEED = 60;  // ms per tick — fastest possible
const BOOST_SPEED = 40; // ms per tick — when holding direction key

function calcSpeed(snakeLength: number): number {
  // Reduz 4ms por segmento, nunca abaixo de MIN_SPEED
  return Math.max(MIN_SPEED, BASE_SPEED - (snakeLength - 3) * 4);
}

type GameState = 'idle' | 'countdown' | 'running' | 'paused' | 'over';

const COUNTDOWN_STEPS = ['3', '2', '1', 'GO! 🐾'];
const COUNTDOWN_INTERVAL_MS = 700;
const COUNTDOWN_CLEAR_DELAY_MS = 400;

export class Game {
  private snake: Snake;
  private food: Food;
  private obstacle: Obstacle;
  private renderer: Renderer;
  private state: GameState = 'idle';
  private score = 0;
  private best = parseInt(localStorage.getItem('cat-snake-best') ?? '0', 10);
  private level = 1;
  private boosting = false;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  private scoreEl: HTMLElement;
  private bestEl: HTMLElement;
  private levelEl: HTMLElement;
  private lengthEl: HTMLElement;
  private messageEl: HTMLElement;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new Renderer(canvas, GRID_SIZE);
    this.snake = new Snake(10, 10);
    this.food = new Food(GRID_SIZE);
    this.obstacle = new Obstacle([]);

    this.scoreEl = document.getElementById('score')!;
    this.bestEl = document.getElementById('best')!;
    this.levelEl = document.getElementById('level')!;
    this.lengthEl = document.getElementById('length')!;
    this.messageEl = document.getElementById('message')!;

    this.bestEl.textContent = String(this.best);

    this.setupInput();
    this.renderer.clear();
    this.renderer.drawGrid();
    this.renderer.drawSnake(this.snake);
    this.renderer.drawFood(this.food);
    this.renderer.drawObstacles(this.obstacle);
  }

  private setupInput() {
    const dirMap: Record<string, Direction> = {
      ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
      w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT',
      W: 'UP', S: 'DOWN', A: 'LEFT', D: 'RIGHT',
    };

    document.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && this.state !== 'running' && this.state !== 'paused' && this.state !== 'countdown') {
        this.start();
        return;
      }
      if (e.key === 'p' || e.key === 'P') {
        this.togglePause();
        return;
      }
      if (this.state === 'running' && dirMap[e.key]) {
        this.snake.setDirection(dirMap[e.key]);
        e.preventDefault();

        // Segurar a tecla de direção = boost
        if (e.repeat && !this.boosting) {
          this.boosting = true;
          this.restartInterval();
        }
      }
    });

    document.addEventListener('keyup', (e) => {
      if (dirMap[e.key] && this.boosting) {
        this.boosting = false;
        this.restartInterval();
      }
    });
  }

  private togglePause() {
    if (this.state === 'running') {
      this.state = 'paused';
      if (this.intervalId !== null) clearInterval(this.intervalId);
      this.messageEl.textContent = '⏸ PAUSED — press P to resume';
    } else if (this.state === 'paused') {
      this.state = 'running';
      this.messageEl.textContent = '';
      this.restartInterval();
    }
  }

  private restartInterval() {
    if (this.intervalId !== null) clearInterval(this.intervalId);
    const speed = this.boosting ? BOOST_SPEED : calcSpeed(this.snake.body.length);
    this.intervalId = setInterval(() => this.tick(), speed);
  }

  // Células seguras para spawnar obstáculos: longe das bordas e do spawn da cobra (10,10)
  private static SAFE_CELLS = [
    {x:3,y:3},{x:3,y:10},{x:3,y:17},
    {x:10,y:3},{x:10,y:17},
    {x:17,y:3},{x:17,y:10},{x:17,y:17},
    {x:5,y:7},{x:7,y:5},{x:13,y:5},{x:15,y:7},
    {x:5,y:13},{x:7,y:15},{x:13,y:15},{x:15,y:13},
  ];

  private buildObstacle(count: number): Obstacle {
    const shuffled = [...Game.SAFE_CELLS].sort(() => Math.random() - 0.5);
    return new Obstacle(shuffled.slice(0, count));
  }

  start() {
    this.snake = new Snake(10, 10);
    this.food = new Food(GRID_SIZE);
    this.obstacle = new Obstacle([]);
    this.score = 0;
    this.level = 1;
    this.scoreEl.textContent = '0';
    this.levelEl.textContent = '1';
    this.lengthEl.textContent = '3';
    this.boosting = false;
    this.startCountdown();
  }

  private startCountdown() {
    this.state = 'countdown';
    let step = 0;

    const tick = () => {
      this.messageEl.textContent = COUNTDOWN_STEPS[step];
      step++;
      if (step < COUNTDOWN_STEPS.length) {
        setTimeout(tick, COUNTDOWN_INTERVAL_MS);
      } else {
        setTimeout(() => this.beginGame(), COUNTDOWN_CLEAR_DELAY_MS);
      }
    };

    tick();
  }

  private beginGame() {
    this.messageEl.textContent = '';
    this.state = 'running';
    this.restartInterval();
  }

  private tick() {
    const tail = this.snake.move();

    // Wall wrap-around — cobra atravessa a borda e aparece no lado oposto
    const head = this.snake.head;
    head.x = (head.x + GRID_SIZE) % GRID_SIZE;
    head.y = (head.y + GRID_SIZE) % GRID_SIZE;

    // Self collision
    if (this.snake.collidesWithSelf()) {
      return this.gameOver();
    }

    // Obstacle collision
    if (this.obstacle.collidesWith(head)) {
      return this.gameOver();
    }

    // Eat food
    if (head.x === this.food.position.x && head.y === this.food.position.y) {
      this.snake.grow(tail);
      this.food.respawn(this.snake.body);
      this.score += 10;
      this.scoreEl.textContent = String(this.score);
      this.lengthEl.textContent = String(this.snake.body.length);

      // Sobe de nível a cada 5 comidas
      const newLevel = Math.floor((this.snake.body.length - 3) / 5) + 1;
      if (newLevel > this.level) {
        this.level = newLevel;
        this.levelEl.textContent = String(this.level);
        // Fase 2+: spawna obstáculos (2 por fase a partir do level 2)
        const count = (this.level - 1) * 2;
        this.obstacle = this.buildObstacle(count);
      }

      // Restart interval com nova velocidade baseada no tamanho atual
      this.restartInterval();
    }

    this.renderer.clear();
    this.renderer.drawGrid();
    this.renderer.drawObstacles(this.obstacle);
    this.renderer.drawSnake(this.snake);
    this.renderer.drawFood(this.food);
  }

  private gameOver() {
    this.state = 'over';
    if (this.intervalId !== null) clearInterval(this.intervalId);
    if (this.score > this.best) {
      this.best = this.score;
      this.bestEl.textContent = String(this.best);
      localStorage.setItem('cat-snake-best', String(this.best));
    }
    this.renderer.drawGameOver(this.score);
    this.messageEl.textContent = '';
  }
}
