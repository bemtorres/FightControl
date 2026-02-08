'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Character } from '@/types';
import { Trash2, Upload } from 'lucide-react';

interface CharacterManagerProps {
  scenarioId: string;
  characters: Character[];
  onUpdate: () => void;
}

export const CharacterManager = ({ scenarioId, characters, onUpdate }: CharacterManagerProps) => {
  const [name, setName] = useState('');
  const [uploading, setUploading] = useState(false);

  // File states
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [combatFile, setCombatFile] = useState<File | null>(null);
  const [victoryFile, setVictoryFile] = useState<File | null>(null);

  const uploadFile = async (file: File, path: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('assets')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('assets').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleAddCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !iconFile) {
      alert("Name and Icon are required!");
      return;
    }

    setUploading(true);
    try {
      const iconUrl = await uploadFile(iconFile, 'icons');
      const combatUrl = combatFile ? await uploadFile(combatFile, 'combat') : null;
      const victoryUrl = victoryFile ? await uploadFile(victoryFile, 'victory') : null;

      const { error } = await supabase.from('characters').insert({
        scenario_id: scenarioId,
        name,
        icon_face: iconUrl,
        side_view_combat: combatUrl,
        victory_pose: victoryUrl
      });

      if (error) throw error;

      // Reset form
      setName('');
      setIconFile(null);
      setCombatFile(null);
      setVictoryFile(null);
      (document.getElementById('form-reset') as HTMLFormElement)?.reset();

      onUpdate();
    } catch (error: any) {
      console.error(error);
      alert('Error uploading character: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this character?")) return;
    await supabase.from('characters').delete().eq('id', id);
    onUpdate();
  };

  const generateDemoData = async () => {
    setUploading(true);
    try {
      const demoChars = [
        { name: 'RYU', color: 'white', bg: 'red' },
        { name: 'KEN', color: 'yellow', bg: 'red' },
        { name: 'CHUN', color: 'white', bg: 'blue' },
        { name: 'GUILE', color: 'yellow', bg: 'green' },
        { name: 'BLANKA', color: 'orange', bg: 'green' },
        { name: 'ZANGIEF', color: 'red', bg: 'brown' },
        { name: 'DHALSIM', color: 'yellow', bg: 'orange' },
        { name: 'HONDA', color: 'blue', bg: 'cyan' },
      ];

      for (const char of demoChars) {
        await supabase.from('characters').insert({
          scenario_id: scenarioId,
          name: char.name,
          icon_face: `https://placehold.co/200x200/${char.bg}/${char.color}?text=${char.name}`,
          side_view_combat: `https://placehold.co/400x800/${char.bg}/${char.color}?text=${char.name}+Combat`,
          victory_pose: `https://placehold.co/800x600/${char.bg}/${char.color}?text=${char.name}+Wins`
        });
      }
      onUpdate();
    } catch (e: any) {
      alert("Error generating demo data: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mt-8 shrink-0">
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-2">
        <h3 className="text-xl font-russo text-white">ROSTER MANAGEMENT</h3>
        <button
          onClick={generateDemoData}
          disabled={uploading}
          className="text-xs bg-yellow-600 hover:bg-yellow-500 text-black px-3 py-1 font-bold rounded"
        >
          {uploading ? 'GENERATING...' : 'GENERATE DEMO ROSTER'}
        </button>
      </div>

      <div className="flex gap-8">
        {/* Form */}
        <form id="form-reset" onSubmit={handleAddCharacter} className="w-1/3 flex flex-col gap-4">
          <div>
            <label className="text-gray-400 text-sm">Character Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded"
              placeholder="e.g. RYU"
            />
          </div>

          <div className="space-y-2">
            <label className="text-gray-400 text-sm block">Icon (Face) *</label>
            <input type="file" accept="image/*" onChange={e => setIconFile(e.target.files?.[0] || null)} className="text-sm text-gray-500" />
          </div>

          <div className="space-y-2">
            <label className="text-gray-400 text-sm block">Side View (Combat)</label>
            <input type="file" accept="image/*" onChange={e => setCombatFile(e.target.files?.[0] || null)} className="text-sm text-gray-500" />
          </div>

          <div className="space-y-2">
            <label className="text-gray-400 text-sm block">Victory Pose</label>
            <input type="file" accept="image/*" onChange={e => setVictoryFile(e.target.files?.[0] || null)} className="text-sm text-gray-500" />
          </div>

          <button
            disabled={uploading}
            className="bg-neon-blue text-black font-press-start py-3 mt-4 hover:bg-white transition-colors disabled:opacity-50"
          >
            {uploading ? 'UPLOADING...' : 'ADD FIGHTER'}
          </button>
        </form>

        {/* List */}
        <div className="flex-1 overflow-y-auto max-h-[500px] grid grid-cols-2 md:grid-cols-3 gap-4">
          {characters.map(char => (
            <div key={char.id} className="bg-gray-900 border border-gray-700 p-2 relative group">
              <img src={char.icon_face} className="w-full h-32 object-cover mb-2" />
              <p className="font-russo text-white text-center">{char.name}</p>
              <button
                onClick={() => handleDelete(char.id)}
                className="absolute top-2 right-2 bg-red-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} color="white" />
              </button>
            </div>
          ))}
          {characters.length === 0 && (
            <div className="col-span-3 text-gray-500 text-center py-10">No characters added yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};
