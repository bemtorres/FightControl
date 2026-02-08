'use client';

import { useEffect, useState, use, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { SceneManager } from '@/components/scenes/SceneManager';
import { SoundManager } from '@/components/audio/SoundManager';
import { useGameState } from '@/hooks/useGameState';
import { Character, Scenario } from '@/types';
import { Maximize, Minimize, MousePointer2, Shield, Lock, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { RealtimeStatus } from '@/components/debug/RealtimeStatus';

export default function VisorPage({ params }: { params: Promise<{ scenarioId: string }> }) {
  const { scenarioId } = use(params);
  const { gameState } = useGameState(scenarioId);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const [accessGranted, setAccessGranted] = useState(false);
  const [accessInput, setAccessInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPortrait, setIsPortrait] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      const { data: scenData } = await supabase.from('scenarios').select('*').eq('id', scenarioId).single();
      if (scenData) {
        setScenario(scenData);
        // If not public and no access key, and not logged in as owner, we might block
        // For now, let's just focus on the access key gate as requested
        if (!scenData.settings?.access_key) {
          setAccessGranted(true);
        }
      }

      const { data: charData } = await supabase.from('characters').select('*').eq('scenario_id', scenarioId);
      if (charData) setCharacters(charData);
    };

    fetchData();

    const updateScale = () => {
      const scaleX = window.innerWidth / 1920;
      const scaleY = window.innerHeight / 1080;
      setScale(Math.min(scaleX, scaleY));
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    updateScale();
    window.addEventListener('resize', updateScale);

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      window.removeEventListener('resize', updateScale);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [scenarioId]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
  };

  const handleAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scenario?.settings?.access_key === accessInput) {
      setAccessGranted(true);
      setError(null);
    } else {
      setError('Invalid Access Key');
    }
  };

  if (!gameState || !scenario) return <div className="text-white bg-black h-screen w-screen flex items-center justify-center font-mono text-xs uppercase tracking-[0.3em] animate-pulse">Establishing uplink...</div>;

  if (!accessGranted && scenario.settings?.access_key) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-4xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white mb-2">
              <Shield size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{scenario.name}</h1>
              <p className="text-zinc-500 text-sm mt-2">This event is protected. Please enter the access key to continue.</p>
            </div>
          </div>

          <form onSubmit={handleAccessSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={accessInput}
                onChange={(e) => setAccessInput(e.target.value)}
                autoFocus
                className={clsx(
                  "w-full bg-zinc-900 border rounded-2xl px-6 py-4 text-center text-xl font-mono tracking-[0.5em] focus:outline-none transition-all",
                  error ? "border-red-500 text-red-500" : "border-zinc-800 text-white focus:border-white/20"
                )}
                placeholder="••••••"
              />
              {error && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest text-center mt-3">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-all shadow-xl shadow-white/5"
            >
              Verify Access Key
            </button>
          </form>

          {/* <footer className="text-center">
            <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.2em]">Secure Access Engine v2.0</p>
          </footer> */}
        </div>
      </div>
    );
  }

  // Check if public access is allowed
  if (!scenario.settings?.is_public && !accessGranted) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-500 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto mb-4">
            <Lock size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Private Event</h1>
            <p className="text-zinc-500 text-sm mt-2">This event is not public. Please contact the administrator for access.</p>
          </div>
          <a href="/login" className="block w-full py-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-white font-bold text-sm hover:bg-zinc-800 transition-all">
            Login as Administrator
          </a>
        </div>
      </div>
    );
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div
      className="w-full h-full min-h-screen bg-black overflow-hidden flex items-center justify-center cursor-none group relative"
      onMouseMove={handleMouseMove}
      onPointerMove={handleMouseMove}
      onDoubleClick={toggleFullscreen}
      style={{
        backgroundColor: scenario.chroma_key_color || '#00FF00',
        cursor: showControls ? 'auto' : 'none'
      }}
    >
      {/* PORTRAIT WARNING COVER */}
      <AnimatePresence>
        {isPortrait && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-zinc-950 flex flex-col items-center justify-center p-8 text-center md:hidden"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-6 animate-pulse">
              <RefreshCcw size={40} className="rotate-90" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Rotate for Battle</h2>
            <p className="text-zinc-400 text-sm max-w-[240px]">This event is optimized for landscape view. Flip your device to enter the arena.</p>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Visual Feedback for Fullscreen Toggle */}
      <div className={clsx(
        "fixed top-4 md:top-6 right-4 md:right-6 z-[100] flex items-center gap-2 transition-all duration-500",
        showControls ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
      )}>
        <button
          onClick={toggleFullscreen}
          className="bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 p-4 md:p-3 rounded-2xl text-white transition-all hover:scale-110 active:scale-95 shadow-2xl"
          title={isFullscreen ? "Minimize" : "Maximize"}
        >
          {isFullscreen ? <Minimize size={24} className="md:w-5 md:h-5" /> : <Maximize size={24} className="md:w-5 md:h-5" />}
        </button>
      </div>

      {/* RESPONSIVE SCALE CONTAINER - 16:9 Aspect Ratio */}
      <div
        className="relative w-full h-full flex items-center justify-center"
      >
        <div
          className="w-[1920px] h-[1080px] relative shrink-0 origin-center will-change-transform"
          style={{
            transform: `scale(${scale})`
          }}
        >
          <SceneManager gameState={gameState} characters={characters} scenario={scenario} />
        </div>
      </div>

      <SoundManager gameState={gameState} />

      {/* Info indicator when hovering */}
      <div className={clsx(
        "fixed bottom-6 left-6 z-[100] px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl text-[10px] font-bold text-white/50 uppercase tracking-widest transition-all duration-500",
        showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        {scenario.name} • 1920x1080 Engine • {isFullscreen ? 'Fullscreen' : 'Windowed'}
      </div>

      {/* Realtime Connection Monitor */}
      <RealtimeStatus scenarioId={scenarioId} />
    </div>
  );
}
