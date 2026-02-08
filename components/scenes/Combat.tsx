import { Character } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface CombatProps {
  p1: Character | undefined;
  p2: Character | undefined;
}

export const Combat = ({ p1, p2 }: CombatProps) => (
  <div className="h-full w-full relative">
    {/* Character Sprites Area */}
    <div className="absolute inset-0 flex items-end justify-between px-32 pb-10 pointer-events-none">
      {/* Player 1 Sprite */}
      <AnimatePresence>
        {p1 && (
          <motion.div
            key={p1.id}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="relative h-[85%]"
          >
            <img
              src={p1.side_view_combat || p1.icon_face}
              className="h-full w-auto object-contain drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player 2 Sprite */}
      <AnimatePresence>
        {p2 && (
          <motion.div
            key={p2.id}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="relative h-[85%] flex items-end justify-end"
          >
            <img
              src={p2.side_view_combat || p2.icon_face}
              className="h-full w-auto object-contain drop-shadow-[0_0_30px_rgba(0,0,0,0.5)] scale-x-[-1]"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* HUD Container */}
    <div className="absolute top-8 left-8 right-8 z-50">

      <div className="flex justify-between items-stretch h-24">

        {/* P1 Health Bar Section */}
        <div className="flex-1 flex flex-col relative">
          {/* Character Name & Portrait */}
          <div className="flex items-center absolute -top-4 w-full z-10">
            <div className="w-16 h-16 border-2 border-emerald-500 bg-black overflow-hidden mr-2 shadow-[0_0_10px_rgba(16,185,129,0.5)]">
              <img src={p1?.icon_face} className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-white text-2xl uppercase tracking-wider mr-auto drop-shadow-lg">{p1?.name}</span>
          </div>

          {/* Bar Container */}
          <div className="h-8 w-full bg-zinc-900 border-2 border-white skew-x-[-20deg] relative mt-10 overflow-hidden shadow-lg transform origin-left">
            <motion.div
              initial={{ width: "100%" }}
              className="absolute top-0 left-0 h-full bg-red-600 w-full"
            />
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, delay: 0.5 }}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-600 to-emerald-300 border-r-2 border-white"
            />
          </div>
        </div>

        {/* Timer */}
        <div className="w-24 flex flex-col items-center justify-start z-20 -mt-2 mx-4">
          <div className="text-5xl font-black text-white italic drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] bg-zinc-950/80 px-4 py-1 border border-white/20 skew-x-[-15deg]">
            99
          </div>
        </div>

        {/* P2 Health Bar Section */}
        <div className="flex-1 flex flex-col items-end relative">
          {/* Character Name & Portrait */}
          <div className="flex items-center flex-row-reverse absolute -top-4 w-full z-10">
            <div className="w-16 h-16 border-2 border-red-500 bg-black overflow-hidden ml-2 shadow-[0_0_10px_rgba(239,68,68,0.5)]">
              <img src={p2?.icon_face} className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-white text-2xl uppercase tracking-wider ml-auto drop-shadow-lg">{p2?.name}</span>
          </div>

          {/* Bar Container */}
          <div className="h-8 w-full bg-zinc-900 border-2 border-white skew-x-[20deg] relative mt-10 overflow-hidden shadow-lg transform origin-right">
            <motion.div
              initial={{ width: "100%" }}
              className="absolute top-0 right-0 h-full bg-red-600 w-full"
            />
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, delay: 0.5 }}
              className="absolute top-0 right-0 h-full bg-gradient-to-l from-red-600 to-red-400 border-l-2 border-white"
            />
          </div>
        </div>

      </div>
    </div>
  </div>
);
