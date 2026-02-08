import { Character, GameState } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface CharacterSelectProps {
  characters: Character[];
  gameState: GameState;
}

export const CharacterSelect = ({ characters, gameState }: CharacterSelectProps) => {
  const p1Hovered = characters[gameState.p1_cursor_index];
  const p2Hovered = characters[gameState.p2_cursor_index];

  const p1Display = characters.find(c => c.id === gameState.p1_selected_id) || p1Hovered;
  const p2Display = characters.find(c => c.id === gameState.p2_selected_id) || p2Hovered;

  const isP1Locked = gameState.p1_locked;
  const isP2Locked = gameState.p2_locked;

  return (
    <div className="h-full w-full relative overflow-hidden bg-zinc-950/20 backdrop-blur-sm">
      {/* GLOBAL VIGNETTE */}
      <div className="absolute inset-0 pointer-events-none z-1 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />
      {/* LAYER 1: BACKGROUND PORTRAITS (Isolated Layers) */}
      <div
        className="absolute inset-x-0 top-0 bottom-0 pointer-events-none flex z-0 overflow-hidden"
        style={{ maskImage: 'linear-gradient(to top, transparent, black 25%)', WebkitMaskImage: 'linear-gradient(to top, transparent, black 25%)' }}
      >
        {/* PLAYER 1 SECTION */}
        <div className="w-1/2 h-full relative flex items-center justify-center border-r border-white/5 bg-zinc-950/20">
          <AnimatePresence mode="popLayout" initial={false}>
            {p1Display && (
              <motion.div
                key={`p1-portrait-${p1Display.id}`}
                initial={{ x: -100, opacity: 0, scale: 0.95 }}
                animate={{
                  x: 0,
                  opacity: 1,
                  scale: isP1Locked ? 1.15 : 1,
                  filter: isP1Locked ? "brightness(1.1) contrast(1.1) saturate(1.1)" : "brightness(0.6) contrast(0.9) saturate(0.3)"
                }}
                exit={{ x: -50, opacity: 0, scale: 0.9 }}
                transition={{
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                  scale: { type: 'spring', damping: 25, stiffness: 120 }
                }}
                style={{ transformOrigin: 'top center' }}
                className="relative h-[90vh] w-full"
              >
                {/* Localized Glow */}
                <div className={clsx(
                  "absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.25),transparent_70%)] transition-opacity duration-1000",
                  isP1Locked ? "opacity-100" : "opacity-0"
                )} />
                <img
                  src={p1Display.side_view_combat || p1Display.icon_face}
                  className={clsx(
                    "h-full w-full object-contain object-top drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-700",
                    isP1Locked ? "brightness-110" : "grayscale opacity-80"
                  )}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* PLAYER 2 SECTION */}
        <div className="w-1/2 h-full relative flex items-center justify-center bg-zinc-950/20">
          <AnimatePresence mode="popLayout" initial={false}>
            {p2Display && (
              <motion.div
                key={`p2-portrait-${p2Display.id}`}
                initial={{ x: 100, opacity: 0, scale: 0.95 }}
                animate={{
                  x: 0,
                  opacity: 1,
                  scale: isP2Locked ? 1.15 : 1,
                  filter: isP2Locked ? "brightness(1.1) contrast(1.1) saturate(1.1)" : "brightness(0.6) contrast(0.9) saturate(0.3)"
                }}
                exit={{ x: 50, opacity: 0, scale: 0.9 }}
                transition={{
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                  scale: { type: 'spring', damping: 25, stiffness: 120 }
                }}
                style={{ transformOrigin: 'top center' }}
                className="relative h-[90vh] w-full"
              >
                {/* Localized Glow */}
                <div className={clsx(
                  "absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.25),transparent_70%)] transition-opacity duration-1000",
                  isP2Locked ? "opacity-100" : "opacity-0"
                )} />
                <img
                  src={p2Display.side_view_combat || p2Display.icon_face}
                  className={clsx(
                    "h-full w-full object-contain scale-x-[-1] object-top drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-700",
                    isP2Locked ? "brightness-110" : "grayscale opacity-80"
                  )}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* GLASS DIVIDER */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-linear-to-b from-transparent via-white/5 to-transparent z-10 opacity-30" />
      </div>

      {/* LAYER 2: INFORMATION (NAMES & VS LOGO) - FIXED POSITIONING */}
      <div className="absolute inset-x-0 bottom-48 z-10 pointer-events-none h-40 flex items-center justify-center">
        {/* VS Indicator - Anchor Center */}
        <motion.div
          initial={{ scale: 0.8, rotate: -45, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          className="w-24 h-24 rounded-full border-4 border-white/10 flex items-center justify-center bg-zinc-950/90 shadow-[0_0_60px_rgba(0,0,0,0.8)] relative z-20"
        >
          <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping opacity-20" />
          <span className="text-4xl font-black italic text-white skew-x-[-10deg]">VS</span>
        </motion.div>

        {/* P1 Name Panel */}
        <div className="absolute right-[calc(50%+60px)] flex flex-col items-end pr-12 min-w-[400px]">
          <div className="flex flex-col items-end overflow-hidden">
            <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em] mb-2">
              {isP1Locked ? 'CHALLENGER READY' : 'SELECTING FIGHTER'}
            </span>
            <AnimatePresence mode="wait">
              <motion.div
                key={`p1-name-${p1Display?.id}`}
                initial={{ x: 50, opacity: 0, skewX: -10 }}
                animate={{ x: 0, opacity: 1, skewX: 0 }}
                exit={{ x: -50, opacity: 0, skewX: 10 }}
                transition={{ duration: 0.2 }}
                className={clsx(
                  "text-6xl font-black tracking-tight uppercase drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] transition-colors duration-300",
                  isP1Locked ? "text-white" : "text-zinc-500"
                )}
              >
                {p1Display?.name || '---'}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* P2 Name Panel */}
        <div className="absolute left-[calc(50%+60px)] flex flex-col items-start pl-12 min-w-[400px]">
          <div className="flex flex-col items-start overflow-hidden">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-2">
              {isP2Locked ? 'CHALLENGER READY' : 'SELECTING FIGHTER'}
            </span>
            <AnimatePresence mode="wait">
              <motion.div
                key={`p2-name-${p2Display?.id}`}
                initial={{ x: -50, opacity: 0, skewX: 10 }}
                animate={{ x: 0, opacity: 1, skewX: 0 }}
                exit={{ x: 50, opacity: 0, skewX: -10 }}
                transition={{ duration: 0.2 }}
                className={clsx(
                  "text-6xl font-black tracking-tight uppercase drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] transition-colors duration-300",
                  isP2Locked ? "text-white" : "text-zinc-500"
                )}
              >
                {p2Display?.name || '---'}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* LAYER 3: CHARACTER GRID (Foreground) */}
      <div className="absolute inset-x-0 bottom-12 z-20 flex justify-center w-full px-20">
        <div className="p-1.5 bg-zinc-950/90 border border-white/10 shadow-2xl skew-x-[-5deg]">
          <div className="grid grid-cols-10 gap-1 skew-x-[5deg]">
            {characters.map((char, index) => {
              const isP1Hover = gameState.p1_cursor_index === index;
              const isP2Hover = gameState.p2_cursor_index === index;
              const isP1LockedOnThis = gameState.p1_selected_id === char.id && isP1Locked;
              const isP2LockedOnThis = gameState.p2_selected_id === char.id && isP2Locked;

              return (
                <div
                  key={char.id}
                  className={clsx(
                    "relative w-16 aspect-[4/5] overflow-hidden transition-all duration-200",
                    isP1Hover ? "ring-[3px] ring-white z-30 scale-110 shadow-[0_0_20px_rgba(255,255,255,0.4)]" :
                      isP2Hover ? "ring-[3px] ring-white z-30 scale-110 shadow-[0_0_20px_rgba(255,255,255,0.4)]" :
                        "opacity-60 grayscale hover:opacity-100 hover:grayscale-0"
                  )}
                >
                  <img src={char.icon_face} className={clsx(
                    "w-full h-full object-cover transition-all duration-300",
                    (isP1Hover || isP2Hover || isP1LockedOnThis || isP2LockedOnThis) ? "grayscale-0 brightness-110 contrast-110 scale-105" : ""
                  )} />

                  {/* Player Indicators */}
                  <div className="absolute inset-0 pointer-events-none">
                    {isP1Hover && <div className="absolute top-0 inset-x-0 h-1 bg-red-500 shadow-[0_5px_10px_rgba(239,68,68,0.8)]" />}
                    {isP2Hover && <div className="absolute bottom-0 inset-x-0 h-1 bg-green-500 shadow-[0_-5px_10px_rgba(59,130,246,0.8)]" />}
                  </div>

                  {/* Lock Indicators */}
                  <AnimatePresence>
                    {(isP1LockedOnThis || isP2LockedOnThis) && (
                      <motion.div
                        initial={{ opacity: 0, scale: 2 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className={clsx(
                          "absolute inset-0 flex items-center justify-center z-40 transition-colors duration-300",
                          isP1LockedOnThis && isP2LockedOnThis ? "bg-white/40" :
                            isP1LockedOnThis ? "bg-red-600/40" : "bg-blue-600/40"
                        )}
                      >
                        <div className="font-black text-[10px] text-white px-1 shadow-lg bg-black/60">LOCKED</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
