import { Character } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';

interface WinnerProps {
  winner: Character | undefined;
}

export const Winner = ({ winner }: WinnerProps) => (
  <div className="h-full w-full flex flex-col items-center justify-center bg-black/40 backdrop-blur-md relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-t from-neon-purple/50 to-transparent" />

    <AnimatePresence mode="wait">
      {winner ? (
        <motion.div
          key={winner.id}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{
            scale: [0.5, 1.1, 1],
            opacity: 1
          }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{
            duration: 0.8,
            scale: {
              times: [0, 0.6, 1],
              duration: 0.8
            }
          }}
          className="flex flex-col items-center justify-center z-10"
        >
          <motion.img
            src={winner.victory_pose || winner.side_view_combat || winner.icon_face}
            className="h-[70vh] object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.5)]"
            animate={{
              y: [0, -10, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-8xl font-russo text-yellow-400 uppercase mt-8 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]"
          >
            {winner.name} WINS!
          </motion.h1>
        </motion.div>
      ) : (
        <motion.div
          key="waiting"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center z-10 text-center"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Trophy size={120} className="text-zinc-600 mb-8" />
          </motion.div>

          <h2 className="text-5xl font-russo text-zinc-500 uppercase mb-4">
            Awaiting Winner
          </h2>

          <motion.p
            className="text-xl text-zinc-600 max-w-md"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Select the winner from the control panel
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
