
import { DiceValue } from './types';

export const GRID_SIZE = 5;

export const DICE_CONFIGS: Record<DiceValue, { color: string; bgColor: string; borderColor: string; score: number }> = {
  1: {
    color: '#334155', // Slate 700
    bgColor: '#94a3b8', // Slate 400
    borderColor: '#64748b',
    score: 0, 
  },
  2: {
    color: '#f8fafc',
    bgColor: '#3b82f6', // Blue 500
    borderColor: '#2563eb',
    score: 2,
  },
  4: {
    color: '#f8fafc',
    bgColor: '#22c55e', // Green 500
    borderColor: '#16a34a',
    score: 4,
  },
  8: {
    color: '#1e293b',
    bgColor: '#eab308', // Yellow 500
    borderColor: '#ca8a04',
    score: 8,
  },
  16: {
    color: '#f8fafc',
    bgColor: '#a855f7', // Purple 500
    borderColor: '#9333ea',
    score: 16,
  },
  'ULTIMATE': {
    color: '#f8fafc',
    bgColor: '#ef4444', // Red 500
    borderColor: '#dc2626',
    score: 60,
  }
};

// Thresholds balanced for 5x5 grid (easier to survive, so scores can go higher)
export const SPAWN_PROBABILITY_TIERS = [
  {
    threshold: 4501, // Chaos mode
    spawnCount: 3,
    weights: [
      { value: 1 as DiceValue, weight: 0.65 },
      { value: 2 as DiceValue, weight: 0.25 },
      { value: 4 as DiceValue, weight: 0.1 },
    ]
  },
  {
    threshold: 1501, // Intermediate mode
    spawnCount: 2,
    weights: [
      { value: 1 as DiceValue, weight: 0.8 },
      { value: 2 as DiceValue, weight: 0.2 },
    ]
  },
  {
    threshold: 0, // Beginner mode
    spawnCount: 1,
    weights: [
      { value: 1 as DiceValue, weight: 0.9 },
      { value: 2 as DiceValue, weight: 0.1 },
    ]
  }
];
