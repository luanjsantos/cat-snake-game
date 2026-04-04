import { Game } from './game';
import { Menu } from './menu';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const game = new Game(canvas);
const menu = new Menu((mode) => game.start(mode));

game.onReturnToMenu = () => menu.show();
menu.show();
