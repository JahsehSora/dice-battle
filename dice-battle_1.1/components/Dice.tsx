
import React from 'react';
import { motion } from 'framer-motion';
import { DiceValue } from '../types';
import { DICE_CONFIGS } from '../constants';
import { Star } from 'lucide-react';

interface DiceProps {
  value: DiceValue;
  isNew?: boolean;
  isMerged?: boolean;
}

const Dice: React.FC<DiceProps> = ({ value, isNew, isMerged }) => {
  const config = DICE_CONFIGS[value];

  return (
    <motion.div
      initial={isNew ? { scale: 0, opacity: 0 } : false}
      animate={isMerged ? { 
        scale: [1, 1.25, 1],
        transition: { duration: 0.2, ease: "easeOut" }
      } : { scale: 1, opacity: 1 }}
      className="w-full h-full flex items-center justify-center select-none p-1"
    >
      <div className="relative w-full h-full filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]">
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id={`grad-${value}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: config.bgColor, stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: config.borderColor, stopOpacity: 1 }} />
            </linearGradient>
            <filter id="inner-shadow">
              <feOffset dx="0" dy="2" />
              <feGaussianBlur stdDeviation="2" result="offset-blur" />
              <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
              <feFlood floodColor="black" floodOpacity="0.2" result="color" />
              <feComposite operator="in" in="color" in2="inverse" result="shadow" />
              <feComposite operator="over" in="shadow" in2="SourceGraphic" />
            </filter>
          </defs>
          
          <polygon
            points="50,2 95,25 95,75 50,98 5,75 5,25"
            fill={`url(#grad-${value})`}
            stroke="white"
            strokeWidth="1.5"
            strokeOpacity="0.2"
            filter="url(#inner-shadow)"
          />
          
          <path d="M50 2 L95 25 L50 45 Z" fill="white" fillOpacity="0.1" />
          <path d="M5 25 L50 2 L50 45 Z" fill="black" fillOpacity="0.05" />
          <path d="M5 25 L50 45 L5 75 Z" fill="white" fillOpacity="0.05" />
          <path d="M95 25 L50 45 L95 75 Z" fill="black" fillOpacity="0.1" />
          <path d="M5 75 L50 45 L50 98 Z" fill="black" fillOpacity="0.15" />
          <path d="M95 75 L50 45 L50 98 Z" fill="white" fillOpacity="0.05" />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          {value === 'ULTIMATE' ? (
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 4 }}
            >
              <Star className="text-white w-8 h-8 md:w-10 md:h-10 fill-white filter drop-shadow-sm" />
            </motion.div>
          ) : (
            <span
              className="text-xl md:text-2xl lg:text-3xl font-black tracking-tighter filter drop-shadow-sm"
              style={{ color: config.color }}
            >
              {value}
            </span>
          )}
        </div>

        {value === 'ULTIMATE' && (
          <div className="absolute inset-0 bg-red-500 rounded-full mix-blend-screen animate-pulse blur-xl opacity-20" />
        )}
      </div>
    </motion.div>
  );
};

export default Dice;
