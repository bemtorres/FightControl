'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Scenario } from '@/types';
import {
  X,
  Copy,
  Check,
  Globe,
  Lock,
  ExternalLink,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';
import clsx from 'clsx';

interface ShareModalProps {
  scenarioId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal = ({ scenarioId, isOpen, onClose }: ShareModalProps) => {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchScenario();
    }
  }, [isOpen, scenarioId]);

  const fetchScenario = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('scenarios')
      .select('*')
      .eq('id', scenarioId)
      .single();

    if (data) setScenario(data);
    setLoading(false);
  };

  const updateSettings = async (updates: any) => {
    const newSettings = {
      ...(scenario?.settings || {}),
      ...updates
    };

    const { error } = await supabase
      .from('scenarios')
      .update({ settings: newSettings })
      .eq('id', scenarioId);

    if (error) {
      toast.error('Failed to update share settings');
    } else {
      setScenario(prev => prev ? { ...prev, settings: newSettings } : null);
      toast.success('Settings updated');
    }
  };

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/visor/${scenarioId}`
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <header className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Globe size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-none">Share Event Online</h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Observer Live View</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </header>

        <div className="p-8 space-y-8">
          <div className="flex flex-col items-center gap-6">
            <div className="p-4 bg-white rounded-3xl shadow-2xl shadow-emerald-500/10">
              <QRCode value={shareUrl} size={180} />
            </div>

            <div className="w-full space-y-3">
              <div className="flex items-center gap-2 p-1.5 bg-black/40 border border-zinc-800 rounded-2xl">
                <div className="flex-1 truncate pl-3 text-sm text-zinc-400 font-mono">
                  {shareUrl}
                </div>
                <button
                  onClick={handleCopy}
                  className="p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all"
                >
                  {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
              </div>
              <a
                href={shareUrl}
                target="_blank"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-white text-zinc-950 font-bold text-sm hover:bg-zinc-200 transition-all"
              >
                <ExternalLink size={16} /> Open Public Link
              </a>
            </div>
          </div>

          <div className="space-y-4 border-t border-zinc-800 pt-8">
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className={clsx(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                  scenario?.settings?.is_public ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-500"
                )}>
                  <Eye size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Public Access</p>
                  <p className="text-[10px] text-zinc-500">Anyone with the link can view</p>
                </div>
              </div>
              <button
                onClick={() => updateSettings({ is_public: !scenario?.settings?.is_public })}
                className={clsx(
                  "relative w-12 h-6 rounded-full transition-all duration-300",
                  scenario?.settings?.is_public ? "bg-emerald-500" : "bg-zinc-700"
                )}
              >
                <div className={clsx(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm",
                  scenario?.settings?.is_public ? "left-7" : "left-1"
                )} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    scenario?.settings?.access_key ? "bg-blue-500/10 text-blue-500" : "bg-zinc-800 text-zinc-500"
                  )}>
                    <Shield size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Access Key</p>
                    <p className="text-[10px] text-zinc-500">Require a code to enter</p>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <input
                  type={showKey ? "text" : "password"}
                  value={scenario?.settings?.access_key || ''}
                  onChange={(e) => updateSettings({ access_key: e.target.value })}
                  placeholder="Set access key..."
                  className="w-full bg-black/40 border border-zinc-800 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-zinc-600 hover:text-zinc-400"
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <footer className="p-6 bg-black/40 border-t border-zinc-800 text-center">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
            FightControl v1.0
          </p>
        </footer>
      </div>
    </div>
  );
};
