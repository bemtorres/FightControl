'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { Character, Scenario } from '@/types';
import { ArrowLeft, Save, Upload, Trash2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { toast } from 'sonner';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ShareModal } from '@/components/admin/ShareModal';
import { Share2 } from 'lucide-react';

export default function RosterPage({ params }: { params: Promise<{ scenarioId: string }> }) {
  const { scenarioId } = use(params);
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [editingChar, setEditingChar] = useState<Partial<Character> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    fetchData();
  }, [scenarioId]);

  const fetchData = async () => {
    setLoading(true);
    const { data: scen } = await supabase.from('scenarios').select('*').eq('id', scenarioId).single();
    const { data: chars } = await supabase.from('characters').select('*').eq('scenario_id', scenarioId).order('name');

    if (scen) setScenario(scen);
    if (chars) setCharacters(chars);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editingChar || !editingChar.name) {
      toast.warning("Character name is required");
      return;
    }

    const performSave = async () => {
      let result;
      if (editingChar.id) {
        result = await supabase.from('characters').update({
          name: editingChar.name,
          description: editingChar.description,
          icon_face: editingChar.icon_face,
          side_view_combat: editingChar.side_view_combat,
          victory_pose: editingChar.victory_pose
        }).eq('id', editingChar.id);
      } else {
        result = await supabase.from('characters').insert({
          scenario_id: scenarioId,
          name: editingChar.name,
          description: editingChar.description || 'New Challenger',
          icon_face: editingChar.icon_face || 'https://placehold.co/200',
          side_view_combat: editingChar.side_view_combat || 'https://placehold.co/400x800',
          victory_pose: editingChar.victory_pose || 'https://placehold.co/800x600'
        });
      }

      if (result.error) throw result.error;
      return result.data;
    };

    toast.promise(performSave(), {
      loading: 'Saving character...',
      success: () => {
        setEditingChar(null);
        fetchData();
        return `Character saved successfully!`;
      },
      error: (err) => `Error: ${err.message || 'Check database permissions'}`
    });
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  }

  const confirmDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase.from('characters').delete().eq('id', deleteId);

    if (error) {
      toast.error(`Delete failed: ${error.message}`);
    } else {
      toast.success("Character deleted");
      setEditingChar(null);
      fetchData();
    }
    setDeleteId(null);
  };

  const handleUpload = async (file: File, field: keyof Character) => {
    if (!editingChar) return;
    const filePath = `${scenarioId}/${Date.now()}_${file.name}`;

    const uploadPromise = supabase.storage.from('assets').upload(filePath, file);

    toast.promise(uploadPromise, {
      loading: 'Uploading asset...',
      success: async () => {
        const { data } = supabase.storage.from('assets').getPublicUrl(filePath);
        setEditingChar(prev => prev ? ({ ...prev, [field]: data.publicUrl }) : null);
        return 'Upload complete';
      },
      error: 'Upload failed'
    });
  }

  if (loading) return <div className="p-8 text-white">Loading Roster Data...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Header logic remains same... */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push(`/`)} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-all">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-white leading-none">
              {editingChar?.id ? editingChar.name : 'Roster Management'}
            </h1>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">
              {editingChar?.id ? 'Fighter Profile / Editor' : `Scenario: ${scenario?.name || 'Loading...'}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editingChar && (
            <button
              onClick={handleSave}
              className="hidden md:flex bg-emerald-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-emerald-500 transition-all items-center gap-2 text-sm shadow-lg shadow-emerald-500/20"
            >
              <Save size={16} /> Save Changes
            </button>
          )}
          <button
            onClick={() => setShowShare(true)}
            className="bg-zinc-900 text-white border border-zinc-800 font-medium px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-2 text-sm"
          >
            <Share2 size={16} className="text-emerald-500" /> Share
          </button>
          <button
            onClick={() => setEditingChar({ scenario_id: scenarioId })}
            className="bg-white text-zinc-950 font-bold px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-2 text-sm"
          >
            <Plus size={16} /> Add Fighter
          </button>
        </div>
      </header>


      <div className="max-w-7xl mx-auto p-6 flex gap-8 h-[calc(100vh-80px)]">
        {/* LIST SIDEBAR */}
        <div className="w-80 shrink-0 flex flex-col border-r border-zinc-800 pr-6 overflow-y-auto">
          {/* ... List Logic ... */}
          <h2 className="text-xs font-semibold uppercase text-zinc-500 mb-4 tracking-wider">Fighters ({characters.length})</h2>
          <div className="space-y-2">
            {characters.map(char => (
              <div
                key={char.id}
                onClick={() => setEditingChar(char)}
                className={`p-3 rounded-lg border flex items-center gap-3 cursor-pointer transition-all group ${editingChar?.id === char.id
                  ? 'bg-zinc-900 border-zinc-700 ring-1 ring-zinc-700'
                  : 'bg-transparent border-transparent hover:bg-zinc-900 hover:border-zinc-800'
                  }`}
              >
                <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden ring-1 ring-white/10 shrink-0">
                  <img src={char.icon_face} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h3 className={`text-sm font-medium truncate ${editingChar?.id === char.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>{char.name}</h3>
                  <p className="text-xs text-zinc-600 truncate">{char.description || 'No bio'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* EDITOR MAIN AREA */}
        <div className="flex-1 overflow-y-auto pl-2">
          {editingChar ? (
            <div className="max-w-3xl mx-auto space-y-8 pb-20">
              <div className="flex justify-between items-start border-b border-zinc-800 pb-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
                    {editingChar.id ? editingChar.name : 'New Character'}
                  </h2>
                  <p className="text-zinc-400 text-sm">Update profile details, stats, and assets.</p>
                </div>
                {editingChar.id && (
                  <button
                    onClick={() => handleDelete(editingChar.id!)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10 px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                )}
              </div>

              {/* Form Inputs (Same as before) */}
              <div className="space-y-6">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-zinc-300">Display Name</label>
                  <input
                    value={editingChar.name || ''}
                    onChange={e => setEditingChar({ ...editingChar, name: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all font-sans"
                    placeholder="e.g. Ryu"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-zinc-300">Biography / Description</label>
                  <textarea
                    value={editingChar.description || ''}
                    onChange={e => setEditingChar({ ...editingChar, description: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-4 py-3 min-h-[120px] text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all resize-y"
                    placeholder="Character backstory exposed in presentation scene..."
                  />
                </div>
              </div>

              {/* Assets Grid (Same as before) */}
              <div>
                <h3 className="text-sm font-medium text-zinc-300 mb-4">Visual Assets</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Icon (Square)', field: 'icon_face', desc: 'Used in HUD & Select' },
                    { label: 'Combat Sprite (Side)', field: 'side_view_combat', desc: 'Transparent PNG for Versus' },
                    { label: 'Victory Art (Full)', field: 'victory_pose', desc: 'Wallpaper for Win screen' }
                  ].map((item) => (
                    <div key={item.field} className="space-y-3">
                      <div className="flex justify-between items-baseline">
                        <label className="text-sm font-medium text-zinc-400">{item.label}</label>
                      </div>

                      <div className="aspect-[4/5] bg-zinc-900 border-2 border-dashed border-zinc-800 rounded-xl relative group overflow-hidden hover:border-zinc-600 transition-colors flex items-center justify-center">
                        {editingChar[item.field as keyof Character] ? (
                          <img src={editingChar[item.field as keyof Character] as string} className="w-full h-full object-contain p-2" />
                        ) : (
                          <div className="text-zinc-700 flex flex-col items-center gap-2">
                            <Upload size={24} />
                            <span className="text-xs font-mono">NO ASSET</span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                          <Upload className="mb-2 text-white" size={20} />
                          <span className="text-xs font-medium text-white">Click to Upload</span>
                          <input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => {
                              if (e.target.files?.[0]) handleUpload(e.target.files[0], item.field as keyof Character);
                            }}
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-500">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-800">
                <button
                  onClick={handleSave}
                  className="px-8 py-3 bg-white text-black font-medium rounded-md hover:bg-zinc-200 transition-colors flex items-center gap-2 shadow-lg shadow-white/5"
                >
                  <Save size={18} /> Save Changes
                </button>
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500">
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
                <Plus size={24} className="text-zinc-600" />
              </div>
              <h3 className="text-lg font-medium text-zinc-300">No fighter selected</h3>
              <p className="text-sm max-w-xs text-center mt-2">Select a fighter from the list to edit details or create a new challenger.</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Fighter?"
        message="Are you sure you want to remove this fighter from the roster? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        confirmText="Delete"
        isDestructive
      />

      <ShareModal
        scenarioId={scenarioId}
        isOpen={showShare}
        onClose={() => setShowShare(false)}
      />
    </div>
  );
}
