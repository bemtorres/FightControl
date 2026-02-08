import { Character } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface PresentationProps {
  character: Character | undefined;
}

export const Presentation = ({ character }: PresentationProps) => {
  if (!character) return null;

  return (
    <div className="w-full h-full relative overflow-hidden bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={character.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full flex items-center justify-center"
        >
          {/* Background Elements */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-neon-blue/20 to-transparent skew-x-[-20deg] transform translate-x-20"></div>

          {/* Content Container */}
          <div className="w-[90%] h-[80%] flex items-center gap-16 relative z-10 px-12">

            {/* Left: Stats & Bio */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-1/3 flex flex-col items-start text-left space-y-6"
            >
              <div>
                <h1 className="text-8xl font-russo text-white uppercase tracking-tighter loading-none drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">
                  {character.name}
                </h1>
                <div className="h-2 w-32 bg-neon-green mt-2"></div>
              </div>

              <p className="text-2xl font-mono text-gray-300 leading-relaxed max-w-xl border-l-4 border-gray-700 pl-6 italic">
                {character.description || "A legendary fighter with unknown origins. Ready to prove their worth in the arena."}
              </p>

              {/* Mock Stats Bars (Visual decoration) */}
              <div className="w-full space-y-4 pt-8">
                {[
                  { label: 'POWER', width: '85%', color: 'bg-red-500' },
                  { label: 'SPEED', width: '70%', color: 'bg-yellow-500' },
                  { label: 'TECH', width: '90%', color: 'bg-blue-500' },
                ].map((stat, i) => (
                  <div key={stat.label} className="flex items-center gap-4">
                    <span className="font-russo w-24 text-gray-500 text-sm">{stat.label}</span>
                    <div className="h-4 flex-1 bg-gray-900/50 rounded-full overflow-hidden border border-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: stat.width }}
                        transition={{ duration: 0.8, ease: "circOut" }}
                        className={`h-full ${stat.color} shadow-[0_0_10px_rgba(255,255,255,0.2)]`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Big Character Art */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, x: 100 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 100 }}
              className="flex-1 h-full relative"
            >
              <img
                src={character.side_view_combat || character.icon_face}
                className="absolute right-0 bottom-0 h-[110%] object-contain drop-shadow-[0_0_60px_rgba(0,180,255,0.2)] mask-image-gradient scale-x-[-1] transition-all duration-500 hover:scale-x-[-1.05]"
              />
            </motion.div>

          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
