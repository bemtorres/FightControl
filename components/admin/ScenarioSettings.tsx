'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Scenario } from '@/types';
import {
  X,
  Save,
  Image as ImageIcon,
  Type,
  Palette,
  Layout,
  Upload,
  RefreshCcw,
  Settings2
} from 'lucide-react';
import { toast } from 'sonner';
import clsx from 'clsx';
import { ImageUploadModal } from '@/components/ui/ImageUploadModal';

interface ScenarioSettingsProps {
  scenarioId: string;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const ScenarioSettings = ({ scenarioId, isOpen, onClose, onRefresh }: ScenarioSettingsProps) => {
  const [scenario, setScenario] = useState<Partial<Scenario>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<keyof Scenario | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fonts = [
    { name: 'Sans (Inter)', value: 'font-sans' },
    { name: 'Serif (Playfair)', value: 'font-serif' },
    { name: 'Mono (JetBrains)', value: 'font-mono' },
    { name: 'Gaming (Russo One)', value: 'font-russo' },
    { name: 'Retro (Press Start 2P)', value: 'font-press-start' },
  ];

  useEffect(() => {
    if (isOpen) {
      fetchScenario();
    }
  }, [isOpen, scenarioId]);

  const fetchScenario = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('scenarios')
      .select('*')
      .eq('id', scenarioId)
      .single();

    if (error) {
      console.error('Fetch scenario error:', error);
      toast.error('Failed to load scenario data');
    } else if (data) {
      setScenario(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('scenarios')
      .update({
        name: scenario.name,
        background_url: scenario.background_url,
        tournament_logo: scenario.tournament_logo,
        chroma_key_color: scenario.chroma_key_color,
        // @ts-ignore - font_family might not be in types yet
        font_family: scenario.font_family || 'font-sans'
      })
      .eq('id', scenarioId);

    if (error) {
      console.error('Save error:', error);
      toast.error('Failed to update settings: ' + error.message);
    } else {
      toast.success('Scenario settings updated');
      onRefresh();
      onClose();
    }
    setSaving(false);
  };

  const handleUpload = async (file: File, field: keyof Scenario) => {
    // Sanitize filename to avoid issues with special characters
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `scenarios/${scenarioId}/${fileName}`;

    const uploadProcess = async () => {
      const { data, error: uploadError } = await supabase.storage.from('assets').upload(filePath, file, {
        upsert: true
      });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(uploadError.message);
      }

      const { data: urlData } = supabase.storage.from('assets').getPublicUrl(filePath);
      return urlData.publicUrl;
    };

    toast.promise(uploadProcess(), {
      loading: 'Uploading image...',
      success: (url) => {
        setScenario(prev => ({ ...prev, [field]: url }));
        return 'Asset uploaded successfully';
      },
      error: (err) => `Upload failed: ${err.message || 'Unknown error'}`
    });
  };

  const handleUrlSelect = (url: string) => {
    if (uploadTarget) {
      setScenario(prev => ({ ...prev, [uploadTarget]: url }));
      toast.success('External image linked');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-150 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out">
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-950/50 backdrop-blur shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
              <Settings2 size={16} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white leading-none">Scenario Settings</h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Design & Configuration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          {/* Base Info */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Layout size={14} className="text-zinc-500" />
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">General Identity</h3>
            </div>
            <div className="grid gap-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Tournament Name</label>
              <input
                value={scenario.name || ''}
                onChange={e => setScenario({ ...scenario, name: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                placeholder="Ultimate Fighter League"
              />
            </div>
          </section>

          {/* Visual Assets */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon size={14} className="text-zinc-500" />
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Visual Assets</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block px-1">Logo</label>
                <div className="aspect-video bg-zinc-900 border border-zinc-800 rounded-2xl relative overflow-hidden group flex items-center justify-center">
                  {scenario.tournament_logo ? (
                    <img src={scenario.tournament_logo} className="w-full h-full object-contain p-4" />
                  ) : (
                    <ImageIcon size={24} className="text-zinc-800" />
                  )}
                  <div
                    onClick={() => {
                      setUploadTarget('tournament_logo');
                      setShowUploadModal(true);
                    }}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  >
                    <Upload size={18} className="text-white" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block px-1">Background</label>
                <div className="aspect-video bg-zinc-900 border border-zinc-800 rounded-2xl relative overflow-hidden group flex items-center justify-center">
                  {scenario.background_url ? (
                    <img src={scenario.background_url} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={24} className="text-zinc-800" />
                  )}
                  <div
                    onClick={() => {
                      setUploadTarget('background_url');
                      setShowUploadModal(true);
                    }}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  >
                    <Upload size={18} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <ImageUploadModal
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            onUpload={(file) => uploadTarget && handleUpload(file, uploadTarget)}
            onUrlSelect={handleUrlSelect}
            title={uploadTarget === 'tournament_logo' ? "Tournament Logo" : "Scenario Background"}
          />

          {/* Typography & Color */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Type size={14} className="text-zinc-500" />
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Typography & Theme</h3>
            </div>

            <div className="grid gap-3">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Selected Font Family</label>
              <div className="grid grid-cols-1 gap-2">
                {fonts.map(f => (
                  <button
                    key={f.value}
                    // @ts-ignore
                    onClick={() => setScenario({ ...scenario, font_family: f.value })}
                    className={clsx(
                      "flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left",
                      // @ts-ignore
                      scenario.font_family === f.value || (!scenario.font_family && f.value === 'font-sans')
                        ? "bg-white border-white text-zinc-950"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    )}
                  >
                    <span className={clsx("text-sm", f.value)}>{f.name}</span>
                    {/* @ts-ignore */}
                    {(scenario.font_family === f.value || (!scenario.font_family && f.value === 'font-sans')) && <RefreshCcw size={14} className="animate-spin-slow" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Chroma Key Color (Overlays)</label>
              <div className="flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
                <input
                  type="color"
                  value={scenario.chroma_key_color || '#00FF00'}
                  onChange={e => setScenario({ ...scenario, chroma_key_color: e.target.value })}
                  className="w-12 h-12 bg-transparent border-none rounded cursor-pointer"
                />
                <div className="flex-1">
                  <p className="text-sm font-mono text-white">{scenario.chroma_key_color || '#00FF00'}</p>
                  <p className="text-[10px] text-zinc-500 uppercase mt-1">Used for transparency in OBS</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className="p-8 border-t border-zinc-800 bg-zinc-950 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-white text-zinc-950 px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 disabled:opacity-50"
          >
            {saving ? <RefreshCcw className="animate-spin" size={18} /> : <Save size={18} />}
            Save Settings
          </button>
        </footer>
      </div>
    </div>
  );
};
