import { Snake } from './snake';
import { Food, FOOD_POINTS } from './food';
import { Renderer } from './renderer';
import { Obstacle } from './obstacle';
import type { Direction, GameMode, GameState } from './types';
import { getIntervalSpeed } from './utils';
import {
  GRID_SIZE,
  SNAKE_SPAWN_X,
  SNAKE_SPAWN_Y,
  INITIAL_SNAKE_LENGTH,
  COUNTDOWN_STEPS,
  COUNTDOWN_INTERVAL_MS,
  COUNTDOWN_CLEAR_DELAY_MS,
  FOODS_PER_LEVEL,
  OBSTACLES_PER_LEVEL,
  BEST_SCORE_KEY,
  MODE_BADGE_LABEL,
} from './constants';

export class Game {
  private snake: Snake;
  private food: Food;
  private obstacle: Obstacle;
  private renderer: Renderer;
  private state: GameState = 'idle';
  private mode: GameMode = 'endless';
  private score = 0;
  private best = 0;
  private level = 1;
  private boosting = false;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  onReturnToMenu: (() => void) | null = null;

  private scoreEl: HTMLElement;
  private bestEl: HTMLElement;
  private levelEl: HTMLElement;
  private lengthEl: HTMLElement;
  private messageEl: HTMLElement;
  private modeEl: HTMLElement;
  private pauseOverlay: HTMLElement;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new Renderer(canvas, GRID_SIZE);
    this.snake = new Snake(SNAKE_SPAWN_X, SNAKE_SPAWN_Y);
    this.food = new Food(GRID_SIZE);
    this.obstacle = new Obstacle([]);

    this.scoreEl = document.getElementById('score')!;
    this.bestEl = document.getElementById('best')!;
    this.levelEl = document.getElementById('level')!;
    this.lengthEl = document.getElementById('length')!;
    this.messageEl = document.getElementById('message')!;
    this.modeEl = document.getElementById('mode-badge')!;
    this.pauseOverlay = document.getElementById('pause-overlay')!;

    this.setupInput();
    this.setupPauseButtons();
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
      if ((e.key === 'Enter' || e.key === ' ') && this.state === 'over') {
        this.returnToMenu();
        return;
      }
      if ((e.key === 'Enter' || e.key === ' ') && this.state === 'idle') {
        return;
      }
      if (e.key === 'Escape' && this.state === 'running') {
        this.pause();
        return;
      }
      if (e.key === 'Escape' && this.state === 'paused') {
        this.resume();
        return;
      }
      if (this.state === 'running' && dirMap[e.key]) {
        const opposites: Record<Direction, Direction> = {
          UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT',
        };
        if (dirMap[e.key] === opposites[this.snake.direction]) {
          this.snake.reverse();
          this.boosting = false;
          this.restartInterval();
        } else {
          this.snake.setDirection(dirMap[e.key]);
        }
        e.preventDefault();

        // Segurar a tecla de direção = boost
        if (e.repeat && !this.boosting) {
          this.boosting = true;
          this.restartInterval();
        }
      }
    });

    document.addEventListener('keyup', (e) => {
      if (dirMap[e.key] && this.boosting && this.state === 'running') {
        this.boosting = false;
        this.restartInterval();
      }
    });
  }

  private pause() {
    this.state = 'paused';
    if (this.intervalId !== null) clearInterval(this.intervalId);
    this.pauseOverlay.classList.remove('hidden');
    this.messageEl.textContent = '';
  }

  private resume() {
    this.state = 'running';
    this.pauseOverlay.classList.add('hidden');
    this.messageEl.textContent = '';
    this.restartInterval();
  }

  private setupPauseButtons() {
    document.getElementById('pause-resume')!.addEventListener('click', () => {
      if (this.state === 'paused') this.resume();
    });
    document.getElementById('pause-restart')!.addEventListener('click', () => {
      if (this.state === 'paused') {
        this.pauseOverlay.classList.add('hidden');
        this.start(this.mode);
      }
    });
    document.getElementById('pause-exit')!.addEventListener('click', () => {
      if (this.state === 'paused') {
        this.pauseOverlay.classList.add('hidden');
        this.returnToMenu();
      }
    });
  }

  private restartInterval() {
    if (this.intervalId !== null) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => this.tick(), getIntervalSpeed(this.snake.body.length, this.boosting));
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

  start(mode: GameMode = 'endless') {
    this.mode = mode;
    this.best = parseInt(localStorage.getItem(BEST_SCORE_KEY[mode]) ?? '0', 10);
    this.snake = new Snake(SNAKE_SPAWN_X, SNAKE_SPAWN_Y);
    this.food = new Food(GRID_SIZE);
    this.obstacle = new Obstacle([]);
    this.score = 0;
    this.level = 1;
    this.scoreEl.textContent = '0';
    this.levelEl.textContent = '1';
    this.lengthEl.textContent = String(INITIAL_SNAKE_LENGTH);
    this.bestEl.textContent = String(this.best);
    this.modeEl.textContent = MODE_BADGE_LABEL[mode];
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
      const points = FOOD_POINTS[this.food.type];
      this.snake.grow(tail);
      this.food.respawn(this.snake.body);
      this.score += points;
      this.scoreEl.textContent = String(this.score);
      this.lengthEl.textContent = String(this.snake.body.length);

      if (this.mode === 'endless') {
        const newLevel = Math.floor((this.snake.body.length - INITIAL_SNAKE_LENGTH) / FOODS_PER_LEVEL) + 1;
        if (newLevel > this.level) {
          this.level = newLevel;
          this.levelEl.textContent = String(this.level);
          this.obstacle = this.buildObstacle((this.level - 1) * OBSTACLES_PER_LEVEL);
        }
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
    this.boosting = false;
    if (this.intervalId !== null) clearInterval(this.intervalId);
    if (this.score > this.best) {
      this.best = this.score;
      this.bestEl.textContent = String(this.best);
      localStorage.setItem(BEST_SCORE_KEY[this.mode], String(this.best));
    }
    this.renderer.drawGameOver(this.score);
    this.messageEl.textContent = 'Press ENTER for menu — ESC anytime to quit';
  }

  private returnToMenu() {
    if (this.intervalId !== null) clearInterval(this.intervalId);
    this.state = 'idle';
    this.messageEl.textContent = '';
    this.pauseOverlay.classList.add('hidden');
    this.renderer.clear();
    this.renderer.drawGrid();
    this.onReturnToMenu?.();
  }
}
