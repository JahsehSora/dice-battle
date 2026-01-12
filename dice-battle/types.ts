
export type DiceValue = 1 | 2 | 4 | 8 | 16 | 'ULTIMATE';

export interface DiceObject {
  id: string;
  value: DiceValue;
  position: [number, number]; // [row, col]
  mergedFrom?: string[];
  isNew?: boolean;
  isMerged?: boolean;
}

export type Grid = (DiceObject | null)[][];

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}
