import { BASE_SPEED, MIN_SPEED, BOOST_SPEED, INITIAL_SNAKE_LENGTH, SPEED_DECREMENT_PER_SEGMENT } from './constants';

export function calcSpeed(snakeLength: number): number {
  return Math.max(MIN_SPEED, BASE_SPEED - (snakeLength - INITIAL_SNAKE_LENGTH) * SPEED_DECREMENT_PER_SEGMENT);
}

export function getIntervalSpeed(snakeLength: number, boosting: boolean): number {
  return boosting ? BOOST_SPEED : calcSpeed(snakeLength);
}
