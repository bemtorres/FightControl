'use client';

import { GameState, Character, Scenario, SceneType } from '@/types';
import { Intro } from './Intro';
import { CharacterSelect } from './CharacterSelect';
import { Versus } from './Versus';
import { Combat } from './Combat';
import { Winner } from './Winner';
import { Presentation } from './Presentation';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';

interface SceneManagerProps {
  gameState: GameState;
  characters: Character[];
  scenario: Scenario;
}

const variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const SceneManager = ({ gameState, characters, scenario }: SceneManagerProps) => {
  const p1 = characters.find(c => c.id === gameState.p1_selected_id);
  const p2 = characters.find(c => c.id === gameState.p2_selected_id);
  const winner = characters.find(c => c.id === gameState.winner_id);

  const renderScene = () => {
    switch (gameState.current_scene) {
      case 'INTRO':
        return <Intro scenario={scenario} />;
      case 'SELECT':
        return <CharacterSelect characters={characters} gameState={gameState} />;
      case 'VERSUS':
        return <Versus p1={p1} p2={p2} />;
      case 'COMBAT':
        return <Combat p1={p1} p2={p2} />;
      case 'WINNER':
        return <Winner winner={winner} />;
      case 'PRESENTATION':
        const presChar = characters.find(c => c.id === gameState.presentation_char_id) || p1 || p2;
        return <Presentation character={presChar} />;
      default:
        return null;
    }
  };

  return (
    <div className={clsx(
      "w-full h-full relative overflow-hidden transition-all duration-700",
      scenario.font_family || 'font-sans'
    )}
      style={{
        backgroundImage: scenario.background_url ? `url(${scenario.background_url})` : undefined,
        backgroundPosition: 'center',
        backgroundSize: 'cover'
      }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={gameState.current_scene}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
          className="w-full h-full"
          transition={{ duration: 0.5 }}
        >
          {renderScene()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
