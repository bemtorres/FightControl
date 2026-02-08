'use client';

import { useEffect, useState, use, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabase';
import { SceneManager } from '@/components/scenes/SceneManager';
import { useGameState } from '@/hooks/useGameState';
import { useFighterInput } from '@/hooks/useFighterInput';
import { Character, Scenario, SceneType } from '@/types';
import QRCode from 'react-qr-code';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { toast } from 'sonner';
import { RosterManager } from '@/components/admin/RosterManager';
import { ScenarioSettings } from '@/components/admin/ScenarioSettings';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor,
  Users,
  Gamepad2,
  Settings,
  ArrowLeft,
  ChevronRight,
  Play,
  RefreshCcw,
  LayoutDashboard,
  Shield,
  Share2,
  Maximize,
  Minimize,
  Shuffle,
  ChevronLeft,
  CheckSquare
} from 'lucide-react';
import { ShareModal } from '@/components/admin/ShareModal';

export default function ControlPage({ params }: { params: Promise<{ scenarioId: string }> }) {
  const { scenarioId } = use(params);
  const { gameState, updateScene, updateCursors, selectCharacter, updatePresentationChar, lockCharacter, resetGameState, toggleDuplicates, updatePresentationCursor, setWinner } = useGameState(scenarioId);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [showRoster, setShowRoster] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRandomizing, setIsRandomizing] = useState<'p1' | 'p2' | null>(null);
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [pipDimensions, setPipDimensions] = useState({ width: 0, height: 0 });
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const [randomEnabled, setRandomEnabled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!pipWindow) return;

    const handleResize = () => {
      setPipDimensions({
        width: pipWindow.innerWidth,
        height: pipWindow.innerHeight
      });
    };

    handleResize();
    pipWindow.addEventListener('resize', handleResize);
    return () => pipWindow.removeEventListener('resize', handleResize);
  }, [pipWindow]);

  const fetchData = async () => {
    const { data: scenData } = await supabase.from('scenarios').select('*').eq('id', scenarioId).single();
    if (scenData) setScenario(scenData);

    const { data: charData } = await supabase.from('characters').select('*').eq('scenario_id', scenarioId).order('name');
    if (charData) setCharacters(charData);
  };

  useEffect(() => {
    fetchData();
  }, [scenarioId]);

  // Auto-reset winner when leaving WINNER scene
  useEffect(() => {
    if (gameState && gameState.current_scene !== 'WINNER' && gameState.winner_id) {
      setWinner(null);
    }
  }, [gameState?.current_scene]);

  const handleMove = useCallback((player: 'p1' | 'p2', dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (!gameState || characters.length === 0) return;

    if (gameState.current_scene === 'PRESENTATION') {
      const cols = 5;
      const currentIndex = gameState.presentation_cursor_index || 0;
      let newIndex = currentIndex;

      switch (dir) {
        case 'UP': newIndex = currentIndex - cols; break;
        case 'DOWN': newIndex = currentIndex + cols; break;
        case 'LEFT':
          if (currentIndex % cols === 0) newIndex = currentIndex + (cols - 1);
          else newIndex = currentIndex - 1;
          break;
        case 'RIGHT':
          if (currentIndex % cols === cols - 1) newIndex = currentIndex - (cols - 1);
          else newIndex = currentIndex + 1;
          break;
      }

      if (newIndex < 0) newIndex = 0;
      if (newIndex >= characters.length) newIndex = characters.length - 1;

      updatePresentationCursor(newIndex);
      return;
    }

    const isLocked = player === 'p1' ? gameState.p1_locked : gameState.p2_locked;
    if (isLocked) return;

    const cols = 10;
    const currentIndex = player === 'p1' ? gameState.p1_cursor_index : gameState.p2_cursor_index;
    let newIndex = currentIndex;

    switch (dir) {
      case 'UP':
        newIndex = currentIndex - cols;
        if (newIndex < 0) {
          // Wrap to bottom
          const lastRowStart = Math.floor((characters.length - 1) / cols) * cols;
          newIndex = Math.min(lastRowStart + (currentIndex % cols), characters.length - 1);
        }
        break;
      case 'DOWN':
        newIndex = currentIndex + cols;
        if (newIndex >= characters.length) {
          // Wrap to top
          newIndex = currentIndex % cols;
        }
        break;
      case 'LEFT':
        if (currentIndex % cols === 0) {
          // Map to end of current row or end of list if it's the last row
          const rowEnd = Math.min(currentIndex + (cols - 1), characters.length - 1);
          newIndex = rowEnd;
        } else {
          newIndex = currentIndex - 1;
        }
        break;
      case 'RIGHT':
        if (currentIndex % cols === cols - 1 || currentIndex === characters.length - 1) {
          newIndex = Math.max(0, currentIndex - (currentIndex % cols));
        } else {
          newIndex = currentIndex + 1;
        }
        break;
    }

    const p1Idx = player === 'p1' ? newIndex : gameState.p1_cursor_index;
    const p2Idx = player === 'p2' ? newIndex : gameState.p2_cursor_index;
    updateCursors(p1Idx, p2Idx);
  }, [gameState, characters, updatePresentationCursor, updateCursors]);

  const handleSelect = useCallback((player: 'p1' | 'p2') => {
    if (!gameState || characters.length === 0) return;

    if (gameState.current_scene === 'PRESENTATION') {
      const char = characters[gameState.presentation_cursor_index];
      if (char) {
        updatePresentationChar(char.id);
        toast.success(`Biographic focus: ${char.name}`);
      }
      return;
    }

    const isLocked = player === 'p1' ? gameState.p1_locked : gameState.p2_locked;
    const charId = player === 'p1' ? characters[gameState.p1_cursor_index]?.id : characters[gameState.p2_cursor_index]?.id;
    const char = characters.find(c => c.id === charId);

    if (isLocked) {
      lockCharacter(player, null, false);
      toast.info(`${player.toUpperCase()} unlocked ${char?.name}`);
    } else {
      if (char) {
        const otherPlayer = player === 'p1' ? 'p2' : 'p1';
        const otherSelectedId = otherPlayer === 'p1' ? gameState.p1_selected_id : gameState.p2_selected_id;
        const otherLocked = otherPlayer === 'p1' ? gameState.p1_locked : gameState.p2_locked;

        if (!gameState.allow_duplicates && otherSelectedId === char.id && otherLocked) {
          toast.error("Duplicate selection not allowed!");
          return;
        }

        lockCharacter(player, char.id, true);
        toast.success(`${player.toUpperCase()} locked ${char.name}`);
      }
    }
  }, [gameState, characters, updatePresentationChar, lockCharacter]);

  const handleRandomSelect = useCallback(async (player: 'p1' | 'p2') => {
    if (!gameState || characters.length === 0 || isRandomizing) return;

    setIsRandomizing(player);

    // Roulette animation: cycle through characters quickly
    const animationDuration = 2000; // 2 seconds
    const intervalTime = 100; // Change character every 100ms
    const iterations = animationDuration / intervalTime;

    let currentIteration = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * characters.length);
      const randomChar = characters[randomIndex];

      // Update cursor position and selection during animation
      const p1Idx = player === 'p1' ? randomIndex : gameState.p1_cursor_index;
      const p2Idx = player === 'p2' ? randomIndex : gameState.p2_cursor_index;
      updateCursors(p1Idx, p2Idx);
      selectCharacter(player, randomChar.id);

      currentIteration++;

      if (currentIteration >= iterations) {
        clearInterval(interval);

        // Final selection
        const finalIndex = Math.floor(Math.random() * characters.length);
        const finalChar = characters[finalIndex];

        const finalP1Idx = player === 'p1' ? finalIndex : gameState.p1_cursor_index;
        const finalP2Idx = player === 'p2' ? finalIndex : gameState.p2_cursor_index;
        updateCursors(finalP1Idx, finalP2Idx);
        selectCharacter(player, finalChar.id);

        // Auto-lock character at the end
        lockCharacter(player, finalChar.id, true);

        setIsRandomizing(null);
        toast.success(`${player.toUpperCase()} selected ${finalChar.name} randomly!`);
      }
    }, intervalTime);
  }, [gameState, characters, isRandomizing, updateCursors, selectCharacter, lockCharacter]);

  const handlePipToggle = useCallback(async () => {
    if (pipWindow) {
      pipWindow.close();
      setPipWindow(null);
      return;
    }
    if ('documentPictureInPicture' in window) {
      try {
        // @ts-ignore
        const pip = await window.documentPictureInPicture.requestWindow({
          width: 1280,
          height: 720,
          disallowReturnToOpener: true
        });

        // Copy styles
        [...document.styleSheets].forEach((styleSheet) => {
          try {
            const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
            const style = document.createElement('style');
            style.textContent = cssRules;
            pip.document.head.appendChild(style);
          } catch (e) {
            if (styleSheet.href) {
              const link = document.createElement('link');
              link.rel = 'stylesheet';
              link.href = styleSheet.href;
              pip.document.head.appendChild(link);
            }
          }
        });

        // Add some basic reset for body in PiP
        const baseStyle = document.createElement('style');
        baseStyle.textContent = `
          body { margin: 0; padding: 0; overflow: hidden; background: black; }
          .pip-container { 
            width: 100vw; 
            height: 100vh; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            background: black;
            overflow: hidden;
          }
        `;
        pip.document.head.appendChild(baseStyle);

        pip.addEventListener('pagehide', () => setPipWindow(null));
        setPipWindow(pip);
        toast.success('Live view window active');
      } catch (err) {
        toast.error('Browser blocked native window popup');
      }
    }
  }, [pipWindow]);

  useFighterInput({
    onP1Move: (dir) => handleMove('p1', dir),
    onP1Select: () => handleSelect('p1'),
    onP2Move: (dir) => handleMove('p2', dir),
    onP2Select: () => handleSelect('p2'),
    enabled: !!(gameState?.current_scene === 'SELECT' || gameState?.current_scene === 'PRESENTATION') && controlsEnabled
  });

  if (!gameState || !scenario) return (
    <div className="h-screen flex items-center justify-center bg-zinc-950 text-zinc-400 font-sans">
      <div className="flex flex-col items-center gap-4">
        <RefreshCcw className="animate-spin text-white" size={32} />
        <p className="text-sm font-medium tracking-tight">Syncing with combat servers...</p>
      </div>
    </div>
  );

  const intros: { id: SceneType; label: string; icon: any }[] = [
    { id: 'PRESENTATION', label: 'Biography', icon: LayoutDashboard },
  ];

  const scenes: { id: SceneType; label: string; icon: any }[] = [
    { id: 'INTRO', label: 'Intro Sequence', icon: Play },
    { id: 'SELECT', label: 'Character Select', icon: Users },
    //{ id: 'PRESENTATION', label: 'Biography', icon: LayoutDashboard },
    { id: 'VERSUS', label: 'Versus Screen', icon: Gamepad2 },
    { id: 'COMBAT', label: 'Live Combat', icon: Gamepad2 },
    { id: 'WINNER', label: 'Victory Screen', icon: Play },
  ];


  const p1Char = characters.find(c => c.id === gameState.p1_selected_id);
  const p2Char = characters.find(c => c.id === gameState.p2_selected_id);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* MOBILE HEADER */}
      <header className="md:hidden h-16 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-4 shrink-0 z-[110]">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400">
            <ArrowLeft size={18} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xs font-bold text-white uppercase tracking-tighter">FighterControl</h1>
            <span className="text-[8px] text-emerald-500 font-bold uppercase tracking-widest">{gameState.current_scene}</span>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white active:scale-95 transition-all"
        >
          <LayoutDashboard size={20} />
        </button>
      </header>

      {/* SIDEBAR (Desktop: Sidebar, Mobile: Drawer) */}
      <aside className={clsx(
        "fixed inset-0 z-[120] md:relative md:inset-auto md:z-auto md:w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col shrink-0 transition-transform duration-300 ease-in-out md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Mobile Sidebar Backdrop */}
        <div
          className="md:hidden absolute inset-0 bg-black/60 backdrop-blur-sm -z-10"
          style={{ width: '200vw', transform: 'translateX(-50%)' }}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        <div className="p-6 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="hidden md:block p-1 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-white">
              <ArrowLeft size={16} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-sm font-bold tracking-tight text-white leading-none">FighterControl</h1>
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest mt-1">Control Center</span>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-2 text-zinc-500 hover:text-white"
          >
            <RefreshCcw size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          {/* FighterControl */}

          <div className="mb-4">
            <span className="px-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Scenes</span>
          </div>
          {scenes.map(scene => (
            <button
              key={`scene-${scene.id}`}
              onClick={() => {
                setShowRoster(false);
                setShowSettings(false);
                updateScene(scene.id);
                setIsMobileMenuOpen(false);
              }}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group shrink-0",
                gameState.current_scene === scene.id
                  ? "bg-white text-zinc-950 shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent"
              )}
            >
              <scene.icon size={16} className={clsx(gameState.current_scene === scene.id ? "text-zinc-950" : "text-zinc-500 group-hover:text-zinc-300")} />
              <span className="truncate">{scene.label}</span>
              {gameState.current_scene === scene.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-zinc-950 shrink-0" />}
            </button>
          ))}


          <div className="mb-4">
            <span className="px-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Extra</span>
          </div>
          {intros.map(scene => (
            <button
              key={`intro-${scene.id}`}
              onClick={() => {
                setShowRoster(false);
                setShowSettings(false);
                updateScene(scene.id);
                setIsMobileMenuOpen(false);
              }}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group shrink-0",
                gameState.current_scene === scene.id
                  ? "bg-white text-zinc-950 shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent"
              )}
            >
              <scene.icon size={16} className={clsx(gameState.current_scene === scene.id ? "text-zinc-950" : "text-zinc-500 group-hover:text-zinc-300")} />
              <span className="truncate">{scene.label}</span>
              {gameState.current_scene === scene.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-zinc-950 shrink-0" />}
            </button>
          ))}




          <div className="mt-8 mb-4">
            <span className="px-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Administration</span>
          </div>
          <button onClick={() => router.push('/admin/users')} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all w-full text-left">
            <Shield size={16} className="text-zinc-500" />
            User Access
          </button>
          <button onClick={() => { setShowRoster(true); setIsMobileMenuOpen(false); }} className={clsx("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group w-full text-left", showRoster ? "bg-white text-zinc-950" : "text-zinc-400 hover:text-white hover:bg-zinc-900")}>
            <Users size={16} className={showRoster ? "text-zinc-950" : "text-zinc-500"} />
            Fighter Roster
          </button>
          <button onClick={() => { setShowSettings(true); setIsMobileMenuOpen(false); }} className={clsx("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group w-full text-left", showSettings ? "bg-white text-zinc-950" : "text-zinc-400 hover:text-white hover:bg-zinc-900")}>
            <Settings size={16} className={showSettings ? "text-zinc-950" : "text-zinc-500"} />
            Scenario Styles
          </button>
        </nav>

        <div className="p-4 border-t border-zinc-800 bg-zinc-900/20">
          <button
            onClick={() => setShowShare(true)}
            className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 hover:border-zinc-700 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                <QRCode value={`${typeof window !== 'undefined' ? window.location.origin : ''}/visor/${scenarioId}`} size={28} />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1.5">
                  <Share2 size={10} className="text-emerald-500" />
                  Live QR
                </p>
                <p className="text-xs text-white font-bold truncate tracking-tight group-hover:text-emerald-400 transition-colors">Share Online</p>
              </div>
            </div>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-zinc-950 overflow-hidden relative">
        <header className="hidden md:flex h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-950 shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-500">Tournament</span>
            <ChevronRight size={14} className="text-zinc-700" />
            <span className="font-semibold text-white">{scenario.name}</span>
          </div>
          <button
            onClick={handlePipToggle}
            className={clsx(
              "flex items-center gap-3 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border",
              pipWindow
                ? "bg-emerald-500 text-white border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700"
            )}
          >
            <div className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", pipWindow ? "bg-white" : "bg-emerald-500")} />
            {pipWindow ? 'LIVE STREAMING' : 'VIEW ON LIVE'}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-4 md:y-8">
            <section>
              <div className="flex flex-col xl:flex-row gap-4 md:gap-6 items-start">
                <AnimatePresence mode="wait">
                  {gameState.current_scene === 'SELECT' && (
                    <motion.div
                      key="select-controls-pane"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="w-full xl:w-48 shrink-0 space-y-4"
                    >
                      <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-4 shadow-xl">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Keys</span>
                            <button onClick={() => setControlsEnabled(!controlsEnabled)} className={clsx("relative w-10 h-5 rounded-full transition-colors", controlsEnabled ? "bg-emerald-500" : "bg-zinc-700")}>
                              <div className={clsx("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", controlsEnabled ? "left-6" : "left-1")} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block text-xs">Duplicates</span>
                            <button onClick={() => toggleDuplicates(!gameState.allow_duplicates)} className={clsx("relative w-10 h-5 rounded-full transition-colors", gameState.allow_duplicates ? "bg-blue-500" : "bg-zinc-700")}>
                              <div className={clsx("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", gameState.allow_duplicates ? "left-6" : "left-1")} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block text-xs">Random</span>
                            <button onClick={() => setRandomEnabled(!randomEnabled)} className={clsx("relative w-10 h-5 rounded-full transition-colors", randomEnabled ? "bg-purple-500" : "bg-zinc-700")}>
                              <div className={clsx("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", randomEnabled ? "left-6" : "left-1")} />
                            </button>
                          </div>
                        </div>
                        <button onClick={() => { resetGameState(); toast.info("Reset successful"); }} className="w-full py-2 bg-red-500/10 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-500/20">
                          Reset Selection
                        </button>

                        {/* Random Selection Buttons */}
                        {randomEnabled && (
                          <div className="space-y-2 pt-2 border-t border-zinc-700">
                            <button
                              onClick={() => handleRandomSelect('p1')}
                              disabled={isRandomizing !== null}
                              className={clsx(
                                "w-full py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                isRandomizing === 'p1'
                                  ? "bg-emerald-500 text-white animate-pulse"
                                  : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30",
                                isRandomizing !== null && isRandomizing !== 'p1' && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              <Shuffle size={14} />
                              {isRandomizing === 'p1' ? 'Randomizing P1...' : 'Random P1'}
                            </button>

                            <button
                              onClick={() => handleRandomSelect('p2')}
                              disabled={isRandomizing !== null}
                              className={clsx(
                                "w-full py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                isRandomizing === 'p2'
                                  ? "bg-red-500 text-white animate-pulse"
                                  : "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30",
                                isRandomizing !== null && isRandomizing !== 'p2' && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              <Shuffle size={14} />
                              {isRandomizing === 'p2' ? 'Randomizing P2...' : 'Random P2'}
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {gameState.current_scene === 'PRESENTATION' && (
                    <motion.div
                      key="presentation-controls-pane"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="w-full xl:w-48 shrink-0 space-y-4"
                    >
                      <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl space-y-4 shadow-xl">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Biographic Focus</span>
                          <button onClick={() => setControlsEnabled(!controlsEnabled)} className={clsx("relative w-10 h-5 rounded-full transition-colors", controlsEnabled ? "bg-emerald-500" : "bg-zinc-700")}>
                            <div className={clsx("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", controlsEnabled ? "left-6" : "left-1")} />
                          </button>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          {characters.map((char, index) => (
                            <button key={char.id} onClick={() => { updatePresentationCursor(index); updatePresentationChar(char.id); }} className={clsx("aspect-square rounded border-2 transition-all overflow-hidden", (gameState.presentation_char_id === char.id) ? "border-emerald-500 scale-110 z-10" : "border-transparent")}>
                              <img src={char.icon_face} className={clsx("w-full h-full object-cover", gameState.presentation_char_id !== char.id && "grayscale")} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {gameState.current_scene === 'WINNER' && (
                    <motion.div
                      key="winner-controls-pane"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="w-full xl:w-48 shrink-0 space-y-4"
                    >
                      <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-4 shadow-xl">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Select Winner</span>
                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              if (p1Char) {
                                setWinner(p1Char.id);
                                toast.success(`${p1Char.name} declared winner!`);
                              }
                            }}
                            disabled={!p1Char}
                            className={clsx(
                              "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all border-2",
                              gameState.winner_id === p1Char?.id
                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                                : "border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 hover:border-zinc-700",
                              !p1Char && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            {p1Char?.icon_face && (
                              <img src={p1Char.icon_face} className="w-8 h-8 rounded border border-zinc-700 object-cover" />
                            )}
                            <div className="flex-1 text-left">
                              <div className="font-bold text-xs truncate">{p1Char?.name || 'No P1'}</div>
                            </div>
                            {gameState.winner_id === p1Char?.id && (
                              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            )}
                          </button>

                          <button
                            onClick={() => {
                              if (p2Char) {
                                setWinner(p2Char.id);
                                toast.success(`${p2Char.name} declared winner!`);
                              }
                            }}
                            disabled={!p2Char}
                            className={clsx(
                              "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all border-2",
                              gameState.winner_id === p2Char?.id
                                ? "bg-red-500/20 border-red-500 text-red-400"
                                : "border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 hover:border-zinc-700",
                              !p2Char && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            {p2Char?.icon_face && (
                              <img src={p2Char.icon_face} className="w-8 h-8 rounded border border-zinc-700 object-cover" />
                            )}
                            <div className="flex-1 text-left">
                              <div className="font-bold text-xs truncate">{p2Char?.name || 'No P2'}</div>
                            </div>
                            {gameState.winner_id === p2Char?.id && (
                              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            )}
                          </button>

                          {gameState.winner_id && (
                            <button
                              onClick={() => {
                                setWinner(null);
                                toast.info('Winner deselected');
                              }}
                              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-zinc-700 text-zinc-500 hover:text-white hover:bg-zinc-900 mt-2"
                            >
                              <RefreshCcw size={12} />
                              <span>Clear</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex-1 relative bg-black rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden ring-1 ring-white/5 group">
                  {/* Maintain 16:9 aspect ratio but allow content to scale properly */}
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <div className="absolute inset-0 z-0" key={gameState.current_scene + '-' + (gameState.p1_selected_id || 'p1none') + '-' + (gameState.p2_selected_id || 'p2none')}>
                      <SceneManager gameState={gameState} characters={characters} scenario={scenario} />
                    </div>
                  </div>

                  {/* Scene indicator overlay */}
                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg border border-white/10">
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                      {gameState.current_scene}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Player 1', key: 'p1', char: p1Char, locked: gameState.p1_locked },
                { label: 'Player 2', key: 'p2', char: p2Char, locked: gameState.p2_locked }
              ].map(p => (
                <div key={`player-card-${p.key}`} className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 backdrop-blur relative overflow-hidden group">
                  <div className="flex items-center gap-6 relative z-10">
                    <div className="w-20 h-20 rounded-xl bg-zinc-800 border border-white/10 overflow-hidden shadow-lg shrink-0">
                      {p.char ? <img src={p.char.icon_face} className={clsx("w-full h-full object-cover", p.locked ? "" : "grayscale")} /> : <div className="w-full h-full flex items-center justify-center text-zinc-700"><Users size={32} /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={clsx("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded", p.locked ? "text-emerald-400 bg-emerald-500/10" : "text-blue-400 bg-blue-500/10")}>
                        {p.label} {p.locked ? 'LOCKED' : 'SELECTING'}
                      </span>
                      <h3 className="text-2xl font-bold tracking-tight text-white mb-1 truncate">{p.char?.name || 'Awaiting...'}</h3>
                      <p className="text-xs text-zinc-500">{p.locked ? 'Ready for combat' : 'Selecting fighter...'}</p>
                    </div>

                    {/* Mouse Controls Overlay */}
                    {gameState.current_scene === 'SELECT' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleMove(p.key as 'p1' | 'p2', 'LEFT')}
                          disabled={p.locked}
                          className="p-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl border border-white/5 transition-all active:scale-95"
                          title="Move Left"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          onClick={() => handleMove(p.key as 'p1' | 'p2', 'RIGHT')}
                          disabled={p.locked}
                          className="p-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl border border-white/5 transition-all active:scale-95"
                          title="Move Right"
                        >
                          <ChevronRight size={20} />
                        </button>
                        <button
                          onClick={() => handleSelect(p.key as 'p1' | 'p2')}
                          className={clsx(
                            "p-3 rounded-xl border transition-all active:scale-95",
                            p.locked ? "bg-emerald-500 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-zinc-800 text-white border-white/5 hover:bg-zinc-700"
                          )}
                          title={p.locked ? "Unlock" : "Lock Selection"}
                        >
                          <CheckSquare size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </section>

            {/* Keyboard Legend */}

            {gameState.current_scene === 'SELECT' && (
              <section className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Live Keyboard Mappings</h4>
                    <p className="text-xs text-zinc-400">Low-latency binary shortcuts for instant selection</p>
                  </div>
                  <div className="flex flex-wrap gap-8">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-bold text-red-500 uppercase">P1 Control</span>
                      <div className="flex gap-2">
                        {['A', 'D', 'E'].map(k => (
                          <kbd key={k} className="px-2 py-1 bg-zinc-800 border-b-2 border-zinc-950 rounded text-[10px] font-bold text-white min-w-[24px] text-center">{k}</kbd>
                        ))}
                      </div>
                    </div>
                    <div className="w-px h-8 bg-zinc-800 hidden md:block" />
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-bold text-blue-500 uppercase">P2 Control</span>
                      <div className="flex gap-2">
                        {['J', 'L', 'O'].map(k => (
                          <kbd key={k} className="px-2 py-1 bg-zinc-800 border-b-2 border-zinc-950 rounded text-[10px] font-bold text-white min-w-[24px] text-center">{k}</kbd>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {false && (

              <section className="p-8 rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/10 flex flex-col items-center justify-center text-center">
                <h2 className="text-sm font-bold text-zinc-300 mb-4 uppercase tracking-widest">Engine Diagnostics</h2>
                <div className="flex gap-4">
                  <button onClick={() => fetchData()} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-semibold text-white transition-all flex items-center gap-2">
                    <RefreshCcw size={14} /> Full Sync
                  </button>
                  <button onClick={() => { updateCursors(0, 0); toast.info("Cursors reset"); }} className="px-4 py-2 border border-zinc-800 hover:bg-zinc-900 rounded-lg text-xs font-semibold text-zinc-400 transition-all">
                    Reset Cursors
                  </button>
                </div>
              </section>
            )}
          </div>
        </div >

        <footer className="h-10 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between px-4 md:px-8 text-[10px] font-mono text-zinc-500 shrink-0">
          <div className="flex gap-4 md:gap-6">
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> <span className="hidden sm:inline">Database</span> Synced</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> <span className="hidden sm:inline">Realtime</span> Active</span>
          </div>
          <div className="truncate ml-4 font-bold uppercase tracking-wider">FightControl Stable</div>
        </footer>

        {/* OVERLAYS - MOVED TO END OF MAIN TO PREVENT SIDEBAR BLOCKING */}
        <RosterManager scenarioId={scenarioId} isOpen={showRoster} onClose={() => setShowRoster(false)} onRefresh={fetchData} />
        <div className="z-[200]">
          <ScenarioSettings scenarioId={scenarioId} isOpen={showSettings} onClose={() => setShowSettings(false)} onRefresh={fetchData} />
          <ShareModal scenarioId={scenarioId} isOpen={showShare} onClose={() => setShowShare(false)} />
        </div>
      </main >

      {pipWindow && createPortal(
        <div className="pip-container group relative">
          <div
            className="w-[1920px] h-[1080px] shrink-0 origin-center relative transition-transform duration-75"
            style={{
              transform: `scale(min(${pipDimensions.width / 1920}, ${pipDimensions.height / 1080}))`
            }}
          >
            <SceneManager gameState={gameState} characters={characters} scenario={scenario} />
          </div>

          <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-50 flex gap-2">
            <button
              onClick={() => {
                if (!pipWindow) return;

                // Check if window is already maximized
                const isMaximized = pipWindow.outerWidth >= window.screen.availWidth - 20 &&
                  pipWindow.outerHeight >= window.screen.availHeight - 20;

                if (isMaximized) {
                  // Restore to default size
                  pipWindow.resizeTo(1280, 720);
                  pipWindow.moveTo(
                    (window.screen.availWidth - 1280) / 2,
                    (window.screen.availHeight - 720) / 2
                  );
                } else {
                  // Maximize to full screen
                  pipWindow.resizeTo(window.screen.availWidth, window.screen.availHeight);
                  pipWindow.moveTo(0, 0);
                }
              }}
              className="p-3 bg-zinc-900/80 backdrop-blur border border-white/10 text-white rounded-xl hover:bg-white hover:text-black transition-all shadow-xl"
              title="Maximize Window"
            >
              <Maximize size={20} />
            </button>
          </div>
        </div>,
        pipWindow.document.body
      )
      }
    </div >
  );
}
