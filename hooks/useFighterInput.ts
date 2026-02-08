import { useEffect } from 'react';

interface UseFighterInputProps {
  onP1Move: (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => void;
  onP1Select: () => void;
  onP2Move: (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => void;
  onP2Select: () => void;
  enabled: boolean;
}

export const useFighterInput = ({
  onP1Move,
  onP1Select,
  onP2Move,
  onP2Select,
  enabled
}: UseFighterInputProps) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key.toUpperCase();

      // P1 Controls: WASD or Arrows (shared if only one player, but here mapped to P1)
      switch (key) {
        case 'W':
        case 'ARROWUP':
          onP1Move('UP');
          break;
        case 'S':
        case 'ARROWDOWN':
          onP1Move('DOWN');
          break;
        case 'A':
        case 'ARROWLEFT':
          onP1Move('LEFT');
          break;
        case 'D':
        case 'ARROWRIGHT':
          onP1Move('RIGHT');
          break;
        case 'E':
        case 'ENTER':
        case ' ':
          onP1Select();
          break;
      }

      // P2 Controls: IJKL or Numeric Keypad (optional, keeping IJKL + O)
      switch (key) {
        case 'I': onP2Move('UP'); break;
        case 'K': onP2Move('DOWN'); break;
        case 'J': onP2Move('LEFT'); break;
        case 'L': onP2Move('RIGHT'); break;
        case 'O': onP2Select(); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onP1Move, onP1Select, onP2Move, onP2Select]);
};
