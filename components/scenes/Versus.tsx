import { Character } from '@/types';
import { motion } from 'framer-motion';

interface VersusProps {
  p1: Character | undefined;
  p2: Character | undefined;
}

export const Versus = ({ p1, p2 }: VersusProps) => (
  <div className="h-full w-full flex bg-black/30 backdrop-blur-sm relative overflow-hidden">
    {/* Background Noise/Grid overlay could go here */}
    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

    {/* P1 Section */}
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className="w-1/2 h-full relative flex items-center justify-center bg-gradient-to-r from-blue-900/80 to-black border-r-4 border-neon-blue skew-x-[-10deg] origin-bottom-left z-10"
    >
      {p1 && (
        <>
          <motion.img
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            src={p1.side_view_combat || p1.icon_face}
            className="absolute h-[85%] object-contain left-0 bottom-0 z-20 drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]"
          />
          <motion.h1
            initial={{ opacity: 0, scale: 2 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-8xl font-russo text-white/10 z-0 absolute top-1/2 left-10 -translate-y-1/2 uppercase whitespace-nowrap"
          >
            {p1.name}
          </motion.h1>
          <div className="absolute bottom-20 left-10 z-30">
            <h2 className="text-6xl font-russo text-white italic tracking-tighter shadow-black drop-shadow-lg">{p1.name}</h2>
          </div>
        </>
      )}
    </motion.div>

    {/* VS Badge */}
    <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1.5, rotate: 0 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        <h1 className="text-9xl font-press-start text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-orange-600 italic drop-shadow-[5px_5px_0_#000]">VS</h1>
      </motion.div>
    </div>

    {/* P2 Section */}
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className="w-1/2 h-full relative flex items-center justify-center bg-gradient-to-l from-red-900/80 to-black border-l-4 border-red-600 skew-x-[-10deg] origin-top-right z-10"
    >
      {p2 && (
        <>
          <motion.img
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            src={p2.side_view_combat || p2.icon_face}
            className="absolute h-[85%] object-contain right-0 bottom-0 z-20 scale-x-[-1] drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]"
          />
          <motion.h1
            initial={{ opacity: 0, scale: 2 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-8xl font-russo text-white/10 z-0 absolute top-1/2 right-10 -translate-y-1/2 uppercase whitespace-nowrap"
          >
            {p2.name}
          </motion.h1>
          <div className="absolute top-20 right-10 z-30 text-right">
            <h2 className="text-6xl font-russo text-white italic tracking-tighter shadow-black drop-shadow-lg">{p2.name}</h2>
          </div>
        </>
      )}
    </motion.div>
  </div>
);
