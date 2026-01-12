
import React from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, RefreshCcw, X, ShieldAlert, Sparkles, Flame, Swords, Binary, Cpu } from 'lucide-react';

interface LogicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TacticalEntry: React.FC<{ icon: React.ReactNode; title: string; desc: string; color: string; delay: number }> = ({ icon, title, desc, color, delay }) => (
  <motion.div 
    initial={{ x: -20, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ delay }}
    className="group flex items-start gap-4 p-4 bg-slate-800/40 hover:bg-slate-800/60 rounded-2xl border border-slate-700/50 transition-all duration-300"
  >
    <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100 group-hover:scale-110 transition-transform shadow-lg`}>
      {icon}
    </div>
    <div className="flex-1">
      <div className="flex items-center justify-between">
        <h4 className="font-black text-sm text-slate-100 tracking-wide uppercase">{title}</h4>
        <div className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-pulse" />
      </div>
      <p className="text-[11px] text-slate-400 leading-relaxed mt-1 font-medium">{desc}</p>
    </div>
  </motion.div>
);

const LogicModal: React.FC<LogicModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-sm bg-slate-900 border-2 border-slate-700/50 rounded-[2.5rem] p-7 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition-all z-10">
          <X size={20} />
        </button>

        <div className="relative mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/10 mb-3 border border-blue-500/20">
            <Swords className="text-blue-400" size={24} />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter italic text-white">作战指挥手册</h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="h-[1px] w-8 bg-blue-500/50" />
            <span className="text-[9px] font-bold text-blue-500 tracking-[0.3em] uppercase">Tactical Intelligence</span>
            <span className="h-[1px] w-8 bg-blue-500/50" />
          </div>
        </div>

        <div className="space-y-3 relative z-10">
          <TacticalEntry 
            icon={<Binary size={20} className="text-cyan-400" />} 
            title="三重裂变" 
            desc="别被双向合成限制。锁定三个同级骰子，引发“聚变裂变”直接跨级跳升。例如：3个[4]级直接坍缩为1个[16]级。" 
            color="bg-cyan-500"
            delay={0.1}
          />
          
          <TacticalEntry 
            icon={<Zap size={20} className="text-amber-400" />} 
            title="连击节奏" 
            desc="保持进攻连续性！每一次滑动只要产生合成，连击数就会攀升。一旦出现“哑火”（未产生合成），Combo 瞬间归零。" 
            color="bg-amber-500"
            delay={0.2}
          />

          <TacticalEntry 
            icon={<Flame size={20} className="text-red-400" />} 
            title="狂暴增幅" 
            desc="突破极限！当连击数达到 3 次，战场进入【狂暴模式】，此时所有的合成奖励得分全部获得 200% 的终极翻倍。" 
            color="bg-red-500"
            delay={0.3}
          />

          <TacticalEntry 
            icon={<Cpu size={20} className="text-purple-400" />} 
            title="红核清理" 
            desc="红色终极骰子是战场的累赘，无法继续合成。唯一的清理手段是达成横/纵向 3 连消，并获取巨额战略分数。" 
            color="bg-purple-500"
            delay={0.4}
          />
        </div>

        <button 
          onClick={onClose}
          className="relative w-full mt-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-900/40 active:scale-95 group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          同步作战链路
        </button>

        <p className="text-center text-[9px] text-slate-600 mt-4 font-bold uppercase tracking-widest">Version 2.4.0 Combat System Online</p>
      </motion.div>
    </motion.div>
  );
};

export default LogicModal;
