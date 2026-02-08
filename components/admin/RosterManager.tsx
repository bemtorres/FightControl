'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Character } from '@/types';
import {
  Trash2,
  Upload,
  Plus,
  Save,
  X,
  UserPlus,
  Search,
  ChevronRight,
  Gamepad2,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import clsx from 'clsx';
import { ImageEditorModal } from '@/components/ui/ImageEditorModal';
import { ImageUploadModal } from '@/components/ui/ImageUploadModal';

interface RosterManagerProps {
  scenarioId: string;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const RosterManager = ({ scenarioId, isOpen, onClose, onRefresh }: RosterManagerProps) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [editingChar, setEditingChar] = useState<Partial<Character> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Image Editing States
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [currentEditField, setCurrentEditField] = useState<keyof Character | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, scenarioId]);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('characters')
      .select('*')
      .eq('scenario_id', scenarioId)
      .order('name');

    if (data) setCharacters(data);
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
      loading: 'Saving fighter...',
      success: () => {
        setEditingChar(null);
        fetchData();
        onRefresh();
        return `Fighter saved successfully!`;
      },
      error: (err) => `Error: ${err.message || 'Check database permissions'}`
    });
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase.from('characters').delete().eq('id', deleteId);

    if (error) {
      toast.error(`Delete failed: ${error.message}`);
    } else {
      toast.success("Fighter removed from roster");
      setEditingChar(null);
      fetchData();
      onRefresh();
    }
    setDeleteId(null);
  };

  const processFile = (file: File, field: keyof Character) => {
    setOriginalFileName(file.name);
    setCurrentEditField(field);

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setEditingImage(reader.result as string);
    });
    reader.readAsDataURL(file);
  };

  const handleUrlSelect = (url: string) => {
    if (currentEditField && editingChar) {
      setEditingChar(prev => prev ? ({ ...prev, [currentEditField]: url }) : null);
      toast.success('External image linked');
    }
  };

  const handleUploadCropped = async (blob: Blob) => {
    if (!currentEditField || !editingChar) return;

    // Convert Blob to File
    const file = new File([blob], originalFileName, { type: 'image/png' });
    const filePath = `${scenarioId}/${Date.now()}_cropped_${originalFileName}`;

    setEditingImage(null); // Close modal

    const uploadPromise = supabase.storage.from('assets').upload(filePath, file);

    toast.promise(uploadPromise, {
      loading: 'Uploading optimized asset...',
      success: async () => {
        const { data } = supabase.storage.from('assets').getPublicUrl(filePath);
        setEditingChar(prev => prev ? ({ ...prev, [currentEditField]: data.publicUrl }) : null);
        setCurrentEditField(null);
        return 'Identity asset updated';
      },
      error: 'Upload failed'
    });
  };

  if (!isOpen) return null;

  const filteredCharacters = characters.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    // <div className="fixed inset-1 z-[150] flex justify-end">
    // un poco mas grande

    <div className="fixed inset-1 z-150 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Content Panel */}
      <div className="relative w-full max-w-4xl bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-950/50 backdrop-blur shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
              <Users size={16} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white leading-none">Roster Management</h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Scenario Operators</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* List Sidebar */}
          <div className="w-80 border-r border-zinc-800 flex flex-col shrink-0">
            <div className="p-4 border-b border-zinc-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                <input
                  type="text"
                  placeholder="Filter fighters..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <button
                onClick={() => setEditingChar({ scenario_id: scenarioId })}
                className="w-full p-3 rounded-xl border border-dashed border-zinc-800 hover:border-zinc-500 hover:bg-zinc-900/50 transition-all flex items-center justify-center gap-2 text-zinc-500 hover:text-white"
              >
                <Plus size={16} />
                <span className="text-sm font-medium">Add New Fighter</span>
              </button>

              {filteredCharacters.map(char => (
                <div
                  key={char.id}
                  onClick={() => setEditingChar(char)}
                  className={clsx(
                    "p-3 rounded-xl border transition-all cursor-pointer group flex items-center gap-3",
                    editingChar?.id === char.id
                      ? "bg-white border-white text-zinc-950 shadow-lg"
                      : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900"
                  )}
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-800 border border-black/10 shrink-0">
                    <img src={char.icon_face} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold truncate">{char.name}</h3>
                    <p className={clsx("text-[10px] truncate font-medium", editingChar?.id === char.id ? "text-zinc-600" : "text-zinc-500")}>
                      {char.description || 'No bio provided'}
                    </p>
                  </div>
                  <ChevronRight size={14} className={clsx("opacity-0 group-hover:opacity-100 transition-opacity", editingChar?.id === char.id ? "text-zinc-900" : "text-zinc-600")} />
                </div>
              ))}
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 overflow-y-auto p-8 bg-zinc-950/30">
            {editingChar ? (
              <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 uppercase-no">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-white">
                      {editingChar.id ? 'Edit Fighter' : 'New Challenger'}
                    </h3>
                    <p className="text-sm text-zinc-500">Configure visual assets and biography.</p>
                  </div>
                  {editingChar.id && (
                    <button
                      onClick={() => handleDelete(editingChar.id!)}
                      className="text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="grid gap-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Fighter Name</label>
                    <input
                      value={editingChar.name || ''}
                      onChange={e => setEditingChar({ ...editingChar, name: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                      placeholder="e.g. RYU"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Biography / Info</label>
                    <textarea
                      value={editingChar.description || ''}
                      onChange={e => setEditingChar({ ...editingChar, description: e.target.value })}
                      rows={3}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all resize-none"
                      placeholder="The eternal wanderer..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: 'Icon', field: 'icon_face', hint: '200x200 (Square)' },
                      { label: 'Combat', field: 'side_view_combat', hint: '1080x1920 • Face Right' },
                      { label: 'Victory', field: 'victory_pose', hint: '1920x1080 (Wide)' }
                    ].map(asset => (
                      <div key={asset.field} className="space-y-2">
                        <div className="flex flex-col gap-1 px-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em] block">{asset.label}</label>
                          <div className="flex items-center gap-1.5 py-1 px-2 bg-emerald-500/5 border border-emerald-500/10 rounded-md w-fit">
                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] text-emerald-500/80 font-bold uppercase tracking-wider">{asset.hint}</span>
                          </div>
                        </div>
                        <div className="aspect-square bg-zinc-900 border border-zinc-800 rounded-2xl relative overflow-hidden group hover:border-zinc-600 transition-colors flex items-center justify-center">
                          {editingChar[asset.field as keyof Character] ? (
                            <img src={editingChar[asset.field as keyof Character] as string} className="w-full h-full object-cover" />
                          ) : (
                            <Upload size={20} className="text-zinc-700" />
                          )}
                          <div
                            onClick={() => {
                              setCurrentEditField(asset.field as keyof Character);
                              setShowUploadModal(true);
                            }}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                          >
                            <Upload size={16} className="text-white" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-800 flex justify-end">
                  <button
                    onClick={handleSave}
                    className="bg-white text-zinc-950 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-zinc-200 transition-all shadow-xl shadow-white/5"
                  >
                    <Save size={18} />
                    {editingChar.id ? 'Update Profile' : 'Lock Fighter'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 opacity-20">
                <Users size={64} strokeWidth={1} className="mb-4" />
                <p className="text-sm font-bold uppercase tracking-[0.2em]">Select a challenger</p>
                <p className="text-xs mt-2">Manage your tournament roster entries.</p>
              </div>
            )}
          </div>
        </div>
      </div >

      <ConfirmModal
        isOpen={!!deleteId}
        title="Remove Fighter?"
        message="This will completely remove the fighter from this scenario. Previous game history using this fighter might be affected."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        confirmText="Remove Fighter"
        isDestructive
      />

      {/* IMAGE EDITOR OVERLAY */}
      <ImageEditorModal
        image={editingImage}
        aspect={currentEditField === 'icon_face' ? 1 : 1080 / 1920} // Adjusted for portrait combat arts
        onClose={() => {
          setEditingImage(null);
          setCurrentEditField(null);
        }}
        onSave={handleUploadCropped}
      />

      {/* NEW UPLOAD SOURCE MODAL */}
      <ImageUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={(file) => currentEditField && processFile(file, currentEditField)}
        onUrlSelect={handleUrlSelect}
        title={`Combat Asset: ${currentEditField?.replace(/_/g, ' ')}`}
      />
    </div >
  );
};
