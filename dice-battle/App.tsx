
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameLogic } from './hooks/useGameLogic';
import { Direction } from './types';
import Dice from './components/Dice';
import LogicModal from './components/LogicModal';
import { Trophy, RefreshCw, Zap, Sparkles, Wand2, Info, Flame, RotateCcw, Share2, Activity, ShieldAlert, Cpu } from 'lucide-react';

const App: React.FC = () => {
  const { grid, score, highScore, gameOver, initGame, move, combo, isBerserk } = useGameLogic();
  const [isLogicModalOpen, setIsLogicModalOpen] = useState(false);
  const touchStart = useRef<{ x: number, y: number } | null>(null);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "w", "a", "s", "d"].includes(e.key)) {
        e.preventDefault();
      }
      switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'w': move(Direction.UP); break;
        case 'arrowdown':
        case 's': move(Direction.DOWN); break;
        case 'arrowleft':
        case 'a': move(Direction.LEFT); break;
        case 'arrowright':
        case 'd': move(Direction.RIGHT); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    if (Math.max(absX, absY) > 30) {
      if (absX > absY) move(dx > 0 ? Direction.RIGHT : Direction.LEFT);
      else move(dy > 0 ? Direction.DOWN : Direction.UP);
    }
    touchStart.current = null;
  };

  const handleShare = async () => {
    const shareData = {
      title: '骰子大作战 - Dice Battle',
      text: `我正在玩《骰子大作战》，目前的最高分是 ${highScore} 分！快来挑战我吧！`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} 地址: ${shareData.url}`);
        alert('分数已复制到剪贴板，快去分享给好友吧！');
      }
    } catch (err) {
      console.log('Share failed:', err);
    }
  };

  const diceList = grid.flat().filter((d): d is any => d !== null);

  // Intelligence State Mapping
  let combatIntensity = "新兵报道";
  let intensityColor = "text-slate-400";
  let intensityProgress = (score / 4500) * 100;
  let spawnInfo = "基础补给";
  let spawnCount = 1;

  if (score >= 4501) {
    combatIntensity = "末日战场";
    intensityColor = "text-red-500";
    intensityProgress = 100;
    spawnInfo = "极速补给 (x3)";
    spawnCount = 3;
  } else if (score >= 1501) {
    combatIntensity = "前线胶着";
    intensityColor = "text-blue-400";
    intensityProgress = Math.min(score / 4500 * 100, 95);
    spawnInfo = "强化补给 (x2)";
    spawnCount = 2;
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-950 overflow-hidden text-slate-100">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/30 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[140px]" />
      </div>

      <div className="w-full max-w-sm flex flex-col items-center gap-4 mb-4 z-10">
        <motion.div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
             <Activity size={10} className="text-blue-500 animate-pulse" />
             <span className="text-[8px] font-bold text-slate-600 tracking-[0.4em] uppercase">Tactical System Active</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-500 italic">
            骰子大作战
          </h1>
        </motion.div>

        {/* Combo & Score Header */}
        <div className="w-full space-y-2">
          <div className="h-8 flex justify-center items-center">
            <AnimatePresence mode="wait">
              {combo > 0 && (
                <motion.div
                  key={combo}
                  initial={{ scale: 0.5, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0, x: 20 }}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-2xl border shadow-lg ${
                    isBerserk 
                      ? 'bg-red-600 border-red-400 text-white shadow-red-500/40' 
                      : 'bg-blue-600/20 border-blue-500/50 text-blue-400 shadow-blue-500/20'
                  }`}
                >
                  {isBerserk ? <Flame size={14} className="animate-pulse" /> : <Zap size={14} />}
                  <span className="text-xs font-black uppercase tracking-widest">
                    {combo} COMBO
                  </span>
                  {isBerserk && (
                    <div className="flex items-center gap-1 ml-1 pl-2 border-l border-white/30">
                       <ShieldAlert size={10} />
                       <span className="text-[9px] font-bold">2X BERSERK!</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-full flex justify-between items-stretch gap-2">
            <div className={`flex-1 rounded-2xl p-3 border flex flex-col items-center justify-center shadow-xl transition-all duration-300 ${isBerserk ? 'bg-red-900/40 border-red-500 scale-105' : 'bg-slate-900/80 border-slate-800'}`}>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Combat Score</span>
              <motion.span 
                key={score}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className={`text-2xl font-black ${isBerserk ? 'text-white' : 'text-blue-400'}`}
              >
                {score.toLocaleString()}
              </motion.span>
            </div>

            <div className="flex-1 bg-slate-900/80 rounded-2xl p-3 border border-slate-800 flex flex-col items-center justify-center shadow-xl">
              <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">
                <Trophy size={10} className="text-yellow-500" />
                Record
              </div>
              <span className="text-2xl font-black text-yellow-500">{highScore.toLocaleString()}</span>
            </div>

            <div className="flex flex-col gap-1.5 justify-center">
              <button onClick={() => initGame()} className="p-2 bg-slate-900 hover:bg-slate-800 active:scale-95 rounded-xl border border-slate-800 transition-all shadow-xl group">
                <RefreshCw size={18} className="text-purple-400 group-hover:rotate-180 transition-transform duration-500" />
              </button>
              <div className="flex gap-1.5">
                <button onClick={() => setIsLogicModalOpen(true)} className="flex-1 p-2 bg-slate-900 hover:bg-slate-800 active:scale-95 rounded-xl border border-slate-800 transition-all shadow-xl">
                  <Info size={18} className="text-blue-400" />
                </button>
                <button onClick={handleShare} className="flex-1 p-2 bg-slate-900 hover:bg-slate-800 active:scale-95 rounded-xl border border-slate-800 transition-all shadow-xl">
                  <Share2 size={18} className="text-emerald-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-md aspect-square bg-slate-900 p-2.5 rounded-[2.5rem] shadow-[0_0_40px_rgba(0,0,0,0.4)] border-4 border-slate-800 select-none overflow-hidden z-10">
        <div className="absolute inset-2 grid grid-cols-5 grid-rows-5 gap-1.5">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={`bg-${i}`} className="bg-slate-950/50 rounded-xl border border-slate-800/40 shadow-inner" />
          ))}
        </div>

        <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} className="relative w-full h-full grid grid-cols-5 grid-rows-5 gap-1.5 z-10">
          <AnimatePresence mode="popLayout">
            {diceList.map((dice) => (
              <motion.div
                key={dice.id}
                layout
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 450, damping: 25, mass: 0.7 }}
                style={{ gridRow: dice.position[0] + 1, gridColumn: dice.position[1] + 1 }}
              >
                <Dice value={dice.value} isNew={dice.isNew} isMerged={dice.isMerged} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Game Over Overlay */}
        <AnimatePresence>
          {gameOver && (
            <motion.div 
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 p-6 text-center"
            >
              <motion.div
                initial={{ scale: 0.5, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-slate-900 p-8 rounded-[3rem] border-2 border-slate-700 shadow-2xl flex flex-col items-center gap-4 max-w-[300px]"
              >
                <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-2 border border-red-500/20">
                  <ShieldAlert className="text-red-500 w-10 h-10 animate-pulse" />
                </div>
                <div className="space-y-1">
                   <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">作战终止</h2>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Combat Termination</p>
                </div>
                <div className="w-full bg-slate-800/50 p-4 rounded-2xl border border-slate-700/30">
                   <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Final Tactical Score</p>
                   <p className="text-4xl font-black text-blue-400 tracking-tighter">{score.toLocaleString()}</p>
                </div>
                <div className="flex flex-col w-full gap-2.5">
                  <button 
                    onClick={() => initGame()}
                    className="flex items-center justify-center gap-3 w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-900/40 active:scale-95 group"
                  >
                    <RotateCcw size={20} className="group-hover:rotate-[-180deg] transition-transform duration-500" />
                    重启系统
                  </button>
                  <button 
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-400 font-bold rounded-2xl transition-all active:scale-95"
                  >
                    <Share2 size={16} />
                    同步战报
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Intelligence Dashboard Panel */}
      <div className="w-full max-w-sm mt-5 p-5 bg-slate-900/60 rounded-[2rem] border border-slate-800/80 backdrop-blur-md z-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
          <Cpu size={40} className="text-blue-500" />
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="space-y-0.5">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Current Sector</p>
            <div className="flex items-center gap-2">
               <span className={`text-sm font-black uppercase tracking-tight ${intensityColor}`}>{combatIntensity}</span>
               <div className="flex gap-0.5">
                 {[...Array(3)].map((_, i) => (
                   <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < spawnCount ? 'bg-blue-500' : 'bg-slate-700'}`} />
                 ))}
               </div>
            </div>
          </div>
          <div className="text-right">
             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Supply Phase</p>
             <p className="text-[11px] font-black text-blue-400 uppercase tracking-tight">{spawnInfo}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-4 border border-slate-700/30">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${intensityProgress}%` }}
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${score >= 1501 ? 'from-blue-600 to-purple-500' : 'from-slate-600 to-blue-500'} transition-all`}
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "初期侦察", range: "0 - 1.5K", status: score < 1501 ? "Active" : "Cleared" },
            { label: "前线对峙", range: "1.5K - 4.5K", status: score >= 1501 && score < 4501 ? "Active" : score >= 4501 ? "Cleared" : "Locked" },
            { label: "决战领域", range: "4.5K +", status: score >= 4501 ? "Active" : "Locked" }
          ].map((phase, i) => (
            <div key={i} className={`p-2 rounded-xl border transition-colors ${phase.status === 'Active' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-900/40 border-slate-800'}`}>
              <p className={`text-[8px] font-black uppercase tracking-tight ${phase.status === 'Active' ? 'text-blue-400' : 'text-slate-600'}`}>{phase.label}</p>
              <p className="text-[7px] text-slate-700 font-bold mt-0.5">{phase.range}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-[9px] font-black text-slate-700 uppercase tracking-[0.3em]">
         <span className="animate-pulse">● System Online</span>
         <span>● Signal Stable</span>
         <span>● Encryption Active</span>
      </div>

      <LogicModal isOpen={isLogicModalOpen} onClose={() => setIsLogicModalOpen(false)} />
    </div>
  );
};

export default App;
