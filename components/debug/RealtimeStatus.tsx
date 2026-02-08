'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Wifi, WifiOff } from 'lucide-react';

interface RealtimeStatusProps {
  scenarioId: string;
}

export const RealtimeStatus = ({ scenarioId }: RealtimeStatusProps) => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState(0);

  useEffect(() => {
    console.log('🔌 Initializing Realtime Status Monitor...');

    const channel = supabase
      .channel(`debug_game_state_${scenarioId}`)
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'game_state',
          filter: `scenario_id=eq.${scenarioId}`,
        },
        (payload: any) => {
          console.log('✅ Realtime Update Received:', payload);
          setStatus('connected');
          setLastUpdate(new Date());
          setUpdateCount(prev => prev + 1);
        }
      )
      .subscribe((status) => {
        console.log('📡 Channel Status:', status);
        if (status === 'SUBSCRIBED') {
          setStatus('connected');
          console.log('✅ Successfully subscribed to Realtime!');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setStatus('error');
          console.error('❌ Realtime connection failed:', status);
        }
      });

    return () => {
      console.log('🔌 Cleaning up Realtime connection...');
      supabase.removeChannel(channel);
    };
  }, [scenarioId]);

  return (
    <div className="fixed bottom-4 right-4 z-[999] bg-zinc-900/90 backdrop-blur border border-zinc-800 rounded-xl p-4 text-white shadow-2xl max-w-xs">
      <div className="flex items-center gap-3 mb-2">
        {status === 'connected' ? (
          <Wifi size={20} className="text-green-500 animate-pulse" />
        ) : status === 'error' ? (
          <WifiOff size={20} className="text-red-500" />
        ) : (
          <Wifi size={20} className="text-yellow-500 animate-pulse" />
        )}
        <span className="font-bold text-sm uppercase tracking-wider">
          {status === 'connected' ? 'Realtime Active' : status === 'error' ? 'Realtime Error' : 'Connecting...'}
        </span>
      </div>

      <div className="space-y-1 text-xs text-zinc-400">
        <div className="flex justify-between">
          <span>Updates:</span>
          <span className="font-mono text-white">{updateCount}</span>
        </div>
        {lastUpdate && (
          <div className="flex justify-between">
            <span>Last:</span>
            <span className="font-mono text-white">{lastUpdate.toLocaleTimeString()}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Scenario:</span>
          <span className="font-mono text-white truncate max-w-[100px]">{scenarioId.slice(0, 8)}...</span>
        </div>
      </div>

      {status === 'error' && (
        <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-400">
          ⚠️ Check console (F12) for details
        </div>
      )}
    </div>
  );
};
