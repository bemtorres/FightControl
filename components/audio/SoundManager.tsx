'use client';

import { useEffect, useRef, useState } from 'react';
import { GameState } from '@/types';
import { Volume2, VolumeX } from 'lucide-react';

interface SoundManagerProps {
  gameState: GameState;
}

export const SoundManager = ({ gameState }: SoundManagerProps) => {
  const [muted, setMuted] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Refs to track previous values to detect changes
  const prevCursors = useRef({ p1: gameState.p1_cursor_index, p2: gameState.p2_cursor_index });
  const prevSelected = useRef({ p1: gameState.p1_selected_id, p2: gameState.p2_selected_id });
  const prevScene = useRef(gameState.current_scene);

  // Pre-load audio objects for immediate playback
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const sounds = {
    move: 'https://cdn.pixabay.com/audio/2022/03/15/audio_7833005f77.mp3', // Soft click
    select: 'https://cdn.pixabay.com/audio/2022/03/10/audio_5fe4a4e1d5.mp3', // Confirm bip
    transition: 'https://cdn.pixabay.com/audio/2022/03/19/audio_d076776840.mp3', // Whoosh
    confirm: 'https://cdn.pixabay.com/audio/2022/03/15/audio_27d82627eb.mp3' // Impact
  };

  useEffect(() => {
    // Initialize audio objects
    Object.entries(sounds).forEach(([key, url]) => {
      try {
        const audio = new Audio(url);
        audio.volume = 0.4;
        audio.addEventListener('error', (e) => {
          console.warn(`Failed to load sound: ${key}`, e);
        });
        audioRefs.current[key] = audio;
      } catch (err) {
        console.warn(`Audio initialization failed for ${key}`, err);
      }
    });
  }, []);

  const playSound = (key: keyof typeof sounds) => {
    const audio = audioRefs.current[key];
    if (audio && audioEnabled && !muted) {
      try {
        audio.currentTime = 0; // Reset to start if it was playing
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            // Auto-play policy or source error
            // console.warn('Audio play blocked or failed:', e);
          });
        }
      } catch (e) {
        console.warn('Audio execution error:', e);
      }
    }
  };

  useEffect(() => {
    // Detect Changes
    const cursorChanged = gameState.p1_cursor_index !== prevCursors.current.p1 ||
      gameState.p2_cursor_index !== prevCursors.current.p2;

    const selectedChanged = (gameState.p1_selected_id !== prevSelected.current.p1 && gameState.p1_selected_id) ||
      (gameState.p2_selected_id !== prevSelected.current.p2 && gameState.p2_selected_id);

    const sceneChanged = gameState.current_scene !== prevScene.current;

    // Trigger Sounds
    if (cursorChanged) playSound('move');
    if (selectedChanged) playSound('select');
    if (sceneChanged) playSound('transition');

    // Always update refs to stay in sync with state
    prevCursors.current = { p1: gameState.p1_cursor_index, p2: gameState.p2_cursor_index };
    prevSelected.current = { p1: gameState.p1_selected_id, p2: gameState.p2_selected_id };
    prevScene.current = gameState.current_scene;

  }, [gameState, audioEnabled, muted]);

  const enableAudio = () => {
    setAudioEnabled(true);
    // Play a silent or confirmation sound to "unlocked" audio context
    const audio = new Audio(sounds.move);
    audio.volume = 0;
    audio.play();
  };

  return (
    <>
      {/* Audio Unlock Overlay (Required by browsers) */}
      {!audioEnabled && (
        <div
          onClick={enableAudio}
          className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer group"
        >
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-black mb-4 group-hover:scale-110 transition-transform shadow-2xl shadow-white/10">
            <Volume2 size={32} />
          </div>
          <p className="text-white font-bold tracking-widest uppercase text-xs">Click to Activate Audio Engine</p>
        </div>
      )}

      {/* Small Toggle in corner for testing/manual control */}
      <div className="fixed bottom-4 left-4 z-[999] opacity-20 hover:opacity-100 transition-opacity">
        <button
          onClick={() => setMuted(!muted)}
          className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors"
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>
    </>
  );
};
