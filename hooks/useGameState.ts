import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { GameState, SceneType } from '@/types';

export const useGameState = (scenarioId: string) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchState = async () => {
      let { data, error } = await supabase
        .from('game_state')
        .select('*')
        .eq('scenario_id', scenarioId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching game state:', error);
      } else if (!data) {
        // Auto-create if doesn't exist
        const { data: newData, error: insertError } = await supabase
          .from('game_state')
          .insert({ scenario_id: scenarioId, current_scene: 'INTRO' })
          .select()
          .single();

        if (insertError) console.error('Error creating state:', insertError);
        else setGameState(newData);
      } else {
        setGameState(data);
      }
      setLoading(false);
    };

    fetchState();

    // Subscribe to changes
    const channel = supabase
      .channel(`game_state_${scenarioId}`)
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'game_state',
          filter: `scenario_id=eq.${scenarioId}`,
        },
        (payload: any) => {
          if (payload.new) {
            setGameState(payload.new as GameState);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [scenarioId]);

  const updateScene = async (scene: SceneType) => {
    if (!gameState) return;

    // Optimistic update
    setGameState(prev => prev ? { ...prev, current_scene: scene } : null);

    const { error } = await supabase
      .from('game_state')
      .update({ current_scene: scene })
      .eq('id', gameState.id);

    if (error) {
      console.error('Error updating scene:', error);
      // Revert on error if necessary (the subscription will also sync)
    }
  };

  const updateCursors = async (p1Idx: number, p2Idx: number) => {
    if (!gameState) return;

    // Optimistic
    setGameState(prev => prev ? { ...prev, p1_cursor_index: p1Idx, p2_cursor_index: p2Idx } : null);

    const { error } = await supabase
      .from('game_state')
      .update({ p1_cursor_index: p1Idx, p2_cursor_index: p2Idx })
      .eq('id', gameState.id);

    if (error) console.error('Error updating cursors:', error);
  };

  const selectCharacter = async (player: 'p1' | 'p2', characterId: string | null) => {
    if (!gameState) return;
    const field = player === 'p1' ? 'p1_selected_id' : 'p2_selected_id';

    // Optimistic
    setGameState(prev => prev ? { ...prev, [field]: characterId } : null);

    const { error } = await supabase
      .from('game_state')
      .update({ [field]: characterId })
      .eq('id', gameState.id);

    if (error) console.error('Error selecting character:', error);
  };

  const updatePresentationChar = async (characterId: string | null) => {
    if (!gameState) return;

    // Optimistic
    setGameState(prev => prev ? { ...prev, presentation_char_id: characterId } : null);

    const { error } = await supabase
      .from('game_state')
      .update({ presentation_char_id: characterId })
      .eq('id', gameState.id);

    if (error) console.error('Error updating presentation:', error);
  };

  const lockCharacter = async (player: 'p1' | 'p2', characterId: string | null, locked: boolean) => {
    if (!gameState) return;
    const idField = player === 'p1' ? 'p1_selected_id' : 'p2_selected_id';
    const lockField = player === 'p1' ? 'p1_locked' : 'p2_locked';

    // Optimistic
    setGameState(prev => prev ? { ...prev, [idField]: characterId, [lockField]: locked } : null);

    const { error } = await supabase
      .from('game_state')
      .update({ [idField]: characterId, [lockField]: locked })
      .eq('id', gameState.id);

    if (error) console.error('Error locking character:', error);
  };

  const updatePresentationCursor = async (index: number) => {
    if (!gameState) return;

    // Optimistic
    setGameState(prev => prev ? { ...prev, presentation_cursor_index: index } : null);

    const { error } = await supabase
      .from('game_state')
      .update({ presentation_cursor_index: index })
      .eq('id', gameState.id);

    if (error) console.error('Error updating presentation cursor:', error);
  };

  const toggleDuplicates = async (enabled: boolean) => {
    if (!gameState) return;

    // Optimistic
    setGameState(prev => prev ? { ...prev, allow_duplicates: enabled } : null);

    const { error } = await supabase
      .from('game_state')
      .update({ allow_duplicates: enabled })
      .eq('id', gameState.id);

    if (error) console.error('Error toggling duplicates:', error);
  };

  const setWinner = async (characterId: string | null) => {
    if (!gameState) return;

    // Optimistic
    setGameState(prev => prev ? { ...prev, winner_id: characterId } : null);

    const { error } = await supabase
      .from('game_state')
      .update({ winner_id: characterId })
      .eq('id', gameState.id);

    if (error) console.error('Error setting winner:', error);
  };

  const resetGameState = async () => {
    if (!gameState) return;

    const resetData = {
      p1_selected_id: null,
      p2_selected_id: null,
      p1_locked: false,
      p2_locked: false,
      p1_cursor_index: 0,
      p2_cursor_index: 0,
      winner_id: null,
      presentation_char_id: null,
      presentation_cursor_index: 0
    };

    // Optimistic
    setGameState(prev => prev ? { ...prev, ...resetData } : null);

    const { error } = await supabase
      .from('game_state')
      .update(resetData)
      .eq('id', gameState.id);

    if (error) console.error('Error resetting game state:', error);
  };

  return {
    gameState,
    loading,
    updateScene,
    updateCursors,
    selectCharacter,
    updatePresentationChar,
    updatePresentationCursor,
    lockCharacter,
    toggleDuplicates,
    setWinner,
    resetGameState
  };
};
