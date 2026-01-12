
import { useState, useCallback, useEffect } from 'react';
import { DiceObject, Grid, Direction, DiceValue } from '../types';
import { GRID_SIZE, SPAWN_PROBABILITY_TIERS, DICE_CONFIGS } from '../constants';

const createEmptyGrid = (): Grid => 
  Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));

const getNextLevel = (val: DiceValue, steps: number): DiceValue => {
  if (val === 'ULTIMATE') return 'ULTIMATE';
  const levels: DiceValue[] = [1, 2, 4, 8, 16, 'ULTIMATE'];
  const currentIndex = levels.indexOf(val);
  const nextIndex = Math.min(currentIndex + steps, levels.length - 1);
  return levels[nextIndex];
};

export const useGameLogic = () => {
  const [grid, setGrid] = useState<Grid>(createEmptyGrid());
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => 
    Number(localStorage.getItem('dice-battle-high-score')) || 0
  );
  const [gameOver, setGameOver] = useState(false);
  const [combo, setCombo] = useState(0);
  const [isBerserk, setIsBerserk] = useState(false);

  const getRandomDiceValue = useCallback((currentScore: number): DiceValue => {
    const tier = SPAWN_PROBABILITY_TIERS.find(t => currentScore >= t.threshold) || SPAWN_PROBABILITY_TIERS[SPAWN_PROBABILITY_TIERS.length - 1];
    const rand = Math.random();
    let cumulative = 0;
    for (const w of tier.weights) {
      cumulative += w.weight;
      if (rand <= cumulative) return w.value;
    }
    return 1;
  }, []);

  const checkGameOver = (currentGrid: Grid): boolean => {
    // 1. 检查是否有空格
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!currentGrid[r][c]) return false;
      }
    }

    // 2. 检查是否有任何相邻的同级骰子可以合并 (排除 ULTIMATE)
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const current = currentGrid[r][c];
        if (!current) continue;
        
        // 检查右侧
        if (c < GRID_SIZE - 1) {
          const right = currentGrid[r][c + 1];
          if (right && current.value === right.value && current.value !== 'ULTIMATE') return false;
        }
        // 检查下方
        if (r < GRID_SIZE - 1) {
          const down = currentGrid[r + 1][c];
          if (down && current.value === down.value && current.value !== 'ULTIMATE') return false;
        }
      }
    }

    // 3. 检查是否有终极骰子可以消除 (3连)
    const hasUltimateClear = (): boolean => {
      // 横向检查
      for (let r = 0; r < GRID_SIZE; r++) {
        let count = 0;
        for (let c = 0; c < GRID_SIZE; c++) {
          if (currentGrid[r][c]?.value === 'ULTIMATE') count++;
          else count = 0;
          if (count >= 3) return true;
        }
      }
      // 纵向检查
      for (let c = 0; c < GRID_SIZE; c++) {
        let count = 0;
        for (let r = 0; r < GRID_SIZE; r++) {
          if (currentGrid[r][c]?.value === 'ULTIMATE') count++;
          else count = 0;
          if (count >= 3) return true;
        }
      }
      return false;
    };

    if (hasUltimateClear()) return false;

    return true;
  };

  const spawnDice = useCallback((currentGrid: Grid, currentScore: number): { grid: Grid, isFull: boolean } => {
    let newGrid = currentGrid.map(row => [...row]);
    const tier = SPAWN_PROBABILITY_TIERS.find(t => currentScore >= t.threshold) || SPAWN_PROBABILITY_TIERS[SPAWN_PROBABILITY_TIERS.length - 1];
    
    for (let i = 0; i < tier.spawnCount; i++) {
      const emptyCells: [number, number][] = [];
      newGrid.forEach((row, r) => {
        row.forEach((cell, c) => {
          if (!cell) emptyCells.push([r, c]);
        });
      });

      if (emptyCells.length === 0) break;
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      const [r, c] = emptyCells[randomIndex];
      
      newGrid[r][c] = {
        id: Math.random().toString(36).substr(2, 9),
        value: getRandomDiceValue(currentScore),
        position: [r, c],
        isNew: true,
      };
    }
    return { grid: newGrid, isFull: false };
  }, [getRandomDiceValue]);

  const findAndClearUltimateLines = (currentGrid: Grid): { newGrid: Grid, bonus: number, clearedCount: number } => {
    const toClear = new Set<string>();
    let bonus = 0;
    let clearedCount = 0;

    const checkLine = (line: (DiceObject | null)[]) => {
      let consecutive: DiceObject[] = [];
      const finalize = (seq: DiceObject[]) => {
        if (seq.length >= 3) {
          seq.forEach(d => {
            if (!toClear.has(d.id)) {
              toClear.add(d.id);
              clearedCount++;
            }
          });
          if (seq.length === 3) bonus += 180;
          else if (seq.length === 4) bonus += 240;
          else if (seq.length >= 5) bonus += 300;
        }
      };
      for (let i = 0; i < line.length; i++) {
        const dice = line[i];
        if (dice && dice.value === 'ULTIMATE') consecutive.push(dice);
        else { finalize(consecutive); consecutive = []; }
      }
      finalize(consecutive);
    };

    for (let r = 0; r < GRID_SIZE; r++) checkLine(currentGrid[r]);
    for (let c = 0; c < GRID_SIZE; c++) {
      const colLine = [];
      for (let r = 0; r < GRID_SIZE; r++) colLine.push(currentGrid[r][c]);
      checkLine(colLine);
    }
    
    if (toClear.size === 0) return { newGrid: currentGrid, bonus: 0, clearedCount: 0 };
    const newGrid = currentGrid.map(row => row.map(dice => (dice && toClear.has(dice.id) ? null : dice)));
    return { newGrid, bonus, clearedCount };
  };

  const move = useCallback((direction: Direction) => {
    if (gameOver) return;

    setGrid(prev => {
      let turnPoints = 0;
      let hasAction = false;
      const newGrid = createEmptyGrid();
      
      for (let i = 0; i < GRID_SIZE; i++) {
        let line: (DiceObject | null)[] = [];
        if (direction === Direction.UP || direction === Direction.DOWN) {
          for (let j = 0; j < GRID_SIZE; j++) line.push(prev[j][i]);
          if (direction === Direction.DOWN) line.reverse();
        } else {
          for (let j = 0; j < GRID_SIZE; j++) line.push(prev[i][j]);
          if (direction === Direction.RIGHT) line.reverse();
        }

        const filtered = line.filter(x => x !== null) as DiceObject[];
        const merged: DiceObject[] = [];
        
        for (let j = 0; j < filtered.length; ) {
          const a = filtered[j];
          const b = filtered[j + 1];
          const c = filtered[j + 2];

          if (c && a.value === b.value && b.value === c.value && a.value !== 'ULTIMATE') {
            const nextVal = getNextLevel(a.value, 2);
            merged.push({ 
              ...a, value: nextVal, isMerged: true, isNew: false, 
              id: Math.random().toString(36).substr(2, 9) 
            });
            turnPoints += DICE_CONFIGS[nextVal].score;
            hasAction = true;
            j += 3;
          } 
          else if (b && a.value === b.value && a.value !== 'ULTIMATE') {
            const nextVal = getNextLevel(a.value, 1);
            merged.push({ 
              ...a, value: nextVal, isMerged: true, isNew: false, 
              id: Math.random().toString(36).substr(2, 9) 
            });
            turnPoints += DICE_CONFIGS[nextVal].score;
            hasAction = true;
            j += 2;
          } 
          else {
            merged.push({ ...a, isNew: false, isMerged: false });
            j += 1;
          }
        }

        for (let j = 0; j < GRID_SIZE; j++) {
          const dice = merged[j] || null;
          let idx = (direction === Direction.DOWN || direction === Direction.RIGHT) ? GRID_SIZE - 1 - j : j;
          let tr, tc;
          if (direction === Direction.UP || direction === Direction.DOWN) { tr = idx; tc = i; }
          else { tr = i; tc = idx; }
          if (dice) newGrid[tr][tc] = { ...dice, position: [tr, tc] };
        }
      }

      const gridChanged = JSON.stringify(prev.map(r => r.map(c => c?.id))) !== JSON.stringify(newGrid.map(r => r.map(c => c?.id)));
      const { newGrid: clearedGrid, bonus, clearedCount } = findAndClearUltimateLines(newGrid);
      
      if (clearedCount > 0) {
        hasAction = true;
        turnPoints += bonus;
      }

      let finalGrid: Grid;
      let finalScore = score;

      if (hasAction) {
        const nextCombo = combo + 1;
        // 核心改动：连击达到 3 次及以上即进入狂暴翻倍状态
        const multiplier = nextCombo >= 3 ? 2 : 1;
        const totalAward = turnPoints * multiplier;
        finalScore = score + totalAward;

        setCombo(nextCombo);
        setIsBerserk(nextCombo >= 3);
        setScore(finalScore);

        const spawnRes = spawnDice(clearedGrid, finalScore);
        finalGrid = spawnRes.grid;
      } else {
        setCombo(0);
        setIsBerserk(false);
        if (gridChanged) {
          const spawnRes = spawnDice(newGrid, score);
          finalGrid = spawnRes.grid;
        } else {
          return prev;
        }
      }

      if (checkGameOver(finalGrid)) {
        setGameOver(true);
      }

      return finalGrid;
    });
  }, [gameOver, spawnDice, combo, score]);

  const initGame = useCallback(() => {
    let initialGrid = createEmptyGrid();
    const spawnRes = spawnDice(initialGrid, 0);
    setGrid(spawnRes.grid);
    setScore(0);
    setGameOver(false);
    setCombo(0);
    setIsBerserk(false);
  }, [spawnDice]);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('dice-battle-high-score', score.toString());
    }
  }, [score, highScore]);

  return { grid, score, highScore, gameOver, initGame, move, combo, isBerserk };
};
